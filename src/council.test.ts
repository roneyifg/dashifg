import { describe, expect, it } from "vitest";
import { councilRows } from "./council";
import type { Result } from "./data";
const record = (
  student: string,
  subject: string,
  grade: number | null,
  finalGrade: number | null = 8,
): Result => ({
  student,
  subject,
  grades: [grade, 8, null, null],
  absences: [0, 1, null, null],
  finalGrade,
  totalAbsences: 1,
  situation: "Em andamento",
});
const data = [
  record("Ana", "Matemática", 0),
  record("Ana", "História", null),
  record("Bruno", "Matemática", 5),
  record("Bruno", "História", 4),
  record("Carlos", "História", 6),
  record("Dora", "História", null),
];
describe("Matriz do conselho", () => {
  it("ordena por disciplinas abaixo da média, contando zero e excluindo ausentes e nota 6", () => {
    expect(
      councilRows(data, 0, false, "attention").map((r) => [r.student, r.below]),
    ).toEqual([
      ["Bruno", 2],
      ["Ana", 1],
      ["Carlos", 0],
      ["Dora", 0],
    ]);
  });
  it("filtra alunos em atenção sem remover suas outras disciplinas", () => {
    const rows = councilRows(data, 0, true, "name");
    expect(rows.map((r) => r.student)).toEqual(["Ana", "Bruno"]);
    expect(rows[0].records.get("História")?.grades[0]).toBeNull();
    expect(rows[0].records.get("Matemática")?.grades[0]).toBe(0);
    expect(rows[0].records.has("Biologia")).toBe(false);
  });
  it("recalcula os alertas por período e usa a média final informada", () => {
    expect(councilRows(data, 1, true, "attention")).toEqual([]);
    expect(councilRows(data, 3, true, "attention")).toEqual([]);
    expect(
      councilRows([record("Ana", "Matemática", 9, 5)], 4, true, "attention")[0]
        .below,
    ).toBe(1);
  });
  it("respeita o recorte de disciplinas e mantém desempate alfabético", () => {
    expect(
      councilRows(
        data.filter((r) => r.subject === "Matemática"),
        0,
        false,
        "attention",
      ).map((r) => [r.student, r.below]),
    ).toEqual([
      ["Ana", 1],
      ["Bruno", 1],
    ]);
    expect(councilRows([], 0, false, "attention")).toEqual([]);
  });
});
