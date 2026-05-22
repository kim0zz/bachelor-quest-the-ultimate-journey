import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  LOCATIONS,
  MALE_PIWKO_ID,
  UNLOCK_ORDER,
  getSecretUnderBarConfig,
  type Location,
} from "@/data/gameData";

export type SecretUnderBarPhase = "offer" | "entry" | "reveal";

export type StatusKind =
  | "idle"
  | "questActive"
  | "correct"
  | "wrong"
  | "groomDrinks"
  | "teamDrinks"
  | "final";

export type RiskPhase = "intro" | "countdown" | "question" | null;

export interface GameStatus {
  kind: StatusKind;
  message: string;
}

export interface GameState {
  manPoints: number;
  shotCount: number;
  teamShots: number;
  currentLocationId: string;
  activeQuestId: string | null;
  completedIds: string[];
  failedIds: string[];
  status: GameStatus;
  finalShown: boolean;
  // Risk quest state
  riskPhase: RiskPhase;
  riskCountdownStart: number | null;
  riskQuestionStart: number | null;
  secretUnderBarCompleted: boolean;
  secretUnderBarPhase: SecretUnderBarPhase | null;
  secretUnderBarShotsConfirmed: number;
  secretShotPulse: number;
}

const STORAGE_KEY = "bachelor-quest-state-v3";

function shouldOfferSecretUnderBar(
  loc: Location,
  s: GameState,
): boolean {
  if (s.secretUnderBarCompleted || s.secretUnderBarPhase) return false;
  return !!getSecretUnderBarConfig(loc) && loc.id === MALE_PIWKO_ID;
}

function initialState(): GameState {
  return {
    manPoints: 0,
    shotCount: 0,
    teamShots: 0,
    currentLocationId: UNLOCK_ORDER[0],
    activeQuestId: null,
    completedIds: [],
    failedIds: [],
    status: { kind: "idle", message: "Wybierz lokację" },
    finalShown: false,
    riskPhase: null,
    riskCountdownStart: null,
    riskQuestionStart: null,
    secretUnderBarCompleted: false,
    secretUnderBarPhase: null,
    secretUnderBarShotsConfirmed: 0,
    secretShotPulse: 0,
  };
}

function load(): GameState {
  if (typeof window === "undefined") return initialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    return { ...initialState(), ...JSON.parse(raw) };
  } catch {
    return initialState();
  }
}

