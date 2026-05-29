export function ManPointsDeltaLine({
  delta,
  className,
}: {
  delta?: number;
  className?: string;
}) {
  if (delta == null || delta <= 0) return null;
  return (
    <p
      className={
        className ??
        "mt-4 text-3xl font-black uppercase tracking-wide text-cyan-200 drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]"
      }
    >
      +{delta} Mąż Points
    </p>
  );
}

export function BartenderBonusPoints({ bonusPoints }: { bonusPoints?: number }) {
  if (bonusPoints == null || bonusPoints <= 0) return null;
  return (
    <p className="mt-4 text-2xl font-black text-cyan-300">+{bonusPoints} Mąż Points</p>
  );
}
