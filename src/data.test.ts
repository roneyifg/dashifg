import { describe, it, expect } from "vitest";
import { parseWorkbook, gradeFor, absenceFor } from "./data";
const headers = [
  "Aluno",
  ...[
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
  ].map((f) => `Disciplina - com hífen - ${f}`),
];
describe("Importação de boletins", () => {
  it("preserva zeros, campos vazios, nota final e situação sem recalcular", () => {
    const [r] = parseWorkbook([
      headers,
      [
        "Aluno fictício",
        0,
        0,
        "6,5",
        2,
        null,
        3,
        null,
        null,
        8.4,
        5,
        "Em andamento",
      ],
    ]);
    expect(r.subject).toBe("Disciplina - com hífen");
    expect(r.grades).toEqual([0, 6.5, null, null]);
    expect(r.absences).toEqual([0, 2, 3, null]);
    expect(gradeFor(r, 4)).toBe(8.4);
    expect(absenceFor(r, 4)).toBe(5);
    expect(r.situation).toBe("Em andamento");
  });
  it("ignora vínculos sem dados e linhas sem aluno", () => {
    expect(
      parseWorkbook([headers, ["A", 6, 0], ["B"], [null, 10, 2]]),
    ).toHaveLength(1);
  });
  it("rejeita formato incorreto e colunas faltantes", () => {
    expect(() => parseWorkbook([["Nome"], ["A"]])).toThrow("Aluno");
    expect(() =>
      parseWorkbook([
        ["Aluno", "Matemática - N1"],
        ["A", 7],
      ]),
    ).toThrow("incompletas");
  });
  it("rejeita notas fora da escala e faltas negativas ou fracionárias", () => {
    expect(() => parseWorkbook([headers, ["A", 11, 0]])).toThrow(
      "entre 0 e 10",
    );
    expect(() => parseWorkbook([headers, ["A", 7, -1]])).toThrow("inteiros");
    expect(() => parseWorkbook([headers, ["A", 7, 1.5]])).toThrow("inteiros");
  });
});
