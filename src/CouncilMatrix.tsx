import { useState } from "react";
import { ArrowUpRight, ChartNoAxesCombined } from "lucide-react";
import { absenceFor, gradeFor, periods, type Result } from "./data";
import { councilRows } from "./council";
import { CouncilChart } from "./CouncilChart";
export function CouncilMatrix({
  data,
  subjects,
  period,
  attention,
  onSelect,
  onReset,
}: {
  data: Result[];
  subjects: string[];
  period: number;
  attention: boolean;
  onSelect: (name: string) => void;
  onReset: () => void;
}) {
  const [order, setOrder] = useState<"attention" | "name">("attention");
  const [chartOpen, setChartOpen] = useState(false);
  const rows = councilRows(data, period, attention, order);
  const fmt = (n: number | null) =>
    n == null ? "—" : n.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
  return (
    <>
      <div className="matrix-options">
        <p id="matrix-help">
          Cada linha é um aluno. Clique no nome para consultar o histórico.
          Deslize para ver todas as disciplinas.
        </p>
        <div className="matrix-actions">
          <button
            className="primary chart-button"
            onClick={() => setChartOpen(true)}
          >
            <ChartNoAxesCombined size={17} />
            Ver gráfico
          </button>
          <label>
            Ordenar por
            <select
              value={order}
              onChange={(e) => setOrder(e.target.value as typeof order)}
            >
              <option value="attention">Mais disciplinas abaixo de 6,0</option>
              <option value="name">Nome do aluno (A–Z)</option>
            </select>
          </label>
        </div>
      </div>
      {chartOpen && (
        <CouncilChart
          data={data}
          period={period}
          subjects={subjects}
          onClose={() => setChartOpen(false)}
        />
      )}
      <div
        className="table-scroll matrix-scroll"
        role="region"
        aria-label="Matriz do conselho"
        tabIndex={0}
      >
        <table className="council-matrix" aria-describedby="matrix-help">
          <caption className="sr-only">
            Notas e faltas por aluno e disciplina — {periods[period]}
          </caption>
          <thead>
            <tr>
              <th scope="col" className="matrix-student">
                ALUNO
              </th>
              <th scope="col" className="matrix-count">
                ABAIXO DE 6,0
              </th>
              {subjects.map((subject) => (
                <th scope="col" key={subject}>
                  {subject}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.student}>
                <th scope="row" className="matrix-student">
                  <button
                    className="student-name"
                    onClick={() => onSelect(row.student)}
                  >
                    <strong>{row.student}</strong>
                    <ArrowUpRight size={15} />
                  </button>
                </th>
                <td className="matrix-count">
                  <span className={row.below ? "matrix-risk" : "matrix-zero"}>
                    {row.below}
                  </span>
                  <small>disciplinas</small>
                </td>
                {subjects.map((subject) => {
                  const record = row.records.get(subject);
                  const grade = record ? gradeFor(record, period) : null;
                  const absence = record ? absenceFor(record, period) : null;
                  const status =
                    grade == null
                      ? "Sem registro de nota"
                      : grade < 6
                        ? "Abaixo da média"
                        : "Média atingida";
                  return (
                    <td key={subject}>
                      <span
                        className={`grade ${grade == null ? "empty" : grade < 6 ? "low" : "good"}`}
                        aria-label={`${subject}: ${grade == null ? "sem registro de nota" : `nota ${fmt(grade)}, ${status}`}`}
                      >
                        {fmt(grade)}
                      </span>
                      <small className="matrix-faltas">
                        {record ? `Faltas: ${fmt(absence)}` : "Sem vínculo"}
                      </small>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!rows.length && (
        <div className="empty-state">
          <h3>Nenhum aluno encontrado</h3>
          <p>
            {attention
              ? "Nenhum aluno tem nota abaixo de 6,0 neste recorte."
              : "Tente outros filtros ou uma nova busca."}
          </p>
          <button className="text-button" onClick={onReset}>
            Limpar filtros
          </button>
        </div>
      )}
      <div className="matrix-summary" role="status">
        {rows.length} alunos · {subjects.length} disciplinas · {periods[period]}
        <span>“—” = sem registro · 0 = nota ou falta registrada como zero</span>
      </div>
    </>
  );
}
