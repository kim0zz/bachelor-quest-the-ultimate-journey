import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useGame } from "@/state/gameStore";

function TrapImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  const [canLoad, setCanLoad] = useState(false);
  const isDev = import.meta.env.DEV;

  useEffect(() => {
    setFailed(false);
    setCanLoad(true);
  }, [src]);

  const debugUrl = (
    <p
      className={
        isDev
          ? "mb-2 text-sm text-amber-200/90"
          : "mb-2 text-xs text-white/40"
      }
    >
      Image URL: {src}
    </p>
  );

  return (
    <div className="flex w-full max-w-3xl flex-col items-center">
      {debugUrl}
      {failed ? (
        <div className="flex aspect-video w-full flex-col items-center justify-center rounded-2xl border-4 border-dashed border-amber-400/60 bg-black/60 p-8 text-center">
          <div className="text-6xl">🥃</div>
          <p className="mt-4 text-lg text-white/70">
            Nie udało się załadować: {src}
          </p>
        </div>
      ) : canLoad ? (
        <img
          key={src}
          src={src}
          alt={alt}
          className="max-h-[50vh] w-full rounded-2xl border-4 border-rose-500 object-cover shadow-[0_0_60px_rgba(244,63,94,0.6)]"
          loading="eager"
          decoding="async"
          onError={() => {
            console.warn("Trap image failed to load:", src);
            setFailed(true);
          }}
          onLoad={() => console.log("Trap image loaded:", src)}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-2xl border-4 border-rose-500/40 bg-black/40 text-white/50">
          Ładowanie obrazu…
        </div>
      )}
    </div>
  );
}

