export type Exercise = "barras" | "lsit" | "dips";

export interface WorkoutEntry {
  date: string;
  week: number;
  exercise: Exercise;
  value: number;
  notes?: string;
}

export interface ExerciseConfig {
  id: Exercise;
  name: string;
  icon: string;
  target: number;
  unit: string;
  color: string;
}

export const EXERCISES: ExerciseConfig[] = [
  { id: "barras", name: "Barras", icon: "💪", target: 15, unit: "reps", color: "#3B82F6" },
  { id: "lsit", name: "L-Sit", icon: "🔥", target: 30, unit: "seg", color: "#F59E0B" },
  { id: "dips", name: "Dips", icon: "🎯", target: 20, unit: "reps", color: "#10B981" },
];

export const BLOCKS = [
  { name: "ATIVAÇÃO", weeks: [1, 2], color: "#3B82F6" },
  { name: "FORÇA", weeks: [3, 4], color: "#10B981" },
  { name: "PICO", weeks: [5, 6], color: "#F59E0B" },
  { name: "CONSOLIDAÇÃO", weeks: [7, 8], color: "#EF4444" },
];
