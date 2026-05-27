import { AnimatePresence, motion } from "framer-motion";
import { isShotPourLocation } from "@/data/gameData";
import { ShotPourMinigameTv } from "@/components/ShotPourMinigame";
import { useGame, useTick } from "@/state/gameStore";

export function QuestModal() {
  const { activeQuest, state } = useGame();
  useTick(100);

  if (activeQuest?.id === "bitwy") return null;
  if (activeQuest?.id === "dzialka") return null;
  if (activeQuest?.id === "paryz") return null;
  if (activeQuest && state.completedIds.includes(activeQuest.id)) return null;

  const isRisk = activeQuest?.type === "risk";

  const riskCountdownNum =
    isRisk && state.riskPhase === "countdown" && state.riskCountdownStart
      ? Math.max(1, 3 - Math.floor((Date.now() - state.riskCountdownStart) / 1000))
      : 0;

  const riskRemaining =
    isRisk &&
    state.riskPhase === "question" &&
    state.riskQuestionStart &&
    activeQuest?.timeLimitSeconds
      ? Math.max(
          0,
          activeQuest.timeLimitSeconds -
            Math.floor((Date.now() - state.riskQuestionStart) / 1000),
        )
      : 0;

  const bartender = activeQuest?.bartenderDialogue;
  const inBartender = !!bartender && state.bartenderPhase != null;

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
            className={`w-full max-w-5xl rounded-3xl border-2 p-10 ${
              isRisk
                ? "border-amber-300 bg-gradient-to-br from-rose-950 via-amber-950 to-slate-950 shadow-[0_0_100px_rgba(251,191,36,0.7)]"
                : "border-fuchsia-400 bg-gradient-to-br from-purple-950 to-slate-950 shadow-[0_0_80px_rgba(217,70,239,0.6)]"
            }`}
          >
            <div
              className={`mb-2 text-sm uppercase tracking-widest ${
                isRisk ? "text-amber-300" : "text-fuchsia-300"
              }`}
            >
              {activeQuest.type === "quiz" && "🎯 Quiz"}
              {activeQuest.type === "challenge" && "⚡ Wyzwanie"}
              {activeQuest.type === "risk" && "⚠️ HIGH RISK / HIGH REWARD"}
              {activeQuest.type === "minigame" && "🥃 Minigra"}
              {activeQuest.type === "final" && "👑 Finał"}
            </div>
            <h2 className="text-5xl font-black text-white">
              {activeQuest.name}
            </h2>
            <p className="mt-2 text-xl text-white/70">
              {activeQuest.description}
            </p>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/40 p-8">
              {/* ── Bartender dialogue ── */}
              {inBartender && bartender && state.bartenderPhase === "intro" && (
                <div className="text-center">
                  <div className="mb-2 text-sm uppercase tracking-widest text-amber-300">
                    🍺 {bartender.bartenderName}, barman
                  </div>
                  <p className="mx-auto max-w-3xl text-2xl italic text-white/90 leading-relaxed">
                    „{bartender.introLine}"
                  </p>
                  <p className="mt-8 text-lg text-white/50">
                    Odpowiedz na kontrolerze 📱
                  </p>
                </div>
              )}
              {inBartender && bartender && state.bartenderPhase === "outcome" && (
                <div className="text-center">
                  <div className="mb-2 text-sm uppercase tracking-widest text-amber-300">
                    🍺 {bartender.bartenderName}, barman
                  </div>
                  {state.bartenderChoiceIndex != null && (
                    <p className="text-lg text-fuchsia-200">
                      Lama: „{bartender.options[state.bartenderChoiceIndex]?.label}"
                    </p>
                  )}
                  {state.bartenderChoiceIndex != null && (
                    <p className="mt-4 mx-auto max-w-3xl text-2xl italic text-white/90 leading-relaxed">
                      {bartender.bartenderName}: „{bartender.options[state.bartenderChoiceIndex]?.outcomeLine}"
                    </p>
                  )}
                  <p className="mt-6 text-lg text-white/50">
                    Kontynuuj na kontrolerze 📱
                  </p>
                </div>
              )}

              {/* ── Normal quiz (after bartender or without) ── */}
              {activeQuest.type === "quiz" && !inBartender && (
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
              {isShotPourLocation(activeQuest) && !inBartender && (
                <ShotPourMinigameTv loc={activeQuest} />
              )}
              {activeQuest.type === "minigame" &&
                !isShotPourLocation(activeQuest) && !inBartender && (
                  <p className="text-center text-xl text-white/60">
                    Nieznana minigra — skontaktuj operatora.
                  </p>
                )}
              {activeQuest.type === "challenge" && !inBartender && (
                <>
                  <p className="text-3xl font-bold text-white">
                    {activeQuest.challengeText}
                  </p>
                  <p className="mt-6 text-center text-lg text-white/60">
                    Operator/Lama potwierdza na kontrolerze 📱
                  </p>
                </>
              )}
              {activeQuest.type === "risk" && state.riskPhase === "intro" && (
                <div className="text-center">
                  <p className="text-6xl font-black uppercase tracking-tight text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.6)]">
                    HIGH RISK / HIGH REWARD
                  </p>
                  <p className="mt-6 text-3xl text-white/90">
                    Możesz zdobyć dużo Mąż Points, ale porażka oznacza karę.
                  </p>
                  {activeQuest.introText && (
                    <p className="mt-4 text-xl text-white/60">
                      {activeQuest.introText}
                    </p>
                  )}
                  <p className="mt-8 text-lg text-white/60">
                    Decyduj na kontrolerze 📱
                  </p>
                </div>
              )}
              {activeQuest.type === "risk" &&
                state.riskPhase === "countdown" && (
                  <div className="text-center">
                    <p className="text-2xl uppercase tracking-widest text-amber-300">
                      Start za…
                    </p>
                    <motion.div
                      key={riskCountdownNum}
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-[18rem] leading-none font-black text-amber-300 drop-shadow-[0_0_60px_rgba(251,191,36,0.8)]"
                    >
                      {riskCountdownNum}
                    </motion.div>
                  </div>
                )}
              {activeQuest.type === "risk" &&
                state.riskPhase === "question" && (
                  <>
                    <div
                      className={`mx-auto mb-6 w-full max-w-md rounded-3xl border-4 p-6 text-center font-black tabular-nums ${
                        riskRemaining <= 3
                          ? "border-rose-400 bg-rose-500/30 text-rose-200 animate-pulse"
                          : "border-amber-300 bg-amber-500/20 text-amber-200"
                      }`}
                    >
                      <div className="text-xl uppercase tracking-widest">
                        Czas
                      </div>
                      <div className="text-[8rem] leading-none">
                        {riskRemaining}s
                      </div>
                    </div>
                    <p className="text-4xl font-bold text-white">
                      {activeQuest.question}
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
                      {activeQuest.answers?.map((a, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-xl border-2 border-amber-300/40 bg-white/5 px-5 py-4 text-xl text-white"
                        >
                          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-400 font-black text-black">
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
              {activeQuest.type === "final" && (
                <>
                  <p className="text-3xl font-bold text-white">
                    {activeQuest.finalText}
                  </p>
                  <p className="mt-6 text-center text-lg text-white/60">
                    Kliknij „Pokaż werdykt" na kontrolerze 📱
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
