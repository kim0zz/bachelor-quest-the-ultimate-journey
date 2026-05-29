import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { GROOM } from "@/data/gameData";
import { shouldShowPourUi } from "@/lib/pourGuard";
import { isHulajnogaLocked } from "@/lib/hulajnogaDisplay";
import {
  BALANCE_PERIOD_MS,
  BALANCE_TARGET_MIN,
  BALANCE_TARGET_MAX,
  LOCATIONS,
} from "@/data/gameData";
import { ShotPourMinigameTv, ShotPourMinigameController } from "@/components/ShotPourMinigame";
import { useGame, useTick } from "@/state/gameStore";
import { ReadOnlyChoiceCards } from "@/components/ReadOnlyChoiceCards";
import { getBitwyIntroChoices } from "@/lib/tvChoiceMirror";
import { ManPointsDeltaLine } from "@/components/ManPointsFeedback";

function getBalancePos(startTime: number): number {
  const elapsed = Date.now() - startTime;
  const t = (elapsed % BALANCE_PERIOD_MS) / BALANCE_PERIOD_MS;
  return t < 0.5 ? t * 200 : 200 - t * 200;
}

// ── TV ──────────────────────────────────────────────────────────

export function BitwyTv() {
  const { state } = useGame();
  const loc = LOCATIONS.find((l) => l.id === "bitwy")!;
  if (state.activeQuestId !== "bitwy" || !state.bitwyPhase) return null;
  if (isHulajnogaLocked(state.postDrewniakPhase)) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="bitwy-tv"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-30 flex items-center justify-center bg-black/80 backdrop-blur-md p-6"
      >
        {state.bitwyPhase === "intro" && <BitwyIntroTv />}
        {state.bitwyPhase === "kitchen-shots" && <BitwyKitchenTv />}
        {state.bitwyPhase === "kitchen-confession" && <BitwyConfessionTv />}
        {state.bitwyPhase === "salon-narrator" && <BitwySalonNarratorTv />}
        {state.bitwyPhase === "salon-shot-pour" && <BitwyShotPourTv loc={loc} />}
        {state.bitwyPhase === "balance-intro" && <BitwyBalanceIntroTv />}
        {state.bitwyPhase === "balance" && <BitwyBalanceTv />}
        {state.bitwyPhase === "complete" && <BitwyCompleteTv />}
        {![
          "intro", "kitchen-shots", "kitchen-confession", "salon-narrator",
          "salon-shot-pour", "balance-intro", "balance", "complete",
        ].includes(state.bitwyPhase as string) && (
          <TvCard>
            <p className="text-2xl text-white/70">Nieznana faza BITWY: {state.bitwyPhase}</p>
            <p className="mt-4 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
          </TvCard>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function TvCard({ children, border = "border-fuchsia-400" }: { children: React.ReactNode; border?: string }) {
  return (
    <motion.div
      initial={{ scale: 0.85, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      className={`w-full max-w-5xl rounded-3xl border-2 ${border} bg-gradient-to-br from-slate-950 to-slate-900 p-10 text-center shadow-[0_0_80px_rgba(217,70,239,0.3)]`}
    >
      {children}
    </motion.div>
  );
}

function BitwyIntroTv() {
  return (
    <TvCard>
      <div className="text-6xl mb-4">🏚️</div>
      <h2 className="text-5xl font-black uppercase tracking-wide text-fuchsia-300">BITWY</h2>
      <p className="mx-auto mt-6 max-w-3xl text-2xl leading-relaxed text-white/80">
        Bitwy. Miejsce, gdzie kiedyś mieszkał Żuker i jakaś random typiara, ale tak naprawdę mieszkał tam alkohol, chaos i decyzje bez właściciela.
      </p>
      <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-amber-400/40 bg-amber-950/30 p-6">
        <p className="text-xl font-bold text-amber-200">
          Skiba łapie Lamę w korytarzu.
        </p>
        <p className="mt-2 text-sm uppercase tracking-widest text-amber-300/80">Skiba:</p>
        <p className="mt-2 text-2xl font-bold text-white/90">
          &quot;Lama, kurwa, chodź do kuchni na chwilę. Pokój Żuka nie ucieknie.&quot;
        </p>
      </div>
      <div className="mx-auto mt-8 max-w-4xl">
        <ReadOnlyChoiceCards title="BITWY — wybór" choices={getBitwyIntroChoices()} />
      </div>
    </TvCard>
  );
}

function BitwyKitchenTv() {
  const { state } = useGame();
  return (
    <TvCard border="border-amber-400">
      <div className="text-6xl mb-4">🍳</div>
      <h2 className="text-4xl font-black uppercase tracking-wide text-amber-300">KUCHNIA NA BITWY</h2>
      <p className="mx-auto mt-4 max-w-2xl text-xl text-white/70">
        Skiba łapie {GROOM.accusative} w korytarzu na dwa szybkie. Żeby usłyszeć życiówkę, trzeba najpierw potwierdzić dwa shoty.
      </p>
      <div className="mt-8 flex justify-center gap-8">
        {[1, 2].map((n) => (
          <div
            key={n}
            className={`flex h-28 w-28 items-center justify-center rounded-2xl border-4 text-5xl transition-all ${
              state.bitwyKitchenShots >= n
                ? "border-emerald-400 bg-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.4)]"
                : "border-white/20 bg-white/5"
            }`}
          >
            {state.bitwyKitchenShots >= n ? "✅" : "🥃"}
          </div>
        ))}
      </div>
      <p className="mt-6 text-2xl font-bold text-white/90">
        {state.bitwyKitchenShots < 2
          ? `Shot ${state.bitwyKitchenShots}/2`
          : "Shoty wypite! Słuchaj Skiby."}
      </p>
      <p className="mt-4 text-lg text-white/50">
        Potwierdź na kontrolerze 📱 — albo wybierz „NIE DAŁEM RADY”
      </p>
    </TvCard>
  );
}

function BitwyConfessionTv() {
  return (
    <TvCard border="border-amber-400">
      <div className="text-6xl mb-4">🤫</div>
      <h2 className="text-3xl font-black uppercase text-amber-300">ŻYCIÓWKA SKIBY</h2>
      <div className="mx-auto mt-6 max-w-3xl space-y-6 text-left">
        <div className="rounded-2xl border border-amber-400/30 bg-amber-950/20 p-6">
          <p className="text-sm text-amber-300 font-bold">SKIBA:</p>
          <p className="mt-1 text-2xl text-white/90">
            &quot;Stary… ja ci powiem coś, ale ty nie mów nikomu, dobra? Bo ja chyba wysłałem zdjęcie chuja do złej osoby.&quot;
          </p>
        </div>
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-950/20 p-6">
          <p className="text-sm text-cyan-300 font-bold">{GROOM.nickname.toUpperCase()}:</p>
          <p className="mt-1 text-2xl text-white/90">
            &quot;Skiba, wiem. Już mi to ktoś podesłał.&quot;
          </p>
        </div>
        <div className="rounded-2xl border border-amber-400/30 bg-amber-950/20 p-6">
          <p className="text-sm text-amber-300 font-bold">SKIBA:</p>
          <p className="mt-1 text-2xl text-white/90">
            &quot;Aha. Czyli temat jest już w obiegu. Dobra, to po shocie i nie było rozmowy.&quot;
          </p>
        </div>
      </div>
      <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
    </TvCard>
  );
}

function BitwySalonNarratorTv() {
  const { state } = useGame();
  return (
    <TvCard>
      <div className="text-6xl mb-4">🛋️</div>
      <p className="mx-auto max-w-3xl text-3xl font-bold leading-relaxed text-white/90">
        {state.bitwyKitchenBailed
          ? "Lama nie dał rady. Skiba kiwa głową z rozczarowaniem, jakby widział to już wcześniej."
          : state.bitwyChoseKitchen
            ? `${GROOM.nickname} poznał życiówkę Skiby. Niestety za cenę dwóch shotów i części szacunku do świata.`
            : `${GROOM.nickname} próbuje zachować klasę i ominąć kuchnię. Skiba zapamięta ten brak lojalności.`}
      </p>
      <p className="mx-auto mt-6 max-w-3xl text-2xl text-white/70">
        W Pokoju Żuka {GROOM.nickname} siada i nalewa sobie shota. Na BITWY nie pytają, czy pijesz. Pytają, czy potrafisz nalać.
      </p>
      <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
    </TvCard>
  );
}

function BitwyShotPourTv({ loc }: { loc: typeof LOCATIONS[number] }) {
  const { state } = useGame();
  if (!shouldShowPourUi(state)) return null;
  const isFeedback = state.status.kind === "correct" || state.status.kind === "groomDrinks";
  if (isFeedback) return null;
  return (
    <TvCard>
      <h2 className="text-4xl font-black uppercase text-cyan-300 mb-6">BITWY — NALEJ SZOTA</h2>
      <ShotPourMinigameTv loc={loc} />
    </TvCard>
  );
}

function BitwyBalanceIntroTv() {
  const { state } = useGame();
  return (
    <TvCard border="border-emerald-400">
      <div className="text-6xl mb-4">⚖️</div>
      <h2 className="text-4xl font-black uppercase text-emerald-300">ZŁAP PION</h2>
      <p className="mx-auto mt-4 max-w-3xl text-2xl text-white/80">
        {state.status.message}
      </p>
      <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
    </TvCard>
  );
}

function BitwyBalanceTv() {
  const { state } = useGame();
  useTick(30);
  const pos =
    state.balanceStopPosition != null
      ? state.balanceStopPosition
      : state.balanceStartTime
        ? getBalancePos(state.balanceStartTime)
        : 50;
  const isStopped = state.balanceStopPosition != null;
  const success = isStopped && pos >= BALANCE_TARGET_MIN && pos <= BALANCE_TARGET_MAX;

  if (isStopped && (state.status.kind === "correct" || state.status.kind === "groomDrinks")) {
    return null;
  }

  return (
    <TvCard border="border-emerald-400">
      <h2 className="text-5xl font-black uppercase text-emerald-300 mb-8">ZŁAP PION</h2>
      <BalanceBar pos={pos} stopped={isStopped} success={success} variant="tv" />
      <div className="mt-8 flex justify-center gap-12 text-2xl font-black uppercase tracking-widest">
        <span className="text-rose-400">GLEBA</span>
        <span className="text-emerald-400">PION</span>
        <span className="text-rose-400">LECI</span>
      </div>
      {!isStopped && (
        <p className="mt-6 text-xl text-fuchsia-200 animate-pulse">
          Czekam na STOP na kontrolerze 📱
        </p>
      )}
    </TvCard>
  );
}

function BitwyCompleteTv() {
  const { state } = useGame();
  return (
    <TvCard>
      <div className="text-6xl mb-4">🚶</div>
      <p className="mx-auto max-w-3xl text-3xl font-bold leading-relaxed text-white/90">
        {state.status.message}
      </p>
      <p className="mt-8 text-lg text-white/50">Kontynuuj na kontrolerze 📱</p>
    </TvCard>
  );
}

// ── Balance Bar visual ──────────────────────────────────────────

function BalanceBar({
  pos,
  stopped,
  success,
  variant,
}: {
  pos: number;
  stopped: boolean;
  success: boolean;
  variant: "tv" | "controller";
}) {
  const h = variant === "tv" ? "h-20" : "h-14";
  const markerH = variant === "tv" ? "h-16 w-4" : "h-10 w-3";
  return (
    <div className={`relative ${h} w-full rounded-full bg-black/50 border-2 border-white/20 overflow-hidden`}>
      <div
        className="absolute top-0 h-full bg-emerald-500/30 border-x-2 border-emerald-400"
        style={{ left: `${BALANCE_TARGET_MIN}%`, width: `${BALANCE_TARGET_MAX - BALANCE_TARGET_MIN}%` }}
      />
      <div
        className={`absolute top-1/2 rounded-full shadow-lg transition-colors ${markerH} ${
          stopped
            ? success
              ? "bg-emerald-400 shadow-emerald-400/50"
              : "bg-rose-400 shadow-rose-400/50"
            : "bg-white shadow-white/50"
        }`}
        style={{ left: `${pos}%`, transform: "translateX(-50%) translateY(-50%)" }}
      />
    </div>
  );
}

// ── Controller ──────────────────────────────────────────────────

export function BitwyController() {
  const {
    state,
    chooseBitwyPath,
    confirmBitwyKitchenShot,
    bailBitwyKitchen,
    listenToSkiba,
    advanceBitwy,
    stopBalance,
    closeStatus,
  } = useGame();
  const loc = LOCATIONS.find((l) => l.id === "bitwy")!;
  const isFeedback = state.status.kind === "correct" || state.status.kind === "groomDrinks";

  if (isFeedback) {
    return <BitwyFeedback />;
  }

  switch (state.bitwyPhase) {
    case "intro":
      return <BitwyIntroCtrl chooseBitwyPath={chooseBitwyPath} />;
    case "kitchen-shots":
      return (
        <BitwyKitchenCtrl
          shots={state.bitwyKitchenShots}
          confirmShot={confirmBitwyKitchenShot}
          bail={bailBitwyKitchen}
          listen={listenToSkiba}
        />
      );
    case "kitchen-confession":
      return <BitwyConfessionCtrl advance={advanceBitwy} />;
    case "salon-narrator":
      return (
        <BitwySalonNarratorCtrl
          choseKitchen={state.bitwyChoseKitchen}
          kitchenBailed={state.bitwyKitchenBailed}
          advance={advanceBitwy}
        />
      );
    case "salon-shot-pour":
      return <ShotPourMinigameController loc={loc} />;
    case "balance-intro":
      return <BitwyBalanceIntroCtrl advance={advanceBitwy} message={state.status.message} />;
    case "balance":
      return <BitwyBalanceCtrl startTime={state.balanceStartTime} stopPos={state.balanceStopPosition} stopBalance={stopBalance} />;
    case "complete":
      return <BitwyCompleteCtrl advance={advanceBitwy} message={state.status.message} />;
    default:
      return (
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-center">
            <p className="text-base text-white/70">Nieznana faza BITWY: {state.bitwyPhase}</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={advanceBitwy}
            className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
          >
            Kontynuuj →
          </motion.button>
        </div>
      );
  }
}

function BitwyFeedback() {
  const { state, closeStatus } = useGame();
  const isCorrect = state.status.kind === "correct";
  return (
    <div className="space-y-4">
      <div
        className={`rounded-2xl border-2 p-5 text-center ${
          isCorrect
            ? "border-emerald-400 bg-emerald-500/20"
            : "border-rose-400 bg-rose-500/20"
        }`}
      >
        <div className="mb-3 text-4xl">{isCorrect ? "✅" : "❌"}</div>
        <p className="text-xl font-black text-white/90">
          {isCorrect ? "DOBRZE!" : "ŹLE!"}
        </p>
        <p className="mt-3 text-base text-white/80">{state.status.message}</p>
        <ManPointsDeltaLine
          delta={state.status.pointsDelta}
          className="mt-3 text-2xl font-black text-cyan-300"
        />
        {state.status.kind === "groomDrinks" && (
          <p className="mt-2 text-lg font-bold text-amber-300">🥃 {GROOM.nickname} pije</p>
        )}
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={closeStatus}
        className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
      >
        Dalej →
      </motion.button>
    </div>
  );
}

function BitwyIntroCtrl({ chooseBitwyPath }: { chooseBitwyPath: (k: boolean) => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-6xl mb-2">🏚️</div>
        <h3 className="text-2xl font-black uppercase">BITWY</h3>
        <p className="mt-2 text-sm text-white/60">Skiba łapie Lamę w korytarzu.</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => chooseBitwyPath(true)}
        className="flex w-full items-center gap-4 rounded-2xl border-2 border-amber-400 bg-amber-500/10 p-5 text-left"
      >
        <span className="text-4xl">🍳</span>
        <div>
          <div className="text-xl font-black">Idę ze Skibą do kuchni</div>
          <div className="text-sm text-white/60">Brzmi jak zły pomysł, czyli standard.</div>
        </div>
      </motion.button>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={() => chooseBitwyPath(false)}
        className="flex w-full items-center gap-4 rounded-2xl border-2 border-cyan-400 bg-cyan-500/10 p-5 text-left"
      >
        <span className="text-4xl">🛋️</span>
        <div>
          <div className="text-xl font-black">Idę do Pokoju Żuka</div>
          <div className="text-sm text-white/60">Przywitać się z ludźmi</div>
        </div>
      </motion.button>
    </div>
  );
}

function BitwyKitchenCtrl({
  shots,
  confirmShot,
  bail,
  listen,
}: {
  shots: number;
  confirmShot: () => void;
  bail: () => void;
  listen: () => void;
}) {
  const prevShots = useRef(shots);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (shots > prevShots.current) {
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 800);
      prevShots.current = shots;
      return () => clearTimeout(t);
    }
  }, [shots]);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-300">🍳 Kuchnia</div>
        <h3 className="text-2xl font-black">SHOTY SKIBY</h3>
      </div>
      <div className="flex justify-center gap-6">
        {[1, 2].map((n) => (
          <div
            key={n}
            className={`flex h-20 w-20 items-center justify-center rounded-2xl border-4 text-4xl transition-all ${
              shots >= n
                ? "border-emerald-400 bg-emerald-500/20"
                : "border-white/20 bg-white/5"
            }`}
          >
            {shots >= n ? "✅" : "🥃"}
          </div>
        ))}
      </div>
      {flash && (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ opacity: 0 }}
          className="rounded-2xl bg-amber-500/20 border border-amber-400 p-4 text-center text-xl font-black text-amber-300"
        >
          🥃 SHOT {shots}/2 POTWIERDZONY!
        </motion.div>
      )}
      {shots < 2 ? (
        <>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={confirmShot}
            className="w-full rounded-2xl border-4 border-amber-300 bg-gradient-to-b from-amber-500 to-amber-700 p-8 text-3xl font-black uppercase text-black shadow-[0_0_40px_rgba(251,191,36,0.5)]"
          >
            🥃 Shot {shots + 1} wypity
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={bail}
            className="w-full rounded-2xl border-2 border-rose-400/60 bg-rose-950/30 p-5 text-xl font-black uppercase text-rose-300"
          >
            ❌ NIE DAŁEM RADY
          </motion.button>
        </>
      ) : (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={listen}
          className="w-full rounded-2xl border-4 border-fuchsia-300 bg-gradient-to-b from-fuchsia-500 to-fuchsia-700 p-8 text-2xl font-black uppercase text-white shadow-[0_0_40px_rgba(217,70,239,0.5)]"
        >
          🤫 Słucham życiówki Skiby
        </motion.button>
      )}
    </div>
  );
}

