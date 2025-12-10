# Janz Força Tracker

Registro mobile-first das 8 semanas de barras, L-Sit e dips do Rodrigo Janz. Stack: Next.js 16 (App Router), Tailwind 4, Google Sheets via Apps Script como backend.

## Setup rápido
1) Instalar deps  
`npm install`

2) Variáveis de ambiente  
Copie `.env.example` para `.env.local` e preencha:  
`NEXT_PUBLIC_SHEETS_URL=https://script.google.com/macros/s/SEU_ID_AQUI/exec`

3) Rodar em dev  
`npm run dev` → http://localhost:3000

## Backend (Google Sheets)
- Sheet: aba `Dados` com colunas `Data | Semana | Exercicio | Valor | Notas`.
- Apps Script Web App com `doGet`/`doPost` públicos (quem tem o link edita).
- Use a URL de implantação no `NEXT_PUBLIC_SHEETS_URL`.
- Código do Apps Script: use `apps-script/sheets.gs`. Ele trata `mode: "overwrite"` ou
  `overwrite: true` para sobrescrever a linha da mesma semana/exercício em vez de criar
  outra. Depois de colar o código, publique/implante novamente o Web App.

## Scripts úteis
- `npm run dev` — desenvolvimento
- `npm run lint` — checagem de lint
- `npm run build` — build de produção

## Estrutura
- `src/app` — App Router + estilos globais
- `src/components` — UI (Header, WeekSelector, ExerciseCard, ProgressChart)
- `src/hooks` — `useSheets` (fetch/save no Sheets)
- `src/lib` — tipos e cliente Sheets
