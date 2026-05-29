import { emptyPourFields } from "@/lib/pourGuard";
import type { GameState, PostDrewniakPhase } from "@/state/gameStore";

export const HULAJNOGA_SKIPPED_TITLE = "HULAJNOGA ODRZUCONA PRZEZ SYSTEM";
export const HULAJNOGA_SKIPPED_TEXT =
  "Lama widzi hulajnogę i przez chwilę rozważa decyzję, którą mogliby badać biegli. Na szczęście system bezpieczeństwa melanżu odmawia autoryzacji.";

const LEGACY_HULAJNOGA_PHASES: NonNullable<PostDrewniakPhase>[] = [
  "hulajnoga-choice",
  "hulajnoga-skip-narrator",
  "hulajnoga-running",
  "hulajnoga-result",
];

/** Party-night transition: skip interactive hulajnoga, clear pour + hulajnoga fields. */
export function buildHulajnogaSkippedState(s: GameState): GameState {
  return {
    ...s,
    ...emptyPourFields(),
    postDrewniakPhase: "hulajnoga-skipped",
    hulajnogaStartedAt: null,
    hulajnogaEndsAt: null,
    hulajnogaClicks: 0,
    hulajnogaResult: null,
    status: { kind: "idle", message: HULAJNOGA_SKIPPED_TITLE },
  };
}

/** Normalize stale remote/local hulajnoga phases into the skipped transition. */
export function normalizeStaleHulajnoga(s: GameState): GameState {
  const phase = s.postDrewniakPhase;
  if (!phase || phase === "hulajnoga-skipped") return s;
  if (!LEGACY_HULAJNOGA_PHASES.includes(phase)) return s;
  return buildHulajnogaSkippedState(s);
}
