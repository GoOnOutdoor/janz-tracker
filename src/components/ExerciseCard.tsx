"use client";

import { useMemo, useState } from "react";
import type { ExerciseConfig, WorkoutEntry } from "@/lib/types";

type ExerciseCardProps = {
  exercise: ExerciseConfig;
  week: number;
  latest?: WorkoutEntry | null;
  saving?: boolean;
  onSave: (payload: { value: number; notes: string; overwrite: boolean }) => Promise<void>;
};

export function ExerciseCard({
  exercise,
  week,
  latest,
  saving = false,
  onSave,
}: ExerciseCardProps) {
  const [value, setValue] = useState(() => (latest ? String(latest.value) : ""));
  const [notes, setNotes] = useState(() => latest?.notes ?? "");
  const [overwrite, setOverwrite] = useState(false);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const lastLabel = useMemo(() => {
    if (!latest) return "Sem registro nesta semana";
    const date = new Date(latest.date);
    const formatted = Number.isNaN(date.getTime())
      ? ""
      : ` • ${date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })}`;
    return `Último: ${latest.value} ${exercise.unit}${formatted}`;
  }, [exercise.unit, latest]);

  const handleSave = async () => {
    setError(null);
    if (!value || Number(value) <= 0) {
      setError("Informe um valor maior que zero.");
      setStatus("error");
      return;
    }

    try {
      await onSave({ value: Number(value), notes: notes.trim(), overwrite });
      setStatus("saved");
      setTimeout(() => setStatus("idle"), 1800);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Não foi possível salvar.");
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-xl shadow-black/30 backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 text-white">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl">
            {exercise.icon}
          </span>
          <div className="leading-tight">
            <p className="text-sm text-slate-300/80">Meta: {exercise.target} {exercise.unit}</p>
            <h3 className="text-xl font-semibold">{exercise.name}</h3>
            <p className="text-xs text-slate-400">{lastLabel}</p>
          </div>
        </div>
        <span
          className="rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]"
          style={{ backgroundColor: `${exercise.color}20`, color: exercise.color }}
        >
          Semana {week}
        </span>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="flex items-center gap-3">
          <input
            inputMode="numeric"
            type="number"
            min={0}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Valor"
            className="w-32 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-lg font-semibold text-white outline-none ring-blue-500/50 transition focus:border-white/30 focus:ring-2"
          />
          <span className="text-sm text-slate-300/80">{exercise.unit}</span>
        </div>

        <textarea
          rows={2}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notas (opcional)"
          className="w-full resize-none rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none ring-blue-500/40 transition focus:border-white/30 focus:ring-2"
        />

        <label className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-3 py-2 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={overwrite}
            onChange={(e) => setOverwrite(e.target.checked)}
            className="h-5 w-5 rounded border-white/30 bg-transparent accent-blue-500"
          />
          <div className="leading-tight">
            <span className="font-semibold">Corrigir última entrada desta semana</span>
            <p className="text-xs text-slate-400">
              Sobrescreve o valor da semana para {exercise.name}. Use se errou o preenchimento.
            </p>
          </div>
        </label>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:translate-y-[1px] hover:shadow-blue-400/40 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar"}
          </button>

          {status === "saved" && (
            <span className="rounded-xl bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-300">
              Salvo!
            </span>
          )}
          {status === "error" && (
            <span className="rounded-xl bg-red-500/15 px-3 py-2 text-xs font-semibold text-red-300">
              Erro
            </span>
          )}
        </div>

        {error && <p className="text-xs text-red-300">{error}</p>}
      </div>
    </div>
  );
}

export default ExerciseCard;
