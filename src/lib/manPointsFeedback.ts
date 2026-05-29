import type { GameStatus } from "@/state/gameStore";

const MAN_POINTS_IN_MESSAGE = /\+\d+\s*m[aą]ż\s*points/i;

export function messageMentionsManPoints(message: string): boolean {
  return MAN_POINTS_IN_MESSAGE.test(message);
}

/** Success status with optional pointsDelta when points were awarded but not in copy. */
export function correctStatus(message: string, points = 0): GameStatus {
  if (points > 0 && !messageMentionsManPoints(message)) {
    return { kind: "correct", message, pointsDelta: points };
  }
  return { kind: "correct", message };
}
