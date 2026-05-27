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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-6 backdrop-blur-md">
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 120, damping: 14 }}
        className="w-full max-w-5xl rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-purple-950 via-fuchsia-950 to-slate-950 p-12 text-center shadow-[0_0_120px_rgba(251,191,36,0.5)]"
      >
        <div className="text-2xl uppercase tracking-[0.4em] text-amber-300">
          DOM / KONOPA
        </div>
        <div className="my-6 text-8xl">🏠</div>
        <p className="mx-auto max-w-3xl text-xl text-white/75">
          Lama dociera na KONOPA na autopilocie. Szedł zygzakiem, ale dotarł. W jego stanie to już logistyka klasy premium.
        </p>
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

        <div className="mt-8 rounded-2xl border border-white/15 bg-black/40 px-6 py-4 text-left">
          <div className="text-sm uppercase tracking-widest text-white/50">Zaliczone lokacje</div>
          <p className="mt-2 text-lg text-white/85">{keyLocations || "Brak danych"}</p>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 text-left md:grid-cols-2">
          {badges.map((badge) => (
            <div key={badge.title} className="rounded-2xl border border-cyan-400/40 bg-cyan-950/20 p-4">
              <div className="text-lg font-black text-cyan-200">
                {badge.icon} {badge.title}
              </div>
              <div className="mt-1 text-sm text-white/75">{badge.desc}</div>
            </div>
          ))}
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
