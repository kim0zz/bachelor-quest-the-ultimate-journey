import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { getClientRole, isControllerClient, shouldPushGameStateToRoom } from "@/lib/clientRole";
import { isHulajnogaInputActive } from "@/lib/hulajnogaDisplay";
import { hulajnogaDebug } from "@/lib/hulajnogaDebug";
import { getClientId, getRoomCode } from "@/lib/gameRoom";
import { getSupabase } from "@/lib/supabase";
import { normalizeStaleHulajnoga } from "@/lib/hulajnogaParty";
import { stripStalePourState } from "@/lib/pourGuard";
import { createInitialGameState } from "@/state/gameDefaults";
import type { GameState } from "@/state/gameStore";

export type RealtimeStatus = "local-only" | "connecting" | "connected";

const HULAJNOGA_CLICKS_WRITE_MS = 180;
const SYNC_LOG = import.meta.env.DEV;

function syncLog(...args: unknown[]) {
  if (SYNC_LOG) console.log("[game-sync]", ...args);
}

function parseRemoteState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  return { ...createInitialGameState(), ...(raw as Partial<GameState>) };
}

function parseUpdatedAtMs(updatedAt: string | null | undefined): number {
  if (!updatedAt) return Date.now();
  const ms = Date.parse(updatedAt);
  return Number.isFinite(ms) ? ms : Date.now();
}

/** Skip Supabase write when only animated pour fill changed (derived from pourStartedAt on clients). */
function isPourVisualOnlyChange(prev: GameState, next: GameState): boolean {
  if (prev.pourIsPouring !== next.pourIsPouring) return false;
  if (prev.pourStartedAt !== next.pourStartedAt) return false;
  if (prev.pourEvaluated !== next.pourEvaluated) return false;
  if (prev.pourResult !== next.pourResult) return false;
  if (prev.pourLevel === next.pourLevel) return false;
  return (
    next.pourIsPouring &&
    !next.pourEvaluated &&
    prev.activeQuestId === next.activeQuestId &&
    prev.currentLocationId === next.currentLocationId &&
    prev.manPoints === next.manPoints &&
    prev.shotCount === next.shotCount &&
    prev.teamShots === next.teamShots &&
    prev.completedIds.length === next.completedIds.length &&
    prev.status.kind === next.status.kind &&
    prev.status.message === next.status.message
  );
}

function isHulajnogaClicksOnlyChange(prev: GameState, next: GameState): boolean {
  if (prev.postDrewniakPhase !== "hulajnoga-running") return false;
  if (next.postDrewniakPhase !== "hulajnoga-running") return false;
  if (prev.hulajnogaResult !== next.hulajnogaResult) return false;
  if (prev.hulajnogaClicks === next.hulajnogaClicks) return false;
  return (
    prev.hulajnogaStartedAt === next.hulajnogaStartedAt &&
    prev.hulajnogaEndsAt === next.hulajnogaEndsAt &&
    prev.activeQuestId === next.activeQuestId &&
    prev.manPoints === next.manPoints &&
    prev.shotCount === next.shotCount &&
    prev.teamShots === next.teamShots &&
    prev.status.kind === next.status.kind &&
    prev.status.message === next.status.message
  );
}

