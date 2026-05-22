import { UNLOCK_ORDER, type PourResult } from "@/data/gameData";

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
    currentLocationId: UNLOCK_ORDER[0],
    activeQuestId: null,
    completedIds: [] as string[],
    failedIds: [] as string[],
    status: { kind: "idle" as const, message: "Wybierz lokację" },
    finalShown: false,
    riskPhase: null,
    riskCountdownStart: null,
    riskQuestionStart: null,
    secretUnderBarCompleted: false,
    secretUnderBarPhase: null,
    secretUnderBarShotsConfirmed: 0,
    secretShotPulse: 0,
    ...emptyPourState(),
  };
}
