import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GROOM } from "@/data/gameData";
import {
  DZIALKA_INTRO_PART1,
  DZIALKA_INTRO_PART2,
  DZIALKA_RANDOM_LINE,
  DZIALKA_RAP,
  DZIALKA_FINAL_NARRATOR1,
  DZIALKA_FINAL_NARRATOR2,
} from "@/data/gameData";
import { isHulajnogaLocked } from "@/lib/hulajnogaDisplay";
import { useGame } from "@/state/gameStore";
import { ReadOnlyChoiceCards } from "@/components/ReadOnlyChoiceCards";
import { getDzialkaFinalChoices } from "@/lib/tvChoiceMirror";

function TvCard({
  children,
  border = "border-emerald-400",
}: {
  children: ReactNode;
  border?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.85, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      className={`w-full max-w-5xl rounded-3xl border-2 ${border} bg-gradient-to-br from-slate-950 to-emerald-950 p-10 text-center shadow-[0_0_80px_rgba(16,185,129,0.25)]`}
    >
      {children}
    </motion.div>
  );
}

// ── TV ──────────────────────────────────────────────────────────

export function DzialkaTv() {
  const { state } = useGame();
  if (isHulajnogaLocked(state.postDrewniakPhase)) return null;
  if (state.activeQuestId !== "dzialka" || !state.dzialkaPhase) return null;

  const isFeedback =
    state.dzialkaPhase === "rap-result" &&
    (state.status.kind === "teamDrinks" || state.status.kind === "groomDrinks");

  if (isFeedback) {
    const team = state.status.kind === "teamDrinks";
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <TvCard border={team ? "border-cyan-400" : "border-rose-400"}>
            <p className="text-5xl font-black uppercase text-white">
              {team ? "CZYSTY WERS!" : "PROFANACJA!"}
            </p>
            <p className="mx-auto mt-6 max-w-3xl whitespace-pre-line text-2xl text-white/90">
              {state.status.message}
            </p>
            <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
          </TvCard>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        key={`dzialka-tv-${state.dzialkaPhase}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      >
        {state.dzialkaPhase === "intro" && (
          <TvCard>
            <div className="text-6xl mb-4">🏕️</div>
            <h2 className="text-5xl font-black uppercase text-emerald-300">DZIAŁKA</h2>
            <div className="mx-auto mt-6 max-w-3xl space-y-6 text-left">
              <p className="text-xl leading-relaxed text-white/90">{DZIALKA_INTRO_PART1}</p>
              <p className="text-xl leading-relaxed text-white/80">{DZIALKA_INTRO_PART2}</p>
            </div>
            <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
          </TvCard>
        )}
        {state.dzialkaPhase === "random" && (
          <TvCard border="border-amber-400">
            <div className="text-6xl mb-4">🍻</div>
            <h2 className="text-3xl font-black uppercase text-amber-300">LOSOWY TYP</h2>
            <div className="mx-auto mt-6 max-w-3xl space-y-4 text-left">
              <div className="rounded-2xl border border-white/20 bg-white/5 p-5">
                <p className="text-sm font-bold text-white/50">RANDOM:</p>
                <p className="mt-2 text-2xl text-white/90">&quot;{DZIALKA_RANDOM_LINE}&quot;</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-5">
                <p className="text-sm font-bold text-cyan-300">{GROOM.nickname.toUpperCase()}:</p>
                <p className="mt-2 text-2xl text-white/90">&quot;Co kurwa? Mam deja vu&quot;</p>
              </div>
              <p className="text-lg italic text-white/60 text-center">
                Lama przez chwilę próbuje ustalić, czy to był człowiek, wspomnienie, czy komunikat
                systemowy. Nie udaje się. Melanż trwa dalej.
              </p>
            </div>
            <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
          </TvCard>
        )}
        {state.dzialkaPhase === "rap" && (
          <TvCard border="border-fuchsia-400">
            <div className="text-6xl mb-4">🎤</div>
            <h2 className="text-4xl font-black uppercase text-fuchsia-300">DZIAŁKA RAP TEST</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-white/70">{DZIALKA_RAP.narratorBefore}</p>
            <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-fuchsia-400/40 bg-black/40 p-6 text-left">
              <p className="text-sm uppercase tracking-widest text-fuchsia-300">Fragment:</p>
              <p className="mt-3 whitespace-pre-line text-2xl font-bold italic text-white/95">
                {DZIALKA_RAP.lyricFragment}
              </p>
            </div>
            <p className="mt-4 text-2xl font-bold text-white">{DZIALKA_RAP.question}</p>
            <div className="mx-auto mt-8 grid max-w-4xl gap-3 text-left">
              {DZIALKA_RAP.answers.map((answer, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 rounded-2xl border-2 border-white/20 bg-white/5 p-4"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-xl font-black">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-lg font-mono text-white/95">{answer}</span>
                </div>
              ))}
            </div>
            <p className="mt-8 text-lg text-white/50">Odpowiedz na kontrolerze 📱</p>
          </TvCard>
        )}
        {state.dzialkaPhase === "final-choice" && (
          <TvCard border="border-amber-400">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="mx-auto max-w-3xl text-2xl text-white/90">{DZIALKA_FINAL_NARRATOR1}</p>
            <p className="mx-auto mt-6 max-w-3xl text-xl text-white/70">{DZIALKA_FINAL_NARRATOR2}</p>
            <div className="mx-auto mt-8 max-w-4xl">
              <ReadOnlyChoiceCards choices={getDzialkaFinalChoices()} />
            </div>
          </TvCard>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

// ── Controller ──────────────────────────────────────────────────

export function DzialkaController() {
  const { state, advanceDzialka, answerDzialkaRap, chooseDzialkaRoute, closeStatus } = useGame();

  if (
    state.dzialkaPhase === "rap-result" &&
    (state.status.kind === "teamDrinks" || state.status.kind === "groomDrinks")
  ) {
    const team = state.status.kind === "teamDrinks";
    return (
      <div className="space-y-4">
        <div
          className={`rounded-2xl border-2 p-5 text-center ${
            team ? "border-cyan-400 bg-cyan-600/15" : "border-rose-400 bg-rose-600/15"
          }`}
        >
          <div className="mb-3 text-4xl">{team ? "🍻" : "❌"}</div>
          <p className="text-xl font-black text-white/90">
            {team ? "CZYSTY WERS!" : "ŹLE!"}
          </p>
          <p className="mt-3 whitespace-pre-line text-base text-white/80">{state.status.message}</p>
          {team ? (
            <p className="mt-2 text-lg font-bold text-cyan-300">Wszyscy oprócz Lamy piją</p>
          ) : (
            <p className="mt-2 text-lg font-bold text-rose-300">🥃 Lama pije</p>
          )}
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={closeStatus}
          className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
        >
          Dalej →
        </motion.button>
      </div>
    );
  }

  switch (state.dzialkaPhase) {
    case "intro":
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-2">🏕️</div>
            <h3 className="text-2xl font-black uppercase text-emerald-300">DZIAŁKA</h3>
          </div>
          <div className="rounded-2xl border border-emerald-400/40 bg-emerald-950/30 p-4">
            <p className="text-sm text-white/90">{DZIALKA_INTRO_PART1}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm text-white/80">{DZIALKA_INTRO_PART2}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={advanceDzialka}
            className="w-full rounded-2xl bg-emerald-600 p-6 text-2xl font-black uppercase"
          >
            Dalej →
          </motion.button>
        </div>
      );
    case "random":
      return (
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-xl font-black uppercase text-amber-300">LOSOWY TYP</h3>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
            <p className="text-xs font-bold text-white/50">RANDOM:</p>
            <p className="mt-1 text-base text-white/90">&quot;{DZIALKA_RANDOM_LINE}&quot;</p>
          </div>
          <div className="rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-4">
            <p className="text-xs font-bold text-cyan-300">{GROOM.nickname}:</p>
            <p className="mt-1 text-base text-white/90">&quot;Co kurwa? Mam deja vu&quot;</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
            <p className="text-sm italic text-white/60">
              Lama przez chwilę próbuje ustalić, czy to był człowiek, wspomnienie, czy komunikat
              systemowy. Nie udaje się. Melanż trwa dalej.
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={advanceDzialka}
            className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
          >
            Dalej →
          </motion.button>
        </div>
      );
    case "rap":
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-5xl mb-2">🎤</div>
            <h3 className="text-2xl font-black uppercase text-fuchsia-300">DZIAŁKA RAP TEST</h3>
          </div>
          <div className="rounded-2xl border border-white/20 bg-white/5 p-4">
            <p className="text-sm text-white/70">{DZIALKA_RAP.narratorBefore}</p>
          </div>
          <div className="rounded-2xl border border-fuchsia-400/40 bg-fuchsia-950/20 p-4">
            <p className="text-xs uppercase tracking-widest text-fuchsia-300">Fragment:</p>
            <p className="mt-2 whitespace-pre-line text-base font-bold italic text-white/95">
              {DZIALKA_RAP.lyricFragment}
            </p>
          </div>
          <p className="px-1 text-xl font-bold text-white/90">{DZIALKA_RAP.question}</p>
          <div className="grid gap-3">
            {DZIALKA_RAP.answers.map((a, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.96 }}
                onClick={() => answerDzialkaRap(i)}
                className="flex items-center gap-4 rounded-2xl border-2 border-white/20 bg-white/5 p-5 text-left text-lg active:bg-fuchsia-500/30"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-fuchsia-500 text-xl font-black">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{a}</span>
              </motion.button>
            ))}
          </div>
        </div>
      );
    case "final-choice":
      return (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-xs uppercase tracking-[0.3em] text-amber-300">🗺️ Decyzja</div>
            <p className="mt-2 text-sm text-white/70">{DZIALKA_FINAL_NARRATOR1}</p>
            <p className="mt-2 text-sm text-white/60">{DZIALKA_FINAL_NARRATOR2}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => chooseDzialkaRoute("paryz")}
            className="flex w-full items-start gap-4 rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-rose-600/40 to-amber-500/30 p-5 text-left shadow-[0_0_30px_rgba(244,63,94,0.4)]"
          >
            <span className="text-4xl">🗼</span>
            <div>
              <div className="text-2xl font-black">PARYŻ</div>
              <div className="mt-1 text-sm text-white/80">
                OSTROŻNIE. DUŻE RYZYKO. To już nie jest decyzja — to wniosek o przygodę.
              </div>
            </div>
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => chooseDzialkaRoute("dom-zgon")}
            className="flex w-full items-start gap-4 rounded-2xl border-2 border-slate-400 bg-gradient-to-r from-slate-600/40 to-slate-800/40 p-5 text-left"
          >
            <span className="text-4xl">💀</span>
            <div>
              <div className="text-2xl font-black">DOM</div>
              <div className="mt-1 text-sm text-white/80">
                Idziemy spać, już kurwa starczy. Opcja dla ludzi, którzy jeszcze wierzą w regenerację.
              </div>
            </div>
          </motion.button>
        </div>
      );
    default:
      return (
        <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-center">
          <p className="text-white/70">Nieznana faza DZIAŁKI: {state.dzialkaPhase}</p>
        </div>
      );
  }
}
