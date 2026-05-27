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
  BAR_IDS,
  LOCATIONS,
  MALE_PIWKO_ID,
  UNLOCK_ORDER,
  BALANCE_PERIOD_MS,
  BALANCE_TARGET_MIN,
  BALANCE_TARGET_MAX,
  BALANCE_POINTS,
  evaluatePourLevel,
  getSecretUnderBarConfig,
  isShotPourLocation,
  type Location,
  type PourResult,
} from "@/data/gameData";
import { createInitialGameState } from "@/state/gameDefaults";
import {
  useGameRoomSync,
  type RealtimeStatus,
} from "@/state/useGameRoomSync";

export type { PourResult };
export type { RealtimeStatus } from "@/state/useGameRoomSync";
export { createInitialGameState };

const POUR_TICK_MS = 50;

function emptyPourState() {
  return {
    pourLevel: 0,
    pourIsPouring: false,
    pourEvaluated: false,
    pourResult: null as PourResult | null,
  };
}

function evaluatePourState(s: GameState, level: number, loc: Location) {
  const targetMin = loc.targetMin ?? 80;
  const targetMax = loc.targetMax ?? 95;
  const pourResult = evaluatePourLevel(level, targetMin, targetMax);
  return {
    ...emptyPourState(),
    pourLevel: level,
    pourEvaluated: true,
    pourResult,
    pourIsPouring: false,
  };
}

export type SecretUnderBarPhase = "offer" | "entry" | "reveal";
export type EarlyGamePhase = "choosing-bar" | "post-bar-choice" | null;
export type BartenderPhase = "intro" | "outcome" | null;
export type FoodPhase = "choosing" | "pekin-event" | "pekin-aftermath" | "pekin-transition" | null;

export type BitwyPhase =
  | "intro"
  | "kitchen-shots"
  | "kitchen-confession"
  | "salon-narrator"
  | "salon-shot-pour"
  | "balance-intro"
  | "balance"
  | "complete"
  | null;

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
  riskPhase: RiskPhase;
  riskCountdownStart: number | null;
  riskQuestionStart: number | null;
  secretUnderBarCompleted: boolean;
  secretUnderBarPhase: SecretUnderBarPhase | null;
  secretUnderBarShotsConfirmed: number;
  secretShotPulse: number;
  pourLevel: number;
  pourIsPouring: boolean;
  pourEvaluated: boolean;
  pourResult: PourResult | null;
  earlyGamePhase: EarlyGamePhase;
  bartenderPhase: BartenderPhase;
  bartenderChoiceIndex: number | null;
  foodPhase: FoodPhase;
  bitwyPhase: BitwyPhase;
  bitwyKitchenShots: number;
  bitwyChoseKitchen: boolean;
  bitwyKitchenBailed: boolean;
  balanceStartTime: number | null;
  balanceStopPosition: number | null;
}

const STORAGE_KEY = "bachelor-quest-state-v3";

function shouldOfferSecretUnderBar(
  loc: Location,
  s: GameState,
): boolean {
  if (s.secretUnderBarCompleted || s.secretUnderBarPhase) return false;
  return !!getSecretUnderBarConfig(loc) && loc.id === MALE_PIWKO_ID;
}

function canPour(loc: Location, s: GameState): boolean {
  if (isShotPourLocation(loc)) return true;
  return loc.id === "bitwy" && s.bitwyPhase === "salon-shot-pour";
}

const FOOD_NARRATOR =
  "Po barach organizm Lamy zgłasza błąd krytyczny: brak cukru, brak godności, zbyt dużo decyzji. Czas coś zjeść.";

