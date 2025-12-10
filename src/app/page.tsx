"use client";

import { useMemo, useState } from "react";
import ExerciseCard from "@/components/ExerciseCard";
import Header from "@/components/Header";
import ProgressChart from "@/components/ProgressChart";
import WeekSelector from "@/components/WeekSelector";
import { useSheets } from "@/hooks/useSheets";
import { BLOCKS, EXERCISES, type Exercise, type WorkoutEntry } from "@/lib/types";

type View = "workout" | "progress";

const blockForWeek = (week: number) => BLOCKS.find((block) => block.weeks.includes(week));

const ruleForWeek = (week: number) => {
  const block = blockForWeek(week);
  switch (block?.name) {
    case "ATIVAÇÃO":
      return "Priorize técnica limpa e amplitudes completas. Sem falhar, apenas sentir o movimento e registrar.";
    case "FORÇA":
      return "2-3 minutos de descanso, anota logo após a série. Busca progressão mínima de +1 rep ou +3s.";
    case "PICO":
      return "Qualidade máxima e controle. Se bater a meta, registra e fecha o dia mais cedo.";
    case "CONSOLIDAÇÃO":
      return "Mantenha consistência, sem ego. Repetir o valor da semana anterior já é vitória.";
    default:
      return "Registra cada bloco logo após fazer. 30 segundos e você vê o gráfico subir.";
  }
};

export default function Home() {
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [view, setView] = useState<View>("workout");
  const { entries, loading, saving, error, latestFor, saveEntry } = useSheets();

  const dataByExercise = useMemo(() => {
    return EXERCISES.reduce<Record<Exercise, WorkoutEntry[]>>((acc, exercise) => {
      acc[exercise.id] = entries.filter((item) => item.exercise === exercise.id);
      return acc;
    }, {} as Record<Exercise, WorkoutEntry[]>);
  }, [entries]);

  const handleSave = async (
    exerciseId: Exercise,
    value: number,
    notes: string,
    overwrite: boolean,
  ) => {
    await saveEntry({
      week: currentWeek,
      exercise: exerciseId,
      value,
      notes,
      mode: overwrite ? "overwrite" : "append",
    });
  };

  const currentBlock = blockForWeek(currentWeek);

  return (
    <main className="min-h-screen text-white">
      <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-8 md:py-12">
        <Header
          view={view}
          onToggleView={() => setView((prev) => (prev === "workout" ? "progress" : "workout"))}
        />

        <WeekSelector
          currentWeek={currentWeek}
          onChange={setCurrentWeek}
          blockName={currentBlock?.name}
          blockColor={currentBlock?.color}
        />

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-inner shadow-black/30">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-[0.22em] text-slate-300/80">
                Regra de ouro
              </p>
              <h2 className="text-lg font-semibold text-white">
                Semana {currentWeek} • {currentBlock?.name ?? "Progresso"}
              </h2>
            </div>
            <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-slate-200">
              {view === "workout" ? "Registrar treino" : "Visualizar progresso"}
            </div>
          </div>
          <p className="mt-3 text-sm text-slate-200">{ruleForWeek(currentWeek)}</p>
          {error && (
            <p className="mt-3 text-xs text-red-300">
              {error} • Verifique a URL do Sheets e tente recarregar.
            </p>
          )}
        </div>

        {view === "workout" ? (
          <section className="grid gap-4">
            {loading
              ? EXERCISES.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="h-48 animate-pulse rounded-3xl bg-white/5"
                    aria-hidden
                  />
                ))
              : EXERCISES.map((exercise) => {
                  const latest = latestFor(currentWeek, exercise.id);
                  const cardKey = `${exercise.id}-w${currentWeek}-${latest?.date ?? "empty"}`;
                  return (
                    <ExerciseCard
                      key={cardKey}
                      exercise={exercise}
                      week={currentWeek}
                      latest={latest}
                      saving={Boolean(saving[`${exercise.id}-${currentWeek}`])}
                      onSave={({ value, notes, overwrite }) =>
                        handleSave(exercise.id, value, notes, overwrite)
                      }
                    />
                  );
                })}
          </section>
        ) : (
          <section className="grid gap-4">
            {EXERCISES.map((exercise) => (
              <ProgressChart
                key={exercise.id}
                exercise={exercise}
                data={dataByExercise[exercise.id] ?? []}
              />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}
