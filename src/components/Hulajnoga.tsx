import { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GROOM,
  GROOM_AVATAR_URL,
  HULAJNOGA_REQUIRED_CLICKS,
  PRE_BITWY_NARRATOR,
  PRE_BITWY_ZUKER_INTRO,
  PRE_BITWY_ZUKER_LINE,
} from "@/data/gameData";
import {
  getHulajnogaProgress,
  getHulajnogaRemainingSeconds,
} from "@/lib/hulajnogaDisplay";
import { useGame, useTick } from "@/state/gameStore";

// ── TV ──────────────────────────────────────────────────────────

export function PreBitwyTransitionTv() {
  const { state } = useGame();
  if (state.preBitwyPhase !== "zuker-call") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-5xl rounded-3xl border-2 border-cyan-400 bg-gradient-to-br from-cyan-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(34,211,238,0.4)]"
        >
          <div className="text-6xl mb-4">📱</div>
          <p className="mx-auto max-w-3xl text-2xl leading-relaxed text-white/90">
            {PRE_BITWY_ZUKER_INTRO}
          </p>
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-6 text-left">
            <p className="text-sm font-bold uppercase text-cyan-300">Żuker:</p>
            <p className="mt-2 text-2xl font-bold text-white/90">
              &quot;{PRE_BITWY_ZUKER_LINE}&quot;
            </p>
          </div>
          <p className="mx-auto mt-8 max-w-3xl text-xl italic text-white/70">
            {PRE_BITWY_NARRATOR}
          </p>
          <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function PostBitwyTransitionTv() {
  const { state } = useGame();
  if (state.postBitwyPhase !== "transition") return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-5xl rounded-3xl border-2 border-fuchsia-400 bg-gradient-to-br from-purple-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(217,70,239,0.5)]"
        >
          <div className="text-6xl mb-4">🏚️ → 🛒</div>
          <p className="mx-auto max-w-3xl text-2xl leading-relaxed text-white/90">
            {state.status.message}
          </p>
          <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export function HulajnogaTv() {
  const { state } = useGame();
  useTick(50);

  if (state.postDrewniakPhase === "hulajnoga-choice") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-5xl rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(251,191,36,0.4)]"
          >
            <div className="text-6xl mb-4">🛴</div>
            <h2 className="text-4xl font-black uppercase tracking-wide text-amber-300">
              CZY BIERZESZ HULAJNOGĘ?
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-2xl text-white/80">
              DREWNIAK załatwiony. Działka czeka. Przed Lamą pojawia się hulajnoga — pojazd, który po
              alkoholu wygląda jak transport, a jest testem charakteru.
            </p>
            <p className="mt-8 text-lg text-white/50">Wybierz na kontrolerze 📱</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (state.postDrewniakPhase === "hulajnoga-skip-narrator") {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-5xl rounded-3xl border-2 border-cyan-400 bg-gradient-to-br from-cyan-950 to-slate-950 p-10 text-center"
          >
            <p className="mx-auto max-w-3xl text-3xl font-bold text-white/90">
              {state.status.message}
            </p>
            <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (state.postDrewniakPhase === "hulajnoga-result") {
    const success = state.hulajnogaResult === "success";
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
        >
          <motion.div
            initial={{ scale: 0.85, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            className={`w-full max-w-5xl rounded-3xl border-2 p-10 text-center ${
              success
                ? "border-emerald-400 bg-gradient-to-br from-emerald-950 to-slate-950"
                : "border-rose-400 bg-gradient-to-br from-rose-950 to-slate-950"
            }`}
          >
            <p className="text-6xl font-black uppercase text-white">
              {success ? "DOJECHAŁ!" : "WYJEBKA!"}
            </p>
            <p className="mx-auto mt-6 max-w-3xl text-2xl text-white/90">
              {state.status.message}
            </p>
            <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    );
  }

  if (state.postDrewniakPhase !== "hulajnoga-running") return null;
  if (state.hulajnogaResult) return null;

  const remaining = getHulajnogaRemainingSeconds(state.hulajnogaEndsAt);
  const progress = getHulajnogaProgress(state.hulajnogaClicks);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-5xl rounded-3xl border-2 border-rose-400 bg-gradient-to-br from-rose-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(244,63,94,0.5)]"
        >
          <h2 className="text-5xl font-black uppercase text-rose-300">HULAJNOGA HIGH RISK</h2>
          <div
            className={`mx-auto mt-6 w-40 rounded-2xl border-4 p-4 text-6xl font-black tabular-nums ${
              remaining <= 2
                ? "border-rose-400 text-rose-300 animate-pulse"
                : "border-amber-300 text-amber-200"
            }`}
          >
            {remaining}s
          </div>
          <div className="mx-auto mt-8 max-w-3xl">
            <div className="flex justify-between text-sm uppercase tracking-widest text-white/60 mb-2">
              <span>🛒 DREWNIAK</span>
              <span>🌲 DZIAŁKA</span>
            </div>
            <div className="relative h-8 rounded-full bg-black/50 border-2 border-white/20 overflow-hidden">
              <motion.div
                className="absolute top-0 h-full bg-gradient-to-r from-amber-500 to-emerald-500"
                style={{ width: `${progress}%` }}
                layout
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 text-2xl transition-all duration-75"
                style={{ left: `calc(${progress}% - 1rem)` }}
              >
                🛴
              </div>
            </div>
            <div className="mt-4 flex items-center justify-center gap-4">
              <img
                src={GROOM_AVATAR_URL}
                alt={GROOM.nickname}
                className="h-16 w-16 rounded-full border-2 border-fuchsia-400 object-cover"
              />
              <p className="text-3xl font-black text-white">
                {state.hulajnogaClicks} / {HULAJNOGA_REQUIRED_CLICKS}
              </p>
            </div>
          </div>
          <p className="mt-8 text-xl text-fuchsia-200 animate-pulse">
            Klikaj ODPYCHAJ SIĘ na kontrolerze 📱
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Controller ──────────────────────────────────────────────────

export function PreBitwyTransitionController() {
  const { state, closeStatus } = useGame();
  if (state.preBitwyPhase !== "zuker-call") return null;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border-2 border-cyan-400/60 bg-black/50 p-5 text-center">
        <p className="text-base leading-snug text-white/90">{PRE_BITWY_ZUKER_INTRO}</p>
        <p className="mt-4 text-sm font-bold text-cyan-300">Żuker:</p>
        <p className="mt-1 text-base text-white/90">&quot;{PRE_BITWY_ZUKER_LINE}&quot;</p>
        <p className="mt-4 text-sm italic text-white/70">{PRE_BITWY_NARRATOR}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={closeStatus}
        className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
      >
        Dalej → BITWY
      </motion.button>
    </div>
  );
}