/** Determine post-bar state after a bar quest and/or secret finishes. */
function resolvePostBar(s: GameState): Pick<GameState, "earlyGamePhase" | "status" | "foodPhase"> {
  if (s.earlyGamePhase !== "choosing-bar") {
    return { earlyGamePhase: s.earlyGamePhase, foodPhase: s.foodPhase, status: { kind: "idle", message: "Wybierz lokację" } };
  }
  const hansOk = s.completedIds.includes("hans");
  const mpOk = s.completedIds.includes("male-piwko");
  if (hansOk && mpOk) {
    return {
      earlyGamePhase: null,
      foodPhase: "choosing",
      status: { kind: "idle", message: FOOD_NARRATOR },
    };
  }
  if (hansOk || mpOk) {
    const msg = hansOk
      ? "Teoretycznie można iść dalej. Praktycznie Lama zobaczył Małe Piwko na mapie i jego mózg uznał to za quest obowiązkowy."
      : "Po Małym Piwku normalny człowiek szukałby wody. Lama dostał na mapie Hansa i potraktował to jak zaproszenie od losu.";
    return { earlyGamePhase: "post-bar-choice", foodPhase: null, status: { kind: "idle", message: msg } };
  }
  return {
    earlyGamePhase: "choosing-bar",
    foodPhase: null,
    status: { kind: "idle", message: "Pierwszy etap przygotowań do ślubu: wybrać, gdzie się nakurwić." },
  };
}

function load(): GameState {
  if (typeof window === "undefined") return createInitialGameState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialGameState();
    return { ...createInitialGameState(), ...JSON.parse(raw) };
  } catch {
    return createInitialGameState();
  }
}

