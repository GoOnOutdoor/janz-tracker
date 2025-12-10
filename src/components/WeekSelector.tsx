type WeekSelectorProps = {
  currentWeek: number;
  onChange: (week: number) => void;
  blockName?: string;
  blockColor?: string;
};

const TOTAL_WEEKS = 8;

export function WeekSelector({
  currentWeek,
  onChange,
  blockName,
  blockColor = "#3B82F6",
}: WeekSelectorProps) {
  const decrement = () => onChange(Math.max(1, currentWeek - 1));
  const increment = () => onChange(Math.min(TOTAL_WEEKS, currentWeek + 1));

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-white shadow-inner shadow-black/30">
      <button
        type="button"
        onClick={decrement}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-sm font-semibold transition hover:border-white/30 hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentWeek === 1}
        aria-label="Semana anterior"
      >
        Prev
      </button>

      <div className="text-center">
        {blockName ? (
          <p
            className="text-xs font-semibold tracking-[0.22em]"
            style={{ color: blockColor }}
          >
            {blockName}
          </p>
        ) : (
          <p className="text-xs font-semibold tracking-[0.22em] text-slate-300/70">
            8 SEMANAS
          </p>
        )}
        <div className="flex items-baseline justify-center gap-2">
          <span className="text-5xl font-semibold leading-none">S{currentWeek}</span>
          <span className="text-sm text-slate-400">/ {TOTAL_WEEKS}</span>
        </div>
      </div>

      <button
        type="button"
        onClick={increment}
        className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/10 text-sm font-semibold transition hover:border-white/30 hover:bg-white/15 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentWeek === TOTAL_WEEKS}
        aria-label="Próxima semana"
      >
        Next
      </button>
    </div>
  );
}

export default WeekSelector;