function BitwyConfessionCtrl({ advance }: { advance: () => void }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-xs uppercase tracking-[0.3em] text-amber-300">🤫 Kuchnia</div>
        <h3 className="text-xl font-black">ŻYCIÓWKA SKIBY</h3>
      </div>
      <div className="rounded-2xl border border-amber-400/40 bg-amber-950/30 p-4">
        <p className="text-xs text-amber-300 font-bold">SKIBA:</p>
        <p className="mt-1 text-base text-white/90">
          &quot;Stary… ja ci powiem coś, ale ty nie mów nikomu, dobra? Bo ja chyba wysłałem zdjęcie chuja do złej osoby.&quot;
        </p>
      </div>
      <div className="rounded-2xl border border-cyan-400/40 bg-cyan-950/30 p-4">
        <p className="text-xs text-cyan-300 font-bold">{GROOM.nickname.toUpperCase()}:</p>
        <p className="mt-1 text-base text-white/90">
          &quot;Skiba, wiem. Już mi to ktoś podesłał.&quot;
        </p>
      </div>
      <div className="rounded-2xl border border-amber-400/40 bg-amber-950/30 p-4">
        <p className="text-xs text-amber-300 font-bold">SKIBA:</p>
        <p className="mt-1 text-base text-white/90">
          &quot;Aha. Czyli temat jest już w obiegu. Dobra, to po shocie i nie było rozmowy.&quot;
        </p>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center">
        <p className="text-sm italic text-white/60">
          {GROOM.nickname} poznał życiówkę Skiby. Niestety za cenę dwóch shotów i części szacunku do świata.
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={advance}
        className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
      >
        🛋️ Idę do Pokoju Żuka
      </motion.button>
    </div>
  );
}

