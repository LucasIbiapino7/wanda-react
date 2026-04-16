import { useState, useCallback, useEffect, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import AuditoriaService from "../services/AudiroriaService";
import AuditFilters from "../components/Auditoria/AuditFilters";
import AppModal from "../components/UI/AppModal";
import "./ResearchPage.css";
import PropTypes from "prop-types";

const AGENTE_LABEL = {
  VERBOSE: "Cosmo",
  SUCCINCT: "Timmy",
  INTERMEDIATE: "Wanda",
};

const AGENTE_COR = {
  VERBOSE: "#9c27b0",
  SUCCINCT: "#ffcc00",
  INTERMEDIATE: "#4dac4a",
};

const INTERACTION_LABEL = {
  FEEDBACK: "Feedback",
  RUN: "Testar",
  SUBMIT: "Submeter",
};

const CORES_JOGO = ["#9c27b0", "#ce93d8"];
const CORES_FUNCAO = ["#9c27b0", "#ce93d8", "#e1bee7"];

const EMPTY = {
  totalInteracoes: 0,
  totalAlunosAtivos: 0,
  mediaInteracoesPorAluno: 0,
  porAgente: [],
  porJogo: [],
  porFuncao: [],
  porInteractionType: [],
};

function MetricCard({ label, value, loading }) {
  return (
    <div className="research-metric">
      <span className="research-metric__value">
        {loading ? "..." : (value ?? 0)}
      </span>
      <span className="research-metric__label">{label}</span>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h2 className="research-section-title">{children}</h2>;
}

function BarShape(cores) {
  function ShapeRenderer(props) {
    const { x, y, width, height, index } = props;
    return (
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={cores[index % cores.length]}
        rx={6}
        ry={6}
      />
    );
  }
  ShapeRenderer.propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    width: PropTypes.number,
    height: PropTypes.number,
    index: PropTypes.number.isRequired,
  };
  return ShapeRenderer;
}

export default function ResearchPage() {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));
  const seq = useRef(0);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const s = ++seq.current;
    try {
      const res = await AuditoriaService.findAgentes({ from, to });
      if (s === seq.current) setData(res);
    } catch {
      setModal({
        open: true,
        title: "Erro",
        message: "Não foi possível carregar os dados.",
        variant: "error",
      });
    } finally {
      if (s === seq.current) setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const dataAgente = data.porAgente.map((a) => ({
    name: AGENTE_LABEL[a.agente] ?? a.agente,
    key: a.agente,
    total: a.total,
    percentual: a.percentual,
    likes: a.likes,
    dislikes: a.dislikes,
  }));

  const dataJogo = data.porJogo.map((j) => ({
    name: j.jogo.charAt(0).toUpperCase() + j.jogo.slice(1),
    total: j.total,
    percentual: j.percentual,
  }));

  const dataFuncao = data.porFuncao.map((f) => ({
    name: f.funcao,
    total: f.total,
    percentual: f.percentual,
  }));

  const dataInteraction = (data.porInteractionType ?? []).map((i) => ({
    name: INTERACTION_LABEL[i.interactionType] ?? i.interactionType,
    key: i.interactionType,
    total: i.total,
    percentual: i.percentual,
  }));

  return (
    <div className="research-page">
      <div className="research-card">
        <div className="research-page__header">
          <h1 className="research-page__title">Dashboard de Pesquisa</h1>
          <p className="research-page__subtitle">
            Análise de uso dos agentes e interações
          </p>
        </div>

        <AuditFilters
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
        />

        <div className="research-metrics">
          <MetricCard
            label="Total de interações"
            value={data.totalInteracoes}
            loading={loading}
          />
          <MetricCard
            label="Alunos ativos"
            value={data.totalAlunosAtivos}
            loading={loading}
          />
          <MetricCard
            label="Média por aluno"
            value={data.mediaInteracoesPorAluno}
            loading={loading}
          />
        </div>

        <SectionTitle>Uso por agente</SectionTitle>
        <div className="research-agentes">
          {dataAgente.map((a) => (
            <div key={a.key} className="research-agente-card">
              <div className="research-agente-card__header">
                <span
                  className="research-agente-card__nome"
                  style={{ color: AGENTE_COR[a.key] }}
                >
                  {a.name}
                </span>
                <span className="research-agente-card__pct">
                  {a.percentual}%
                </span>
              </div>
              <div className="research-progress">
                <div
                  className="research-progress__bar"
                  style={{
                    width: `${a.percentual}%`,
                    background: AGENTE_COR[a.key],
                  }}
                />
              </div>
              <div className="research-agente-card__footer">
                <span>{a.total} interações</span>
                <span className="research-satisfaction">
                  👍 {a.likes} &nbsp; 👎 {a.dislikes}
                </span>
              </div>
            </div>
          ))}
        </div>

        {dataInteraction.length > 0 && (
          <>
            <SectionTitle>Interações por tipo</SectionTitle>
            <div className="research-agentes">
              {dataInteraction.map((i) => (
                <div key={i.key} className="research-agente-card">
                  <div className="research-agente-card__header">
                    <span
                      className="research-agente-card__nome"
                      style={{ color: "#9c27b0" }}
                    >
                      {i.name}
                    </span>
                    <span className="research-agente-card__pct">
                      {i.percentual}%
                    </span>
                  </div>
                  <div className="research-progress">
                    <div
                      className="research-progress__bar"
                      style={{
                        width: `${i.percentual}%`,
                        background: "#9c27b0",
                      }}
                    />
                  </div>
                  <div className="research-agente-card__footer">
                    <span>{i.total} interações</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className="research-charts">
          <div className="research-chart-block">
            <SectionTitle>Interações por jogo</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={dataJogo}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 16, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 12, fill: "#777" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 13, fill: "#333" }}
                  width={72}
                />
                <Tooltip
                  formatter={(v) => [`${v} interações`, "Total"]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar
                  dataKey="total"
                  radius={[0, 6, 6, 0]}
                  shape={BarShape(CORES_JOGO)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="research-chart-block">
            <SectionTitle>Interações por função</SectionTitle>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart
                data={dataFuncao}
                layout="vertical"
                margin={{ top: 0, right: 24, left: 16, bottom: 0 }}
              >
                <XAxis type="number" tick={{ fontSize: 12, fill: "#777" }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#333", fontFamily: "monospace" }}
                  width={80}
                />
                <Tooltip
                  formatter={(v) => [`${v} interações`, "Total"]}
                  contentStyle={{ borderRadius: 8, fontSize: 13 }}
                />
                <Bar
                  dataKey="total"
                  radius={[0, 6, 6, 0]}
                  shape={BarShape(CORES_FUNCAO)}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <AppModal
        open={modal.open}
        onClose={closeModal}
        title={modal.title}
        variant={modal.variant}
        primaryAction={{ id: "modal-ok", label: "Ok", onClick: closeModal }}
        initialFocus="modal-ok"
      >
        <p>{modal.message}</p>
      </AppModal>
    </div>
  );
}

MetricCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  loading: PropTypes.bool,
};

SectionTitle.propTypes = {
  children: PropTypes.node.isRequired,
};
