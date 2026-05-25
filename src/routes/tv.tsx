import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/state/gameStore";
import { MapView } from "@/components/MapView";
import { ScoreBoard } from "@/components/ScoreBoard";
import { QuestModal } from "@/components/QuestModal";
import { StatusBurst } from "@/components/StatusBurst";
import { FinalVerdict } from "@/components/FinalVerdict";
import { SecretUnderBarTv } from "@/components/SecretUnderBar";
import { RealtimeIndicator } from "@/components/RealtimeIndicator";

export const Route = createFileRoute("/tv")({
  head: () => ({
    meta: [
      { title: "TV Mode — Bachelor Quest" },
      { name: "description", content: "Główny ekran gry imprezowej." },
    ],
  }),
  component: TvInner,
});

function PostBarOverlay() {
  const { state } = useGame();
  if (state.earlyGamePhase !== "post-bar-choice") return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-5xl rounded-3xl border-2 border-fuchsia-400 bg-gradient-to-br from-purple-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(217,70,239,0.5)]"
        >
          <div className="text-sm uppercase tracking-[0.35em] text-fuchsia-300">
            Co dalej?
          </div>
          <p className="mt-4 mx-auto max-w-3xl text-2xl leading-relaxed text-white/90">
            {state.status.message}
          </p>
          <p className="mt-8 text-lg text-white/50">
            Wybierz na kontrolerze 📱
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TvInner() {
  const { state, realtimeStatus, roomCode } = useGame();
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-6 text-white">
      <RealtimeIndicator status={realtimeStatus} roomCode={roomCode} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,70,239,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(34,211,238,0.2),_transparent_60%)]" />
      <header className="relative z-10 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.4em] text-fuchsia-300">
            Bachelor Quest
          </div>
          <h1 className="text-5xl font-black drop-shadow-[0_2px_20px_rgba(217,70,239,0.5)]">
            Droga Lamy do Małżeństwa
          </h1>
        </div>
        <ScoreBoard />
      </header>

      <div className="relative z-10 mt-6 flex h-[calc(100vh-220px)] gap-6">
        <div className="flex-1">
          <MapView />
        </div>
      </div>

      <footer className="relative z-10 mt-4 rounded-2xl border border-fuchsia-500/40 bg-black/50 px-6 py-4 text-center text-2xl font-bold">
        {state.status.message}
      </footer>

      <QuestModal />
      <StatusBurst />
      <SecretUnderBarTv />
      <PostBarOverlay />
      {state.finalShown && <FinalVerdict />}
    </div>
  );
}