function BitwySalonNarratorCtrl({
  choseKitchen,
  kitchenBailed,
  advance,
}: {
  choseKitchen: boolean;
  kitchenBailed: boolean;
  advance: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-center">
        <p className="text-base text-white/80">
          {kitchenBailed
            ? "Lama nie dał rady. Skiba kiwa głową z rozczarowaniem, jakby widział to już wcześniej."
            : choseKitchen
              ? `${GROOM.nickname} poznał życiówkę Skiby. Niestety za cenę dwóch shotów i części szacunku do świata.`
              : "Dobra, idź, idź, i tak wszyscy już wiedzą!"}
        </p>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-center">
        <p className="text-sm text-white/70">
          W Pokoju Żuka {GROOM.nickname} siada i nalewa sobie shota. Na BITWY nie pytają, czy pijesz. Pytają, czy potrafisz nalać.
        </p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={advance}
        className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
      >
        Dalej →
      </motion.button>
    </div>
  );
}

function BitwyBalanceIntroCtrl({ advance, message }: { advance: () => void; message: string }) {
  return (
    <div className="space-y-4">
      <div className="text-center">
        <div className="text-5xl mb-2">⚖️</div>
        <h3 className="text-2xl font-black uppercase text-emerald-300">ZŁAP PION</h3>
      </div>
      <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-center">
        <p className="text-base text-white/80">{message}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={advance}
        className="w-full rounded-2xl bg-emerald-600 p-6 text-2xl font-black uppercase"
      >
        Zaczynaj →
      </motion.button>
    </div>
  );
}

