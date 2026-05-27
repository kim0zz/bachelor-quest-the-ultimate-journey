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
  POST_BITWY_TRANSITION_TEXT,
  HULAJNOGA_REQUIRED_CLICKS,
  HULAJNOGA_POINTS,
  DZIALKA_RAP,
  PARYZ_VOMIT_TEXT,
  PARYZ_SLEEP_TEXT,
  PARYZ_ESCAPE_TRANSITION,
  DOM_DIRECT_TRANSITION,
  PRE_BITWY_ZUKER_INTRO,
  PRE_BITWY_ZUKER_LINE,
  PRE_BITWY_NARRATOR,
  evaluatePourLevel,
  getSecretUnderBarConfig,
  isShotPourLocation,
  type Location,
  type PourResult,
} from "@/data/gameData";
import { isControllerClient, isTvClient } from "@/lib/clientRole";
import { getSupabase } from "@/lib/supabase";
import { computeHulajnogaEndsAt } from "@/lib/hulajnogaDisplay";
import { computePourDisplayLevel } from "@/lib/pourLevel";
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
    pourStartedAt: null as number | null,
    pourIsPouring: false,
    pourEvaluated: false,
    pourResult: null as PourResult | null,
  };
}

function getPourFillSpeed(loc: Location): number {
  return loc.fillSpeed ?? 45;
}

function resolvePourLevelForStop(s: GameState, loc: Location): number {
  return computePourDisplayLevel(
    s.pourStartedAt,
    s.pourIsPouring,
    s.pourEvaluated,
    s.pourLevel,
    getPourFillSpeed(loc),
  );
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

export type PostBitwyPhase = "transition" | null;

export type PreBitwyPhase = "zuker-call" | null;

export type PostDrewniakPhase =
  | "hulajnoga-choice"
  | "hulajnoga-skip-narrator"
  | "hulajnoga-running"
  | "hulajnoga-result"
  | null;

export type HulajnogaResult = "success" | "fail" | null;

export type DzialkaPhase =
  | "intro"
  | "random"
  | "rap"
  | "rap-result"
  | "final-choice"
  | null;

export type ParyzPhase =
  | "intro"
  | "choice-1"
  | "vomit"
  | "choice-2"
  | "sleep"
  | "choice-3"
  | "marta-call"
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
  pourStartedAt: number | null;
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
  postBitwyPhase: PostBitwyPhase;
  preBitwyPhase: PreBitwyPhase;
  pendingMpSecretOffer: boolean;
  pendingZukerCall: boolean;
  postDrewniakPhase: PostDrewniakPhase;
  hulajnogaStartedAt: number | null;
  hulajnogaEndsAt: number | null;
  hulajnogaClicks: number;
  hulajnogaResult: HulajnogaResult;
  dzialkaPhase: DzialkaPhase;
  paryzPhase: ParyzPhase;
  paryzCalledMarta: boolean;
  paryzTookFirstShot: boolean;
  paryzTookGroupShot: boolean;
  paryzSleptInWoods: boolean;
  sawPekinEvent: boolean;
  bitwyBalanceSuccess: boolean;
  bitwyHeardSkibaConfession: boolean;
  hulajnogaSucceeded: boolean;
  hulajnogaFailed: boolean;
  dzialkaRapOutcome: "success" | "fail" | null;
}

function emptyHulajnogaState() {
  return {
    postDrewniakPhase: null as PostDrewniakPhase,
    hulajnogaStartedAt: null as number | null,
    hulajnogaEndsAt: null as number | null,
    hulajnogaClicks: 0,
    hulajnogaResult: null as HulajnogaResult,
  };
}

