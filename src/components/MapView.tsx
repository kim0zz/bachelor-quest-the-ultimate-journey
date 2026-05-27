import { motion } from "framer-motion";
import { useGame } from "@/state/gameStore";
import { GroomAvatar } from "./GroomAvatar";
import { MAP_CONNECTIONS, type Location } from "@/data/gameData";
import {
  getMapLocationVisibility,
  isMapLocationRevealed,
  type MapLocationVisibility,
} from "@/lib/mapVisibility";

function LocationPin({
  loc,
  visibility,
}: {
  loc: Location;
  visibility: MapLocationVisibility;
}) {
  const { state } = useGame();
  const failed = state.failedIds.includes(loc.id);
  const isRisk = loc.type === "risk";

  if (visibility === "fogged") {
    return (
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
        style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
      >
        <div className="flex flex-col items-center gap-2 opacity-70">
          <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-slate-600/80 bg-slate-900/90 text-3xl text-slate-500 blur-[0.5px] grayscale">
            ?
          </div>
          <div className="rounded-full bg-slate-900/90 px-3 py-1 text-sm font-black text-slate-500">
            ???
          </div>
        </div>
      </div>
    );
  }

  const icon =
    loc.icon ??
    (loc.type === "final"
      ? "👑"
      : loc.type === "minigame"
        ? "🥃"
        : loc.type === "quiz"
          ? "🎯"
          : loc.type === "challenge"
            ? "⚡"
            : loc.type === "start"
              ? "🏠"
              : "⚠️");

  let ring = "border-white/25 bg-white/8";
  if (loc.type === "start") ring = "border-cyan-300/80 bg-cyan-500/15";
  if (visibility === "completed" && !failed) {
    ring = "border-emerald-400 bg-emerald-500/25";
  }
  if (failed) ring = "border-rose-400 bg-rose-500/20";
  if (visibility === "available" && !isRisk) {
    ring =
      "border-fuchsia-400 bg-fuchsia-500/30 animate-pulse shadow-[0_0_28px_rgba(217,70,239,0.75)] ring-4 ring-fuchsia-400/50";
  }
  if (isRisk && visibility === "available") {
    ring =
      "border-amber-300 bg-gradient-to-br from-rose-500/40 to-amber-400/40 animate-pulse shadow-[0_0_40px_rgba(251,191,36,0.9)]";
  }
  if (visibility === "current") {
    ring = "border-fuchsia-300 bg-fuchsia-500/35 shadow-[0_0_36px_rgba(217,70,239,0.65)]";
  }
  if (visibility === "revealed") {
    ring = "border-white/30 bg-white/10";
  }

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
      style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
    >
      <div className="relative flex flex-col items-center gap-2">
        <div
          className={`relative flex h-20 w-20 items-center justify-center rounded-full border-4 ${ring} text-3xl backdrop-blur-sm`}
        >
          {icon}
          {visibility === "completed" && !failed && (
            <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white shadow-md">
              ✓
            </span>
          )}
        </div>
        <div
          className={`rounded-full px-3 py-1 text-sm font-black shadow-md ${
            isRisk
              ? "bg-gradient-to-r from-rose-500 to-amber-400 text-black uppercase tracking-wider"
              : "bg-black/80 text-white"
          }`}
        >
          {loc.shortName}
        </div>
        {visibility === "current" && (
          <div className="text-xs font-bold uppercase text-fuchsia-300">tu jesteś</div>
        )}
      </div>
    </div>
  );
}

export function MapView() {
  const { locations, currentLocation, state, availableLocations } = useGame();

  const visibilityFor = (loc: Location) =>
    getMapLocationVisibility(loc, state, availableLocations);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-3xl border-2 border-fuchsia-500/40 bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 shadow-[0_0_60px_rgba(217,70,239,0.3)_inset]">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(217,70,239,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.15) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        {MAP_CONNECTIONS.map(([fromId, toId]) => {
          const from = locations.find((l) => l.id === fromId);
          const to = locations.find((l) => l.id === toId);
          if (!from || !to) return null;
          const fromFog = !isMapLocationRevealed(fromId, state, availableLocations);
          const toFog = !isMapLocationRevealed(toId, state, availableLocations);
          const stroke =
            fromFog && toFog
              ? "rgba(100,116,139,0.12)"
              : fromFog || toFog
                ? "rgba(148,163,184,0.2)"
                : "rgba(217,70,239,0.35)";
          return (
            <line
              key={`${fromId}-${toId}`}
              x1={`${from.x}%`}
              y1={`${from.y}%`}
              x2={`${to.x}%`}
              y2={`${to.y}%`}
              stroke={stroke}
              strokeWidth={fromFog && toFog ? 2 : 3}
              strokeDasharray="8 8"
            />
          );
        })}
      </svg>

      {locations.map((l) => (
        <LocationPin key={l.id} loc={l} visibility={visibilityFor(l)} />
      ))}

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
