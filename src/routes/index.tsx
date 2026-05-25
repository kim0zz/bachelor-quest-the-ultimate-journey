import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bachelor Quest: Droga Lamy do Małżeństwa" },
      {
        name: "description",
        content:
          "Imprezowa gra na kawalerski. Wybierz tryb i zaczynaj zabawę.",
      },
    ],
  }),
  component: Home,
});

const modes = [
  {
    to: "/tv",
    title: "TV Mode",
    icon: "📺",
    desc: "Główny ekran do telewizora.",
    cls: "from-fuchsia-600 to-purple-700 border-fuchsia-400",
  },
  {
    to: "/controller",
    title: "Controller",
    icon: "📱",
    desc: "Telefon Lamy.",
    cls: "from-cyan-500 to-blue-700 border-cyan-400",
  },
  {
    to: "/admin",
    title: "Admin / Operator",
    icon: "🛠",
    desc: "Panel awaryjny.",
    cls: "from-amber-500 to-rose-600 border-amber-400",
  },
] as const;

function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,70,239,0.3),_transparent_60%),radial-gradient(ellipse_at_bottom,_rgba(34,211,238,0.25),_transparent_60%)]" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm uppercase tracking-[0.5em] text-fuchsia-300"
        >
          Kawalerski 2026
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1, type: "spring" }}
          className="mt-4 text-6xl md:text-8xl font-black leading-none drop-shadow-[0_4px_30px_rgba(217,70,239,0.6)]"
        >
          Bachelor <span className="text-fuchsia-400">Quest</span>
        </motion.h1>
        <p className="mt-4 text-xl text-white/70">
          Droga Lamy do Małżeństwa — wybierz swój tryb gry.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {modes.map((m, i) => (
            <motion.div
              key={m.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Link
                to={m.to}
                className={`block rounded-3xl border-2 bg-gradient-to-br ${m.cls} p-8 text-left shadow-[0_0_40px_rgba(217,70,239,0.3)] transition hover:scale-[1.02]`}
              >
                <div className="text-6xl">{m.icon}</div>
                <div className="mt-4 text-3xl font-black">{m.title}</div>
                <div className="mt-1 text-white/80">{m.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="mt-12 text-xs uppercase tracking-widest text-white/40">
          Tip: otwórz /tv na laptopie, /controller na telefonie Lamy.
        </div>
      </div>
    </div>
  );
}
