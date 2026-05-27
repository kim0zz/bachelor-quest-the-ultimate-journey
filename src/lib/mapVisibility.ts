import type { Location } from "@/data/gameData";
import type { GameState } from "@/state/gameStore";

export type MapLocationVisibility =
  | "fogged"
  | "revealed"
  | "available"
  | "completed"
  | "current";

/** Story-progression reveal set (map display only, not gameplay). */
function getStoryRevealedIds(state: GameState): Set<string> {
  const ids = new Set<string>(["konopa", "hans", "male-piwko"]);

  const foodStarted =
    state.foodPhase != null ||
    state.sawPekinEvent ||
    state.completedIds.includes("gofer-przy-latarni") ||
    (state.completedIds.includes("hans") && state.completedIds.includes("male-piwko"));

  if (foodStarted) {
    ids.add("pekin-bar");
    ids.add("gofer-przy-latarni");
  }

  if (
    state.completedIds.includes("gofer-przy-latarni") ||
    state.completedIds.includes("bitwy") ||
    state.bitwyPhase ||
    state.activeQuestId === "bitwy" ||
    state.postBitwyPhase
  ) {
    ids.add("bitwy");
  }

  if (
    state.completedIds.includes("bitwy") ||
    state.postBitwyPhase ||
    state.activeQuestId === "drewniak" ||
    state.completedIds.includes("drewniak") ||
    state.postDrewniakPhase ||
    state.dzialkaPhase ||
    state.activeQuestId === "dzialka"
  ) {
    ids.add("drewniak");
  }

  if (
    state.completedIds.includes("drewniak") ||
    state.postDrewniakPhase ||
    state.dzialkaPhase ||
    state.activeQuestId === "dzialka" ||
    state.completedIds.includes("dzialka")
  ) {
    ids.add("dzialka");
  }

  const endgameUnlocked =
    state.dzialkaPhase === "final-choice" ||
    state.completedIds.includes("dzialka") ||
    state.activeQuestId === "paryz" ||
    state.activeQuestId === "dom-zgon" ||
    state.paryzPhase != null ||
    state.finalShown;

  if (endgameUnlocked) {
    ids.add("paryz");
    ids.add("dom-zgon");
  }

  if (
    state.completedIds.includes("dzialka") ||
    state.activeQuestId === "risk-narzeczona" ||
    state.riskPhase != null
  ) {
    ids.add("risk-narzeczona");
  }

  return ids;
}

export function isMapLocationRevealed(
  locationId: string,
  state: GameState,
  availableLocations: Location[],
): boolean {
  if (state.completedIds.includes(locationId)) return true;
  if (state.currentLocationId === locationId) return true;
  if (state.activeQuestId === locationId) return true;
  if (availableLocations.some((l) => l.id === locationId)) return true;
  return getStoryRevealedIds(state).has(locationId);
}

export function getMapLocationVisibility(
  loc: Location,
  state: GameState,
  availableLocations: Location[],
): MapLocationVisibility {
  if (!isMapLocationRevealed(loc.id, state, availableLocations)) {
    return "fogged";
  }
  if (state.currentLocationId === loc.id) return "current";
  if (state.completedIds.includes(loc.id)) return "completed";
  if (availableLocations.some((l) => l.id === loc.id)) return "available";
  return "revealed";
}
