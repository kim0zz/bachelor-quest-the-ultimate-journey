export type ReadOnlyChoice = {
  title: string;
  description?: string;
  icon?: string;
};

type Props = {
  title?: string;
  subtitle?: string;
  choices: ReadOnlyChoice[];
  className?: string;
};

const DEFAULT_SUBTITLE = "Lama wybiera na telefonie";

export function ReadOnlyChoiceCards({
  title,
  subtitle = DEFAULT_SUBTITLE,
  choices,
  className = "",
}: Props) {
  if (choices.length === 0) return null;

  return (
    <div
      className={`pointer-events-none select-none ${className}`}
      aria-hidden="true"
    >
      {title && (
        <h3 className="text-center text-2xl font-black uppercase tracking-wide text-white">
          {title}
        </h3>
      )}
      <p className="mt-2 text-center text-sm text-white/50">{subtitle}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {choices.map((choice, i) => (
          <div
            key={`${choice.title}-${i}`}
            className="flex items-start gap-4 rounded-2xl border-2 border-white/25 bg-black/50 p-5 text-left opacity-95"
          >
            {choice.icon && (
              <span className="shrink-0 text-3xl" aria-hidden>
                {choice.icon}
              </span>
            )}
            <div className="min-w-0">
              <div className="text-xl font-black text-white">{choice.title}</div>
              {choice.description && (
                <div className="mt-1 text-sm text-white/65">{choice.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
