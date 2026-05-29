const MAX_POUR_ELAPSED_SEC = 15;

function clampLevel(level: number): number {
  return Math.max(0, Math.min(100, level));
}

/** Derive fill % for display without syncing every animation frame. */
export function computePourDisplayLevel(
  pourStartedAt: number | null,
  pourIsPouring: boolean,
  pourEvaluated: boolean,
  storedLevel: number,
  fillSpeed: number,
): number {
  if (pourEvaluated) return clampLevel(storedLevel);

  if (pourIsPouring) {
    if (pourStartedAt == null) return 0;
    const elapsedSec = (Date.now() - pourStartedAt) / 1000;
    if (elapsedSec > MAX_POUR_ELAPSED_SEC) return 0;
    return clampLevel(elapsedSec * fillSpeed);
  }

  return 0;
}
