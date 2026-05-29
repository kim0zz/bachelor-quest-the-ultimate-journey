import { AnimatePresence, motion } from "framer-motion";
import { ReadOnlyChoiceCards } from "@/components/ReadOnlyChoiceCards";
import { getStandaloneTvChoiceMirror } from "@/lib/tvChoiceMirror";
import { useGame } from "@/state/gameStore";

/** Full-screen read-only choice mirror when TV has no dedicated overlay. */
export function TvChoiceMirroring() {
  const { state, availableLocations } = useGame();
  const config = getStandaloneTvChoiceMirror(state, availableLocations);

  if (!config) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="pointer-events-none fixed inset-0 z-[25] flex items-end justify-center bg-gradient-to-t from-black/85 via-black/50 to-transparent p-6 pb-28"
      >
        <div className="w-full max-w-5xl rounded-3xl border-2 border-fuchsia-400/40 bg-slate-950/90 p-6 shadow-[0_0_60px_rgba(217,70,239,0.25)]">
          <ReadOnlyChoiceCards
            title={config.title}
            subtitle={config.subtitle}
            choices={config.choices}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
