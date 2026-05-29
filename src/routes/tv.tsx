import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useGame } from "@/state/gameStore";
import { MapView } from "@/components/MapView";
import { ScoreBoard } from "@/components/ScoreBoard";
import { QuestModal } from "@/components/QuestModal";
import { StatusBurst } from "@/components/StatusBurst";
import { FinalVerdict } from "@/components/FinalVerdict";
import { SecretUnderBarTv } from "@/components/SecretUnderBar";
import { BitwyTv } from "@/components/Bitwy";
import { PreBitwyTransitionTv, PostBitwyTransitionTv, HulajnogaTv } from "@/components/Hulajnoga";
import { DzialkaTv } from "@/components/Dzialka";
import { ParyzTv } from "@/components/Paryz";
import { RealtimeIndicator } from "@/components/RealtimeIndicator";
import { MapPreviewToggle } from "@/components/MapPreviewToggle";
import { TvChoiceMirroring } from "@/components/TvChoiceMirroring";
import { ReadOnlyChoiceCards } from "@/components/ReadOnlyChoiceCards";
import { getPostBarChoices } from "@/lib/tvChoiceMirror";

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
          <div className="mx-auto mt-8 max-w-4xl">
            <ReadOnlyChoiceCards title="CO DALEJ?" choices={getPostBarChoices(state)} />
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PekinTransitionOverlay() {
  const { state } = useGame();
  if (state.foodPhase !== "pekin-transition") return null;
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
          className="w-full max-w-5xl rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-amber-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(251,191,36,0.4)]"
        >
          <div className="text-6xl mb-4">🧇</div>
          <p className="mx-auto max-w-3xl text-3xl font-bold leading-relaxed text-white/90">
            {state.status.message}
          </p>
          <p className="mt-8 text-lg text-white/50">
            Kontynuuj na kontrolerze 📱
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function PekinBarOverlay() {
  const { state } = useGame();
  if (state.foodPhase !== "pekin-event") return null;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/90 backdrop-blur-md p-6"
      >
        <motion.div
          initial={{ scale: 0.85, y: 30 }}
          animate={{ scale: 1, y: 0 }}
          className="w-full max-w-5xl rounded-3xl border-2 border-rose-400 bg-gradient-to-br from-rose-950 to-slate-950 p-10 text-center shadow-[0_0_100px_rgba(244,63,94,0.6)]"
        >
          <p className="text-xl italic text-white/60 mb-6">
            Lama rusza do Pekin Baru. Przez chwilę czuć wspomnienia, sos i czasy, których już nie da się odzyskać.
          </p>
          <motion.h2
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 120 }}
            className="text-5xl font-black text-rose-300 drop-shadow-[0_0_40px_rgba(244,63,94,0.7)]"
          >
            PEKIN BAR ZOSTAŁ SPRZEDANY PRZEZ CHIŃCZYKÓW
          </motion.h2>
          <p className="mt-6 text-2xl text-white/80">
            Niech mu ziemia lekką będzie. Wszyscy walą shota za pamięć Pekin Baru. 🍺
          </p>
          <p className="mt-8 text-lg text-white/50">
            Kontynuuj na kontrolerze 📱
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
      <MapPreviewToggle className="fixed bottom-6 right-6 z-50" />
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
      <BitwyTv />
      <PreBitwyTransitionTv />
      <PostBitwyTransitionTv />
      <HulajnogaTv />
      <DzialkaTv />
      <ParyzTv />
      <PostBarOverlay />
      <PekinBarOverlay />
      <PekinTransitionOverlay />
      <TvChoiceMirroring />
      {state.finalShown && <FinalVerdict />}
    </div>
  );
}
