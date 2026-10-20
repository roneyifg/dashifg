import ExcelJS from "exceljs";

// Read the original workbook directly, including empty inline-string cells.
// Formula cells use only their saved result; formulas are never executed.
export async function readWorkbook(buffer: ArrayBuffer): Promise<unknown[][]> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) throw new Error("A planilha não contém abas.");
  if (sheet.rowCount > 10000 || sheet.columnCount > 1000)
    throw new Error(
      "A planilha ultrapassa o limite de 10.000 linhas ou 1.000 colunas.",
    );
  return Array.from({ length: sheet.rowCount }, (_, i) =>
    Array.from({ length: sheet.columnCount }, (_, j) => {
      const cell = sheet.getRow(i + 1).getCell(j + 1);
      const value = cell.value;
      if (value && typeof value === "object" && !(value instanceof Date)) {
        if ("formula" in value || "sharedFormula" in value)
          return value.result ?? null;
        if ("richText" in value)
          return value.richText.map((part) => part.text).join("");
        if ("text" in value) return value.text;
        if ("error" in value)
          throw new Error(
            `A célula ${cell.address} contém um erro do Excel. Corrija a planilha e importe novamente.`,
          );
      }
      return value;
    }),
  );
}
