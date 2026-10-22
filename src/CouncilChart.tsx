import { useEffect, useRef } from "react";
import { X, ChartNoAxesCombined } from "lucide-react";
import { councilRows } from "./council";
import { periods, type Result } from "./data";

export function CouncilChart({
  data,
  period,
  subjects,
  onClose,
}: {
  data: Result[];
  period: number;
  subjects: string[];
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const ranking = councilRows(data, period, true, "attention");
  const max = Math.max(1, ...ranking.map((row) => row.below));
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    const trapFocus = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const nodes = element.querySelectorAll<HTMLElement>(
        'button, [tabindex="0"]',
      );
      const first = nodes[0],
        last = nodes[nodes.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    element.addEventListener("keydown", trapFocus);
    return () => {
      element.removeEventListener("keydown", trapFocus);
      element.close();
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={dialog}
      className="ranking-dialog"
      aria-labelledby="ranking-title"
      aria-describedby="ranking-description"
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          const rect = e.currentTarget.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          )
            onClose();
        }
      }}
    >
      <button
        className="modal-close icon-button"
        aria-label="Fechar gráfico"
        onClick={onClose}
        autoFocus
      >
        <X size={22} />
      </button>
      <div className="eyebrow">VISÃO DO CONSELHO</div>
      <h2 id="ranking-title">Alunos com mais notas abaixo de 6,0</h2>
      <p id="ranking-description">
        {periods[period]} ·{" "}
        {subjects.length === 1
          ? subjects[0]
          : `${subjects.length} disciplinas no recorte`}
        . Cada barra mostra a quantidade de disciplinas com nota abaixo de 6,0.
      </p>
      {ranking.length ? (
        <>
          <div className="ranking-summary">
            <strong>
              {ranking.length} {ranking.length === 1 ? "aluno" : "alunos"} em
              atenção
            </strong>
            <span>Do maior para o menor número de disciplinas</span>
          </div>
          <div
            className="ranking-scroll"
            role="region"
            aria-label="Ranking de alunos"
            tabIndex={0}
          >
            <ol className="ranking-list">
              {ranking.map((row, index) => (
                <li
                  key={row.student}
                  aria-label={`${index + 1}º: ${row.student}, ${row.below} ${row.below === 1 ? "disciplina" : "disciplinas"} abaixo de 6,0`}
                >
                  <div className="ranking-label">
                    <span className="ranking-position">{index + 1}.</span>
                    <strong>{row.student}</strong>
                    <span className="ranking-value">
                      {row.below}{" "}
                      {row.below === 1 ? "disciplina" : "disciplinas"}
                    </span>
                  </div>
                  <div className="ranking-track" aria-hidden="true">
                    <div
                      className="ranking-bar"
                      style={{ width: `${(row.below / max) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ol>
            <div className="ranking-axis" aria-hidden="true">
              <span>0</span>
              <span>
                {max} {max === 1 ? "disciplina" : "disciplinas"}
              </span>
            </div>
          </div>
        </>
      ) : (
        <div className="empty-state">
          <ChartNoAxesCombined size={32} />
          <h3>Nenhum aluno com nota abaixo de 6,0</h3>
          <p>
            Não há notas abaixo da média nos filtros e no período selecionados.
            Campos sem registro não entram na contagem.
          </p>
        </div>
      )}
      <p className="ranking-note">
        O gráfico respeita os filtros de aluno, disciplina e busca. Notas iguais
        a 6,0 e campos sem registro não entram na contagem.{" "}
        {period === 4
          ? "São usadas as médias finais informadas na planilha."
          : "São usadas as notas do bimestre selecionado."}
      </p>
    </dialog>
  );
}