function BitwyBalanceCtrl({
  startTime,
  stopPos,
  stopBalance,
}: {
  startTime: number | null;
  stopPos: number | null;
  stopBalance: () => void;
}) {
  useTick(30);
  const pos = stopPos ?? (startTime ? getBalancePos(startTime) : 50);
  const isStopped = stopPos != null;
  const success = isStopped && pos >= BALANCE_TARGET_MIN && pos <= BALANCE_TARGET_MAX;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-2xl font-black uppercase text-emerald-300">ZŁAP PION</h3>
        <p className="mt-1 text-sm text-white/60">Zatrzymaj wahadło w zielonym.</p>
      </div>
      <BalanceBar pos={pos} stopped={isStopped} success={success} variant="controller" />
      {!isStopped && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={stopBalance}
          className="w-full rounded-2xl border-4 border-red-300 bg-gradient-to-b from-red-500 to-red-700 p-10 text-5xl font-black uppercase text-white shadow-[0_0_40px_rgba(239,68,68,0.5)]"
        >
          ✋ STOP
        </motion.button>
      )}
    </div>
  );
}

function BitwyCompleteCtrl({ advance, message }: { advance: () => void; message: string }) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/20 bg-white/5 p-4 text-center">
        <div className="text-4xl mb-2">🚶</div>
        <p className="text-base text-white/80">{message}</p>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={advance}
        className="w-full rounded-2xl bg-fuchsia-600 p-6 text-2xl font-black uppercase"
      >
        Dalej →
      </motion.button>
    </div>
  );
}
