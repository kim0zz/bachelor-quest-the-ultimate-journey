import { motion } from "framer-motion";
import type { PourResult } from "@/data/gameData";

const GLASS_H = 360;

type Props = {
  level: number;
  targetMin: number;
  targetMax: number;
  isPouring?: boolean;
  frozen?: boolean;
  result?: PourResult | null;
  variant?: "tv" | "compact";
};

function clampLevel(level: number) {
  return Math.min(100, Math.max(0, level));
}

/** Controller: compact meter — same % mapping as TV. */
function CompactPourBar({
  level,
  targetMin,
  targetMax,
}: {
  level: number;
  targetMin: number;
  targetMax: number;
}) {
  const pct = Math.round(clampLevel(level));
  const zoneH = targetMax - targetMin;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative w-12 overflow-hidden rounded-lg border-2 border-white/30 bg-black/40"
        style={{ height: 128 }}
      >
        <div
          className="pointer-events-none absolute left-0 right-0 border-y-2 border-emerald-400 bg-emerald-500/40"
          style={{ bottom: `${targetMin}%`, height: `${zoneH}%` }}
        />
        <motion.div
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-800 to-amber-300"
          style={{ height: `${pct}%` }}
          transition={
            { type: "spring", stiffness: 300, damping: 28 }
          }
        />
      </div>
      <span className="text-3xl font-black tabular-nums text-amber-200">{pct}%</span>
    </div>
  );
}

/** TV: CSS shot meter — fill height equals fillLevel % exactly. */
function TvShotMeter({
  level,
  targetMin,
  targetMax,
  isPouring,
  frozen,
  result,
}: {
  level: number;
  targetMin: number;
  targetMax: number;
  isPouring: boolean;
  frozen: boolean;
  result: PourResult | null;
}) {
  const pct = Math.round(clampLevel(level));
  const zoneH = targetMax - targetMin;

  return (
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-end sm:gap-10">
      {/* Zone labels aligned to glass height */}
      <div
        className="relative hidden w-28 shrink-0 sm:block"
        style={{ height: GLASS_H }}
      >
        <p className="absolute right-0 top-0 text-right text-base font-black uppercase tracking-wide text-rose-400">
          ZA DUŻO
        </p>
        <p
          className="absolute right-0 text-right text-base font-black uppercase tracking-wide text-emerald-400"
          style={{
            bottom: `${targetMin + zoneH / 2}%`,
            transform: "translateY(50%)",
          }}
        >
          IDEALNIE
          <span className="mt-0.5 block text-xs font-bold text-emerald-300/90">
            {targetMin}–{targetMax}%
          </span>
        </p>
        <p className="absolute bottom-0 right-0 text-right text-base font-black uppercase tracking-wide text-rose-400/90">
          ZA MAŁO
        </p>
      </div>

      <div className="flex items-end gap-6">
        <motion.div
          className="flex flex-col items-center"
          animate={
            isPouring
              ? { filter: ["brightness(1)", "brightness(1.08)", "brightness(1)"] }
              : {}
          }
          transition={
            isPouring
              ? { duration: 0.5, repeat: Infinity, ease: "easeInOut" }
              : {}
          }
        >
          {/* Glass cup */}
          <div
            className="relative w-28 overflow-hidden rounded-t-2xl border-4 border-white/45 bg-white/[0.07] shadow-[inset_0_0_30px_rgba(0,0,0,0.5),0_8px_40px_rgba(0,0,0,0.45)]"
            style={{ height: GLASS_H }}
          >
            {/* Ideal zone */}
            <motion.div
              className="pointer-events-none absolute left-0 right-0 z-10 border-y-2 border-emerald-400 bg-emerald-500/45"
              style={{ bottom: `${targetMin}%`, height: `${zoneH}%` }}
              animate={
                result === "success"
                  ? {
                      backgroundColor: [
                        "rgba(16,185,129,0.45)",
                        "rgba(16,185,129,0.7)",
                        "rgba(16,185,129,0.45)",
                      ],
                    }
                  : {}
              }
              transition={{ duration: 0.7, repeat: result === "success" ? 2 : 0 }}
            />

            {/* Liquid — direct % from bottom */}
            <motion.div
              className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-amber-900 via-amber-500 to-amber-200"
              style={{ height: `${pct}%` }}
              transition={
                frozen
                  ? { duration: 0 }
                  : { type: "spring", stiffness: 320, damping: 30 }
              }
            />

            {/* Meniscus highlight at fill top */}
            {pct > 0 && (
              <div
                className="pointer-events-none absolute left-1 right-1 z-30 h-1 rounded-full bg-amber-100/90 shadow-[0_0_8px_rgba(254,240,138,0.8)]"
                style={{ bottom: `calc(${pct}% - 2px)` }}
              />
            )}

            {/* Glass shine */}
            <div className="pointer-events-none absolute inset-y-4 left-2 w-2 rounded-full bg-white/15" />
          </div>

          {/* Thick base */}
          <div className="-mt-1 h-5 w-32 rounded-b-xl border-4 border-t-0 border-white/40 bg-white/[0.08]" />
        </motion.div>

        <div className="flex flex-col items-center justify-center">
          <div className="text-7xl font-black tabular-nums leading-none text-amber-100 drop-shadow-[0_0_20px_rgba(251,191,36,0.45)]">
            {pct}%
          </div>
          <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/50">
            poziom
          </p>
        </div>
      </div>

      <p className="flex flex-wrap justify-center gap-x-4 text-sm font-bold uppercase tracking-widest sm:hidden">
        <span className="text-rose-400">ZA MAŁO</span>
        <span className="text-emerald-400">IDEALNIE</span>
        <span className="text-rose-400">ZA DUŻO</span>
      </p>
    </div>
  );
}

export function ShotGlassVisual({
  level,
  targetMin,
  targetMax,
  isPouring = false,
  frozen = false,
  result = null,
  variant = "tv",
}: Props) {
  if (variant === "compact") {
    return (
      <CompactPourBar
        level={level}
        targetMin={targetMin}
        targetMax={targetMax}
      />
    );
  }

  return (
    <TvShotMeter
      level={level}
      targetMin={targetMin}
      targetMax={targetMax}
      isPouring={isPouring}
      frozen={frozen}
      result={result}
    />
  );
}