export function HulajnogaController() {
  const {
    state,
    closeStatus,
    skipHulajnoga,
    startHulajnoga,
    hulajnogaClick,
  } = useGame();
  useTick(50);
  const tapLockRef = useRef(false);

  const handleHulajnogaPush = () => {
    if (tapLockRef.current || state.hulajnogaResult) return;
    tapLockRef.current = true;
    hulajnogaClick();
    window.setTimeout(() => {
      tapLockRef.current = false;
    }, 0);
  };

  if (state.preBitwyPhase === "zuker-call") {
    return <PreBitwyTransitionController />;
  }

  if (state.postBitwyPhase === "transition") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border-2 border-fuchsia-400/60 bg-black/50 p-5 text-center">
          <p className="text-base leading-snug text-white/90">{state.status.message}</p>
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

  if (state.postDrewniakPhase === "hulajnoga-choice") {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="text-5xl mb-2">🛴</div>
          <h3 className="text-2xl font-black uppercase text-amber-300">CZY BIERZESZ HULAJNOGĘ?</h3>
          <p className="mt-2 text-sm text-white/70">
            DREWNIAK załatwiony. Działka czeka. Przed Lamą pojawia się hulajnoga — pojazd, który po
            alkoholu wygląda jak transport, a jest testem charakteru.
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={skipHulajnoga}
          className="flex w-full items-center gap-4 rounded-2xl border-2 border-cyan-400 bg-cyan-500/10 p-5 text-left"
        >
          <span className="text-4xl">🚶</span>
          <div>
            <div className="text-xl font-black">Idę normalnie</div>
            <div className="text-sm text-white/60">Bez punktów, bez historii medycznej</div>
          </div>
        </motion.button>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={startHulajnoga}
          className="flex w-full items-center gap-4 rounded-2xl border-2 border-rose-400 bg-gradient-to-r from-rose-600/40 to-amber-500/40 p-5 text-left shadow-[0_0_30px_rgba(244,63,94,0.4)]"
        >
          <span className="text-4xl">🛴</span>
          <div>
            <div className="text-xl font-black">Biorę hulajnogę</div>
            <div className="text-sm text-white/60">HIGH RISK — 7 sekund, 25 klików</div>
          </div>
        </motion.button>
      </div>
    );
  }

  if (state.postDrewniakPhase === "hulajnoga-skip-narrator") {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border-2 border-cyan-400/60 bg-black/50 p-5 text-center">
          <p className="text-base text-white/90">{state.status.message}</p>
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

  if (state.postDrewniakPhase === "hulajnoga-result") {
    const success = state.hulajnogaResult === "success";
    return (
      <div className="space-y-4">
        <div
          className={`rounded-2xl border-2 p-5 text-center ${
            success
              ? "border-emerald-400 bg-emerald-600/15"
              : "border-rose-400 bg-rose-600/15"
          }`}
        >
          <div className="mb-3 text-4xl">{success ? "✅" : "❌"}</div>
          <p className="text-2xl font-black text-white/90">
            {success ? "DOJECHAŁ!" : "WYJEBKA!"}
          </p>
          <p className="mt-3 text-base text-white/80">{state.status.message}</p>
          {!success && (
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

  if (state.postDrewniakPhase !== "hulajnoga-running" || state.hulajnogaResult) {
    return null;
  }

  const remaining = getHulajnogaRemainingSeconds(state.hulajnogaEndsAt);
  const progress = getHulajnogaProgress(state.hulajnogaClicks);

  return (
    <div className="space-y-4 select-none">
      <div className="text-center">
        <h3 className="text-2xl font-black uppercase text-rose-300">HULAJNOGA</h3>
        <p className="mt-1 text-sm text-white/70">
          Masz 7 sekund. Klikaj ODPYCHAJ SIĘ, żeby dojechać na działkę.
        </p>
      </div>
      <div
        className={`rounded-2xl border-2 p-4 text-center font-black tabular-nums text-5xl ${
          remaining <= 2
            ? "border-rose-400 bg-rose-500/20 text-rose-200"
            : "border-amber-400 bg-amber-500/20 text-amber-200"
        }`}
      >
        {remaining}s
      </div>
      <div className="relative h-6 rounded-full bg-black/50 border border-white/20 overflow-hidden">
        <div
          className="absolute top-0 h-full bg-gradient-to-r from-amber-500 to-emerald-500 transition-all duration-75"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="text-center text-xl font-black text-white">
        {state.hulajnogaClicks} / {HULAJNOGA_REQUIRED_CLICKS}
      </p>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          handleHulajnogaPush();
        }}
        disabled={!!state.hulajnogaResult}
        className="w-full select-none rounded-2xl border-4 border-rose-300 bg-gradient-to-b from-rose-500 to-amber-600 p-10 text-4xl font-black uppercase text-white shadow-[0_0_40px_rgba(244,63,94,0.5)] active:scale-95 disabled:opacity-40"
        style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
      >
        🛴 ODPYCHAJ SIĘ
      </button>
    </div>
  );
}
