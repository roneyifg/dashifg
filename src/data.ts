export type Result = {
  student: string;
  subject: string;
  grades: (number | null)[];
  absences: (number | null)[];
  finalGrade: number | null;
  totalAbsences: number | null;
  situation: string;
};
export const periods = [
  "1º bimestre",
  "2º bimestre",
  "3º bimestre",
  "4º bimestre",
  "Resultado final",
];
const fields = [
  "N1",
  "F1",
  "N2",
  "F2",
  "N3",
  "F3",
  "N4",
  "F4",
  "Média Final",
  "Faltas",
  "Situação",
];
export function parseWorkbook(rows: unknown[][]): Result[] {
  if (rows.length < 2)
    throw new Error(
      "A planilha precisa conter um cabeçalho e pelo menos um aluno.",
    );
  const headers = rows[0].map((v) => String(v ?? "").trim());
  const studentColumn = headers.indexOf("Aluno");
  if (studentColumn < 0)
    throw new Error("Não foi encontrada a coluna “Aluno” na primeira linha.");
  const subjects = [
    ...new Set(
      headers.filter((h) => h.endsWith(" - N1")).map((h) => h.slice(0, -5)),
    ),
  ];
  if (!subjects.length)
    throw new Error(
      "Não foram encontradas disciplinas. Use cabeçalhos como “Matemática - N1” e “Matemática - F1”.",
    );
  const result: Result[] = [];
  const number = (
    v: unknown,
    row: number,
    field: string,
    grade: boolean,
  ): number | null => {
    if (v == null || String(v).trim() === "") return null;
    const n =
      typeof v === "number" ? v : Number(String(v).trim().replace(",", "."));
    if (!Number.isFinite(n) || n < 0 || (grade ? n > 10 : !Number.isInteger(n)))
      throw new Error(
        `Valor inválido na linha ${row}, coluna “${field}”. ${grade ? "A nota deve estar entre 0 e 10." : "Faltas devem ser números inteiros não negativos."}`,
      );
    return n;
  };
  for (const subject of subjects) {
    const columns = fields.map((f) => headers.indexOf(`${subject} - ${f}`));
    if (columns.some((c) => c < 0))
      throw new Error(
        `A disciplina “${subject}” está com colunas incompletas. São necessárias N1–N4, F1–F4, Média Final, Faltas e Situação.`,
      );
    rows.slice(1).forEach((row, i) => {
      const student = String(row[studentColumn] ?? "").trim();
      if (!student) return;
      const values = columns.map((c) => row[c]);
      if (values.every((v) => v == null || String(v).trim() === "")) return;
      result.push({
        student,
        subject,
        grades: [0, 2, 4, 6].map((c) =>
          number(values[c], i + 2, `${subject} - ${fields[c]}`, true),
        ),
        absences: [1, 3, 5, 7].map((c) =>
          number(values[c], i + 2, `${subject} - ${fields[c]}`, false),
        ),
        finalGrade: number(values[8], i + 2, `${subject} - Média Final`, true),
        totalAbsences: number(values[9], i + 2, `${subject} - Faltas`, false),
        situation: String(values[10] ?? "").trim(),
      });
    });
  }
  if (!result.length)
    throw new Error("Não há resultados preenchidos para importar.");
  return result;
}
export const gradeFor = (r: Result, p: number) =>
  p === 4 ? r.finalGrade : r.grades[p];
export const absenceFor = (r: Result, p: number) =>
  p === 4 ? r.totalAbsences : r.absences[p];
const names = [
  "Ana Oliveira",
  "Bruno Santos",
  "Camila Costa",
  "Daniel Souza",
  "Elisa Martins",
  "Felipe Lima",
  "Gabriela Alves",
  "Henrique Rocha",
];
const subjects = [
  "Matemática III",
  "Língua Portuguesa e Literatura Brasileira III",
  "Biologia III",
  "História III",
  "Redes de Computadores",
];
export const demo: Result[] = names.flatMap((student, i) =>
  subjects.map((subject, j) => {
    const grades = [0, 1, 2].map(
      (p) => Math.round((4.5 + ((i * 7 + j * 3 + p * 2) % 55) / 10) * 10) / 10,
    );
    return {
      student,
      subject,
      grades: [...grades, null],
      absences: [(i + j) % 5, (i * 2 + j) % 4, (i + j * 2) % 3, null],
      finalGrade: Math.round((grades.reduce((a, b) => a + b, 0) / 3) * 10) / 10,
      totalAbsences: ((i + j) % 5) + ((i * 2 + j) % 4) + ((i + j * 2) % 3),
      situation: "Em andamento",
    };
  }),
);
