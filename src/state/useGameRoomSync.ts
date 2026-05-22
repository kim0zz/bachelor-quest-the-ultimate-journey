import {
  useCallback,
  useEffect,
  useRef,
  type Dispatch,
  type SetStateAction,
} from "react";
import { getClientId, getRoomCode } from "@/lib/gameRoom";
import { getSupabase } from "@/lib/supabase";
import { createInitialGameState } from "@/state/gameDefaults";
import type { GameState } from "@/state/gameStore";

export type RealtimeStatus = "local-only" | "connecting" | "connected";

const POUR_WRITE_MS = 200;

function parseRemoteState(raw: unknown): GameState | null {
  if (!raw || typeof raw !== "object") return null;
  return { ...createInitialGameState(), ...(raw as Partial<GameState>) };
}

function isPourOnlyChange(prev: GameState, next: GameState): boolean {
  if (prev.pourIsPouring !== next.pourIsPouring) return false;
  if (prev.pourEvaluated !== next.pourEvaluated) return false;
  if (prev.pourResult !== next.pourResult) return false;
  if (prev.pourLevel !== next.pourLevel) {
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
  return false;
}

export function useGameRoomSync(
  state: GameState,
  setState: Dispatch<SetStateAction<GameState>>,
  onStatus: (status: RealtimeStatus) => void,
) {
  const roomCode = getRoomCode();
  const hydratedRef = useRef(false);
  const applyingRemoteRef = useRef(false);
  const pourTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingStateRef = useRef<GameState | null>(null);
  const lastPushedRef = useRef<string>("");

  const stateRef = useRef(state);
  stateRef.current = state;

  const writeToRoom = useCallback(
    async (next: GameState, opts?: { force?: boolean }) => {
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

      const { error } = await supabase.from("game_rooms").upsert(
        {
          room_code: roomCode,
          state: next,
          updated_by: clientId,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "room_code" },
      );

      if (error) {
        console.warn("[game_rooms] write failed:", error.message);
        return;
      }

      lastPushedRef.current = payload;
    },
    [roomCode],
  );

  const scheduleWrite = useCallback(
    (next: GameState, prev: GameState, immediate = false) => {
      if (!hydratedRef.current || applyingRemoteRef.current) return;

      if (pourTimerRef.current) {
        clearTimeout(pourTimerRef.current);
        pourTimerRef.current = null;
      }

      const run = () => {
        pendingStateRef.current = null;
        void writeToRoom(next);
      };

      if (immediate || !isPourOnlyChange(prev, next)) {
        run();
        return;
      }

      pendingStateRef.current = next;
      pourTimerRef.current = setTimeout(run, POUR_WRITE_MS);
    },
    [writeToRoom],
  );

  const pushStateNow = useCallback(
    async (next: GameState) => {
      if (pourTimerRef.current) {
        clearTimeout(pourTimerRef.current);
        pourTimerRef.current = null;
      }
      pendingStateRef.current = null;
      lastPushedRef.current = "";
      await writeToRoom(next, { force: true });
    },
    [writeToRoom],
  );

  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) {
      onStatus("local-only");
      hydratedRef.current = true;
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
          applyingRemoteRef.current = true;
          setState(remote);
          lastPushedRef.current = JSON.stringify(remote);
          applyingRemoteRef.current = false;
        }
      } else {
        await writeToRoom(stateRef.current, { force: true });
      }

      hydratedRef.current = true;
      onStatus("connected");
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
          } | null;
          if (!row?.state) return;
          if (row.updated_by === getClientId()) return;

          const remote = parseRemoteState(row.state);
          if (!remote) return;

          applyingRemoteRef.current = true;
          setState(remote);
          lastPushedRef.current = JSON.stringify(remote);
          applyingRemoteRef.current = false;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init once per room
  }, [roomCode, setState, onStatus]);

  const prevStateRef = useRef(state);
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = state;
    if (prev === state) return;
    scheduleWrite(state, prev);
  }, [state, scheduleWrite]);

  useEffect(() => {
    return () => {
      if (pourTimerRef.current) clearTimeout(pourTimerRef.current);
      if (pendingStateRef.current) {
        void writeToRoom(pendingStateRef.current);
      }
    };
  }, [writeToRoom]);

  return { roomCode, pushStateNow };
}