function ShotBurstTv({
  pulse,
  required,
}: {
  pulse: number;
  required: number;
}) {
  const [show, setShow] = useState(false);
  const [label, setLabel] = useState("");

  useEffect(() => {
    if (pulse <= 0) return;
    setLabel(`SHOT ${pulse}/${required} POTWIERDZONY`);
    setShow(true);
    const t = setTimeout(() => setShow(false), 2200);
    return () => clearTimeout(t);
  }, [pulse, required]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={pulse}
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            x: [0, -24, 24, -18, 18, -10, 10, 0],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.55 }}
          className="pointer-events-none fixed inset-0 z-[55] flex items-center justify-center bg-black/50 p-6 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.4, rotate: -8 }}
            animate={{ scale: 1, rotate: 0 }}
            className="rounded-3xl border-4 border-amber-300 bg-gradient-to-br from-rose-600 to-amber-500 px-12 py-10 text-center shadow-[0_0_100px_rgba(251,191,36,0.8)]"
          >
            <div className="text-8xl">🥃🍻</div>
            <div className="mt-4 text-5xl font-black uppercase tracking-tight text-white">
              {label}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function ShotBurstController({
  pulse,
  required,
}: {
  pulse: number;
  required: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (pulse <= 0) return;
    setShow(true);
    const t = setTimeout(() => setShow(false), 1800);
    return () => clearTimeout(t);
  }, [pulse]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key={pulse}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{
            scale: 1,
            opacity: 1,
            x: [0, -12, 12, -8, 8, 0],
          }}
          exit={{ opacity: 0 }}
          className="rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-rose-600 to-amber-500 p-6 text-center shadow-lg"
        >
          <div className="text-4xl">🥃</div>
          <div className="mt-2 text-2xl font-black uppercase">
            SHOT {pulse}/{required} POTWIERDZONY
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function SecretUnderBarTv() {
  const { state, secretUnderBarConfig } = useGame();
  const phase = state.secretUnderBarPhase;
  if (!phase || !secretUnderBarConfig) return null;

  const required = secretUnderBarConfig.requiredShots;
  const progress =
    required > 0
      ? Math.min(100, (state.secretUnderBarShotsConfirmed / required) * 100)
      : 0;

  return (
    <>
      <ShotBurstTv pulse={state.secretShotPulse} required={required} />
      <AnimatePresence>
        {phase === "offer" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] flex items-center justify-center bg-black/85 p-6 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-5xl rounded-3xl border-2 border-fuchsia-400 bg-gradient-to-br from-purple-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(217,70,239,0.5)]"
            >
              <div className="text-sm uppercase tracking-[0.35em] text-fuchsia-300">
                Po MAŁYM PIWIE
              </div>
              <h2 className="mt-4 text-4xl font-black leading-tight text-white md:text-5xl">
                {secretUnderBarConfig.offerTitle}
              </h2>
              <p className="mt-6 text-xl text-white/60">
                Wybierz na kontrolerze 📱
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === "entry" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[50] flex items-center justify-center bg-black/85 p-6 backdrop-blur-md"
          >
            <motion.div
              animate={{ x: [0, -6, 6, -4, 4, 0] }}
              transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 2 }}
              className="w-full max-w-5xl rounded-3xl border-2 border-amber-400 bg-gradient-to-br from-rose-950 via-amber-950 to-slate-950 p-10 text-center shadow-[0_0_80px_rgba(251,191,36,0.4)]"
            >
              <div className="text-6xl">🍺👀</div>
              <h2 className="mt-4 text-6xl font-black text-amber-200">
                {secretUnderBarConfig.title}
              </h2>
              <p className="mt-6 text-3xl text-white/90">
                {secretUnderBarConfig.enterText}
              </p>
              <div className="mx-auto mt-8 max-w-md">
                <div className="mb-2 flex justify-between text-sm uppercase text-amber-200">
                  <span>Shoty pod barem</span>
                  <span>
                    {state.secretUnderBarShotsConfirmed}/{required}
                  </span>
                </div>
                <div className="h-6 overflow-hidden rounded-full border-2 border-amber-300 bg-black/50">
                  <motion.div
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-400"
                    animate={{ width: `${progress}%` }}
                    transition={{ type: "spring", stiffness: 120 }}
                  />
                </div>
              </div>
              <p className="mt-8 text-lg text-white/50">
                Potwierdź shoty na kontrolerze 📱
              </p>
            </motion.div>
          </motion.div>
        )}

        {phase === "reveal" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[50] flex items-center justify-center overflow-y-auto bg-black/95 p-6"
          >
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              className="flex w-full max-w-5xl flex-col items-center text-center"
            >
              <TrapImage
                src={secretUnderBarConfig.imageUrl}
                alt={secretUnderBarConfig.revealTitle}
              />
              <h2 className="mt-8 text-8xl font-black text-rose-400 drop-shadow-[0_0_40px_rgba(244,63,94,0.8)]">
                {secretUnderBarConfig.revealTitle}
              </h2>
              <p className="mt-4 text-5xl font-black uppercase text-white">
                {secretUnderBarConfig.revealText}
              </p>
              {secretUnderBarConfig.revealSubtext && (
                <p className="mt-6 text-2xl text-white/70">
                  {secretUnderBarConfig.revealSubtext}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export function SecretUnderBarController() {
  const {
    state,
    secretUnderBarConfig,
    secretContinueJourney,
    secretChooseUnderBar,
    secretConfirmShot,
    secretEnterUnderBar,
    secretFinishReveal,
  } = useGame();

  const phase = state.secretUnderBarPhase;
  if (!phase || !secretUnderBarConfig) return null;

  const required = secretUnderBarConfig.requiredShots;
  const shotsDone = state.secretUnderBarShotsConfirmed;
  const canEnter = shotsDone >= required;

  return (
    <div className="space-y-3">
      <ShotBurstController pulse={state.secretShotPulse} required={required} />

      {phase === "offer" && (
        <>
          <div className="rounded-2xl border-2 border-fuchsia-400 bg-black/50 p-4 text-center">
            <p className="text-lg font-bold leading-snug">
              {secretUnderBarConfig.offerTitle}
            </p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={secretContinueJourney}
            className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
          >
            Idę dalej
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={secretChooseUnderBar}
            className="w-full rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-rose-600/80 to-amber-500/80 p-6 text-xl font-black uppercase"
          >
            Sprawdź sekret pod barem
          </motion.button>
        </>
      )}

      {phase === "entry" && (
        <>
          <div className="rounded-2xl border-2 border-amber-300 bg-gradient-to-br from-rose-950/80 to-amber-950/50 p-5 text-center">
            <div className="text-xs uppercase tracking-widest text-amber-200">
              {secretUnderBarConfig.title}
            </div>
            <p className="mt-3 text-lg font-bold">{secretUnderBarConfig.enterText}</p>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-black/50">
              <div
                className="h-full bg-amber-400 transition-all duration-300"
                style={{
                  width: `${(shotsDone / required) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-sm text-white/60">
              {shotsDone}/{required} shotów
            </p>
          </div>

          {shotsDone < 1 && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={secretConfirmShot}
              className="w-full rounded-2xl bg-amber-500 p-6 text-2xl font-black uppercase text-black shadow-lg"
            >
              🥃 Shot 1 wypity
            </motion.button>
          )}
          {shotsDone >= 1 && shotsDone < required && (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={secretConfirmShot}
              className="w-full rounded-2xl bg-amber-500 p-6 text-2xl font-black uppercase text-black shadow-lg"
            >
              🥃 Shot 2 wypity
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={secretEnterUnderBar}
            disabled={!canEnter}
            className={`w-full rounded-2xl p-6 text-2xl font-black uppercase shadow-lg ${
              canEnter
                ? "bg-gradient-to-r from-rose-500 to-fuchsia-600 text-white"
                : "cursor-not-allowed bg-white/10 text-white/30"
            }`}
          >
            WEJDŹ POD BAR
          </motion.button>
        </>
      )}

      {phase === "reveal" && (
        <>
          <div className="rounded-2xl border-2 border-rose-400 bg-rose-950/50 p-5 text-center">
            <p className="text-xl font-bold">Pułapka aktywowana. Wracamy do gry.</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={secretFinishReveal}
            className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
          >
            Wracamy do gry
          </motion.button>
        </>
      )}
    </div>
  );
}
