import { LOCATIONS, type Location } from "@/data/gameData";
import type { ReadOnlyChoice } from "@/components/ReadOnlyChoiceCards";
import type { GameState } from "@/state/gameStore";
import { isHulajnogaLocked } from "@/lib/hulajnogaDisplay";

export type TvChoiceMirrorConfig = {
  title?: string;
  subtitle?: string;
  choices: ReadOnlyChoice[];
};

function locToChoice(loc: Location): ReadOnlyChoice {
  return {
    title: loc.name,
    description: loc.description,
    icon: loc.icon ?? "📍",
  };
}

export function getPostBarChoices(state: GameState): ReadOnlyChoice[] {
  const hansCompleted = state.completedIds.includes("hans");
  const mpCompleted = state.completedIds.includes("male-piwko");
  return [
    {
      icon: "🎰",
      title: "Idę dalej",
      description:
        hansCompleted && !mpCompleted
          ? "Niepokojący przebłysk rozsądku."
          : "Już wystarczy patologii.",
    },
    {
      icon: hansCompleted && !mpCompleted ? "🍺" : "🍻",
      title: hansCompleted && !mpCompleted ? "Jeszcze Małe Piwko" : "Jeszcze Hans",
      description:
        hansCompleted && !mpCompleted
          ? "Co może pójść źle?"
          : "Nauka wymaga poświęceń.",
    },
  ];
}

export function getBitwyIntroChoices(): ReadOnlyChoice[] {
  return [
    {
      icon: "🍳",
      title: "Idę ze Skibą do kuchni",
      description: "Brzmi jak zły pomysł, czyli standard.",
    },
    {
      icon: "🛋️",
      title: "Idę do Pokoju Bewicza",
      description: "Przywitać się z ludźmi",
    },
  ];
}

export function getSecretOfferChoices(offerTitle: string): ReadOnlyChoice[] {
  return [
    { icon: "➡️", title: "IDĘ DALEJ", description: "Kontynuuj bez sekretu" },
    {
      icon: "🕳️",
      title: "SEKRET POD BAREM",
      description: offerTitle,
    },
  ];
}

export function getDzialkaFinalChoices(): ReadOnlyChoice[] {
  return [
    {
      icon: "🗼",
      title: "PARYŻ",
      description:
        "OSTROŻNIE. DUŻE RYZYKO. To już nie jest decyzja — to wniosek o przygodę.",
    },
    {
      icon: "💀",
      title: "DOM",
      description:
        "Idziemy spać, już kurwa starczy. Opcja dla ludzi, którzy jeszcze wierzą w regenerację.",
    },
  ];
}

/** Standalone full-screen mirror (map visible underneath). */
export function getStandaloneTvChoiceMirror(
  state: GameState,
  availableLocations: Location[],
): TvChoiceMirrorConfig | null {
  if (state.finalShown || isHulajnogaLocked(state.postDrewniakPhase)) {
    return null;
  }

  if (!state.activeQuestId && state.earlyGamePhase === "choosing-bar") {
    const choices = availableLocations.map(locToChoice);
    if (choices.length === 0) return null;
    return {
      title: "Gdzie się nakurwić?",
      choices,
    };
  }

  if (!state.activeQuestId && state.foodPhase === "choosing") {
    const choices = availableLocations.map(locToChoice);
    if (choices.length === 0) {
      const fallback = LOCATIONS.filter(
        (l) => l.id === "pekin-bar" || l.id === "gofer-przy-latarni",
      ).map(locToChoice);
      if (fallback.length === 0) return null;
      return { title: "Czas coś zjeść", choices: fallback };
    }
    return { title: "Czas coś zjeść", choices };
  }

  return null;
}
