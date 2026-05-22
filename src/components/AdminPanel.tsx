import { useGame } from "@/state/gameStore";
import { RealtimeIndicator } from "@/components/RealtimeIndicator";

function Btn({
  onClick,
  children,
  tone = "default",
}: {
  onClick: () => void;
  children: React.ReactNode;
  tone?: "default" | "danger" | "success" | "warn";
}) {
  const cls =
    tone === "danger"
      ? "bg-rose-500 hover:bg-rose-400"
      : tone === "success"
        ? "bg-emerald-500 hover:bg-emerald-400"
        : tone === "warn"
          ? "bg-amber-500 hover:bg-amber-400"
          : "bg-fuchsia-500 hover:bg-fuchsia-400";
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-xl ${cls} p-4 text-lg font-bold uppercase text-white shadow`}
    >
      {children}
    </button>
  );
}

export function AdminPanel() {
  const {
    state,
    realtimeStatus,
    roomCode,
    locations,
    currentLocation,
    activeQuest,
    reset,
    addPoints,
    addShot,
    addTeamShot,
    nextLocation,
    forcePass,
    forceFail,
    goToLocation,
  } = useGame();

  const final = locations.find((l) => l.type === "final");

  return (
    <div className="relative min-h-screen bg-slate-950 p-6 text-white">
      <RealtimeIndicator status={realtimeStatus} roomCode={roomCode} />
      <h1 className="text-3xl font-black">
        🛠 Admin / Operator
      </h1>
      <p className="text-white/60">
        Panel awaryjny — uratuj flow po trzecim drinku.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h2 className="mb-3 text-xl font-bold">Stan gry</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-fuchsia-500/20 p-3">
              <div className="text-xs">Mąż</div>
              <div className="text-2xl font-black">💍 {state.manPoints}</div>
            </div>
            <div className="rounded-lg bg-amber-500/20 p-3">
              <div className="text-xs">Shoty</div>
              <div className="text-2xl font-black">🥃 {state.shotCount}</div>
            </div>
            <div className="rounded-lg bg-cyan-500/20 p-3">
              <div className="text-xs">Team</div>
              <div className="text-2xl font-black">🍻 {state.teamShots}</div>
            </div>
          </div>
          <div className="mt-4 text-sm text-white/70">
            Lokacja: <b>{currentLocation.name}</b>
            {activeQuest && (
              <> · Quest aktywny: <b>{activeQuest.name}</b></>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h2 className="mb-3 text-xl font-bold">Punkty i shoty</h2>
          <div className="grid grid-cols-2 gap-3">
            <Btn onClick={() => addPoints(5)}>+5 Mąż</Btn>
            <Btn onClick={() => addPoints(-5)} tone="danger">−5 Mąż</Btn>
            <Btn onClick={addShot} tone="warn">+1 Shot PM</Btn>
            <Btn onClick={addTeamShot} tone="warn">+1 Team Shot</Btn>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h2 className="mb-3 text-xl font-bold">Quest</h2>
          <div className="grid gap-3">
            <Btn onClick={forcePass} tone="success">✅ Zalicz quest</Btn>
            <Btn onClick={forceFail} tone="danger">❌ Oblej quest</Btn>
            <Btn onClick={nextLocation}>➡️ Następna lokacja</Btn>
            {final && (
              <Btn onClick={() => goToLocation(final.id)} tone="warn">
                👑 Pokaż finał
              </Btn>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-black/40 p-5">
          <h2 className="mb-3 text-xl font-bold">Skocz do lokacji</h2>
          <div className="grid grid-cols-2 gap-2">
            {locations.map((l) => (
              <button
                key={l.id}
                onClick={() => goToLocation(l.id)}
                className="rounded-lg border border-white/15 bg-white/5 p-3 text-left text-sm hover:bg-white/10"
              >
                <div className="font-bold">{l.name}</div>
                <div className="text-xs text-white/50">{l.type}</div>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-rose-500/40 bg-rose-950/30 p-5 md:col-span-2">
          <h2 className="mb-3 text-xl font-bold text-rose-300">Strefa zagłady</h2>
          <Btn onClick={reset} tone="danger">🔥 Reset gry</Btn>
        </section>
      </div>
    </div>
  );
}
