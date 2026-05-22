import { motion } from "framer-motion";
import { useGame } from "@/state/gameStore";

function Stat({
  label,
  value,
  color,
  icon,
}: {
  label: string;
  value: number;
  color: string;
  icon: string;
}) {
  return (
    <motion.div
      key={value}
      initial={{ scale: 0.85 }}
      animate={{ scale: 1 }}
      className={`rounded-2xl border-2 ${color} bg-black/60 px-6 py-4 backdrop-blur-md shadow-[0_0_30px_rgba(0,0,0,0.5)]`}
    >
      <div className="text-xs uppercase tracking-widest text-white/70">
        {label}
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl">{icon}</span>
        <span className="text-5xl font-black text-white tabular-nums">
          {value}
        </span>
      </div>
    </motion.div>
  );
}

export function ScoreBoard() {
  const { state } = useGame();
  return (
    <div className="flex gap-4">
      <Stat
        label="Mąż Points"
        value={state.manPoints}
        color="border-fuchsia-400 shadow-[0_0_30px_rgba(217,70,239,0.4)]"
        icon="💍"
      />
      <Stat
        label="Shoty Pana Młodego"
        value={state.shotCount}
        color="border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]"
        icon="🥃"
      />
      <Stat
        label="Team Shots"
        value={state.teamShots}
        color="border-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.4)]"
        icon="🍻"
      />
    </div>
  );
}
