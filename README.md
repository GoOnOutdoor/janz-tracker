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

## Troubleshooting

### Erro: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

Este erro indica que o Google Apps Script não está retornando JSON válido. Siga este checklist:

#### 1. Verifique se o script está publicado como Web App
   - Abra o Google Apps Script (Extensions > Apps Script)
   - Clique em **Deploy** > **Manage deployments**
   - Verifique se existe um deploy ativo
   - Se não existir ou estiver desatualizado, clique em **New deployment**

#### 2. Configure as permissões corretamente
   Ao publicar o Web App, certifique-se de:
   - **Execute as**: Me (seu email)
   - **Who has access**: Anyone (qualquer pessoa com o link)

   **IMPORTANTE**: Se você mudar o código do script, precisa criar um **New deployment** para que as mudanças tenham efeito!

#### 3. Verifique a URL no .env.local
   - A URL deve terminar com `/exec` (não `/dev`)
   - Exemplo: `https://script.google.com/macros/s/ABC123.../exec`
   - Copie a URL exata da última implantação em "Manage deployments"

#### 4. Verifique a planilha
   - A aba deve se chamar exatamente `Dados` (com D maiúsculo)
   - As colunas devem estar na ordem: `Data | Semana | Exercicio | Valor | Notas`

#### 5. Teste o script diretamente
   - Abra a URL do script diretamente no navegador
   - Você deve ver um JSON como: `{"success":true,"data":[...]}`
   - Se ver HTML ou erro, o problema está na configuração do Google Apps Script

#### 6. Verifique os logs do Next.js
   - Rode `npm run dev` e abra o console do terminal
   - Você verá logs detalhados de todas as requisições ao Sheets
   - Procure por mensagens de erro específicas que indicam o problema
