import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapView } from "@/components/MapView";

type Props = {
  /** fixed corner placement */
  className?: string;
};

export function MapPreviewToggle({ className = "" }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`pointer-events-auto rounded-xl border border-fuchsia-400/50 bg-black/70 px-3 py-2 text-xs font-black uppercase tracking-wide text-fuchsia-200 shadow-lg backdrop-blur-sm hover:bg-fuchsia-950/80 ${className}`}
        style={{ touchAction: "manipulation" }}
      >
        POKAŻ MAPĘ
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[220] flex flex-col bg-black/90 p-4 backdrop-blur-md md:p-6"
            role="dialog"
            aria-modal="true"
            aria-label="Podgląd mapy"
          >
            <div className="flex shrink-0 items-center justify-between gap-4 pb-3">
              <h2 className="text-lg font-black uppercase tracking-wide text-fuchsia-300 md:text-xl">
                Mapa — podgląd
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-fuchsia-600 px-4 py-3 text-sm font-black uppercase text-white md:text-base"
                style={{ touchAction: "manipulation" }}
              >
                WRÓĆ DO GRY
              </button>
            </div>
            <div className="pointer-events-none min-h-0 flex-1">
              <MapView />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
