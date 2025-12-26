import type { WorkoutEntry } from "./types";

const SHEETS_API_URL = "/api/sheets";

type SheetsResponse = {
  success?: boolean;
  data?: unknown;
  error?: string;
};

const createTimeout = (ms = 12000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  const clear = () => clearTimeout(timer);
  return { controller, clear };
};

const parseExercise = (value: unknown): WorkoutEntry["exercise"] => {
  return value === "lsit" || value === "dips" || value === "barras" ? value : "barras";
};

type SaveEntryInput = Omit<WorkoutEntry, "date"> & {
  mode?: "overwrite" | "append";
  overwrite?: boolean;
};

function normalizeEntry(raw: Record<string, unknown>): WorkoutEntry {
  const week = Number(
    raw.week ?? raw.semana ?? (typeof raw.week === "string" ? raw.week : 0),
  );
  const value = Number(
    raw.value ?? raw.valor ?? (typeof raw.value === "string" ? raw.value : 0),
  );
  const exercise = parseExercise(
    raw.exercise ?? raw.exercicio ?? raw["exercício" as keyof typeof raw],
  );

  return {
    date:
      (typeof raw.date === "string" && raw.date) ||
      (typeof raw.data === "string" && raw.data) ||
      new Date().toISOString(),
    week: Number.isNaN(week) ? 0 : week,
    exercise,
    value: Number.isNaN(value) ? 0 : value,
    notes:
      (typeof raw.notes === "string" && raw.notes) ||
      (typeof raw.notas === "string" && raw.notas) ||
      "",
  };
}

export async function fetchWorkouts(): Promise<WorkoutEntry[]> {
  const { controller, clear } = createTimeout();

  try {
    const res = await fetch(SHEETS_API_URL, { cache: "no-store", signal: controller.signal });

    // Tenta fazer parse do JSON com melhor tratamento de erro
    let json: SheetsResponse;
    try {
      const text = await res.text();
      if (!text || text.trim() === "") {
        throw new Error("Resposta vazia da API. Verifique os logs do servidor.");
      }
      json = JSON.parse(text) as SheetsResponse;
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON:", parseError);
      throw new Error("Resposta inválida da API. Verifique os logs do servidor e o console do navegador.");
    }

    if (!res.ok || json.success === false) {
      throw new Error(json.error || "Não foi possível carregar dados do Sheets.");
    }

    const rows = Array.isArray(json.data) ? json.data : [];
    return rows.map(normalizeEntry).filter((entry) => entry.week > 0);
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Tempo esgotado ao ler dados do Sheets.");
    }
    throw err;
  } finally {
    clear();
  }
}

export async function saveWorkout(entry: SaveEntryInput): Promise<WorkoutEntry> {
  const { mode, overwrite, ...rest } = entry;
  const selectedMode = mode ?? (overwrite ? "overwrite" : "append");
  const payload = {
    ...rest,
    date: new Date().toISOString(),
    mode: selectedMode,
    overwrite: selectedMode === "overwrite",
  };

  const { controller, clear } = createTimeout();

  try {
    const res = await fetch(SHEETS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    // Tenta fazer parse do JSON com melhor tratamento de erro
    let json: SheetsResponse;
    try {
      const text = await res.text();
      if (!text || text.trim() === "") {
        throw new Error("Resposta vazia da API no POST. Verifique os logs do servidor.");
      }
      json = JSON.parse(text) as SheetsResponse;
    } catch (parseError) {
      console.error("Erro ao fazer parse do JSON no POST:", parseError);
      throw new Error("Resposta inválida da API no POST. Verifique os logs do servidor.");
    }

    if (!res.ok || json.success === false) {
      throw new Error(json.error || "Falha ao salvar no Sheets.");
    }

    const saved: WorkoutEntry = {
      ...rest,
      date: payload.date,
      notes: rest.notes ?? "",
    };
    return saved;
  } catch (err) {
    if ((err as Error).name === "AbortError") {
      throw new Error("Tempo esgotado ao salvar no Sheets.");
    }
    throw err;
  } finally {
    clear();
  }
}
