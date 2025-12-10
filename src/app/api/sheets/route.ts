import { NextResponse } from "next/server";

const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_URL;

const missingEnvResponse = NextResponse.json(
  { success: false, error: "NEXT_PUBLIC_SHEETS_URL não configurado." },
  { status: 500 },
);

const parseJson = async (res: Response) => {
  const text = await res.text();
  try {
    return JSON.parse(text) as { success?: boolean; data?: unknown; error?: string };
  } catch {
    return null;
  }
};

export async function GET() {
  if (!SHEETS_URL) return missingEnvResponse;

  try {
    const res = await fetch(SHEETS_URL, { cache: "no-store" });
    const json = await parseJson(res);

    if (!res.ok) {
      const message = json?.error || "Erro ao ler dados do Sheets.";
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    if (!json) {
      return NextResponse.json(
        { success: false, error: "Resposta inesperada do Sheets." },
        { status: 502 },
      );
    }

    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error("Sheets GET error", error);
    return NextResponse.json(
      { success: false, error: "Não foi possível comunicar com Sheets." },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  if (!SHEETS_URL) return missingEnvResponse;

  try {
    const body = await request.json();
    const res = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const json = await parseJson(res);
    const ok = res.ok && json?.success !== false;

    if (!ok) {
      const message = json?.error || "Falha ao salvar no Sheets.";
      return NextResponse.json({ success: false, error: message }, { status: res.status || 502 });
    }

    return NextResponse.json(json ?? { success: true }, { status: 200 });
  } catch (error) {
    console.error("Sheets POST error", error);
    return NextResponse.json(
      { success: false, error: "Não foi possível enviar dados ao Sheets." },
      { status: 502 },
    );
  }
}
