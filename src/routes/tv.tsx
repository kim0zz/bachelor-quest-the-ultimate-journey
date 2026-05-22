import { createFileRoute } from "@tanstack/react-router";
import { useGame } from "@/state/gameStore";
import { MapView } from "@/components/MapView";
import { ScoreBoard } from "@/components/ScoreBoard";
import { QuestModal } from "@/components/QuestModal";
import { StatusBurst } from "@/components/StatusBurst";
import { FinalVerdict } from "@/components/FinalVerdict";
import { SecretUnderBarTv } from "@/components/SecretUnderBar";

export const Route = createFileRoute("/tv")({
  head: () => ({
    meta: [
      { title: "TV Mode — Bachelor Quest" },
      { name: "description", content: "Główny ekran gry imprezowej." },
    ],
  }),
  component: TvInner,
});

function TvInner() {
  const { state } = useGame();
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(217,70,239,0.25),_transparent_60%),radial-gradient(ellipse_at_bottom_right,_rgba(34,211,238,0.2),_transparent_60%)]" />
      <header className="relative z-10 flex items-center justify-between">
        <div>
          <div className="text-sm uppercase tracking-[0.4em] text-fuchsia-300">
            Bachelor Quest
          </div>
          <h1 className="text-5xl font-black drop-shadow-[0_2px_20px_rgba(217,70,239,0.5)]">
            Droga do Małżeństwa
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
      {state.finalShown && <FinalVerdict />}
    </div>
  );
}
