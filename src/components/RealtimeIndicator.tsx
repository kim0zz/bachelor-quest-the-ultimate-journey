import type { RealtimeStatus } from "@/state/gameStore";

export function RealtimeIndicator({
  status,
  roomCode,
}: {
  status: RealtimeStatus;
  roomCode: string;
}) {
  const connected = status === "connected";
  const label =
    status === "connected"
      ? "Realtime: connected"
      : status === "connecting"
        ? "Realtime: connecting…"
        : "Realtime: local only";

  return (
    <div
      className="pointer-events-none fixed bottom-3 right-3 z-[100] rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wide text-white/50 backdrop-blur-sm"
      aria-live="polite"
    >
      <span
        className={
          connected ? "text-emerald-400/90" : "text-white/40"
        }
      >
        {label}
      </span>
      <span className="mx-1.5 text-white/20">·</span>
      <span>Room: {roomCode}</span>
    </div>
  );
}
