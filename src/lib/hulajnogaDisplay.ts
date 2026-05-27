import { HULAJNOGA_DURATION_MS, HULAJNOGA_REQUIRED_CLICKS } from "@/data/gameData";
import type { PostDrewniakPhase } from "@/state/gameStore";

const HULAJNOGA_LOCK_PHASES: PostDrewniakPhase[] = [
  "hulajnoga-choice",
  "hulajnoga-skip-narrator",
  "hulajnoga-running",
  "hulajnoga-result",
];

/** True while hulajnoga flow blocks all other controller/TV inputs. */
export function isHulajnogaLocked(postDrewniakPhase: PostDrewniakPhase): boolean {
  if (!postDrewniakPhase) return false;
  return HULAJNOGA_LOCK_PHASES.includes(postDrewniakPhase);
}

/** Running or result — controller must show only hulajnoga UI. */
export function isHulajnogaInputActive(postDrewniakPhase: PostDrewniakPhase): boolean {
  return (
    postDrewniakPhase === "hulajnoga-running" ||
    postDrewniakPhase === "hulajnoga-result"
  );
}

export function getHulajnogaRemainingMs(endsAt: number | null): number {
  if (endsAt == null) return 0;
  return Math.max(0, endsAt - Date.now());
}

export function getHulajnogaRemainingSeconds(endsAt: number | null): number {
  return Math.max(0, Math.ceil(getHulajnogaRemainingMs(endsAt) / 1000));
}

export function getHulajnogaProgress(clicks: number): number {
  return Math.min(100, (clicks / HULAJNOGA_REQUIRED_CLICKS) * 100);
}

export function computeHulajnogaEndsAt(startedAt: number): number {
  return startedAt + HULAJNOGA_DURATION_MS;
}
