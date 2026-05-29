import { isShotPourLocation, LOCATIONS, type PourResult } from "@/data/gameData";
import { isHulajnogaLocked } from "@/lib/hulajnogaDisplay";
import type { GameState } from "@/state/gameStore";

export function emptyPourFields() {
  return {
    pourLevel: 0,
    pourStartedAt: null as number | null,
    pourIsPouring: false,
    pourEvaluated: false,
    pourResult: null as PourResult | null,
  };
}

/** True when the current quest/phase is allowed to run shot-pour. */
export function isPourCapableContext(s: GameState): boolean {
  const locId = s.activeQuestId;
  if (!locId) return false;
  const loc = LOCATIONS.find((l) => l.id === locId);
  if (!loc) return false;
  if (isShotPourLocation(loc)) return true;
  return loc.id === "bitwy" && s.bitwyPhase === "salon-shot-pour";
}

/** TV/controller should not show pour UI during hulajnoga or outside pour context. */
export function shouldShowPourUi(s: GameState): boolean {
  if (isHulajnogaLocked(s.postDrewniakPhase)) return false;
  return isPourCapableContext(s);
}

/** Strip pour flags when they cannot apply to the current quest/phase. */
export function stripStalePourState(s: GameState): GameState {
  const hasPour =
    s.pourIsPouring ||
    s.pourEvaluated ||
    s.pourResult != null ||
    s.pourLevel > 0 ||
    s.pourStartedAt != null;

  if (!hasPour) return s;
  if (isHulajnogaLocked(s.postDrewniakPhase) || !isPourCapableContext(s)) {
    return { ...s, ...emptyPourFields() };
  }
  return s;
}
