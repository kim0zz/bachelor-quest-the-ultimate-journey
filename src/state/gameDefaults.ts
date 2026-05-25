import { type PourResult } from "@/data/gameData";

function emptyPourState() {
  return {
    pourLevel: 0,
    pourIsPouring: false,
    pourEvaluated: false,
    pourResult: null as PourResult | null,
  };
}

export function createInitialGameState() {
  return {
    manPoints: 0,
    shotCount: 0,
    teamShots: 0,
    currentLocationId: "konopa",
    activeQuestId: null,
    completedIds: [] as string[],
    failedIds: [] as string[],
    status: {
      kind: "idle" as const,
      message:
        "Lama budzi się na Konopie. Człowiek odpowiedzialny napiłby się wody i przemyślał życie. Lama ma na dziś inne plany.",
    },
    finalShown: false,
    riskPhase: null,
    riskCountdownStart: null,
    riskQuestionStart: null,
    secretUnderBarCompleted: false,
    secretUnderBarPhase: null,
    secretUnderBarShotsConfirmed: 0,
    secretShotPulse: 0,
    // Early game (bar choice) flow
    earlyGamePhase: "choosing-bar" as "choosing-bar" | "post-bar-choice" | null,
    bartenderPhase: null as "intro" | "outcome" | null,
    bartenderChoiceIndex: null as number | null,
    // Food stage (after bars)
    foodPhase: null as "choosing" | "pekin-event" | "pekin-aftermath" | "pekin-transition" | null,
    // BITWY multi-phase quest
    bitwyPhase: null as string | null,
    bitwyKitchenShots: 0,
    bitwyChoseKitchen: false,
    // Balance minigame
    balanceStartTime: null as number | null,
    balanceStopPosition: null as number | null,
    ...emptyPourState(),
  };
}