interface Ctx {
  state: GameState;
  locations: Location[];
  availableLocations: Location[];
  currentLocation: Location;
  activeQuest: Location | null;
  // controller
  goToLocation: (id: string) => void;
  answerQuiz: (index: number) => void;
  resolveChallenge: (success: boolean) => void;
  // risk
  acceptRisk: () => void;
  escapeRisk: () => void;
  startRiskQuestion: () => void;
  answerRisk: (index: number) => void;
  failRisk: () => void;
  // final
  showFinal: () => void;
  closeStatus: () => void;
  // admin
  reset: () => void;
  addPoints: (n: number) => void;
  addShot: () => void;
  addTeamShot: () => void;
  forcePass: () => void;
  forceFail: () => void;
  nextLocation: () => void;
  secretUnderBarConfig: ReturnType<typeof getSecretUnderBarConfig>;
  secretContinueJourney: () => void;
  secretChooseUnderBar: () => void;
  secretConfirmShot: () => void;
  secretEnterUnderBar: () => void;
  secretFinishReveal: () => void;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => load());
  const writingRef = useRef(false);

  useEffect(() => {
    writingRef.current = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    writingRef.current = false;
  }, [state]);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue) return;
      try {
        setState(JSON.parse(e.newValue));
      } catch {
        /* noop */
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const locations = LOCATIONS;
  const currentLocation =
    locations.find((l) => l.id === state.currentLocationId) ?? locations[0];
  const activeQuest = state.activeQuestId
    ? (locations.find((l) => l.id === state.activeQuestId) ?? null)
    : null;

  const availableLocations = useMemo(() => {
    const nextMain = UNLOCK_ORDER.find(
      (id) => !state.completedIds.includes(id),
    );
    return locations.filter((l) => {
      if (state.completedIds.includes(l.id)) return false;
      if (l.type === "risk") return true;
      return l.id === nextMain;
    });
  }, [state.completedIds, locations]);

  const goToLocation = useCallback(
    (id: string) => {
      const loc = locations.find((l) => l.id === id);
      if (!loc) return;
      setState((s) => ({
        ...s,
        currentLocationId: id,
        activeQuestId: id,
        riskPhase: loc.type === "risk" ? "intro" : null,
        riskCountdownStart: null,
        riskQuestionStart: null,
        status: { kind: "questActive", message: `Quest: ${loc.name}` },
      }));
    },
    [locations],
  );

  const completeQuest = useCallback(
    (
      success: boolean,
      loc: Location,
      opts?: { penaltyShots?: number; teamShotOnSuccess?: boolean },
    ) => {
      setState((s) => {
        const pts = success ? loc.pointsForSuccess : 0;
        const isFinal = loc.type === "final";
        const penalty = opts?.penaltyShots ?? loc.penaltyShots ?? 1;
        const teamBonus =
          success && (opts?.teamShotOnSuccess ?? loc.teamShotOnSuccess)
            ? 1
            : 0;
        const offerSecret = shouldOfferSecretUnderBar(loc, s);
        return {
          ...s,
          manPoints: s.manPoints + pts,
          shotCount:
            !success && !isFinal ? s.shotCount + penalty : s.shotCount,
          teamShots: s.teamShots + teamBonus,
          completedIds: [...s.completedIds, loc.id],
          failedIds: success ? s.failedIds : [...s.failedIds, loc.id],
          activeQuestId: null,
          riskPhase: null,
          riskCountdownStart: null,
          riskQuestionStart: null,
          status: success
            ? { kind: "correct", message: loc.rewardText }
            : { kind: "groomDrinks", message: loc.penaltyText },
          finalShown: isFinal ? true : s.finalShown,
          secretUnderBarPhase: offerSecret ? "offer" : s.secretUnderBarPhase,
        };
      });
    },
    [],
  );

  const answerQuiz = useCallback(
    (index: number) => {
      if (!activeQuest || activeQuest.type !== "quiz") return;
      const success = index === activeQuest.correctAnswerIndex;
      completeQuest(success, activeQuest);
    },
    [activeQuest, completeQuest],
  );

  const resolveChallenge = useCallback(
    (success: boolean) => {
      if (!activeQuest || activeQuest.type !== "challenge") return;
      completeQuest(success, activeQuest);
    },
    [activeQuest, completeQuest],
  );

  // Risk
  const acceptRisk = useCallback(() => {
    setState((s) => ({
      ...s,
      riskPhase: "countdown",
      riskCountdownStart: Date.now(),
    }));
  }, []);

  const escapeRisk = useCallback(() => {
    setState((s) => ({
      ...s,
      activeQuestId: null,
      riskPhase: null,
      riskCountdownStart: null,
      riskQuestionStart: null,
      status: { kind: "idle", message: "Uciekłeś z high-risk. Wybierz lokację." },
    }));
  }, []);

  const startRiskQuestion = useCallback(() => {
    setState((s) => {
      if (s.riskPhase !== "countdown") return s;
      return {
        ...s,
        riskPhase: "question",
        riskQuestionStart: Date.now(),
      };
    });
  }, []);

  const answerRisk = useCallback(
    (index: number) => {
      if (!activeQuest || activeQuest.type !== "risk") return;
      const success = index === activeQuest.correctAnswerIndex;
      completeQuest(success, activeQuest);
    },
    [activeQuest, completeQuest],
  );

  const failRisk = useCallback(() => {
    if (!activeQuest || activeQuest.type !== "risk") return;
    completeQuest(false, activeQuest);
  }, [activeQuest, completeQuest]);

  const showFinal = useCallback(() => {
    if (!activeQuest || activeQuest.type !== "final") return;
    setState((s) => ({
      ...s,
      completedIds: [...s.completedIds, activeQuest.id],
      activeQuestId: null,
      finalShown: true,
      status: { kind: "final", message: "Werdykt końcowy!" },
    }));
  }, [activeQuest]);

  const closeStatus = useCallback(() => {
    setState((s) => ({
      ...s,
      status:
        s.secretUnderBarPhase === "offer"
          ? { kind: "idle", message: "Decyzja na kontrolerze 📱" }
          : { kind: "idle", message: "Wybierz lokację" },
    }));
  }, []);

  const malePiwkoLoc =
    locations.find((l) => l.id === MALE_PIWKO_ID) ?? null;
  const secretUnderBarConfig = getSecretUnderBarConfig(malePiwkoLoc);

  const secretContinueJourney = useCallback(() => {
    setState((s) => ({
      ...s,
      secretUnderBarCompleted: true,
      secretUnderBarPhase: null,
      secretUnderBarShotsConfirmed: 0,
      status: { kind: "idle", message: "Wybierz lokację" },
    }));
  }, []);

  const secretChooseUnderBar = useCallback(() => {
    setState((s) => ({
      ...s,
      secretUnderBarPhase: "entry",
      secretUnderBarShotsConfirmed: 0,
      status: {
        kind: "idle",
        message: "Sekret pod barem — potwierdź shoty na kontrolerze",
      },
    }));
  }, []);

  const secretConfirmShot = useCallback(() => {
    setState((s) => {
      if (s.secretUnderBarPhase !== "entry" || !secretUnderBarConfig) return s;
      const required = secretUnderBarConfig.requiredShots;
      if (s.secretUnderBarShotsConfirmed >= required) return s;
      const next = s.secretUnderBarShotsConfirmed + 1;
      return {
        ...s,
        shotCount: s.shotCount + 1,
        secretUnderBarShotsConfirmed: next,
        secretShotPulse: s.secretShotPulse + 1,
        status: {
          kind: "groomDrinks",
          message: `SHOT ${next}/${required} POTWIERDZONY`,
        },
      };
    });
  }, [secretUnderBarConfig]);

  const secretEnterUnderBar = useCallback(() => {
    setState((s) => {
      if (s.secretUnderBarPhase !== "entry" || !secretUnderBarConfig) return s;
      if (s.secretUnderBarShotsConfirmed < secretUnderBarConfig.requiredShots) {
        return s;
      }
      return {
        ...s,
        secretUnderBarPhase: "reveal",
        status: { kind: "idle", message: secretUnderBarConfig.revealTitle },
      };
    });
  }, [secretUnderBarConfig]);

  const secretFinishReveal = useCallback(() => {
    setState((s) => ({
      ...s,
      secretUnderBarCompleted: true,
      secretUnderBarPhase: null,
      secretUnderBarShotsConfirmed: 0,
      status: { kind: "idle", message: "Wybierz lokację" },
    }));
  }, []);

  const reset = useCallback(() => setState(initialState()), []);
  const addPoints = useCallback(
    (n: number) =>
      setState((s) => ({ ...s, manPoints: Math.max(0, s.manPoints + n) })),
    [],
  );
  const addShot = useCallback(
    () => setState((s) => ({ ...s, shotCount: s.shotCount + 1 })),
    [],
  );
  const addTeamShot = useCallback(
    () => setState((s) => ({ ...s, teamShots: s.teamShots + 1 })),
    [],
  );
  const nextLocation = useCallback(() => {
    setState((s) => {
      const nextId = UNLOCK_ORDER.find(
        (id) => !s.completedIds.includes(id) && id !== s.currentLocationId,
      );
      if (!nextId) return s;
      return { ...s, currentLocationId: nextId, activeQuestId: null };
    });
  }, []);
  const forcePass = useCallback(() => {
    setState((s) => {
      const loc = LOCATIONS.find(
        (l) => l.id === (s.activeQuestId ?? s.currentLocationId),
      );
      if (!loc) return s;
      const completedIds = s.completedIds.includes(loc.id)
        ? s.completedIds
        : [...s.completedIds, loc.id];
      const offerSecret =
        !s.completedIds.includes(loc.id) && shouldOfferSecretUnderBar(loc, s);
      return {
        ...s,
        manPoints: s.manPoints + loc.pointsForSuccess,
        completedIds,
        activeQuestId: null,
        riskPhase: null,
        status: { kind: "correct", message: loc.rewardText },
        secretUnderBarPhase: offerSecret ? "offer" : s.secretUnderBarPhase,
      };
    });
  }, []);
  const forceFail = useCallback(() => {
    setState((s) => {
      const loc = LOCATIONS.find(
        (l) => l.id === (s.activeQuestId ?? s.currentLocationId),
      );
      if (!loc) return s;
      const completedIds = s.completedIds.includes(loc.id)
        ? s.completedIds
        : [...s.completedIds, loc.id];
      const offerSecret =
        !s.completedIds.includes(loc.id) && shouldOfferSecretUnderBar(loc, s);
      return {
        ...s,
        shotCount: s.shotCount + (loc.penaltyShots ?? 1),
        completedIds,
        failedIds: [...s.failedIds, loc.id],
        activeQuestId: null,
        riskPhase: null,
        status: {
          kind: "groomDrinks",
          message: loc.penaltyText || "PAN MŁODY PIJE",
        },
        secretUnderBarPhase: offerSecret ? "offer" : s.secretUnderBarPhase,
      };
    });
  }, []);

  const value: Ctx = {
    state,
    locations,
    availableLocations,
    currentLocation,
    activeQuest,
    goToLocation,
    answerQuiz,
    resolveChallenge,
    acceptRisk,
    escapeRisk,
    startRiskQuestion,
    answerRisk,
    failRisk,
    showFinal,
    closeStatus,
    reset,
    addPoints,
    addShot,
    addTeamShot,
    forcePass,
    forceFail,
    nextLocation,
    secretUnderBarConfig,
    secretContinueJourney,
    secretChooseUnderBar,
    secretConfirmShot,
    secretEnterUnderBar,
    secretFinishReveal,
  };

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

// Lightweight tick hook for re-rendering timers.
export function useTick(intervalMs = 100) {
  const [, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((v) => v + 1), intervalMs);
    return () => clearInterval(i);
  }, [intervalMs]);
}
