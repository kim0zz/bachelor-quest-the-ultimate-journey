import { AnimatePresence, motion } from "framer-motion";
import {
  GROOM,
  PARYZ_INTRO_1,
  PARYZ_INTRO_2,
  PARYZ_SLEEP_TEXT,
  PARYZ_VOMIT_TEXT,
  PARYZ_WAKE_TEXT,
} from "@/data/gameData";
import { useGame } from "@/state/gameStore";

type ParyzChoice = "real-shot" | "group-shot" | "go-home" | "call-marta";

const PARYZ_CHOICES: Record<
  "choice-1" | "choice-2" | "choice-3",
  { primary: { id: ParyzChoice; title: string; desc: string }; martaDesc: string }
> = {
  "choice-1": {
    primary: {
      id: "real-shot",
      title: "Walę realnego shota",
      desc: "Tak, prawdziwego. Nie w grze. Lama klika dopiero jak wypije.",
    },
    martaDesc: "Ostatnia działająca funkcja rozsądku.",
  },
  "choice-2": {
    primary: {
      id: "group-shot",
      title: "Wszyscy walą shota, łącznie ze mną",
      desc: "To nie jest plan. To jest zbiorowa odpowiedzialność.",
    },
    martaDesc: "Opcja coraz bardziej sensowna.",
  },
  "choice-3": {
    primary: {
      id: "go-home",
      title: "Wypierdalam do domu, póki nie zasnąłem tu na całą noc",
      desc: "Decyzja spóźniona, ale nadal legalna.",
    },
    martaDesc: "Najrozsądniejszy przycisk w tej lokacji.",
  },
};

function ParyzChoiceCards({
  phase,
  onChoose,
  variant,
}: {
  phase: "choice-1" | "choice-2" | "choice-3";
  onChoose: (opt: ParyzChoice) => void;
  variant: "tv" | "controller";
}) {
  const cfg = PARYZ_CHOICES[phase];
  const isTv = variant === "tv";

  return (
    <div className={`mx-auto mt-6 grid w-full gap-4 ${isTv ? "max-w-4xl md:grid-cols-2" : ""}`}>
      <motion.button
        type="button"
        whileTap={isTv ? undefined : { scale: 0.97 }}
        onClick={() => onChoose(cfg.primary.id)}
        className={`rounded-2xl border-2 border-rose-400 bg-rose-700/20 text-left ${
          isTv ? "p-8 hover:bg-rose-700/30" : "p-5"
        }`}
        style={isTv ? { touchAction: "manipulation" } : undefined}
      >
        <div className={isTv ? "text-3xl font-black" : "text-2xl font-black"}>
          {cfg.primary.title}
        </div>
        <div className={`mt-2 text-white/80 ${isTv ? "text-lg" : "text-sm"}`}>
          {cfg.primary.desc}
        </div>
      </motion.button>
      <motion.button
        type="button"
        whileTap={isTv ? undefined : { scale: 0.97 }}
        onClick={() => onChoose("call-marta")}
        className={`rounded-2xl border-2 border-cyan-400 bg-cyan-700/20 text-left ${
          isTv ? "p-8 hover:bg-cyan-700/30" : "p-5"
        }`}
        style={isTv ? { touchAction: "manipulation" } : undefined}
      >
        <div className={isTv ? "text-3xl font-black" : "text-2xl font-black"}>
          Dzwonię do Marty
        </div>
        <div className={`mt-2 text-white/80 ${isTv ? "text-lg" : "text-sm"}`}>
          {cfg.martaDesc}
        </div>
      </motion.button>
    </div>
  );
}