function applyHulajnogaResult(s: GameState, success: boolean): GameState {
  if (s.hulajnogaResult) return s;
  return {
    ...s,
    postDrewniakPhase: "hulajnoga-result",
    hulajnogaResult: success ? "success" : "fail",
    hulajnogaSucceeded: success ? true : s.hulajnogaSucceeded,
    hulajnogaFailed: success ? s.hulajnogaFailed : true,
    manPoints: s.manPoints + (success ? HULAJNOGA_POINTS : 0),
    shotCount: success ? s.shotCount : s.shotCount + 1,
    status: success
      ? {
          kind: "correct" as const,
          message:
            "Lama dojechał na działkę. Pojazd i godność w stanie akceptowalnym. +15 Mąż Points.",
        }
      : {
          kind: "groomDrinks" as const,
          message:
            "Hulajnoga wygrała. Lama przeprowadził kontrolowane spotkanie z chodnikiem. Shot na ukojenie bólu.",
        },
  };
}

function startDzialkaQuest(s: GameState): GameState {
  return {
    ...s,
    currentLocationId: "dzialka",
    activeQuestId: "dzialka",
    dzialkaPhase: "intro",
    riskPhase: null,
    riskCountdownStart: null,
    riskQuestionStart: null,
    bartenderPhase: null,
    bartenderChoiceIndex: null,
    ...emptyPourState(),
    status: { kind: "idle" as const, message: "DZIAŁKA" },
  };
}

function routeToDzialka(s: GameState): GameState {
  return startDzialkaQuest({
    ...s,
    postBitwyPhase: null,
    ...emptyHulajnogaState(),
  });
}

function startParyzQuest(s: GameState): GameState {
  return {
    ...s,
    currentLocationId: "paryz",
    activeQuestId: "paryz",
    paryzPhase: "intro",
    dzialkaPhase: null,
    riskPhase: null,
    riskCountdownStart: null,
    riskQuestionStart: null,
    bartenderPhase: null,
    bartenderChoiceIndex: null,
    ...emptyPourState(),
    status: { kind: "idle" as const, message: "PARYŻ" },
  };
}

