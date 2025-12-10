import { BLOCKS, type ExerciseConfig, type WorkoutEntry } from "@/lib/types";

type ProgressChartProps = {
  exercise: ExerciseConfig;
  data: WorkoutEntry[];
};

const weeks = Array.from({ length: 8 }, (_, i) => i + 1);

const blockForWeek = (week: number) =>
  BLOCKS.find((block) => block.weeks.includes(week));

export function ProgressChart({ exercise, data }: ProgressChartProps) {
  const values = weeks.map((week) => {
    const entries = data.filter(
      (entry) => entry.week === week && entry.exercise === exercise.id,
    );
    if (entries.length === 0) return 0;
    return entries.reduce((best, entry) => Math.max(best, entry.value), 0);
  });

  const maxValue = Math.max(exercise.target, ...values, 1);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-4 text-white shadow-inner shadow-black/30">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-slate-300/80">Meta: {exercise.target} {exercise.unit}</p>
          <h3 className="text-lg font-semibold">{exercise.name}</h3>
        </div>
        <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
          8 semanas
        </div>
      </div>

      <div className="mt-5 grid grid-cols-8 items-end gap-2">
        {values.map((value, index) => {
          const week = index + 1;
          const block = blockForWeek(week);
          const height = `${Math.max((value / maxValue) * 100, 6)}%`;

          return (
            <div key={week} className="flex flex-col items-center gap-2">
              <div className="relative flex h-40 w-full items-end justify-center rounded-xl bg-white/5">
                <div
                  className="w-6 rounded-full transition-all"
                  style={{
                    height,
                    backgroundColor: block?.color || exercise.color,
                    opacity: value === 0 ? 0.35 : 1,
                    boxShadow:
                      value >= exercise.target
                        ? `0 0 18px ${exercise.color}66`
                        : "none",
                  }}
                  title={`Semana ${week}`}
                />
                <div className="absolute inset-x-0"
                  style={{
                    bottom: `${(exercise.target / maxValue) * 100}%`,
                  }}
                >
                  <div className="h-[2px] w-full bg-red-400/70" />
                </div>
              </div>
              <span className="text-xs font-semibold text-slate-200">S{week}</span>
              <span className="text-[11px] text-slate-400">{value || "—"}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ProgressChart;
