import { NextResponse } from "next/server";

const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_URL;

const missingEnvResponse = NextResponse.json(
  { success: false, error: "NEXT_PUBLIC_SHEETS_URL não configurado." },
  { status: 500 },
);

const parseJson = async (res: Response) => {
  const text = await res.text();

  // Detecta se a resposta é HTML (comum quando o script não está publicado corretamente)
  if (text.trim().startsWith("<")) {
    console.error("Resposta HTML recebida do Google Apps Script. Verifique se o script está publicado como Web App.");
    console.error("Primeiros 200 caracteres:", text.substring(0, 200));
    return null;
  }

  // Detecta resposta vazia
  if (!text || text.trim() === "") {
    console.error("Resposta vazia do Google Apps Script.");
    return null;
  }

  try {
    return JSON.parse(text) as { success?: boolean; data?: unknown; error?: string };
  } catch (error) {
    console.error("Erro ao fazer parse do JSON:", error);
    console.error("Conteúdo recebido:", text.substring(0, 200));
    return null;
  }
};

export async function GET() {
  if (!SHEETS_URL) return missingEnvResponse;

  try {
    console.log("Fazendo GET para:", SHEETS_URL);
    const res = await fetch(SHEETS_URL, { cache: "no-store" });
    console.log("Status da resposta:", res.status, res.statusText);

    const json = await parseJson(res);

    if (!res.ok) {
      const message = json?.error || "Erro ao ler dados do Sheets.";
      return NextResponse.json({ success: false, error: message }, { status: res.status });
    }

    if (!json) {
      return NextResponse.json(
        {
          success: false,
          error: "O Google Apps Script retornou HTML ou resposta vazia. Verifique se está publicado como Web App com permissões 'Anyone' e se a planilha tem a aba 'Dados'."
        },
        { status: 502 },
      );
    }

    return NextResponse.json(json, { status: res.status });
  } catch (error) {
    console.error("Sheets GET error", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: `Não foi possível comunicar com Sheets: ${errorMessage}` },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  if (!SHEETS_URL) return missingEnvResponse;

  try {
    const body = await request.json();
    console.log("Fazendo POST para:", SHEETS_URL, "com body:", JSON.stringify(body));

    const res = await fetch(SHEETS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    console.log("Status da resposta POST:", res.status, res.statusText);
    const json = await parseJson(res);

    if (!json) {
      return NextResponse.json(
        {
          success: false,
          error: "O Google Apps Script retornou HTML ou resposta vazia no POST. Verifique se está publicado como Web App com permissões 'Anyone'."
        },
        { status: 502 },
      );
    }

    const ok = res.ok && json?.success !== false;

    if (!ok) {
      const message = json?.error || "Falha ao salvar no Sheets.";
      return NextResponse.json({ success: false, error: message }, { status: res.status || 502 });
    }

    return NextResponse.json(json ?? { success: true }, { status: 200 });
  } catch (error) {
    console.error("Sheets POST error", error);
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      { success: false, error: `Não foi possível enviar dados ao Sheets: ${errorMessage}` },
      { status: 502 },
    );
  }
}
