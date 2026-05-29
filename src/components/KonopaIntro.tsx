import { motion, AnimatePresence } from "framer-motion";
import { KONOPA_INTRO_TEXT } from "@/data/gameData";
import { useGame } from "@/state/gameStore";

export function KonopaIntroTv() {
  const { state } = useGame();
  if (state.earlyGamePhase !== "konopa-intro") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 flex items-center justify-center bg-black/85 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.9, y: 24 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-4xl rounded-3xl border-2 border-cyan-400 bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(34,211,238,0.35)]"
        >
          <div className="text-6xl mb-4">🏠</div>
          <h2 className="text-4xl font-black uppercase tracking-wide text-cyan-300">KONOPA</h2>
          <p className="mx-auto mt-6 max-w-3xl text-2xl leading-relaxed text-white/90">
            {KONOPA_INTRO_TEXT}
          </p>
          <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function KonopaIntroController() {
  const { acknowledgeKonopaIntro } = useGame();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border-2 border-cyan-400/60 bg-black/50 p-6 text-center">
        <div className="text-5xl mb-3">🏠</div>
        <h3 className="text-2xl font-black uppercase text-cyan-300">KONOPA</h3>
        <p className="mt-4 text-base leading-relaxed text-white/90">{KONOPA_INTRO_TEXT}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={acknowledgeKonopaIntro}
        className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
      >
        DALEJ
      </motion.button>
    </div>
  );
}
