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
import { LOCATIONS, UNLOCK_ORDER, type Location } from "@/data/gameData";

export type StatusKind =
  | "idle"
  | "questActive"
  | "correct"
  | "wrong"
  | "groomDrinks"
  | "teamDrinks"
  | "secret"
  | "final";

export interface GameStatus {
  kind: StatusKind;
  message: string;
}

export interface GameState {
  manPoints: number;
  shotCount: number;
  teamShots: number;
  currentLocationId: string; // gdzie stoi avatar
  activeQuestId: string | null; // otwarty quest
  completedIds: string[];
  failedIds: string[];
  status: GameStatus;
  finalShown: boolean;
}

const STORAGE_KEY = "bachelor-quest-state-v1";

function initialState(): GameState {
  return {
    manPoints: 0,
    shotCount: 0,
    teamShots: 0,
    currentLocationId: LOCATIONS[0].id,
    activeQuestId: null,
    completedIds: [],
    failedIds: [],
    status: { kind: "idle", message: "Wybierz lokację" },
    finalShown: false,
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
  revealSecret: () => void;
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
}

const GameCtx = createContext<Ctx | null>(null);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GameState>(() => load());
  const writingRef = useRef(false);

  // persist + cross-tab sync
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
    // pierwsza nieukończona w UNLOCK_ORDER + wszystkie sekrety nieukończone
    const nextMain = UNLOCK_ORDER.find(
      (id) => !state.completedIds.includes(id),
    );
    return locations.filter((l) => {
      if (state.completedIds.includes(l.id)) return false;
      if (l.isSecret) return true;
      return l.id === nextMain;
    });
  }, [state.completedIds, locations]);

  const setStatus = useCallback((status: GameStatus) => {
    setState((s) => ({ ...s, status }));
  }, []);

  const goToLocation = useCallback(
    (id: string) => {
      const loc = locations.find((l) => l.id === id);
      if (!loc) return;
      setState((s) => ({
        ...s,
        currentLocationId: id,
        activeQuestId: id,
        status: { kind: "questActive", message: `Quest: ${loc.name}` },
      }));
    },
    [locations],
  );

  const completeQuest = useCallback(
    (success: boolean, loc: Location) => {
      setState((s) => {
        const pts = success ? loc.pointsForSuccess : 0;
        const isFinal = loc.type === "final";
        return {
          ...s,
          manPoints: s.manPoints + pts,
          shotCount: !success && !isFinal ? s.shotCount + 1 : s.shotCount,
          completedIds: [...s.completedIds, loc.id],
          failedIds: success ? s.failedIds : [...s.failedIds, loc.id],
          activeQuestId: null,
          status: success
            ? { kind: "correct", message: loc.rewardText }
            : { kind: "groomDrinks", message: loc.penaltyText },
          finalShown: isFinal ? true : s.finalShown,
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

  const revealSecret = useCallback(() => {
    if (!activeQuest || activeQuest.type !== "secret") return;
    setState((s) => ({
      ...s,
      manPoints: s.manPoints + activeQuest.pointsForSuccess,
      teamShots: s.teamShots + 1,
      completedIds: [...s.completedIds, activeQuest.id],
      activeQuestId: null,
      status: {
        kind: "secret",
        message: activeQuest.secretText ?? activeQuest.rewardText,
      },
    }));
  }, [activeQuest]);

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
      status: { kind: "idle", message: "Wybierz lokację" },
    }));
  }, []);

  // admin
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
      const loc = LOCATIONS.find((l) => l.id === (s.activeQuestId ?? s.currentLocationId));
      if (!loc) return s;
      return {
        ...s,
        manPoints: s.manPoints + loc.pointsForSuccess,
        completedIds: s.completedIds.includes(loc.id)
          ? s.completedIds
          : [...s.completedIds, loc.id],
        activeQuestId: null,
        status: { kind: "correct", message: loc.rewardText },
      };
    });
  }, []);
  const forceFail = useCallback(() => {
    setState((s) => {
      const loc = LOCATIONS.find((l) => l.id === (s.activeQuestId ?? s.currentLocationId));
      if (!loc) return s;
      return {
        ...s,
        shotCount: s.shotCount + 1,
        completedIds: s.completedIds.includes(loc.id)
          ? s.completedIds
          : [...s.completedIds, loc.id],
        failedIds: [...s.failedIds, loc.id],
        activeQuestId: null,
        status: { kind: "groomDrinks", message: loc.penaltyText || "PAN MŁODY PIJE" },
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
    revealSecret,
    showFinal,
    closeStatus,
    reset,
    addPoints,
    addShot,
    addTeamShot,
    forcePass,
    forceFail,
    nextLocation,
  };

  return <GameCtx.Provider value={value}>{children}</GameCtx.Provider>;
}

export function useGame() {
  const ctx = useContext(GameCtx);
  if (!ctx) throw new Error("useGame must be used inside GameProvider");
  return ctx;
}
