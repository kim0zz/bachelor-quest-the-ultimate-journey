import { HULAJNOGA_DURATION_MS, HULAJNOGA_REQUIRED_CLICKS } from "@/data/gameData";
import type { PostDrewniakPhase } from "@/state/gameStore";

/** True while post-DREWNIAK skipped transition blocks other controller/TV inputs. */
export function isHulajnogaLocked(postDrewniakPhase: PostDrewniakPhase): boolean {
  return postDrewniakPhase === "hulajnoga-skipped";
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