export function ParyzTv() {
  const { state, chooseParyzOption } = useGame();
  if (state.activeQuestId !== "paryz" || !state.paryzPhase) return null;

  const phase = state.paryzPhase;
  const isChoice =
    phase === "choice-1" || phase === "choice-2" || phase === "choice-3";

  return (
    <AnimatePresence>
      <motion.div
        key={phase}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-black/90 p-6 backdrop-blur-md"
      >
        <div className="my-auto w-full max-w-6xl rounded-3xl border-2 border-slate-500 bg-gradient-to-br from-slate-950 via-zinc-950 to-black p-10 text-center">
          <div className="mb-4 text-6xl">🌚</div>
          <h2 className="text-5xl font-black uppercase text-slate-200">PARYŻ</h2>
          {phase === "intro" && (
            <div className="mx-auto mt-6 max-w-3xl space-y-5 text-left">
              <p className="text-xl text-white/90">{PARYZ_INTRO_1}</p>
              <p className="text-xl text-white/75">{PARYZ_INTRO_2}</p>
            </div>
          )}
          {phase === "vomit" && (
            <p className="mx-auto mt-6 max-w-3xl text-2xl text-white/85">{PARYZ_VOMIT_TEXT}</p>
          )}
          {phase === "sleep" && (
            <div className="mx-auto mt-6 max-w-3xl space-y-4">
              <p className="text-xl text-white/85">{PARYZ_SLEEP_TEXT}</p>
              <p className="text-2xl font-bold text-white/90">{PARYZ_WAKE_TEXT}</p>
            </div>
          )}
          {phase === "marta-call" && (
            <div className="mx-auto mt-6 max-w-3xl space-y-3 text-left">
              <p className="text-xl text-white/90">
                {GROOM.nickname}: &quot;Marta… ja się trochę nakurwiłem.&quot;
              </p>
              <p className="text-xl text-white/90">
                {GROOM.nickname}: &quot;Byłem w Hansie, Małym Piwku, na gofrze, na BITWY, w
                DREWNIAKU, na działce… i teraz jestem chyba w lesie.&quot;
              </p>
              <p className="text-xl text-white/90">{GROOM.nickname}: &quot;Ale kocham cię.&quot;</p>
              <p className="text-xl font-bold text-cyan-200">
                Marta: &quot;Lama, wracaj na chatę. Teraz. Jak najszybciej.&quot;
              </p>
              <p className="text-lg italic text-white/70">
                System wykrył głos rozsądku. Lama otrzymuje misję główną: powrót do domu.
              </p>
            </div>
          )}
          {isChoice && (
            <>
              <p className="mx-auto mt-6 max-w-3xl text-2xl font-bold text-white/90">
                Co robi Lama?
              </p>
              <ParyzChoiceCards
                phase={phase}
                onChoose={chooseParyzOption}
                variant="tv"
              />
            </>
          )}
          {!isChoice && (
            <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ParyzController() {
  const { state, advanceParyz, chooseParyzOption, confirmParyzReturnHome } = useGame();
  if (state.activeQuestId !== "paryz" || !state.paryzPhase) return null;

  if (state.paryzPhase === "intro") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/90">
          {PARYZ_INTRO_1}
        </div>
        <div className="rounded-2xl border border-slate-400/40 bg-slate-900/40 p-4 text-sm text-white/80">
          {PARYZ_INTRO_2}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={advanceParyz}
          className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
        >
          Dalej →
        </motion.button>
      </div>
    );
  }

  if (state.paryzPhase === "vomit") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-600/15 p-5 text-center text-white/90">
          {PARYZ_VOMIT_TEXT}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={advanceParyz}
          className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
        >
          Dalej →
        </motion.button>
      </div>
    );
  }

  if (state.paryzPhase === "sleep") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-cyan-400 bg-cyan-700/15 p-5 text-center">
          <p className="text-white/90">{PARYZ_SLEEP_TEXT}</p>
          <p className="mt-3 text-lg font-bold text-cyan-200">{PARYZ_WAKE_TEXT}</p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={advanceParyz}
          className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
        >
          Dalej →
        </motion.button>
      </div>
    );
  }

  if (state.paryzPhase === "marta-call") {
    return (
      <div className="space-y-4">
        <div className="rounded-2xl border-2 border-cyan-400 bg-cyan-700/15 p-5 text-sm text-white/90">
          <p>{GROOM.nickname}: &quot;Marta… ja się trochę nakurwiłem.&quot;</p>
          <p className="mt-2">
            {GROOM.nickname}: &quot;Byłem w Hansie, Małym Piwku, na gofrze, na BITWY, w DREWNIAKU,
            na działce… i teraz jestem chyba w lesie.&quot;
          </p>
          <p className="mt-2">{GROOM.nickname}: &quot;Ale kocham cię.&quot;</p>
          <p className="mt-2 font-bold text-cyan-200">
            Marta: &quot;Lama, wracaj na chatę. Teraz. Jak najszybciej.&quot;
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={confirmParyzReturnHome}
          className="w-full rounded-2xl bg-emerald-600 p-6 text-2xl font-black uppercase"
        >
          WRACAM DO DOMU
        </motion.button>
      </div>
    );
  }

  if (
    state.paryzPhase === "choice-1" ||
    state.paryzPhase === "choice-2" ||
    state.paryzPhase === "choice-3"
  ) {
    return (
      <ParyzChoiceCards
        phase={state.paryzPhase}
        onChoose={chooseParyzOption}
        variant="controller"
      />
    );
  }

  return null;
}
