import { motion } from "framer-motion";
import { useGame } from "@/state/gameStore";
import { GroomAvatar } from "./GroomAvatar";
import type { Location } from "@/data/gameData";

function LocationPin({ loc }: { loc: Location }) {
  const { state, availableLocations } = useGame();
  const completed = state.completedIds.includes(loc.id);
  const failed = state.failedIds.includes(loc.id);
  const available = availableLocations.some((l) => l.id === loc.id);
  const isCurrent = state.currentLocationId === loc.id;

  let ring = "border-white/20 bg-white/5";
  if (completed && !failed) ring = "border-emerald-400 bg-emerald-500/20";
  if (failed) ring = "border-rose-400 bg-rose-500/20";
  if (available) ring = "border-fuchsia-400 bg-fuchsia-500/20 animate-pulse";

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
    >
      <div className="flex flex-col items-center gap-2">
        <div
          className={`flex h-20 w-20 items-center justify-center rounded-full border-4 ${ring} text-3xl shadow-[0_0_25px_rgba(217,70,239,0.5)] backdrop-blur-sm`}
        >
          {loc.isSecret && !completed
            ? "❓"
            : loc.type === "final"
              ? "👑"
              : loc.type === "quiz"
                ? "🎯"
                : loc.type === "challenge"
                  ? "⚡"
                  : "✨"}
        </div>
        <div className="rounded-full bg-black/80 px-3 py-1 text-sm font-bold text-white shadow-md">
          {loc.isSecret && !completed ? "???" : loc.shortName}
        </div>
        {isCurrent && (
          <div className="text-xs font-bold uppercase text-fuchsia-300">
            tu jesteś
          </div>
        )}
      </div>
    </div>
  );
}

export function MapView() {
  const { locations, currentLocation } = useGame();
  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 shadow-[0_0_60px_rgba(217,70,239,0.3)_inset]">
      {/* grid background */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(217,70,239,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      {/* path lines between consecutive main locations */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {locations
          .filter((l) => !l.isSecret)
          .map((l, i, arr) => {
            const next = arr[i + 1];
            if (!next) return null;
            return (
              <line
                key={l.id}
                x1={`${l.x}%`}
                y1={`${l.y}%`}
                x2={`${next.x}%`}
                y2={`${next.y}%`}
                stroke="rgba(217,70,239,0.35)"
                strokeWidth={3}
                strokeDasharray="8 8"
              />
            );
          })}
      </svg>

      {locations.map((l) => (
        <LocationPin key={l.id} loc={l} />
      ))}

      {/* Avatar */}
      <motion.div
        className="pointer-events-none absolute z-10"
        animate={{ left: `${currentLocation.x}%`, top: `${currentLocation.y - 8}%` }}
        transition={{ type: "spring", stiffness: 60, damping: 14 }}
        style={{ translateX: "-50%", translateY: "-50%" }}
      >
        <GroomAvatar size={84} />
      </motion.div>
    </div>
  );
}