interface Ctx {
  state: GameState;
  realtimeStatus: RealtimeStatus;
  roomCode: string;
  locations: Location[];
  availableLocations: Location[];
  currentLocation: Location;
  activeQuest: Location | null;
  goToLocation: (id: string) => void;
  answerQuiz: (index: number) => void;
  resolveChallenge: (success: boolean) => void;
  acceptRisk: () => void;
  escapeRisk: () => void;
  startRiskQuestion: () => void;
  answerRisk: (index: number) => void;
  failRisk: () => void;
  showFinal: () => void;
  closeStatus: () => void;
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
  startPouring: () => void;
  stopPouring: () => void;
  acknowledgePourResult: () => void;
  chooseBartenderOption: (index: number) => void;
  continuePastBartender: () => void;
  choosePostBar: (goToOtherBar: boolean) => void;
  chooseFoodOption: (option: "pekin" | "gofer") => void;
  acknowledgePekinBar: () => void;
  chooseBitwyPath: (kitchen: boolean) => void;
  confirmBitwyKitchenShot: () => void;
  bailBitwyKitchen: () => void;
  listenToSkiba: () => void;
  advanceBitwy: () => void;
  stopBalance: () => void;
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => load());
  const [realtimeStatus, setRealtimeStatus] =
    useState<RealtimeStatus>("local-only");
  const { roomCode, pushStateNow } = useGameRoomSync(
    state,
    setState,
    setRealtimeStatus,
  );
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
    // Bar section: show uncompleted bars
    if (state.earlyGamePhase === "choosing-bar") {
      return locations.filter(
        (l) => (BAR_IDS as readonly string[]).includes(l.id) && !state.completedIds.includes(l.id),
      );
    }
    // Post-bar choice: no locations, UI handles the binary choice
    if (state.earlyGamePhase === "post-bar-choice") {
      return [];
    }
    // Food choice: show both food destinations on the map
    if (state.foodPhase === "choosing") {
      return locations.filter(
        (l) => l.id === "pekin-bar" || l.id === "gofer-przy-latarni",
      );
    }
    // Other food phases (event/aftermath): no selectable locations
    if (state.foodPhase) {
      return [];
    }
    // Linear progression after bar+food section
    const nextMain = UNLOCK_ORDER.find(
      (id) => !state.completedIds.includes(id),
    );
    return locations.filter((l) => {
      if (state.completedIds.includes(l.id)) return false;
      if (l.type === "start") return false;
      if (l.type === "risk") {
        return state.completedIds.includes("dzialka");
      }
      if ((BAR_IDS as readonly string[]).includes(l.id)) return false;
      return l.id === nextMain;
    });
  }, [state.completedIds, state.earlyGamePhase, state.foodPhase, locations]);

  const goToLocation = useCallback(
    (id: string) => {
      const loc = locations.find((l) => l.id === id);
      if (!loc) return;
      setState((s) => {
        // During food choice, intercept food destinations
        if (s.foodPhase === "choosing") {
          if (id === "pekin-bar") {
            return {
              ...s,
              foodPhase: "pekin-event" as const,
              currentLocationId: "pekin-bar",
              status: {
                kind: "idle" as const,
                message: "PEKIN BAR ZOSTAŁ SPRZEDANY PRZEZ CHIŃCZYKÓW",
              },
            };
          }
          if (id === "gofer-przy-latarni") {
            const hasBartender = !!loc.bartenderDialogue;
            return {
              ...s,
              foodPhase: null,
              currentLocationId: "gofer-przy-latarni",
              activeQuestId: "gofer-przy-latarni",
              bartenderPhase: hasBartender ? ("intro" as const) : null,
              bartenderChoiceIndex: null,
              ...emptyPourState(),
              riskPhase: null,
              riskCountdownStart: null,
              riskQuestionStart: null,
              status: { kind: "questActive" as const, message: `Quest: ${loc.name}` },
            };
          }
        }
        const hasBartender = !!loc.bartenderDialogue;
        return {
          ...s,
          currentLocationId: id,
          activeQuestId: id,
          riskPhase: loc.type === "risk" ? ("intro" as const) : null,
          riskCountdownStart: null,
          riskQuestionStart: null,
          ...emptyPourState(),
          bartenderPhase: hasBartender ? ("intro" as const) : null,
          bartenderChoiceIndex: null,
          bitwyPhase: id === "bitwy" ? ("intro" as BitwyPhase) : null,
          bitwyKitchenShots: id === "bitwy" ? 0 : s.bitwyKitchenShots,
          bitwyChoseKitchen: id === "bitwy" ? false : s.bitwyChoseKitchen,
          bitwyKitchenBailed: id === "bitwy" ? false : s.bitwyKitchenBailed,
          balanceStartTime: null,
          balanceStopPosition: null,
          status: { kind: "questActive" as const, message: `Quest: ${loc.name}` },
        };
      });
    },
    [locations],
  );

  const completeQuest = useCallback(
    (
      success: boolean,
      loc: Location,
      opts?: {
        penaltyShots?: number;
        teamShotOnSuccess?: boolean;
        statusMessage?: string;
      },
    ) => {
      setState((s) => {
        const pts = success ? loc.pointsForSuccess : 0;
        const isFinal = loc.type === "final";
        const penalty = opts?.penaltyShots ?? loc.penaltyShots ?? 1;
        const teamBonus =
          success && (opts?.teamShotOnSuccess ?? loc.teamShotOnSuccess)
            ? 1
            : 0;
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
          bartenderPhase: null,
          bartenderChoiceIndex: null,
          status: success
            ? {
                kind: "correct",
                message: opts?.statusMessage ?? loc.rewardText,
              }
            : {
                kind: "groomDrinks",
                message: opts?.statusMessage ?? loc.penaltyText,
              },
          finalShown: isFinal ? true : s.finalShown,
          ...emptyPourState(),
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
    setState((s) => {
      if (s.secretUnderBarPhase === "offer") {
        return { ...s, status: { kind: "idle", message: "Decyzja na kontrolerze 📱" } };
      }
      // BITWY: after pour feedback, go to balance intro
      if (s.activeQuestId === "bitwy" && s.bitwyPhase === "salon-shot-pour" &&
          (s.status.kind === "correct" || s.status.kind === "groomDrinks")) {
        return {
          ...s,
          bitwyPhase: "balance-intro" as BitwyPhase,
          status: {
            kind: "idle" as const,
            message: "Po tym szocie Lama zaczyna widzieć fabułę w lekkim opóźnieniu. Postanawia wstać, zanim organizm złoży wypowiedzenie.",
          },
        };
      }
      // BITWY: after balance feedback, go to complete
      if (s.activeQuestId === "bitwy" && s.bitwyPhase === "balance" &&
          (s.status.kind === "correct" || s.status.kind === "groomDrinks")) {
        return {
          ...s,
          bitwyPhase: "complete" as BitwyPhase,
          status: {
            kind: "idle" as const,
            message: "Lama wstaje. Nie jest to piękne, ale jest skuteczne. Czas opuścić BITWY, zanim ktoś zaproponuje trzecią kuchnię.",
          },
        };
      }
      // After Pekin Bar team shot, show transition note
      if (s.foodPhase === "pekin-aftermath") {
        return {
          ...s,
          foodPhase: "pekin-transition" as const,
          status: {
            kind: "idle" as const,
            message: "Pekin Bar umarł, ale głód Lamy nie. Lama jednak idzie po gofra.",
          },
        };
      }
      // After transition note, route to GOFER
      if (s.foodPhase === "pekin-transition") {
        const goferLoc = LOCATIONS.find((l) => l.id === "gofer-przy-latarni");
        if (goferLoc) {
          return {
            ...s,
            foodPhase: null,
            currentLocationId: "gofer-przy-latarni",
            activeQuestId: "gofer-przy-latarni",
            bartenderPhase: goferLoc.bartenderDialogue ? ("intro" as const) : null,
            bartenderChoiceIndex: null,
            ...emptyPourState(),
            riskPhase: null,
            riskCountdownStart: null,
            riskQuestionStart: null,
            status: { kind: "questActive" as const, message: `Quest: ${goferLoc.name}` },
          };
        }
      }
      // After a bar quest, check if we need to offer the second bar
      if (s.earlyGamePhase === "choosing-bar") {
        const pb = resolvePostBar(s);
        return { ...s, ...pb };
      }
      return { ...s, status: { kind: "idle", message: "Wybierz lokację" } };
    });
  }, []);

  // ── Bartender dialogue ──
  const chooseBartenderOption = useCallback(
    (index: number) => {
      setState((s) => {
        if (s.bartenderPhase !== "intro" || !s.activeQuestId) return s;
        const loc = locations.find((l) => l.id === s.activeQuestId);
        if (!loc?.bartenderDialogue) return s;
        const option = loc.bartenderDialogue.options[index];
        if (!option) return s;
        return {
          ...s,
          bartenderPhase: "outcome",
          bartenderChoiceIndex: index,
          manPoints: s.manPoints + (option.bonusPoints ?? 0),
        };
      });
    },
    [locations],
  );

  const continuePastBartender = useCallback(() => {
    setState((s) => {
      if (s.bartenderPhase !== "outcome") return s;
      return { ...s, bartenderPhase: null };
    });
  }, []);

  // ── Post-bar choice ──
  const choosePostBar = useCallback((goToOtherBar: boolean) => {
    setState((s) => {
      if (s.earlyGamePhase !== "post-bar-choice") return s;
      if (goToOtherBar) {
        const otherBarId = s.completedIds.includes("hans") ? "male-piwko" : "hans";
        const otherBar = LOCATIONS.find((l) => l.id === otherBarId);
        if (!otherBar) return s;
        const hasBartender = !!otherBar.bartenderDialogue;
        return {
          ...s,
          earlyGamePhase: "choosing-bar" as const,
          currentLocationId: otherBarId,
          activeQuestId: otherBarId,
          bartenderPhase: hasBartender ? ("intro" as const) : null,
          bartenderChoiceIndex: null,
          ...emptyPourState(),
          riskPhase: null,
          riskCountdownStart: null,
          riskQuestionStart: null,
          status: { kind: "questActive" as const, message: `Quest: ${otherBar.name}` },
        };
      }
      return {
        ...s,
        earlyGamePhase: null,
        foodPhase: "choosing" as const,
        status: { kind: "idle" as const, message: FOOD_NARRATOR },
      };
    });
  }, []);

  // ── Food choice (Pekin Bar / Gofer) ──
  const chooseFoodOption = useCallback(
    (option: "pekin" | "gofer") => {
      if (option === "pekin") {
        setState((s) => {
          if (s.foodPhase !== "choosing") return s;
          return {
            ...s,
            foodPhase: "pekin-event" as const,
            status: {
              kind: "idle" as const,
              message: "PEKIN BAR ZOSTAŁ SPRZEDANY PRZEZ CHIŃCZYKÓW",
            },
          };
        });
      } else {
        const loc = locations.find((l) => l.id === "gofer-przy-latarni");
        if (!loc) return;
        const hasBartender = !!loc.bartenderDialogue;
        setState((s) => {
          if (s.foodPhase !== "choosing") return s;
          return {
            ...s,
            foodPhase: null,
            currentLocationId: "gofer-przy-latarni",
            activeQuestId: "gofer-przy-latarni",
            bartenderPhase: hasBartender ? ("intro" as const) : null,
            bartenderChoiceIndex: null,
            ...emptyPourState(),
            riskPhase: null,
            riskCountdownStart: null,
            riskQuestionStart: null,
            status: { kind: "questActive" as const, message: `Quest: ${loc.name}` },
          };
        });
      }
    },
    [locations],
  );

  const acknowledgePekinBar = useCallback(() => {
    setState((s) => {
      if (s.foodPhase !== "pekin-event") return s;
      return {
        ...s,
        foodPhase: "pekin-aftermath" as const,
        teamShots: s.teamShots + 1,
        status: {
          kind: "teamDrinks" as const,
          message: "Wszyscy walą shota za pamięć Pekin Baru. 🍺",
        },
      };
    });
  }, []);

  const malePiwkoLoc =
    locations.find((l) => l.id === MALE_PIWKO_ID) ?? null;
  const secretUnderBarConfig = getSecretUnderBarConfig(malePiwkoLoc);

  const secretContinueJourney = useCallback(() => {
    setState((s) => {
      const pb = resolvePostBar({ ...s, secretUnderBarCompleted: true, secretUnderBarPhase: null });
      return {
        ...s,
        secretUnderBarCompleted: true,
        secretUnderBarPhase: null,
        secretUnderBarShotsConfirmed: 0,
        ...pb,
      };
    });
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
    setState((s) => {
      const pb = resolvePostBar({ ...s, secretUnderBarCompleted: true, secretUnderBarPhase: null });
      return {
        ...s,
        secretUnderBarCompleted: true,
        secretUnderBarPhase: null,
        secretUnderBarShotsConfirmed: 0,
        ...pb,
      };
    });
  }, []);

  const startPouring = useCallback(() => {
    setState((s) => {
      const loc = LOCATIONS.find((l) => l.id === s.activeQuestId);
      if (!loc || !canPour(loc, s) || s.pourEvaluated) return s;
      return { ...s, pourIsPouring: true };
    });
  }, []);

  const stopPouring = useCallback(() => {
    setState((s) => {
      const loc = LOCATIONS.find((l) => l.id === s.activeQuestId);
      if (!loc || !canPour(loc, s) || s.pourEvaluated) return s;
      if (!s.pourIsPouring) return s;
      return { ...s, ...evaluatePourState(s, s.pourLevel, loc) };
    });
  }, []);

  const acknowledgePourResult = useCallback(() => {
    setState((s) => {
      const loc = LOCATIONS.find((l) => l.id === s.activeQuestId);
      if (!loc || !s.pourEvaluated || !s.pourResult) return s;
      if (!canPour(loc, s)) return s;
      const success = s.pourResult === "success";
      const statusMessage = success
        ? (loc.successTitle ?? loc.rewardText)
        : s.pourResult === "under"
          ? (loc.underTitle ?? loc.underPenaltyText ?? loc.penaltyText)
          : (loc.overTitle ?? loc.overPenaltyText ?? loc.penaltyText);
      const pts = success ? loc.pointsForSuccess : 0;
      const penalty = loc.penaltyShots ?? 1;
      // BITWY: stay in quest, feedback will transition to balance via closeStatus
      if (loc.id === "bitwy") {
        return {
          ...s,
          manPoints: s.manPoints + pts,
          shotCount: success ? s.shotCount : s.shotCount + penalty,
          ...emptyPourState(),
          status: success
            ? { kind: "correct" as const, message: statusMessage }
            : { kind: "groomDrinks" as const, message: statusMessage },
        };
      }
      return {
        ...s,
        manPoints: s.manPoints + pts,
        shotCount: success ? s.shotCount : s.shotCount + penalty,
        completedIds: [...s.completedIds, loc.id],
        failedIds: success ? s.failedIds : [...s.failedIds, loc.id],
        activeQuestId: null,
        ...emptyPourState(),
        status: success
          ? { kind: "correct", message: statusMessage }
          : { kind: "groomDrinks", message: statusMessage },
      };
    });
  }, []);

  useEffect(() => {
    if (!state.pourIsPouring || state.pourEvaluated) return;
    const loc = locations.find((l) => l.id === state.activeQuestId);
    if (!loc || !canPour(loc, state)) return;

    const id = setInterval(() => {
      setState((s) => {
        if (!s.pourIsPouring || s.pourEvaluated) return s;
        const activeLoc = locations.find((l) => l.id === s.activeQuestId);
        if (!activeLoc || !canPour(activeLoc, s)) return s;
        const speed = activeLoc.fillSpeed ?? 45;
        const delta = (speed * POUR_TICK_MS) / 1000;
        const next = Math.min(100, s.pourLevel + delta);
        if (next >= 100) {
          return { ...s, ...evaluatePourState(s, 100, activeLoc) };
        }
        return { ...s, pourLevel: next };
      });
    }, POUR_TICK_MS);
    return () => clearInterval(id);
  }, [state.pourIsPouring, state.pourEvaluated, state.activeQuestId, state.bitwyPhase, locations]);

  // ── BITWY actions ──────────────────────────────────────────────
  const chooseBitwyPath = useCallback((kitchen: boolean) => {
    setState((s) => {
      if (s.bitwyPhase !== "intro") return s;
      return {
        ...s,
        bitwyPhase: kitchen ? ("kitchen-shots" as BitwyPhase) : ("salon-narrator" as BitwyPhase),
        bitwyChoseKitchen: kitchen,
        bitwyKitchenShots: 0,
        bitwyKitchenBailed: false,
        status: {
          kind: "idle" as const,
          message: kitchen
            ? "Lama wchodzi do kuchni na BITWY."
            : "Lama próbuje zachować klasę i ominąć kuchnię. Skiba zapamięta ten brak lojalności.",
        },
      };
    });
  }, []);

  const confirmBitwyKitchenShot = useCallback(() => {
    setState((s) => {
      if (s.bitwyPhase !== "kitchen-shots" || s.bitwyKitchenShots >= 2) return s;
      const next = s.bitwyKitchenShots + 1;
      return {
        ...s,
        shotCount: s.shotCount + 1,
        bitwyKitchenShots: next,
        status: { kind: "idle" as const, message: `Shot ${next}/2 potwierdzony! 🥃` },
      };
    });
  }, []);

  const bailBitwyKitchen = useCallback(() => {
    setState((s) => {
      if (s.bitwyPhase !== "kitchen-shots" || s.bitwyKitchenShots >= 2) return s;
      return {
        ...s,
        bitwyPhase: "salon-narrator" as BitwyPhase,
        bitwyKitchenBailed: true,
        status: {
          kind: "idle" as const,
          message:
            "Lama nie dał rady. Skiba kiwa głową z rozczarowaniem, jakby widział to już wcześniej.",
        },
      };
    });
  }, []);

  const listenToSkiba = useCallback(() => {
    setState((s) => {
      if (s.bitwyPhase !== "kitchen-shots" || s.bitwyKitchenShots < 2) return s;
      return {
        ...s,
        bitwyPhase: "kitchen-confession" as BitwyPhase,
        status: { kind: "idle" as const, message: "Skiba ma coś do powiedzenia..." },
      };
    });
  }, []);

  const advanceBitwy = useCallback(() => {
    setState((s) => {
      if (s.activeQuestId !== "bitwy" || !s.bitwyPhase) return s;
      switch (s.bitwyPhase) {
        case "kitchen-confession":
          return {
            ...s,
            bitwyPhase: "salon-narrator" as BitwyPhase,
            status: { kind: "idle" as const, message: "Czas na salon." },
          };
        case "salon-narrator":
          return {
            ...s,
            bitwyPhase: "salon-shot-pour" as BitwyPhase,
            ...emptyPourState(),
            status: { kind: "questActive" as const, message: "BITWY — Nalej szota" },
          };
        case "balance-intro":
          return {
            ...s,
            bitwyPhase: "balance" as BitwyPhase,
            balanceStartTime: Date.now(),
            balanceStopPosition: null,
            status: { kind: "questActive" as const, message: "ZŁAP PION" },
          };
        case "complete":
          return {
            ...s,
            bitwyPhase: null,
            activeQuestId: null,
            completedIds: [...s.completedIds, "bitwy"],
            balanceStartTime: null,
            balanceStopPosition: null,
            status: { kind: "idle" as const, message: "Wybierz lokację" },
          };
        default:
          return s;
      }
    });
  }, []);

  const stopBalance = useCallback(() => {
    setState((s) => {
      if (s.bitwyPhase !== "balance" || !s.balanceStartTime || s.balanceStopPosition != null) return s;
      const elapsed = Date.now() - s.balanceStartTime;
      const t = (elapsed % BALANCE_PERIOD_MS) / BALANCE_PERIOD_MS;
      const pos = t < 0.5 ? t * 200 : 200 - t * 200;
      const success = pos >= BALANCE_TARGET_MIN && pos <= BALANCE_TARGET_MAX;
      return {
        ...s,
        balanceStopPosition: pos,
        manPoints: s.manPoints + (success ? BALANCE_POINTS : 0),
        shotCount: success ? s.shotCount : s.shotCount + 1,
        status: success
          ? { kind: "correct" as const, message: "Pion złapany. Chwilowo. Fizyka jest zaskoczona." }
          : { kind: "groomDrinks" as const, message: "Pion uciekł. Godność też. Lama pije." },
      };
    });
  }, []);

  const reset = useCallback(() => {
    const next = createInitialGameState();
    setState(next);
    void pushStateNow(next);
  }, [pushStateNow]);
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
      return { ...s, currentLocationId: nextId, activeQuestId: null, earlyGamePhase: null };
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
        bartenderPhase: null,
        bartenderChoiceIndex: null,
        bitwyPhase: null,
        balanceStartTime: null,
        balanceStopPosition: null,
        bitwyKitchenBailed: false,
        ...emptyPourState(),
        status: { kind: "correct", message: loc.rewardText },
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
        bartenderPhase: null,
        bartenderChoiceIndex: null,
        ...emptyPourState(),
        status: {
          kind: "groomDrinks",
          message: loc.penaltyText || "LAMA PIJE",
        },
        secretUnderBarPhase: offerSecret ? "offer" : s.secretUnderBarPhase,
      };
    });
  }, []);

  const value: Ctx = {
    state,
    realtimeStatus,
    roomCode,
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
    startPouring,
    stopPouring,
    acknowledgePourResult,
    chooseBartenderOption,
    continuePastBartender,
    choosePostBar,
    chooseFoodOption,
    acknowledgePekinBar,
    chooseBitwyPath,
    confirmBitwyKitchenShot,
    bailBitwyKitchen,
    listenToSkiba,
    advanceBitwy,
    stopBalance,
  };

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}

export function useTick(intervalMs = 100) {
  const [, setT] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setT((v) => v + 1), intervalMs);
    return () => clearInterval(i);
  }, [intervalMs]);
}
