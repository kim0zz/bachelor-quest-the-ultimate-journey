import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/state/gameStore";

export function QuestModal() {
  const { activeQuest } = useGame();
  return (
    <AnimatePresence>
      {activeQuest && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.85, y: 40 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.85, y: 40 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-full max-w-4xl rounded-3xl border-2 border-fuchsia-400 bg-gradient-to-br from-purple-950 to-slate-950 p-10 shadow-[0_0_80px_rgba(217,70,239,0.6)]"
          >
            <div className="mb-2 text-sm uppercase tracking-widest text-fuchsia-300">
              {activeQuest.type === "quiz" && "🎯 Quiz"}
              {activeQuest.type === "challenge" && "⚡ Wyzwanie"}
              {activeQuest.type === "secret" && "✨ Sekret"}
              {activeQuest.type === "final" && "👑 Finał"}
            </div>
            <h2 className="text-5xl font-black text-white">
              {activeQuest.name}
            </h2>
            <p className="mt-2 text-xl text-white/70">{activeQuest.description}</p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-8">
              {activeQuest.type === "quiz" && (
                <>
                  <p className="text-3xl font-bold text-white">
                    {activeQuest.question}
                  </p>
                  <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                    {activeQuest.answers?.map((a, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 rounded-xl border-2 border-white/15 bg-white/5 px-5 py-4 text-xl text-white"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-500 font-black">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {a}
                      </div>
                    ))}
                  </div>
                  <p className="mt-6 text-center text-lg text-white/60">
                    Odpowiedz na kontrolerze 📱
                  </p>
                </>
              )}
              {activeQuest.type === "challenge" && (
                <>
                  <p className="text-3xl font-bold text-white">
                    {activeQuest.challengeText}
                  </p>
                  <p className="mt-6 text-center text-lg text-white/60">
                    Operator/Pan młody potwierdza na kontrolerze 📱
                  </p>
                </>
              )}
              {activeQuest.type === "secret" && (
                <>
                  <p className="text-3xl font-bold text-white">
                    Znalazłeś sekretne miejsce…
                  </p>
                  <p className="mt-6 text-center text-lg text-white/60">
                    Kliknij „Odkryj sekret” na kontrolerze 📱
                  </p>
                </>
              )}
              {activeQuest.type === "final" && (
                <>
                  <p className="text-3xl font-bold text-white">
                    {activeQuest.finalText}
                  </p>
                  <p className="mt-6 text-center text-lg text-white/60">
                    Kliknij „Pokaż werdykt” na kontrolerze 📱
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
