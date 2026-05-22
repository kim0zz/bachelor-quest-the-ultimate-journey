import { motion } from "framer-motion";
import { useEffect, type PointerEvent } from "react";
import confetti from "canvas-confetti";
import type { Location } from "@/data/gameData";
import { useGame, useTick } from "@/state/gameStore";

function ShotGlass({
  level,
  targetMin,
  targetMax,
  frozen,
}: {
  level: number;
  targetMin: number;
  targetMax: number;
  frozen: boolean;
}) {
  return (
    <div className="flex items-end justify-center gap-6">
      <div className="flex flex-col items-end gap-2 text-sm font-bold uppercase tracking-wider text-rose-300">
        <span>ZA DUŻO</span>
        <span className="text-white/40">↑</span>
      </div>

      <div className="relative flex flex-col items-center">
        <div
          className={`relative h-72 w-28 overflow-hidden rounded-b-3xl rounded-t-lg border-4 border-white/30 bg-white/5 shadow-[inset_0_0_40px_rgba(0,0,0,0.5)] ${
            frozen ? "ring-4 ring-amber-400/80" : ""
          }`}
        >
          <div
            className="pointer-events-none absolute left-0 right-0 border-y-2 border-emerald-400/90 bg-emerald-500/25"
            style={{
              bottom: `${targetMin}%`,
              height: `${targetMax - targetMin}%`,
            }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-600 via-amber-400 to-amber-200"
            animate={{ height: `${level}%` }}
            transition={
              frozen ? { duration: 0 } : { type: "spring", stiffness: 300, damping: 28 }
            }
            style={{ boxShadow: "0 0 30px rgba(251,191,36,0.6)" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent" />
        </div>
        <div className="mt-2 text-5xl font-black tabular-nums text-amber-200">
          {Math.round(level)}%
        </div>
      </div>

      <div className="flex flex-col items-start gap-6 text-sm font-bold uppercase tracking-wider">
        <span className="text-emerald-300">IDEALNIE</span>
        <span className="text-rose-300">ZA MAŁO</span>
        <span className="text-white/40">↓</span>
      </div>
    </div>
  );
}

function resultSubtext(loc: Location, result: "success" | "under" | "over") {
  if (result === "success") return loc.rewardText;
  if (result === "under") return loc.underPenaltyText ?? loc.penaltyText;
  return loc.overPenaltyText ?? loc.penaltyText;
}

function resultTitle(loc: Location, result: "success" | "under" | "over") {
  if (result === "success") return loc.successTitle ?? "SUKCES";
  if (result === "under") return loc.underTitle ?? "NIEDOLANE!";
  return loc.overTitle ?? "PRZELANE!";
}

export function ShotPourMinigameTv({ loc }: { loc: Location }) {
  const { state } = useGame();
  useTick(50);

  const targetMin = loc.targetMin ?? 70;
  const targetMax = loc.targetMax ?? 85;
  const frozen = state.pourEvaluated;
  const result = state.pourResult;

  useEffect(() => {
    if (!frozen || result !== "success") return;
    confetti({
      particleCount: 160,
      spread: 90,
      origin: { y: 0.55 },
      colors: ["#d946ef", "#22d3ee", "#facc15", "#10b981"],
    });
  }, [frozen, result]);

  return (
    <div className="text-center">
      <p className="text-lg text-white/60">{loc.introText}</p>

      <div className="mt-8">
        <ShotGlass
          level={state.pourLevel}
          targetMin={targetMin}
          targetMax={targetMax}
          frozen={frozen}
        />
      </div>

      <p className="mt-6 text-sm uppercase tracking-widest text-white/50">
        Zielona strefa: {targetMin}% – {targetMax}%
      </p>

      {!frozen && (
        <p className="mt-4 text-xl text-fuchsia-200 animate-pulse">
          {state.pourIsPouring ? "LEJE… przytrzymaj na kontrolerze 📱" : "Czekam na LEJ…"}
        </p>
      )}

      {frozen && result && (
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            x:
              result === "success"
                ? 0
                : [0, -14, 14, -10, 10, 0],
          }}
          transition={{ duration: 0.45 }}
          className={`mt-8 rounded-2xl border-2 px-8 py-6 ${
            result === "success"
              ? "border-emerald-400 bg-emerald-500/20"
              : "border-rose-400 bg-rose-500/20"
          }`}
        >
          <div
            className={`text-5xl font-black uppercase ${
              result === "success" ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {resultTitle(loc, result)}
          </div>
          <p className="mt-3 text-xl text-white/80">{resultSubtext(loc, result)}</p>
        </motion.div>
      )}
    </div>
  );
}

export function ShotPourMinigameController({ loc }: { loc: Location }) {
  const {
    state,
    startPouring,
    stopPouring,
    acknowledgePourResult,
  } = useGame();

  const frozen = state.pourEvaluated;
  const result = state.pourResult;

  const bindPour = () => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      startPouring();
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      stopPouring();
    },
    onPointerCancel: () => stopPouring(),
    onPointerLeave: (e: PointerEvent<HTMLButtonElement>) => {
      if (e.buttons > 0) stopPouring();
    },
  });

  return (
    <div className="space-y-3 select-none touch-none">
      <div className="rounded-2xl border-2 border-cyan-400/60 bg-black/50 p-4 text-center">
        <div className="text-xs uppercase tracking-widest text-cyan-300">
          Minigra
        </div>
        <div className="text-2xl font-black">{loc.name}</div>
        <p className="mt-2 text-sm text-white/70">
          Przytrzymaj LEJ i puść w idealnym momencie.
        </p>
        <p className="mt-2 text-3xl font-black tabular-nums text-amber-300">
          {Math.round(state.pourLevel)}%
        </p>
      </div>

      {!frozen ? (
        <button
          type="button"
          {...bindPour()}
          className={`w-full rounded-2xl border-4 p-10 text-5xl font-black uppercase shadow-[0_0_40px_rgba(251,191,36,0.5)] transition ${
            state.pourIsPouring
              ? "border-amber-200 bg-amber-400 text-black scale-[0.98]"
              : "border-amber-300 bg-gradient-to-b from-amber-500 to-amber-700 text-black"
          }`}
        >
          🥃 LEJ
        </button>
      ) : (
        <>
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{
              scale: 1,
              x: result === "success" ? 0 : [0, -10, 10, -6, 6, 0],
            }}
            className={`rounded-2xl border-2 p-6 text-center ${
              result === "success"
                ? "border-emerald-400 bg-emerald-500/20"
                : "border-rose-400 bg-rose-500/20"
            }`}
          >
            <div className="text-3xl font-black uppercase">
              {result && resultTitle(loc, result)}
            </div>
            <p className="mt-2 text-sm text-white/70">
              {result && resultSubtext(loc, result)}
            </p>
          </motion.div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={acknowledgePourResult}
            className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
          >
            Dalej
          </motion.button>
        </>
      )}
    </div>
  );
}
