import { useEffect, useRef, useState } from "react";
import type { GameState } from "@/state/gameStore";

export const MAP_REVEAL_MS = 900;

/** Signature of phases that open a full-screen overlay after a move. */
function mapRevealSignature(state: GameState): string {
  return [
    state.currentLocationId,
    state.activeQuestId,
    state.earlyGamePhase,
    state.foodPhase,
    state.bitwyPhase,
    state.dzialkaPhase,
    state.paryzPhase,
    state.postDrewniakPhase,
    state.postBitwyPhase,
    state.preBitwyPhase,
    state.secretUnderBarPhase,
    state.bartenderPhase,
  ].join("|");
}

/**
 * TV-only: brief pause after route/quest transitions so viewers see the map avatar move
 * before the next modal covers it.
 */
export function useMapRevealDelay(state: GameState): boolean {
  const [revealing, setRevealing] = useState(false);
  const sigRef = useRef(mapRevealSignature(state));
  const isFirstRef = useRef(true);

  useEffect(() => {
    const sig = mapRevealSignature(state);
    if (isFirstRef.current) {
      isFirstRef.current = false;
      sigRef.current = sig;
      return;
    }
    if (sig === sigRef.current) return;
    sigRef.current = sig;
    setRevealing(true);
    const t = window.setTimeout(() => setRevealing(false), MAP_REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [state]);

  return revealing;
}
