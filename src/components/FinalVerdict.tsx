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

  const keyLocations = [
    "hans",
    "male-piwko",
    "pekin-bar",
    "gofer-przy-latarni",
    "bitwy",
    "drewniak",
    "dzialka",
    "paryz",
    "dom-zgon",
  ]
    .filter((id) => state.completedIds.includes(id))
    .join(" • ");

  const badges = [
    state.sawPekinEvent && {
      icon: "🥡",
      title: "Był w Pekinie, którego nie ma",
      desc: "Oddał szacunek legendzie gastronomii.",
    },
    state.completedIds.includes("bitwy") && {
      icon: "🏚️",
      title: "Przeżył BITWY",
      desc: "Wyszedł z meliny o własnych nogach. Mniej więcej.",
    },
    state.bitwyBalanceSuccess && {
      icon: "🧍",
      title: "Złapał pion",
      desc: "Fizyka została chwilowo oszukana.",
    },
    state.bitwyChoseKitchen && state.bitwyHeardSkibaConfession && {
      icon: "🍽️",
      title: "Kuchnia Skiby",
      desc: "Poznał życiówkę, której nie da się odzobaczyć.",
    },
    state.hulajnogaSucceeded && {
      icon: "🛴",
      title: "Dojechał hulajnogą",
      desc: "Transport i godność w stanie akceptowalnym.",
    },
    state.hulajnogaFailed && {
      icon: "💥",
      title: "Wyjebka na hulajnodze",
      desc: "Chodnik wygrał pojedynek.",
    },
    state.paryzCalledMarta && {
      icon: "📞",
      title: "Zadzwonił do Marty",
      desc: "Aktywował głos rozsądku.",
    },
    {
      icon: "🏠",
      title: "Wrócił bez nocowania w lesie",
      desc: "KONOPA osiągnięta. Autopilot działa.",
    },
    state.dzialkaRapOutcome === "success" && {
      icon: "🎤",
      title: "Rap na działce zaliczony",
      desc: "Paktofonika przetrwała interpretację.",
    },
    state.dzialkaRapOutcome === "fail" && {
      icon: "🫠",
      title: "Profanacja klasyka",
      desc: "Pewność siebie nie wystarczyła.",
    },
  ].filter(Boolean) as { icon: string; title: string; desc: string }[];

  const visitedCount = keyLocations ? keyLocations.split(" • ").length : 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 p-4 backdrop-blur-md md:p-6">
      <div className="mx-auto flex min-h-full max-w-7xl items-center justify-center py-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 120, damping: 14 }}
          className="w-full rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-purple-950 via-fuchsia-950 to-slate-950 p-6 text-center shadow-[0_0_120px_rgba(251,191,36,0.5)] md:p-10"
        >
          <div className="text-sm uppercase tracking-[0.35em] text-amber-300">
            DOM / KONOPA
          </div>
          <div className="my-4 text-6xl md:text-7xl">🏠</div>
          <p className="mx-auto max-w-4xl text-lg text-white/75 md:text-xl">
            Lama dociera na KONOPA na autopilocie. Szedł zygzakiem, ale dotarł. W jego stanie to już
            logistyka klasy premium.
          </p>
          <h1 className="mt-4 text-5xl font-black text-white drop-shadow-[0_4px_30px_rgba(217,70,239,0.5)] md:text-7xl">
            {verdict.title}
          </h1>
          <p className="mt-3 text-xl text-white/80 md:text-2xl">{verdict.subtitle}</p>

          <div className="mt-6 grid grid-cols-2 gap-3 text-white md:grid-cols-4 md:gap-4">
            <div className="rounded-2xl border border-fuchsia-400 bg-black/40 px-4 py-3 md:py-4">
              <div className="text-xs uppercase text-white/50 md:text-sm">Mąż Points</div>
              <div className="text-2xl font-black md:text-3xl">💍 {state.manPoints}</div>
            </div>
            <div className="rounded-2xl border border-amber-400 bg-black/40 px-4 py-3 md:py-4">
              <div className="text-xs uppercase text-white/50 md:text-sm">Lama Shots</div>
              <div className="text-2xl font-black md:text-3xl">🥃 {state.shotCount}</div>
            </div>
            <div className="rounded-2xl border border-cyan-400 bg-black/40 px-4 py-3 md:py-4">
              <div className="text-xs uppercase text-white/50 md:text-sm">Team Shots</div>
              <div className="text-2xl font-black md:text-3xl">🍻 {state.teamShots}</div>
            </div>
            <div className="rounded-2xl border border-emerald-400 bg-black/40 px-4 py-3 md:py-4">
              <div className="text-xs uppercase text-white/50 md:text-sm">Lokacje</div>
              <div className="text-2xl font-black md:text-3xl">📍 {visitedCount}</div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-left md:px-6">
            <div className="text-xs uppercase tracking-widest text-white/50">
              Zaliczone lokacje
            </div>
            <p className="mt-1 text-sm text-white/85 md:text-base">
              {keyLocations || "Brak danych"}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-2 text-left sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {badges.map((badge) => (
              <div
                key={badge.title}
                className="rounded-xl border border-cyan-400/40 bg-cyan-950/20 p-3 md:p-4"
              >
                <div className="text-base font-black text-cyan-200 md:text-lg">
                  {badge.icon} {badge.title}
                </div>
                <div className="mt-1 text-xs text-white/75 md:text-sm">{badge.desc}</div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={reset}
            className="mt-6 rounded-2xl bg-fuchsia-500 px-8 py-4 text-xl font-black uppercase text-white shadow-[0_0_40px_rgba(217,70,239,0.7)] hover:bg-fuchsia-400 md:mt-8 md:px-10 md:py-5 md:text-2xl"
          >
            Nowa Gra
          </button>
        </motion.div>
      </div>
    </div>
  );
}
