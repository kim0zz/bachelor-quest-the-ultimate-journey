/** Derive fill % for display without syncing every animation frame. */
export function computePourDisplayLevel(
  pourStartedAt: number | null,
  pourIsPouring: boolean,
  pourEvaluated: boolean,
  storedLevel: number,
  fillSpeed: number,
): number {
  if (pourEvaluated) return storedLevel;
  if (pourIsPouring && pourStartedAt != null) {
    const elapsedSec = (Date.now() - pourStartedAt) / 1000;
    return Math.min(100, elapsedSec * fillSpeed);
  }
  return storedLevel;
}
