import { motion } from "framer-motion";
import { useGame } from "@/state/gameStore";
import { GroomAvatar } from "./GroomAvatar";

export function ControllerView() {
  const {
    state,
    currentLocation,
    activeQuest,
    availableLocations,
    goToLocation,
    answerQuiz,
    resolveChallenge,
    revealSecret,
    showFinal,
  } = useGame();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-5 text-white">
      <header className="flex items-center justify-between">
        <GroomAvatar size={56} />
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-fuchsia-300">
            Kontroler
          </div>
          <div className="text-lg font-bold">Pan Młody</div>
        </div>
      </header>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border border-fuchsia-400 bg-black/40 p-3">
          <div className="text-[10px] uppercase text-white/60">Mąż</div>
          <div className="text-2xl font-black">💍 {state.manPoints}</div>
        </div>
        <div className="rounded-xl border border-amber-400 bg-black/40 p-3">
          <div className="text-[10px] uppercase text-white/60">Shoty</div>
          <div className="text-2xl font-black">🥃 {state.shotCount}</div>
        </div>
        <div className="rounded-xl border border-cyan-400 bg-black/40 p-3">
          <div className="text-[10px] uppercase text-white/60">Team</div>
          <div className="text-2xl font-black">🍻 {state.teamShots}</div>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
        <div className="text-xs uppercase tracking-widest text-white/50">
          Aktualna lokacja
        </div>
        <div className="text-2xl font-black">{currentLocation.name}</div>
        <div className="text-sm text-white/70">{currentLocation.description}</div>
      </div>

      <div className="mt-5">
        {!activeQuest ? (
          <>
            <div className="mb-3 text-xs uppercase tracking-widest text-white/50">
              Wybierz lokację
            </div>
            <div className="grid gap-3">
              {availableLocations.length === 0 && (
                <div className="rounded-xl bg-white/5 p-4 text-center text-white/60">
                  Brak dostępnych lokacji. Operator może odblokować.
                </div>
              )}
              {availableLocations.map((l) => (
                <motion.button
                  key={l.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => goToLocation(l.id)}
                  className="w-full rounded-2xl border-2 border-fuchsia-400 bg-gradient-to-r from-fuchsia-600/40 to-purple-600/40 p-5 text-left shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                >
                  <div className="text-2xl font-black">
                    {l.isSecret ? "❓ ???" : l.name}
                  </div>
                  <div className="text-sm text-white/70">
                    {l.isSecret ? "Sekretne miejsce…" : l.description}
                  </div>
                </motion.button>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-fuchsia-400 bg-black/50 p-4">
              <div className="text-xs uppercase tracking-widest text-fuchsia-300">
                Quest
              </div>
              <div className="text-xl font-black">{activeQuest.name}</div>
            </div>

            {activeQuest.type === "quiz" && (
              <>
                <div className="rounded-xl bg-white/5 p-4 text-lg font-bold">
                  {activeQuest.question}
                </div>
                <div className="grid gap-3">
                  {activeQuest.answers?.map((a, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => answerQuiz(i)}
                      className="flex items-center gap-4 rounded-2xl border-2 border-white/20 bg-white/5 p-5 text-left text-lg active:bg-fuchsia-500/30"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-fuchsia-500 text-xl font-black">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{a}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {activeQuest.type === "challenge" && (
              <>
                <div className="rounded-xl bg-white/5 p-4 text-lg font-bold">
                  {activeQuest.challengeText}
                </div>
                <button
                  onClick={() => resolveChallenge(true)}
                  className="w-full rounded-2xl bg-emerald-500 p-6 text-2xl font-black uppercase shadow-lg active:bg-emerald-400"
                >
                  ✅ Wykonane
                </button>
                <button
                  onClick={() => resolveChallenge(false)}
                  className="w-full rounded-2xl bg-rose-500 p-6 text-2xl font-black uppercase shadow-lg active:bg-rose-400"
                >
                  ❌ Nie dał rady
                </button>
              </>
            )}

            {activeQuest.type === "secret" && (
              <button
                onClick={revealSecret}
                className="w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-amber-400 p-6 text-2xl font-black uppercase shadow-lg"
              >
                ✨ Odkryj sekret
              </button>
            )}

            {activeQuest.type === "final" && (
              <button
                onClick={showFinal}
                className="w-full rounded-2xl bg-gradient-to-r from-amber-400 to-fuchsia-500 p-6 text-2xl font-black uppercase shadow-lg"
              >
                👑 Pokaż werdykt
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-white/5 p-3 text-center text-sm text-white/60">
        Status: {state.status.message}
      </div>
    </div>
  );
}
