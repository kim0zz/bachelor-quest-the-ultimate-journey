import { motion } from "framer-motion";
import { useEffect, useRef, type PointerEvent } from "react";
import confetti from "canvas-confetti";
import type { Location } from "@/data/gameData";
import { ShotGlassVisual } from "@/components/ShotGlassVisual";
import { computePourDisplayLevel } from "@/lib/pourLevel";
import { useGame, useTick } from "@/state/gameStore";

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

  const targetMin = loc.targetMin ?? 80;
  const targetMax = loc.targetMax ?? 95;
  const fillSpeed = loc.fillSpeed ?? 45;
  const frozen = state.pourEvaluated;
  const result = state.pourResult;
  const displayLevel = computePourDisplayLevel(
    state.pourStartedAt,
    state.pourIsPouring,
    state.pourEvaluated,
    state.pourLevel,
    fillSpeed,
  );

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
      <p className="mx-auto max-w-2xl text-lg text-white/70">{loc.introText}</p>

      <div className="mt-8 flex justify-center">
        <ShotGlassVisual
          level={displayLevel}
          targetMin={targetMin}
          targetMax={targetMax}
          isPouring={state.pourIsPouring && !frozen}
          frozen={frozen}
          result={result}
          variant="tv"
        />
      </div>

      <p className="mt-4 text-sm uppercase tracking-widest text-emerald-400/80">
        Zielona strefa: {targetMin}% – {targetMax}%
      </p>

      {!frozen && (
        <p className="mt-4 text-xl text-fuchsia-200 animate-pulse">
          {state.pourIsPouring
            ? "LEJE… przytrzymaj LEJ na kontrolerze 📱"
            : "Czekam na LEJ…"}
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
          className={`mx-auto mt-8 max-w-3xl rounded-2xl border-2 px-8 py-6 ${
            result === "success"
              ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_40px_rgba(16,185,129,0.35)]"
              : "border-rose-400 bg-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.35)]"
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

  const targetMin = loc.targetMin ?? 80;
  const targetMax = loc.targetMax ?? 95;
  const fillSpeed = loc.fillSpeed ?? 45;
  const frozen = state.pourEvaluated;
  const result = state.pourResult;
  const displayLevel = computePourDisplayLevel(
    state.pourStartedAt,
    state.pourIsPouring,
    state.pourEvaluated,
    state.pourLevel,
    fillSpeed,
  );
  const pourStoppingRef = useRef(false);
  const pourButtonRef = useRef<HTMLButtonElement>(null);
  const activePointerIdRef = useRef<number | null>(null);

  useTick(50);

  const releasePointerCapture = () => {
    const btn = pourButtonRef.current;
    const pointerId = activePointerIdRef.current;
    if (btn == null || pointerId == null) return;
    try {
      if (btn.hasPointerCapture(pointerId)) {
        btn.releasePointerCapture(pointerId);
      }
    } catch {
      /* ignore — capture may already be released */
    }
    activePointerIdRef.current = null;
  };

  const finishPourPointer = () => {
    releasePointerCapture();
    if (pourStoppingRef.current || !state.pourIsPouring || state.pourEvaluated) return;
    pourStoppingRef.current = true;
    stopPouring();
  };

  useEffect(() => {
    return () => {
      releasePointerCapture();
      pourStoppingRef.current = false;
    };
  }, []);

  const bindPour = () => ({
    onPointerDown: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      pourStoppingRef.current = false;
      activePointerIdRef.current = e.pointerId;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        activePointerIdRef.current = null;
      }
      startPouring();
    },
    onPointerUp: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      finishPourPointer();
    },
    onPointerCancel: (e: PointerEvent<HTMLButtonElement>) => {
      e.preventDefault();
      finishPourPointer();
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
          Przytrzymaj LEJ i puść między {targetMin}% a {targetMax}%.
        </p>
        <div className="mt-4 flex justify-center">
          <ShotGlassVisual
            level={displayLevel}
            targetMin={targetMin}
            targetMax={targetMax}
            isPouring={state.pourIsPouring && !frozen}
            frozen={frozen}
            result={result}
            variant="compact"
          />
        </div>
      </div>

      {!frozen ? (
        <button
          ref={pourButtonRef}
          type="button"
          {...bindPour()}
          style={{ touchAction: "manipulation", WebkitTapHighlightColor: "transparent" }}
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
