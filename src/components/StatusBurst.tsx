import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import confetti from "canvas-confetti";
import { useGame } from "@/state/gameStore";

export function StatusBurst() {
  const { state, closeStatus } = useGame();
  const kind = state.status.kind;
  const show =
    kind === "correct" ||
    kind === "wrong" ||
    kind === "groomDrinks" ||
    kind === "teamDrinks";

  useEffect(() => {
    if (!show) return;
    if (kind === "correct") {
      confetti({
        particleCount: 180,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#d946ef", "#22d3ee", "#facc15", "#10b981"],
      });
    }
    const t = setTimeout(closeStatus, 3200);
    return () => clearTimeout(t);
  }, [show, kind, closeStatus, state.status.message]);

  const bg =
    kind === "correct"
      ? "from-emerald-500 to-cyan-500"
      : "from-rose-600 to-amber-600";

  const shake =
    kind === "groomDrinks" || kind === "wrong"
      ? { x: [0, -20, 20, -16, 16, -8, 8, 0] }
      : {};

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, ...shake }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center p-6"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -6 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 12 }}
            className={`rounded-3xl bg-gradient-to-br ${bg} px-16 py-12 text-center shadow-[0_0_120px_rgba(217,70,239,0.7)]`}
          >
            <div className="text-7xl md:text-8xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_30px_rgba(0,0,0,0.6)]">
              {state.status.message}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
