import { motion } from "framer-motion";
import { useEffect } from "react";
import { useGame, useTick } from "@/state/gameStore";
import { GroomAvatar } from "./GroomAvatar";
import { SecretUnderBarController } from "./SecretUnderBar";
import { ShotPourMinigameController } from "./ShotPourMinigame";
import { isShotPourLocation } from "@/data/gameData";

export function ControllerView() {
  const {
    state,
    currentLocation,
    activeQuest,
    availableLocations,
    goToLocation,
    answerQuiz,
    resolveChallenge,
    acceptRisk,
    escapeRisk,
    startRiskQuestion,
    answerRisk,
    failRisk,
    showFinal,
    chooseBartenderOption,
    continuePastBartender,
    choosePostBar,
    acknowledgePekinBar,
  } = useGame();

  useTick(100);

  useEffect(() => {
    if (!activeQuest || activeQuest.type !== "risk") return;
    if (state.riskPhase === "countdown" && state.riskCountdownStart) {
      const elapsed = Date.now() - state.riskCountdownStart;
      const remaining = 3000 - elapsed;
      if (remaining <= 0) {
        startRiskQuestion();
        return;
      }
      const t = setTimeout(startRiskQuestion, remaining);
      return () => clearTimeout(t);
    }
    if (state.riskPhase === "question" && state.riskQuestionStart) {
      const limit = (activeQuest.timeLimitSeconds ?? 10) * 1000;
      const elapsed = Date.now() - state.riskQuestionStart;
      const remaining = limit - elapsed;
      if (remaining <= 0) {
        failRisk();
        return;
      }
      const t = setTimeout(failRisk, remaining);
      return () => clearTimeout(t);
    }
  }, [
    activeQuest,
    state.riskPhase,
    state.riskCountdownStart,
    state.riskQuestionStart,
    startRiskQuestion,
    failRisk,
  ]);

  const riskCountdownNum =
    state.riskPhase === "countdown" && state.riskCountdownStart
      ? Math.max(1, 3 - Math.floor((Date.now() - state.riskCountdownStart) / 1000))
      : 0;

  const riskRemaining =
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

  const hansCompleted = state.completedIds.includes("hans");
  const mpCompleted = state.completedIds.includes("male-piwko");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-purple-950 to-slate-950 p-5 text-white">
      <header className="flex items-center justify-between">
        <GroomAvatar size={56} />
        <div className="text-right">
          <div className="text-xs uppercase tracking-widest text-fuchsia-300">
            Kontroler
          </div>
          <div className="text-lg font-bold">Lama 🦙</div>
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
        {state.secretUnderBarPhase ? (
          <SecretUnderBarController />
        ) : state.earlyGamePhase === "post-bar-choice" ? (
          /* ── Post-bar: go to other bar or continue ── */
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-fuchsia-400/60 bg-black/50 p-4 text-center">
              <p className="text-lg font-bold leading-snug text-white/90">
                {state.status.message}
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => choosePostBar(true)}
              className="w-full rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-600/60 to-fuchsia-600/60 p-6 text-xl font-black uppercase shadow-lg"
            >
              {hansCompleted && !mpCompleted
                ? "🍺 Jeszcze Małe Piwko"
                : "🎂 Jeszcze Hans"}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => choosePostBar(false)}
              className="w-full rounded-2xl border-2 border-white/30 bg-white/5 p-5 text-lg font-bold uppercase"
            >
              🚀 Idę dalej w stronę Las Vegas
            </motion.button>
          </div>
        ) : state.foodPhase === "pekin-event" ? (
          /* ── Pekin Bar dramatic event ── */
          <div className="space-y-3">
            <div className="rounded-2xl border-2 border-rose-400 bg-rose-600/15 p-5 text-center">
              <p className="text-sm italic text-white/60 mb-3">
                Lama rusza do Pekin Baru. Przez chwilę czuć wspomnienia, sos i czasy, których już nie da się odzyskać.
              </p>
              <p className="text-2xl font-black text-rose-300">
                PEKIN BAR ZOSTAŁ SPRZEDANY PRZEZ CHIŃCZYKÓW
              </p>
              <p className="mt-3 text-sm text-white/70">
                Niech mu ziemia lekką będzie. Wszyscy walą shota za pamięć Pekin Baru.
              </p>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={acknowledgePekinBar}
              className="w-full rounded-2xl bg-rose-600 p-6 text-2xl font-black uppercase"
            >
              🍺 Za Pekin Bar! →
            </motion.button>
          </div>
        ) : !activeQuest ? (
          <>
            {state.earlyGamePhase === "choosing-bar" && (
              <div className="mb-4 rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/10 p-3 text-center text-sm italic text-fuchsia-200">
                Pierwszy etap przygotowań do ślubu: wybrać, gdzie się nakurwić.
              </div>
            )}
            {state.foodPhase === "choosing" && (
              <div className="mb-4 rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-center text-sm italic text-amber-200">
                🍽️ Czas coś zjeść. Wybierz gdzie.
              </div>
            )}
            <div className="mb-3 text-xs uppercase tracking-widest text-white/50">
              Wybierz lokację
            </div>
            <div className="grid gap-3">
              {availableLocations.length === 0 && (
                <div className="rounded-xl bg-white/5 p-4 text-center text-white/60">
                  Brak dostępnych lokacji. Operator może odblokować.
                </div>
              )}
              {availableLocations.map((l) => {
                const risk = l.type === "risk";
                return (
                  <motion.button
                    key={l.id}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => goToLocation(l.id)}
                    className={
                      risk
                        ? "w-full rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-rose-600/60 to-amber-500/60 p-5 text-left shadow-[0_0_30px_rgba(251,191,36,0.5)]"
                        : "w-full rounded-2xl border-2 border-fuchsia-400 bg-gradient-to-r from-fuchsia-600/40 to-purple-600/40 p-5 text-left shadow-[0_0_20px_rgba(217,70,239,0.3)]"
                    }
                  >
                    {risk && (
                      <div className="mb-1 text-xs font-black uppercase tracking-widest text-amber-200">
                        ⚠️ HIGH RISK
                      </div>
                    )}
                    <div className="text-2xl font-black">{l.name}</div>
                    <div className="text-sm text-white/70">{l.description}</div>
                  </motion.button>
                );
              })}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {/* ── Bartender dialogue ── */}
            {inBartender && bartender && state.bartenderPhase === "intro" && (
              <>
                <div className="rounded-2xl border-2 border-amber-400/60 bg-black/50 p-4 text-center">
                  <div className="text-xs uppercase tracking-widest text-amber-300">
                    🍺 {bartender.bartenderName}, barman
                  </div>
                  <p className="mt-2 text-base italic text-white/90">
                    „{bartender.introLine}"
                  </p>
                </div>
                <div className="grid gap-3">
                  {bartender.options.map((opt, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => chooseBartenderOption(i)}
                      className="w-full rounded-2xl border-2 border-fuchsia-400/60 bg-fuchsia-600/30 p-5 text-left text-lg font-bold active:bg-fuchsia-500/40"
                    >
                      {opt.label}
                      {(opt.bonusPoints ?? 0) > 0 && (
                        <span className="ml-2 text-sm text-emerald-400">
                          (+{opt.bonusPoints} Mąż)
                        </span>
                      )}
                    </motion.button>
                  ))}
                </div>
              </>
            )}
            {inBartender && bartender && state.bartenderPhase === "outcome" && (
              <>
                <div className="rounded-2xl border-2 border-amber-400/60 bg-black/50 p-4 text-center">
                  <div className="text-xs uppercase tracking-widest text-amber-300">
                    🍺 {bartender.bartenderName}
                  </div>
                  {state.bartenderChoiceIndex != null && (
                    <>
                      <p className="mt-2 text-sm text-fuchsia-200">
                        Lama: „{bartender.options[state.bartenderChoiceIndex]?.label}"
                      </p>
                      <p className="mt-3 text-base italic text-white/90">
                        {bartender.bartenderName}: „{bartender.options[state.bartenderChoiceIndex]?.outcomeLine}"
                      </p>
                    </>
                  )}
                  {state.bartenderChoiceIndex != null &&
                    (bartender.options[state.bartenderChoiceIndex]?.bonusPoints ?? 0) > 0 && (
                      <p className="mt-2 text-sm font-black text-emerald-400">
                        +{bartender.options[state.bartenderChoiceIndex]?.bonusPoints} Mąż Points!
                      </p>
                    )}
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={continuePastBartender}
                  className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
                >
                  Dalej →
                </motion.button>
              </>
            )}

            {/* ── Normal quest content (after bartender or no bartender) ── */}
            {!inBartender && activeQuest && !isShotPourLocation(activeQuest) && (
              <div className="rounded-2xl border-2 border-fuchsia-400 bg-black/50 p-4">
                <div className="text-xs uppercase tracking-widest text-fuchsia-300">
                  Quest
                </div>
                <div className="text-xl font-black">{activeQuest.name}</div>
              </div>
            )}

            {!inBartender && activeQuest && isShotPourLocation(activeQuest) && (
              <ShotPourMinigameController loc={activeQuest} />
            )}

            {!inBartender && activeQuest?.type === "minigame" &&
              !isShotPourLocation(activeQuest) && (
                <p className="text-center text-white/60">
                  Nieznana minigra.
                </p>
              )}

            {!inBartender && activeQuest?.type === "quiz" && (
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

            {!inBartender && activeQuest?.type === "challenge" && (
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

            {activeQuest?.type === "risk" && state.riskPhase === "intro" && (
              <>
                <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-rose-600/40 to-amber-500/30 p-4 text-center">
                  <div className="text-2xl font-black uppercase tracking-widest text-amber-200">
                    HIGH RISK / HIGH REWARD
                  </div>
                  <div className="mt-2 text-white/90">
                    Możesz zdobyć dużo Mąż Points, ale porażka oznacza karę.
                  </div>
                  {activeQuest.introText && (
                    <div className="mt-3 text-sm text-white/70">
                      {activeQuest.introText}
                    </div>
                  )}
                </div>
                <button
                  onClick={acceptRisk}
                  className="w-full rounded-2xl bg-gradient-to-r from-rose-500 to-amber-400 p-6 text-2xl font-black uppercase text-black shadow-lg"
                >
                  🔥 Wchodzę w to
                </button>
                <button
                  onClick={escapeRisk}
                  className="w-full rounded-2xl border-2 border-white/30 bg-white/5 p-5 text-lg font-bold uppercase"
                >
                  🏃 Uciekam
                </button>
              </>
            )}

            {activeQuest?.type === "risk" && state.riskPhase === "countdown" && (
              <div className="rounded-2xl border-2 border-amber-300 bg-black/60 p-10 text-center">
                <div className="text-sm uppercase tracking-widest text-amber-200">
                  Start za…
                </div>
                <div className="text-[10rem] leading-none font-black text-amber-300 drop-shadow-[0_0_30px_rgba(251,191,36,0.7)]">
                  {riskCountdownNum}
                </div>
              </div>
            )}

            {activeQuest?.type === "risk" && state.riskPhase === "question" && (
              <>
                <div
                  className={`rounded-2xl border-2 p-4 text-center font-black tabular-nums ${
                    riskRemaining <= 3
                      ? "border-rose-400 bg-rose-500/30 text-rose-200"
                      : "border-amber-300 bg-amber-500/20 text-amber-200"
                  }`}
                >
                  <div className="text-xs uppercase tracking-widest">
                    Czas
                  </div>
                  <div className="text-6xl">{riskRemaining}s</div>
                </div>
                <div className="rounded-xl bg-white/5 p-4 text-lg font-bold">
                  {activeQuest.question}
                </div>
                <div className="grid gap-3">
                  {activeQuest.answers?.map((a, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => answerRisk(i)}
                      className="flex items-center gap-4 rounded-2xl border-2 border-amber-300/60 bg-white/5 p-5 text-left text-lg active:bg-amber-500/30"
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-400 text-xl font-black text-black">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span>{a}</span>
                    </motion.button>
                  ))}
                </div>
              </>
            )}

            {activeQuest?.type === "final" && (
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
