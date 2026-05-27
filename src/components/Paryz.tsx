import { AnimatePresence, motion } from "framer-motion";
import { GROOM, PARYZ_INTRO_1, PARYZ_INTRO_2, PARYZ_SLEEP_TEXT, PARYZ_VOMIT_TEXT, PARYZ_WAKE_TEXT } from "@/data/gameData";
import { useGame } from "@/state/gameStore";

export function ParyzTv() {
  const { state } = useGame();
  if (state.activeQuestId !== "paryz" || !state.paryzPhase) return null;
  return (
    <AnimatePresence>
      <motion.div key={state.paryzPhase} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-30 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
        <div className="w-full max-w-5xl rounded-3xl border-2 border-slate-500 bg-gradient-to-br from-slate-950 via-zinc-950 to-black p-10 text-center">
          <div className="mb-4 text-6xl">🌚</div>
          <h2 className="text-5xl font-black uppercase text-slate-200">PARYŻ</h2>
          {state.paryzPhase === "intro" && <div className="mx-auto mt-6 max-w-3xl space-y-5 text-left"><p className="text-xl text-white/90">{PARYZ_INTRO_1}</p><p className="text-xl text-white/75">{PARYZ_INTRO_2}</p></div>}
          {state.paryzPhase === "vomit" && <p className="mx-auto mt-6 max-w-3xl text-2xl text-white/85">{PARYZ_VOMIT_TEXT}</p>}
          {state.paryzPhase === "sleep" && <div className="mx-auto mt-6 max-w-3xl space-y-4"><p className="text-xl text-white/85">{PARYZ_SLEEP_TEXT}</p><p className="text-2xl font-bold text-white/90">{PARYZ_WAKE_TEXT}</p></div>}
          {state.paryzPhase === "marta-call" && <div className="mx-auto mt-6 max-w-3xl space-y-3 text-left"><p className="text-xl text-white/90">{GROOM.nickname}: "Marta… ja się trochę nakurwiłem."</p><p className="text-xl text-white/90">{GROOM.nickname}: "Byłem w Hansie, Małym Piwku, na gofrze, na BITWY, w DREWNIAKU, na działce… i teraz jestem chyba w lesie."</p><p className="text-xl text-white/90">{GROOM.nickname}: "Ale kocham cię."</p><p className="text-xl font-bold text-cyan-200">Marta: "Lama, wracaj na chatę. Teraz. Jak najszybciej."</p><p className="text-lg italic text-white/70">System wykrył głos rozsądku. Lama otrzymuje misję główną: powrót do domu.</p></div>}
          {(state.paryzPhase === "choice-1" || state.paryzPhase === "choice-2" || state.paryzPhase === "choice-3") && <p className="mx-auto mt-6 max-w-3xl text-2xl text-white/90">Wybór na kontrolerze.</p>}
          <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function ParyzController() {
  const { state, advanceParyz, chooseParyzOption, confirmParyzReturnHome } = useGame();
  if (state.activeQuestId !== "paryz" || !state.paryzPhase) return null;
  if (state.paryzPhase === "intro") return <div className="space-y-4"><div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-sm text-white/90">{PARYZ_INTRO_1}</div><div className="rounded-2xl border border-slate-400/40 bg-slate-900/40 p-4 text-sm text-white/80">{PARYZ_INTRO_2}</div><motion.button whileTap={{ scale: 0.97 }} onClick={advanceParyz} className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase">Dalej →</motion.button></div>;
  if (state.paryzPhase === "vomit") return <div className="space-y-4"><div className="rounded-2xl border-2 border-amber-400 bg-amber-600/15 p-5 text-center text-white/90">{PARYZ_VOMIT_TEXT}</div><motion.button whileTap={{ scale: 0.97 }} onClick={advanceParyz} className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase">Dalej →</motion.button></div>;
  if (state.paryzPhase === "sleep") return <div className="space-y-4"><div className="rounded-2xl border-2 border-cyan-400 bg-cyan-700/15 p-5 text-center"><p className="text-white/90">{PARYZ_SLEEP_TEXT}</p><p className="mt-3 text-lg font-bold text-cyan-200">{PARYZ_WAKE_TEXT}</p></div><motion.button whileTap={{ scale: 0.97 }} onClick={advanceParyz} className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase">Dalej →</motion.button></div>;
  if (state.paryzPhase === "marta-call") return <div className="space-y-4"><div className="rounded-2xl border-2 border-cyan-400 bg-cyan-700/15 p-5 text-sm text-white/90"><p>{GROOM.nickname}: "Marta… ja się trochę nakurwiłem."</p><p className="mt-2">{GROOM.nickname}: "Byłem w Hansie, Małym Piwku, na gofrze, na BITWY, w DREWNIAKU, na działce… i teraz jestem chyba w lesie."</p><p className="mt-2">{GROOM.nickname}: "Ale kocham cię."</p><p className="mt-2 font-bold text-cyan-200">Marta: "Lama, wracaj na chatę. Teraz. Jak najszybciej."</p></div><motion.button whileTap={{ scale: 0.97 }} onClick={confirmParyzReturnHome} className="w-full rounded-2xl bg-emerald-600 p-6 text-2xl font-black uppercase">WRACAM DO DOMU</motion.button></div>;
  return <div className="space-y-4">{state.paryzPhase === "choice-1" && <motion.button whileTap={{ scale: 0.97 }} onClick={() => chooseParyzOption("real-shot")} className="w-full rounded-2xl border-2 border-rose-400 bg-rose-700/20 p-5 text-left"><div className="text-2xl font-black">Walę realnego shota</div><div className="mt-1 text-sm text-white/80">Tak, prawdziwego. Nie w grze. Lama klika dopiero jak wypije.</div></motion.button>}{state.paryzPhase === "choice-2" && <motion.button whileTap={{ scale: 0.97 }} onClick={() => chooseParyzOption("group-shot")} className="w-full rounded-2xl border-2 border-fuchsia-400 bg-fuchsia-700/20 p-5 text-left"><div className="text-2xl font-black">Wszyscy walą shota, łącznie ze mną</div><div className="mt-1 text-sm text-white/80">To nie jest plan. To jest zbiorowa odpowiedzialność.</div></motion.button>}{state.paryzPhase === "choice-3" && <motion.button whileTap={{ scale: 0.97 }} onClick={() => chooseParyzOption("go-home")} className="w-full rounded-2xl border-2 border-emerald-400 bg-emerald-700/20 p-5 text-left"><div className="text-2xl font-black">Wypierdalam do domu, póki nie zasnąłem tu na całą noc</div><div className="mt-1 text-sm text-white/80">Decyzja spóźniona, ale nadal legalna.</div></motion.button>}<motion.button whileTap={{ scale: 0.97 }} onClick={() => chooseParyzOption("call-marta")} className="w-full rounded-2xl border-2 border-cyan-400 bg-cyan-700/20 p-5 text-left"><div className="text-2xl font-black">Dzwonię do Marty</div><div className="mt-1 text-sm text-white/80">{state.paryzPhase === "choice-1" ? "Ostatnia działająca funkcja rozsądku." : state.paryzPhase === "choice-3" ? "Najrozsądniejszy przycisk w tej lokacji." : "Opcja coraz bardziej sensowna."}</div></motion.button></div>;
}
