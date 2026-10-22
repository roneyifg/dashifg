import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Upload,
  LayoutDashboard,
  GraduationCap,
  ChevronDown,
  Search,
  ArrowUpRight,
  Users,
  BookOpen,
  CircleAlert,
  X,
  ShieldCheck,
  FileSpreadsheet,
  RotateCcw,
  ArrowDown,
  Check,
  Menu,
} from "lucide-react";
import {
  demo,
  periods,
  parseWorkbook,
  gradeFor,
  absenceFor,
  type Result,
} from "./data";
import "./style.css";
import { CouncilMatrix } from "./CouncilMatrix";
const fmt = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(v);
function Grade({ value }: { value: number | null }) {
  return (
    <span
      className={`grade ${value == null ? "empty" : value < 6 ? "low" : "good"}`}
    >
      {fmt(value)}
    </span>
  );
}
function App() {
  const [data, setData] = useState<Result[]>(demo);
  const [fileName, setFileName] = useState("Dados demonstrativos");
  const [isDemo, setIsDemo] = useState(true);
  const [period, setPeriod] = useState(0);
  const [subject, setSubject] = useState("");
  const [student, setStudent] = useState("");
  const [query, setQuery] = useState("");
  const [attention, setAttention] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("council");
  const [mobile, setMobile] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLElement>(null);
  useEffect(() => {
    if (!selected) return;
    const previous = document.activeElement as HTMLElement | null;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
      if (e.key === "Tab") {
        const elements = modalRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], input, select, [tabindex="0"]',
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [selected]);
  const subjects = [...new Set(data.map((r) => r.subject))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const students = [...new Set(data.map((r) => r.student))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const filtered = data.filter(
    (r) =>
      (!subject || r.subject === subject) &&
      (!student || r.student === student) &&
      r.student
        .toLocaleLowerCase("pt-BR")
        .includes(query.toLocaleLowerCase("pt-BR")),
  );
  const shown = filtered.filter(
    (r) =>
      !attention || (gradeFor(r, period) != null && gradeFor(r, period)! < 6),
  );
  const grades = filtered
    .map((r) => gradeFor(r, period))
    .filter((v): v is number => v != null);
  const average = grades.length
    ? grades.reduce((a, b) => a + b, 0) / grades.length
    : null;
  const atRisk = new Set(
    filtered
      .filter((r) => gradeFor(r, period) != null && gradeFor(r, period)! < 6)
      .map((r) => r.student),
  ).size;
  const absenceValues = filtered
    .map((r) => absenceFor(r, period))
    .filter((v): v is number => v != null);
  const absenceTotal = absenceValues.length
    ? absenceValues.reduce((a, b) => a + b, 0)
    : null;
  function reset() {
    setSubject("");
    setStudent("");
    setQuery("");
    setAttention(false);
  }
  async function upload(file?: File) {
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      if (!file.name.toLowerCase().endsWith(".xlsx"))
        throw new Error("Selecione uma planilha no formato .xlsx.");
      if (file.size > 15 * 1024 * 1024)
        throw new Error("O limite para importação é de 15 MB.");
      const { readWorkbook } = await import("./excel");
      const rows = await readWorkbook(await file.arrayBuffer());
      const records = parseWorkbook(rows);
      setData(records);
      setFileName(file.name);
      setIsDemo(false);
      reset();
      setSelected(null);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Não foi possível ler a planilha. Confira o formato do arquivo.",
      );
    } finally {
      setLoading(false);
      if (input.current) input.current.value = "";
    }
  }
  return (
    <div className="shell">
      <aside className={mobile ? "sidebar open" : "sidebar"}>
        <a className="brand" href="#" aria-label="DashIFG início">
          <span className="brand-icon">
            <GraduationCap size={24} />
          </span>
          <span>
            Dash<span className="brand-light">IFG</span>
            <small>CONSELHO DE CLASSE</small>
          </span>
        </a>
        <div className="nav-label">ESPAÇO ACADÊMICO</div>
        <nav>
          <button
            className={tab === "council" ? "active" : ""}
            onClick={() => {
              setTab("council");
              setMobile(false);
            }}
          >
            <GraduationCap size={18} />
            Visão do conselho
          </button>
          <button
            className={tab === "overview" ? "active" : ""}
            onClick={() => {
              setTab("overview");
              setMobile(false);
            }}
          >
            <LayoutDashboard size={18} />
            Visão geral
            <span className="nav-dot" />
          </button>
          <button
            className={tab === "students" ? "active" : ""}
            onClick={() => {
              setTab("students");
              setMobile(false);
            }}
          >
            <Users size={18} />
            Alunos
          </button>
        </nav>
        <div className="sidebar-card">
          <div className="shield">
            <ShieldCheck size={22} />
          </div>
          <strong>Seus dados ficam aqui.</strong>
          <p>A planilha é processada apenas no seu navegador.</p>
          <span>
            Privacidade por padrão <Check size={13} />
          </span>
        </div>
        <div className="sidebar-footer">
          <span className="institution">IF</span>
          <div>
            Conselho de Classe<small>Painel de acompanhamento</small>
          </div>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <button
              className="mobile-menu icon-button"
              aria-label="Abrir menu"
              onClick={() => setMobile(!mobile)}
            >
              <Menu size={20} />
            </button>
            <span>Espaço acadêmico</span>
            <span className="slash">/</span>
            <strong>
              {tab === "council"
                ? "Visão do conselho"
                : tab === "overview"
                  ? "Visão geral"
                  : "Alunos"}
            </strong>
          </div>
          <span className="top-badge">
            <span />
            Ambiente local
          </span>
        </header>
        <div className="content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">ACOMPANHAMENTO PEDAGÓGICO</div>
              <h1>
                {tab === "council"
                  ? "A turma inteira, em um olhar."
                  : tab === "overview"
                    ? "Cada aluno, uma trajetória."
                    : "Um olhar para cada aluno."}
              </h1>
              <p>
                Notas e frequência reunidas para um conselho mais informado.
              </p>
            </div>
            <button
              className="primary"
              disabled={loading}
              onClick={() => input.current?.click()}
            >
              <Upload size={17} />
              {loading ? "Importando…" : "Importar planilha"}
            </button>
          </div>
          <input
            ref={input}
            type="file"
            accept=".xlsx"
            aria-label="Selecionar planilha Excel"
            className="file-input"
            onChange={(e) => upload(e.target.files?.[0])}
          />
          {error && (
            <div role="alert" className="error">
              <CircleAlert size={18} />
              {error}
              <button aria-label="Fechar erro" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          <div className="source-banner">
            <div className="source-icon">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <strong>
                {isDemo ? "Explore o painel com dados de exemplo" : fileName}
              </strong>
              <span>
                {isDemo
                  ? "Importe sua planilha para visualizar os dados reais da sua turma."
                  : `${students.length} alunos · ${subjects.length} disciplinas · Importação concluída`}
              </span>
            </div>
            <span className={isDemo ? "tag demo-tag" : "tag imported-tag"}>
              {isDemo ? "DEMONSTRAÇÃO" : "IMPORTADO"}
            </span>
          </div>
          <section className="filters" aria-label="Filtros">
            <div className="filter-title">
              <span>Filtrar resultados</span>
              <button className="text-button" onClick={reset}>
                <RotateCcw size={13} />
                Limpar filtros
              </button>
            </div>
            <div className="filter-grid">
              <label>
                Aluno
                <div className="select-wrap">
                  <Users size={16} />
                  <select
                    value={student}
                    onChange={(e) => setStudent(e.target.value)}
                  >
                    <option value="">Todos os alunos</option>
                    {students.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </label>
              <label>
                Disciplina
                <div className="select-wrap">
                  <BookOpen size={16} />
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
                    <option value="">Todas as disciplinas</option>
                    {subjects.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </label>
              <label>
                Período
                <div className="select-wrap">
                  <LayoutDashboard size={16} />
                  <select
                    value={period}
                    onChange={(e) => setPeriod(Number(e.target.value))}
                  >
                    {periods.map((p, i) => (
                      <option value={i} key={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} />
                </div>
              </label>
            </div>
          </section>
          <div className="stats">
            <Stat
              label="Alunos no recorte"
              value={String(new Set(filtered.map((r) => r.student)).size)}
              text="Alunos com registros nos filtros"
              icon={<Users size={19} />}
              color="green"
            />
            <Stat
              label="Média das notas"
              value={fmt(average)}
              text={`${grades.length} notas registradas · escala de 0 a 10`}
              icon={<BookOpen size={19} />}
              color="blue"
            />
            <Stat
              label="Precisam de atenção"
              value={String(atRisk)}
              text="Alunos com alguma nota abaixo de 6,0"
              icon={<CircleAlert size={19} />}
              color="orange"
            />
            <Stat
              label="Faltas registradas"
              value={fmt(absenceTotal)}
              text="Soma das faltas no período selecionado"
              icon={<ArrowDown size={19} />}
              color="purple"
            />
          </div>
          <section className="results">
            <div className="results-heading">
              <div>
                <h2>
                  {tab === "council"
                    ? "Matriz do conselho"
                    : tab === "overview"
                      ? "Desempenho da turma"
                      : "Alunos e disciplinas"}
                  {tab !== "council" && (
                    <span className="count">{shown.length}</span>
                  )}
                </h2>
                <p>Um olhar sobre as notas e faltas de cada aluno.</p>
              </div>
              <div className="legend">
                <span>
                  <i className="green-dot" />
                  Média atingida
                </span>
                <span>
                  <i className="orange-dot" />
                  Abaixo de 6,0
                </span>
              </div>
            </div>
            <div className="table-toolbar">
              <div className="search">
                <Search size={16} />
                <input
                  aria-label="Buscar aluno"
                  placeholder="Buscar aluno pelo nome…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <button
                className={attention ? "attention selected" : "attention"}
                aria-pressed={attention}
                onClick={() => setAttention(!attention)}
              >
                <CircleAlert size={15} />
                Somente atenção{attention && <Check size={14} />}
              </button>
              <span className="period-label">{periods[period]}</span>
            </div>
            {tab === "council" ? (
              <CouncilMatrix
                data={filtered}
                subjects={subject ? [subject] : subjects}
                period={period}
                attention={attention}
                onSelect={setSelected}
                onReset={reset}
              />
            ) : (
              <div className="table-scroll">
                {tab === "students" ? (
                  <table>
                    <thead>
                      <tr>
                        <th>ALUNO</th>
                        <th>DISCIPLINAS NO RECORTE</th>
                        <th>MÉDIA DAS NOTAS</th>
                        <th>FALTAS</th>
                        <th>NOTAS ABAIXO DE 6,0</th>
                        <th aria-label="Histórico" />
                      </tr>
                    </thead>
                    <tbody>
                      {[...new Set(shown.map((r) => r.student))].map((name) => {
                        const records = shown.filter((r) => r.student === name);
                        const notes = records
                          .map((r) => gradeFor(r, period))
                          .filter((g): g is number => g != null);
                        const absences = records
                          .map((r) => absenceFor(r, period))
                          .filter((f): f is number => f != null);
                        return (
                          <tr key={name}>
                            <td>
                              <button
                                className="student-name"
                                onClick={() => setSelected(name)}
                              >
                                <span
                                  className={`avatar avatar-${students.indexOf(name) % 4}`}
                                >
                                  {name
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                                <strong>{name}</strong>
                              </button>
                            </td>
                            <td>{records.length}</td>
                            <td>
                              <Grade
                                value={
                                  notes.length
                                    ? notes.reduce((a, b) => a + b, 0) /
                                      notes.length
                                    : null
                                }
                              />
                            </td>
                            <td>
                              {absences.length
                                ? fmt(absences.reduce((a, b) => a + b, 0))
                                : "—"}
                            </td>
                            <td>{notes.filter((n) => n < 6).length}</td>
                            <td>
                              <button
                                className="icon-button"
                                aria-label={`Ver histórico de ${name}`}
                                onClick={() => setSelected(name)}
                              >
                                <ArrowUpRight size={17} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <table>
                    <thead>
                      <tr>
                        <th>ALUNO</th>
                        <th>DISCIPLINA</th>
                        <th>{period === 4 ? "MÉDIA FINAL" : "NOTA"}</th>
                        <th>FALTAS</th>
                        <th>INDICADOR DA NOTA</th>
                        <th aria-label="Detalhes" />
                      </tr>
                    </thead>
                    <tbody>
                      {shown.map((r, i) => {
                        const grade = gradeFor(r, period);
                        return (
                          <tr key={`${r.student}-${r.subject}-${i}`}>
                            <td>
                              <button
                                className="student-name"
                                onClick={() => setSelected(r.student)}
                              >
                                <span
                                  className={`avatar avatar-${students.indexOf(r.student) % 4}`}
                                >
                                  {r.student
                                    .split(" ")
                                    .slice(0, 2)
                                    .map((n) => n[0])
                                    .join("")}
                                </span>
                                <strong>{r.student}</strong>
                              </button>
                            </td>
                            <td className="subject-cell">{r.subject}</td>
                            <td>
                              <Grade value={grade} />
                            </td>
                            <td className="absence-cell">
                              {fmt(absenceFor(r, period))}
                            </td>
                            <td>
                              <span
                                className={`status ${grade == null ? "neutral" : grade < 6 ? "warning" : "success"}`}
                              >
                                <i />
                                {grade == null
                                  ? "Sem registro"
                                  : grade < 6
                                    ? "Precisa de atenção"
                                    : "Média atingida"}
                              </span>
                            </td>
                            <td>
                              <button
                                className="icon-button"
                                aria-label={`Ver histórico de ${r.student}`}
                                onClick={() => setSelected(r.student)}
                              >
                                <ArrowUpRight size={17} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
                {!shown.length && (
                  <div className="empty-state">
                    <Search size={28} />
                    <h3>Nenhum resultado encontrado</h3>
                    <p>Tente outro aluno ou disciplina, ou limpe os filtros.</p>
                    <button className="text-button" onClick={reset}>
                      Limpar filtros
                    </button>
                  </div>
                )}
              </div>
            )}
            {tab !== "council" && (
              <div className="table-footer">
                <span>
                  {shown.length} registros ·{" "}
                  {new Set(shown.map((r) => r.student)).size} alunos
                </span>
                <span>“—” indica informação sem registro</span>
              </div>
            )}
          </section>
          <footer className="page-footer">
            <span>
              <ShieldCheck size={14} />
              Dados processados localmente · Nada é enviado a um servidor
            </span>
            <span>DashIFG · Conselho de Classe</span>
          </footer>
        </div>
      </main>
      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <section
            ref={modalRef}
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={`Histórico de ${selected}`}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSelected(null);
            }}
          >
            <button
              autoFocus
              className="modal-close icon-button"
              aria-label="Fechar histórico"
              onClick={() => setSelected(null)}
            >
              <X size={22} />
            </button>
            <div className="eyebrow">TRAJETÓRIA INDIVIDUAL</div>
            <h2>{selected}</h2>
            <p>Histórico completo por disciplina. N = nota · F = faltas.</p>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>DISCIPLINA</th>
                    {periods.slice(0, 4).map((p) => (
                      <th key={p}>{p}</th>
                    ))}
                    <th>FINAL</th>
                    <th>SITUAÇÃO INFORMADA</th>
                  </tr>
                </thead>
                <tbody>
                  {data
                    .filter((r) => r.student === selected)
                    .map((r, i) => (
                      <tr key={i}>
                        <td>{r.subject}</td>
                        {r.grades.map((g, j) => (
                          <td key={j}>
                            <Grade value={g} />
                            <small className="detail-absence">
                              F: {fmt(r.absences[j])}
                            </small>
                          </td>
                        ))}
                        <td>
                          <Grade value={r.finalGrade} />
                          <small className="detail-absence">
                            F: {fmt(r.totalAbsences)}
                          </small>
                        </td>
                        <td>{r.situation || "Sem registro"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
            <div className="modal-note">
              <CircleAlert size={16} />A situação final é preservada da
              planilha. Os destaques de nota usam a média mínima 6,0.
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
function Stat({
  label,
  value,
  text,
  icon,
  color,
}: {
  label: string;
  value: string;
  text: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <section className={`stat ${color}`}>
      <div className="stat-top">
        <span>{label}</span>
        <span className="stat-icon">{icon}</span>
      </div>
      <strong className="stat-value">{value}</strong>
      <p>{text}</p>
    </section>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