function routeToDomSummary(
  s: GameState,
  transitionMessage: string,
  options?: { completeParyz?: boolean; clearParyz?: boolean },
): GameState {
  const completeParyz = options?.completeParyz ?? false;
  const clearParyz = options?.clearParyz ?? true;
  const completedIds = [...s.completedIds];
  if (!completedIds.includes("dzialka")) completedIds.push("dzialka");
  if (completeParyz && !completedIds.includes("paryz")) completedIds.push("paryz");
  if (!completedIds.includes("dom-zgon")) completedIds.push("dom-zgon");
  return {
    ...s,
    currentLocationId: "dom-zgon",
    activeQuestId: null,
    completedIds,
    finalShown: true,
    dzialkaPhase: null,
    paryzPhase: clearParyz ? null : s.paryzPhase,
    riskPhase: null,
    riskCountdownStart: null,
    riskQuestionStart: null,
    bartenderPhase: null,
    bartenderChoiceIndex: null,
    ...emptyPourState(),
    status: { kind: "final" as const, message: transitionMessage },
  };
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
  // TV + Supabase: do not boot from stale localStorage; wait for room hydrate/realtime.
  if (isTvClient() && getSupabase()) {
    return createInitialGameState();
  }
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
  skipHulajnoga: () => void;
  startHulajnoga: () => void;
  hulajnogaClick: () => void;
  advanceDzialka: () => void;
  answerDzialkaRap: (index: number) => void;
  chooseDzialkaRoute: (route: "paryz" | "dom-zgon") => void;
  advanceParyz: () => void;
  chooseParyzOption: (
    option: "real-shot" | "group-shot" | "call-marta" | "go-home",
  ) => void;
  confirmParyzReturnHome: () => void;
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
    if (realtimeStatus === "connected" || realtimeStatus === "connecting") {
      return;
    }
    writingRef.current = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    writingRef.current = false;
  }, [state, realtimeStatus]);

  useEffect(() => {
    if (getSupabase()) {
      return;
    }
    function onStorage(e: StorageEvent) {
      if (e.key !== STORAGE_KEY || !e.newValue || writingRef.current) return;
      try {
        setState({ ...createInitialGameState(), ...JSON.parse(e.newValue) });
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
    if (state.postBitwyPhase || state.preBitwyPhase || state.postDrewniakPhase) {
      return [];
    }
    if (state.dzialkaPhase) {
      return [];
    }
    if (state.paryzPhase) {
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
  }, [
    state.completedIds,
    state.earlyGamePhase,
    state.foodPhase,
    state.postBitwyPhase,
    state.preBitwyPhase,
    state.postDrewniakPhase,
    state.dzialkaPhase,
    state.paryzPhase,
    locations,
  ]);

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
          bitwyHeardSkibaConfession:
            id === "bitwy" ? false : s.bitwyHeardSkibaConfession,
          balanceStartTime: null,
          balanceStopPosition: null,
          dzialkaPhase: id === "dzialka" ? ("intro" as DzialkaPhase) : null,
          paryzPhase: id === "paryz" ? ("intro" as ParyzPhase) : null,
          status:
            id === "dzialka"
              ? { kind: "idle" as const, message: "DZIAŁKA" }
              : id === "paryz"
                ? { kind: "idle" as const, message: "PARYŻ" }
              : { kind: "questActive" as const, message: `Quest: ${loc.name}` },
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
          pendingMpSecretOffer: loc.id === MALE_PIWKO_ID,
          pendingZukerCall: loc.id === "gofer-przy-latarni",
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
      if (s.pendingMpSecretOffer) {
        const mpLoc = LOCATIONS.find((l) => l.id === MALE_PIWKO_ID);
        if (mpLoc && shouldOfferSecretUnderBar(mpLoc, s)) {
          return {
            ...s,
            pendingMpSecretOffer: false,
            secretUnderBarPhase: "offer",
            status: {
              kind: "idle" as const,
              message: mpLoc.postQuestSecretUnderBar?.offerTitle ?? "SEKRET POD BAREM?",
            },
          };
        }
        const pb = resolvePostBar({ ...s, pendingMpSecretOffer: false });
        return { ...s, pendingMpSecretOffer: false, ...pb };
      }
      if (s.preBitwyPhase === "zuker-call") {
        const bitwyLoc = LOCATIONS.find((l) => l.id === "bitwy");
        return {
          ...s,
          preBitwyPhase: null,
          currentLocationId: "bitwy",
          activeQuestId: "bitwy",
          bitwyPhase: "intro",
          bitwyKitchenShots: 0,
          bitwyChoseKitchen: false,
          bitwyKitchenBailed: false,
          ...emptyPourState(),
          status: {
            kind: "questActive" as const,
            message: `Quest: ${bitwyLoc?.name ?? "BITWY"}`,
          },
        };
      }
      if (s.pendingZukerCall) {
        return {
          ...s,
          pendingZukerCall: false,
          preBitwyPhase: "zuker-call",
          status: { kind: "idle" as const, message: PRE_BITWY_ZUKER_INTRO },
        };
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
            message:
              "Lama opuszcza BITWY, zanim melina uzna go za element wyposażenia.",
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
      if (s.postBitwyPhase === "transition") {
        const drewniakLoc = LOCATIONS.find((l) => l.id === "drewniak");
        return {
          ...s,
          postBitwyPhase: null,
          currentLocationId: "drewniak",
          activeQuestId: "drewniak",
          status: {
            kind: "questActive" as const,
            message: `Quest: ${drewniakLoc?.name ?? "DREWNIAK"}`,
          },
        };
      }
      if (s.postDrewniakPhase === "hulajnoga-skip-narrator") {
        return routeToDzialka(s);
      }
      if (
        s.postDrewniakPhase === "hulajnoga-result" &&
        (s.status.kind === "correct" || s.status.kind === "groomDrinks")
      ) {
        return routeToDzialka(s);
      }
      if (
        s.currentLocationId === "drewniak" &&
        s.completedIds.includes("drewniak") &&
        !s.postDrewniakPhase &&
        !s.activeQuestId &&
        (s.status.kind === "correct" || s.status.kind === "groomDrinks")
      ) {
        return {
          ...s,
          postDrewniakPhase: "hulajnoga-choice",
          status: { kind: "idle" as const, message: "CZY BIERZESZ HULAJNOGĘ?" },
        };
      }
      if (
        s.activeQuestId === "dzialka" &&
        s.dzialkaPhase === "rap-result" &&
        (s.status.kind === "correct" ||
          s.status.kind === "groomDrinks" ||
          s.status.kind === "teamDrinks")
      ) {
        return {
          ...s,
          dzialkaPhase: "final-choice",
          status: { kind: "idle" as const, message: "PARYŻ czy DOM?" },
        };
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
        sawPekinEvent: true,
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
    if (!isControllerClient()) return;
    setState((s) => {
      const loc = LOCATIONS.find((l) => l.id === s.activeQuestId);
      if (!loc || !canPour(loc, s) || s.pourEvaluated || s.pourIsPouring) return s;
      const now = Date.now();
      return {
        ...s,
        pourIsPouring: true,
        pourStartedAt: now,
        pourLevel: 0,
      };
    });
  }, []);

  const stopPouring = useCallback(() => {
    if (!isControllerClient()) return;
    setState((s) => {
      const loc = LOCATIONS.find((l) => l.id === s.activeQuestId);
      if (!loc || !canPour(loc, s) || s.pourEvaluated) return s;
      if (!s.pourIsPouring) return s;
      const level = resolvePourLevelForStop(s, loc);
      return { ...s, ...evaluatePourState(s, level, loc) };
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

  // Controller-only: auto-stop at 100% without syncing pourLevel every frame.
  useEffect(() => {
    if (!isControllerClient()) return;
    if (!state.pourIsPouring || state.pourEvaluated) return;
    const loc = locations.find((l) => l.id === state.activeQuestId);
    if (!loc || !canPour(loc, state)) return;

    const id = setInterval(() => {
      setState((s) => {
        if (!s.pourIsPouring || s.pourEvaluated) return s;
        const activeLoc = locations.find((l) => l.id === s.activeQuestId);
        if (!activeLoc || !canPour(activeLoc, s)) return s;
        const level = resolvePourLevelForStop(s, activeLoc);
        if (level >= 100) {
          return { ...s, ...evaluatePourState(s, 100, activeLoc) };
        }
        return s;
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
        bitwyHeardSkibaConfession: true,
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
            status: { kind: "idle" as const, message: "Czas na Pokój Bewicza." },
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
            completedIds: s.completedIds.includes("bitwy")
              ? s.completedIds
              : [...s.completedIds, "bitwy"],
            balanceStartTime: null,
            balanceStopPosition: null,
            postBitwyPhase: "transition",
            status: {
              kind: "idle" as const,
              message: POST_BITWY_TRANSITION_TEXT,
            },
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
        bitwyBalanceSuccess: success ? true : s.bitwyBalanceSuccess,
        manPoints: s.manPoints + (success ? BALANCE_POINTS : 0),
        shotCount: success ? s.shotCount : s.shotCount + 1,
        status: success
          ? { kind: "correct" as const, message: "Pion złapany. Chwilowo. Fizyka jest zaskoczona." }
          : { kind: "groomDrinks" as const, message: "Pion uciekł. Godność też. Lama pije." },
      };
    });
  }, []);

  const skipHulajnoga = useCallback(() => {
    setState((s) => {
      if (s.postDrewniakPhase !== "hulajnoga-choice") return s;
      return {
        ...s,
        postDrewniakPhase: "hulajnoga-skip-narrator",
        status: {
          kind: "idle" as const,
          message:
            "Niepokojąco rozsądna decyzja. Lama dociera na działkę bez punktów za styl, ale też bez nowej historii medycznej.",
        },
      };
    });
  }, []);

  const startHulajnoga = useCallback(() => {
    if (!isControllerClient()) return;
    setState((s) => {
      if (s.postDrewniakPhase !== "hulajnoga-choice") return s;
      const now = Date.now();
      return {
        ...s,
        postDrewniakPhase: "hulajnoga-running",
        hulajnogaStartedAt: now,
        hulajnogaEndsAt: computeHulajnogaEndsAt(now),
        hulajnogaClicks: 0,
        hulajnogaResult: null,
        status: { kind: "questActive" as const, message: "HULAJNOGA HIGH RISK" },
      };
    });
  }, []);

  const hulajnogaClick = useCallback(() => {
    if (!isControllerClient()) return;
    setState((s) => {
      if (s.postDrewniakPhase !== "hulajnoga-running" || s.hulajnogaResult) return s;
      const next = s.hulajnogaClicks + 1;
      if (next >= HULAJNOGA_REQUIRED_CLICKS) {
        return applyHulajnogaResult({ ...s, hulajnogaClicks: next }, true);
      }
      return { ...s, hulajnogaClicks: next };
    });
  }, []);

  // Controller-only fail timer (uses endsAt set at start).
  useEffect(() => {
    if (!isControllerClient()) return;
    if (state.postDrewniakPhase !== "hulajnoga-running" || state.hulajnogaResult) {
      return;
    }
    const endsAt = state.hulajnogaEndsAt;
    if (endsAt == null) return;

    const remaining = endsAt - Date.now();
    if (remaining <= 0) {
      setState((s) => {
        if (s.postDrewniakPhase !== "hulajnoga-running" || s.hulajnogaResult) return s;
        return applyHulajnogaResult(s, false);
      });
      return;
    }

    const t = setTimeout(() => {
      setState((s) => {
        if (s.postDrewniakPhase !== "hulajnoga-running" || s.hulajnogaResult) return s;
        if (s.hulajnogaEndsAt != null && Date.now() >= s.hulajnogaEndsAt) {
          return applyHulajnogaResult(s, false);
        }
        return s;
      });
    }, remaining);
    return () => clearTimeout(t);
  }, [state.postDrewniakPhase, state.hulajnogaEndsAt, state.hulajnogaResult]);

  const advanceDzialka = useCallback(() => {
    setState((s) => {
      if (s.activeQuestId !== "dzialka" || !s.dzialkaPhase) return s;
      switch (s.dzialkaPhase) {
        case "intro":
          return { ...s, dzialkaPhase: "random", status: { kind: "idle" as const, message: "DZIAŁKA" } };
        case "random":
          return {
            ...s,
            dzialkaPhase: "rap",
            status: { kind: "questActive" as const, message: "DZIAŁKA RAP TEST" },
          };
        default:
          return s;
      }
    });
  }, []);

  const answerDzialkaRap = useCallback((index: number) => {
    setState((s) => {
      if (s.dzialkaPhase !== "rap" || s.activeQuestId !== "dzialka") return s;
      const success = index === DZIALKA_RAP.correctAnswerIndex;
      const message = success
        ? `${DZIALKA_RAP.successNarrator}\n\n${DZIALKA_RAP.successFeedback}`
        : `${DZIALKA_RAP.failureNarrator}\n\n${DZIALKA_RAP.failureFeedback}`;
      return {
        ...s,
        dzialkaPhase: "rap-result",
        dzialkaRapOutcome: success ? "success" : "fail",
        teamShots: success ? s.teamShots + 1 : s.teamShots,
        shotCount: success ? s.shotCount : s.shotCount + 1,
        status: success
          ? { kind: "teamDrinks" as const, message }
          : { kind: "groomDrinks" as const, message },
      };
    });
  }, []);

  const chooseDzialkaRoute = useCallback((route: "paryz" | "dom-zgon") => {
    setState((s) => {
      if (s.dzialkaPhase !== "final-choice" || s.activeQuestId !== "dzialka") return s;
      if (route === "paryz") {
        return startParyzQuest({
          ...s,
          completedIds: s.completedIds.includes("dzialka")
            ? s.completedIds
            : [...s.completedIds, "dzialka"],
        });
      }
      return routeToDomSummary(
        {
          ...s,
          completedIds: s.completedIds.includes("dzialka")
            ? s.completedIds
            : [...s.completedIds, "dzialka"],
        },
        DOM_DIRECT_TRANSITION,
        { completeParyz: false, clearParyz: true },
      );
    });
  }, []);

  const advanceParyz = useCallback(() => {
    setState((s) => {
      if (s.activeQuestId !== "paryz" || !s.paryzPhase) return s;
      switch (s.paryzPhase) {
        case "intro":
          return { ...s, paryzPhase: "choice-1", status: { kind: "idle" as const, message: "PARYŻ — DECYZJA 1" } };
        case "vomit":
          return { ...s, paryzPhase: "choice-2", status: { kind: "idle" as const, message: "PARYŻ — DECYZJA 2" } };
        case "sleep":
          return { ...s, paryzPhase: "choice-3", status: { kind: "idle" as const, message: "PARYŻ — DECYZJA 3" } };
        default:
          return s;
      }
    });
  }, []);

  const chooseParyzOption = useCallback(
    (option: "real-shot" | "group-shot" | "call-marta" | "go-home") => {
      setState((s) => {
        if (s.activeQuestId !== "paryz" || !s.paryzPhase) return s;
        if (option === "call-marta") {
          return {
            ...s,
            paryzCalledMarta: true,
            paryzPhase: "marta-call",
            status: { kind: "idle" as const, message: "MARTA ODBIERA" },
          };
        }
        if (option === "real-shot" && s.paryzPhase === "choice-1") {
          return {
            ...s,
            shotCount: s.shotCount + 1,
            paryzTookFirstShot: true,
            paryzPhase: "vomit",
            status: { kind: "idle" as const, message: PARYZ_VOMIT_TEXT },
          };
        }
        if (option === "group-shot" && s.paryzPhase === "choice-2") {
          return {
            ...s,
            shotCount: s.shotCount + 1,
            teamShots: s.teamShots + 1,
            paryzTookGroupShot: true,
            paryzSleptInWoods: true,
            paryzPhase: "sleep",
            status: { kind: "idle" as const, message: `${PARYZ_SLEEP_TEXT}\n\nLama budzi się w szoku.` },
          };
        }
        if (option === "go-home" && s.paryzPhase === "choice-3") {
          return routeToDomSummary(s, PARYZ_ESCAPE_TRANSITION, {
            completeParyz: true,
            clearParyz: true,
          });
        }
        return s;
      });
    },
    [],
  );

  const confirmParyzReturnHome = useCallback(() => {
    setState((s) => {
      if (s.activeQuestId !== "paryz" || s.paryzPhase !== "marta-call") return s;
      return routeToDomSummary(
        { ...s, paryzCalledMarta: true },
        "System wykrył głos rozsądku. Lama otrzymuje misję główną: powrót do domu.",
        { completeParyz: true, clearParyz: true },
      );
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
        postBitwyPhase: null,
        preBitwyPhase: null,
        pendingMpSecretOffer: false,
        pendingZukerCall: false,
        secretUnderBarPhase: null,
        secretUnderBarCompleted: false,
        secretUnderBarShotsConfirmed: 0,
        ...emptyHulajnogaState(),
        dzialkaPhase: null,
        paryzPhase: null,
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
        paryzPhase: null,
        ...emptyPourState(),
        status: {
          kind: "groomDrinks",
          message: loc.penaltyText || "LAMA PIJE",
        },
        pendingMpSecretOffer:
          loc.id === MALE_PIWKO_ID && offerSecret,
        pendingZukerCall: loc.id === "gofer-przy-latarni",
        secretUnderBarPhase:
          offerSecret && loc.id !== MALE_PIWKO_ID ? "offer" : s.secretUnderBarPhase,
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
    skipHulajnoga,
    startHulajnoga,
    hulajnogaClick,
    advanceDzialka,
    answerDzialkaRap,
    chooseDzialkaRoute,
    advanceParyz,
    chooseParyzOption,
    confirmParyzReturnHome,
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
