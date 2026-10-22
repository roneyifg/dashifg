import { gradeFor, type Result } from "./data";
export type CouncilRow = {
  student: string;
  records: Map<string, Result>;
  below: number;
};
export function councilRows(
  data: Result[],
  period: number,
  attention: boolean,
  order: "attention" | "name",
): CouncilRow[] {
  const students = new Map<string, CouncilRow>();
  for (const record of data) {
    let row = students.get(record.student);
    if (!row) {
      row = { student: record.student, records: new Map(), below: 0 };
      students.set(record.student, row);
    }
    row.records.set(record.subject, record);
  }
  const rows = [...students.values()];
  for (const row of rows)
    row.below = [...row.records.values()].filter((r) => {
      const grade = gradeFor(r, period);
      return grade != null && grade < 6;
    }).length;
  return rows
    .filter((row) => !attention || row.below > 0)
    .sort(
      (a, b) =>
        (order === "attention" ? b.below - a.below : 0) ||
        a.student.localeCompare(b.student, "pt-BR"),
    );
}
