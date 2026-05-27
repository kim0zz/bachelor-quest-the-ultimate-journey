import { HULAJNOGA_DURATION_MS, HULAJNOGA_REQUIRED_CLICKS } from "@/data/gameData";

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