export function useGameRoomSync(
  state: GameState,
  setState: Dispatch<SetStateAction<GameState>>,
  onStatus: (status: RealtimeStatus) => void,
) {
  const roomCode = getRoomCode();
  const hydratedRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const hulajnogaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<GameState | null>(null);
  const lastPushedRef = useRef<string>("");
  const lastRemoteAppliedAtRef = useRef(0);

  const stateRef = useRef(state);
  stateRef.current = state;

  const applyRemoteState = useCallback(
    (remote: GameState, updatedAt: string | null | undefined, source: string) => {
      const ts = parseUpdatedAtMs(updatedAt);
      if (ts < lastRemoteAppliedAtRef.current) {
        syncLog(
          "ignore stale remote",
          source,
          getClientRole(),
          "remoteTs",
          ts,
          "last",
          lastRemoteAppliedAtRef.current,
        );
        return;
      }

      const local = stateRef.current;
      let nextRemote = normalizeStaleHulajnoga(stripStalePourState(remote));

      if (isControllerClient() && isHulajnogaInputActive(local.postDrewniakPhase)) {
        const remoteActive = isHulajnogaInputActive(remote.postDrewniakPhase);
        const remoteAcknowledgedDzialka =
          local.postDrewniakPhase === "hulajnoga-result" &&
          remote.activeQuestId === "dzialka" &&
          !remoteActive;

        if (!remoteActive && !remoteAcknowledgedDzialka) {
          hulajnogaDebug("reject remote during hulajnoga", source, {
            localPhase: local.postDrewniakPhase,
            remotePhase: remote.postDrewniakPhase,
            remoteQuest: remote.activeQuestId,
            remoteLocation: remote.currentLocationId,
          });
          syncLog("reject remote during hulajnoga", getClientRole(), source);
          return;
        }
        if (
          local.postDrewniakPhase === "hulajnoga-running" &&
          remote.postDrewniakPhase === "hulajnoga-running"
        ) {
          nextRemote = {
            ...remote,
            hulajnogaClicks: Math.max(local.hulajnogaClicks, remote.hulajnogaClicks),
            hulajnogaEndsAt: local.hulajnogaEndsAt ?? remote.hulajnogaEndsAt,
            hulajnogaStartedAt: local.hulajnogaStartedAt ?? remote.hulajnogaStartedAt,
          };
        }
        if (
          local.postDrewniakPhase === "hulajnoga-result" &&
          remote.postDrewniakPhase === "hulajnoga-running"
        ) {
          hulajnogaDebug("reject stale remote running after local result", source);
          return;
        }
      }

      lastRemoteAppliedAtRef.current = ts;
      applyingRemoteRef.current = true;
      setState(nextRemote);
      lastPushedRef.current = JSON.stringify(nextRemote);
      applyingRemoteRef.current = false;
      syncLog("applied remote", source, getClientRole(), {
        location: nextRemote.currentLocationId,
        quest: nextRemote.activeQuestId,
        status: nextRemote.status.kind,
      });
    },
    [setState],
  );

  const writeToRoom = useCallback(
    async (next: GameState, opts?: { force?: boolean; label?: string }) => {
      const supabase = getSupabase();
      if (!supabase) return;
      if (
        !opts?.force &&
        (!hydratedRef.current || applyingRemoteRef.current)
      ) {
        return;
      }

      const clientId = getClientId();
      const payload = JSON.stringify(next);
      if (payload === lastPushedRef.current) return;

      const updatedAt = new Date().toISOString();
      const { error } = await supabase.from("game_rooms").upsert(
        {
          room_code: roomCode,
          state: next,
          updated_by: clientId,
          updated_at: updatedAt,
        },
        { onConflict: "room_code" },
      );

      if (error) {
        console.warn("[game_rooms] write failed:", error.message);
        return;
      }

      lastPushedRef.current = payload;
      lastRemoteAppliedAtRef.current = Math.max(
        lastRemoteAppliedAtRef.current,
        Date.parse(updatedAt),
      );
      syncLog("pushed", opts?.label ?? "state", getClientRole(), {
        location: next.currentLocationId,
        quest: next.activeQuestId,
        status: next.status.kind,
      });
    },
    [roomCode],
  );

  const scheduleWrite = useCallback(
    (next: GameState, prev: GameState) => {
      if (!hydratedRef.current || applyingRemoteRef.current) return;

      if (!shouldPushGameStateToRoom()) {
        return;
      }

      if (hulajnogaTimerRef.current) {
        clearTimeout(hulajnogaTimerRef.current);
        hulajnogaTimerRef.current = null;
      }

      if (isPourVisualOnlyChange(prev, next)) {
        return;
      }

      const run = (label: string) => {
        pendingStateRef.current = null;
        void writeToRoom(next, { label });
      };

      if (!isHulajnogaClicksOnlyChange(prev, next)) {
        run("critical");
        return;
      }

      pendingStateRef.current = next;
      hulajnogaTimerRef.current = setTimeout(() => run("hulajnoga-clicks"), HULAJNOGA_CLICKS_WRITE_MS);
    },
    [writeToRoom],
  );

  const pushStateNow = useCallback(
    async (next: GameState) => {
      if (!shouldPushGameStateToRoom()) return;
      if (hulajnogaTimerRef.current) {
        clearTimeout(hulajnogaTimerRef.current);
        hulajnogaTimerRef.current = null;
      }
      pendingStateRef.current = null;
      lastPushedRef.current = "";
      await writeToRoom(next, { force: true, label: "push-now" });
    },
    [writeToRoom],
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      onStatus("local-only");
      hydratedRef.current = true;
      syncLog("local-only (no supabase)", getClientRole());
      return;
    }

    let cancelled = false;
    onStatus("connecting");

    async function hydrate() {
      const { data, error } = await supabase
        .from("game_rooms")
        .select("state, updated_by, updated_at")
        .eq("room_code", roomCode)
        .maybeSingle();

      if (cancelled) return;

      if (error) {
        console.warn("[game_rooms] fetch failed:", error.message);
        onStatus("local-only");
        hydratedRef.current = true;
        return;
      }

      if (data?.state) {
        const remote = parseRemoteState(data.state);
        if (remote) {
          applyRemoteState(remote, data.updated_at, "hydrate");
        }
      } else if (shouldPushGameStateToRoom()) {
        await writeToRoom(stateRef.current, { force: true, label: "seed-room" });
      }

      hydratedRef.current = true;
      onStatus("connected");
      syncLog("hydrated", getClientRole(), roomCode);
    }

    void hydrate();

    const channel = supabase
      .channel(`game-room-${roomCode}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "game_rooms",
          filter: `room_code=eq.${roomCode}`,
        },
        (payload) => {
          if (cancelled) return;
          const row = payload.new as {
            state?: unknown;
            updated_by?: string | null;
            updated_at?: string | null;
          } | null;
          if (!row?.state) return;
          if (row.updated_by === getClientId()) {
            syncLog("ignore own write echo", getClientRole());
            return;
          }

          const remote = parseRemoteState(row.state);
          if (!remote) return;

          applyRemoteState(remote, row.updated_at, "realtime");
        },
      )
      .subscribe((status) => {
        if (cancelled) return;
        if (status === "SUBSCRIBED" && hydratedRef.current) {
          onStatus("connected");
        }
      });

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [roomCode, setState, onStatus, applyRemoteState, writeToRoom]);

  const prevStateRef = useRef(state);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;
    if (prev === state) return;
    scheduleWrite(state, prev);
  }, [state, scheduleWrite]);

  useEffect(() => {
    return () => {
      if (hulajnogaTimerRef.current) clearTimeout(hulajnogaTimerRef.current);
      if (pendingStateRef.current && shouldPushGameStateToRoom()) {
        void writeToRoom(pendingStateRef.current, { label: "flush-unmount" });
      }
    };
  }, [writeToRoom]);

  return { roomCode, pushStateNow };
}
