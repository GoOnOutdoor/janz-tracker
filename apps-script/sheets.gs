const SHEET_NAME = "Dados";
const HEADERS = ["Data", "Semana", "Exercicio", "Valor", "Notas"];

const jsonResponse = (payload) =>
  ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );

const parseBody = (e) => {
  if (!e || !e.postData || !e.postData.contents) return {};
  try {
    return JSON.parse(e.postData.contents);
  } catch (err) {
    return { error: "JSON inválido", details: err?.message };
  }
};

const findRowToOverwrite = (rows, week, exercise) => {
  const targetWeek = Number(week);
  const targetExercise = String(exercise || "").trim().toLowerCase();

  for (let i = rows.length - 1; i >= 0; i--) {
    const rowWeek = Number(rows[i][1]);
    const rowExercise = String(rows[i][2] || "").trim().toLowerCase();
    if (rowWeek === targetWeek && rowExercise === targetExercise) {
      // +2: header row + zero-based index
      return i + 2;
    }
  }
  return null;
};

function doGet() {
  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const values = sheet.getDataRange().getValues();
  const dataRows = values.slice(1); // remove header

  const data = dataRows.map(([date, week, exercise, value, notes]) => ({
    date: typeof date === "string" ? date : new Date(date).toISOString(),
    week,
    exercise,
    value,
    notes: notes || "",
  }));

  return jsonResponse({ success: true, data });
}

function doPost(e) {
  const body = parseBody(e);
  const week = Number(body.week ?? body.semana);
  const exercise = body.exercise ?? body.exercicio ?? body["exercício"];
  const value = Number(body.value ?? body.valor);
  const notes = body.notes ?? body.notas ?? "";
  const mode = body.mode ?? (body.overwrite ? "overwrite" : "append");
  const date = body.date || new Date().toISOString();

  if (!week || !exercise || !value) {
    return jsonResponse({
      success: false,
      error: "Campos obrigatórios: week/exercise/value.",
    });
  }

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues().slice(1);

  const targetRow =
    mode === "overwrite" ? findRowToOverwrite(rows, week, exercise) : null;
  const rowValues = [date, week, exercise, value, notes];

  if (targetRow) {
    sheet.getRange(targetRow, 1, 1, HEADERS.length).setValues([rowValues]);
    return jsonResponse({
      success: true,
      data: rowValues,
      action: "overwritten",
      row: targetRow,
    });
  }

  sheet.appendRow(rowValues);
  return jsonResponse({ success: true, data: rowValues, action: "appended" });
}
