import { useEffect, useMemo, useState } from "react";
import { fetchWorkouts, saveWorkout } from "@/lib/sheets";
import type { Exercise, WorkoutEntry } from "@/lib/types";

type SavingState = Record<string, boolean>;
type SaveEntryInput = Omit<WorkoutEntry, "date"> & {
  mode?: "overwrite" | "append";
  overwrite?: boolean;
};

export function useSheets() {
  const [entries, setEntries] = useState<WorkoutEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<SavingState>({});
  const [error, setError] = useState<string | null>(null);

  const groupedByWeek = useMemo(() => {
    const map = new Map<string, WorkoutEntry[]>();
    entries.forEach((entry) => {
      const key = `${entry.week}-${entry.exercise}`;
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    });
    return map;
  }, [entries]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWorkouts();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const latestFor = (week: number, exercise: Exercise) => {
    const key = `${week}-${exercise}`;
    const list = groupedByWeek.get(key);
    if (!list || list.length === 0) return null;
    return [...list].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    )[0];
  };

  const saveEntry = async (entry: SaveEntryInput) => {
    const mode = entry.mode ?? (entry.overwrite ? "overwrite" : "append");
    const normalized: SaveEntryInput = {
      ...entry,
      mode,
      overwrite: entry.overwrite ?? mode === "overwrite",
    };

    const key = `${normalized.exercise}-${normalized.week}`;
    setSaving((prev) => ({ ...prev, [key]: true }));
    setError(null);

    const optimistic: WorkoutEntry = {
      exercise: normalized.exercise,
      week: normalized.week,
      value: normalized.value,
      notes: normalized.notes ?? "",
      date: new Date().toISOString(),
    };

    let previousEntries: WorkoutEntry[] = [];
    setEntries((prev) => {
      previousEntries = prev;
      const filtered =
        mode === "overwrite"
          ? prev.filter(
              (item) =>
                !(item.exercise === normalized.exercise && item.week === normalized.week),
            )
          : prev;
      return [...filtered, optimistic];
    });

    try {
      const saved = await saveWorkout(normalized);
      setEntries((prev) => {
        const withoutOptimistic = prev.filter((item) => item.date !== optimistic.date);
        const base =
          mode === "overwrite"
            ? withoutOptimistic.filter(
                (item) =>
                  !(item.exercise === normalized.exercise && item.week === normalized.week),
              )
            : withoutOptimistic;
        return [...base, saved];
      });
      return saved;
    } catch (err) {
      setEntries((prev) =>
        prev.filter((item) => item.date !== optimistic.date).length !== prev.length
          ? previousEntries
          : prev,
      );
      setError(err instanceof Error ? err.message : "Erro ao salvar.");
      throw err;
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  return {
    entries,
    loading,
    saving,
    error,
    latestFor,
    loadData,
    saveEntry,
  };
}
