import { useEffect } from "react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { useGame } from "@/state/gameStore";
import { VERDICTS } from "@/data/gameData";

export function FinalVerdict() {
  const { state, reset } = useGame();

  const verdict = [...VERDICTS]
    .reverse()
    .find((v) => state.manPoints >= v.minPoints) ?? VERDICTS[0];

  useEffect(() => {
    const fire = () =>
      confetti({
        particleCount: 200,
        spread: 120,
        origin: { y: 0.5 },
        colors: ["#d946ef", "#22d3ee", "#facc15", "#10b981", "#f43f5e"],
      });
    fire();
    const i = setInterval(fire, 1200);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="w-full max-w-5xl rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-purple-950 via-fuchsia-950 to-slate-950 p-12 text-center shadow-[0_0_120px_rgba(251,191,36,0.5)]"
      >
        <div className="text-2xl uppercase tracking-[0.4em] text-amber-300">
          Werdykt Końcowy
        </div>
        <div className="my-6 text-9xl">👑</div>
        <h1 className="text-7xl md:text-8xl font-black text-white drop-shadow-[0_4px_30px_rgba(217,70,239,0.5)]">
          {verdict.title}
        </h1>
        <p className="mt-6 text-3xl text-white/80">{verdict.subtitle}</p>

        <div className="mt-10 flex flex-wrap justify-center gap-6 text-2xl text-white">
          <div className="rounded-2xl border border-fuchsia-400 bg-black/40 px-6 py-3">
            💍 {state.manPoints} Mąż Points
          </div>
          <div className="rounded-2xl border border-amber-400 bg-black/40 px-6 py-3">
            🥃 {state.shotCount} shotów
          </div>
          <div className="rounded-2xl border border-cyan-400 bg-black/40 px-6 py-3">
            🍻 {state.teamShots} team shots
          </div>
        </div>

        <button
          onClick={reset}
          className="mt-10 rounded-2xl bg-fuchsia-500 px-10 py-5 text-2xl font-black uppercase text-white shadow-[0_0_40px_rgba(217,70,239,0.7)] hover:bg-fuchsia-400"
        >
          Nowa Gra
        </button>
      </motion.div>
    </div>
  );
}
