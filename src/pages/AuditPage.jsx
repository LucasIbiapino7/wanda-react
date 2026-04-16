import { useState, useCallback, useEffect, useRef } from "react";
import AuditoriaService from "../services/AudiroriaService";
import AuditFilters from "../components/Auditoria/AuditFilters";
import AuditTable from "../components/Auditoria/AuditTable";
import AppModal from "../components/UI/AppModal";
import "./AuditPage.css";
import PropTypes from "prop-types";

const EMPTY_PAGE = { content: [], totalElements: 0, totalPages: 0, number: 0 };

const ABAS = [
  { key: "usuarios", label: "Usuários" },
  { key: "funcoes", label: "Funções" },
  { key: "partidas", label: "Partidas" },
  { key: "funcoes-usuario", label: "Funções por usuário" },
];

function formatDate(raw) {
  if (!raw) return "—";
  return new Date(raw).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const COLUMNS_USUARIOS = [
  { header: "Nome", render: (u) => u.name },
  { header: "E-mail", render: (u) => u.email },
  {
    header: "Perfil",
    render: (u) => (
      <span className={`audit-tag audit-tag--${u.profileType?.toLowerCase()}`}>
        {u.profileType}
      </span>
    ),
  },
  { header: "Cadastro", render: (u) => formatDate(u.createdAt) },
];

const COLUMNS_FUNCOES = [
  { header: "Aluno", render: (f) => f.playerName },
  { header: "E-mail", render: (f) => f.playerEmail },
  {
    header: "Jogo",
    render: (f) => (
      <span className="audit-tag audit-tag--jogo">{f.gameName}</span>
    ),
  },
  { header: "Função", render: (f) => <code>{f.functionName}</code> },
  { header: "Criada em", render: (f) => formatDate(f.createdAt) },
];

const COLUMNS_PARTIDAS = [
  {
    header: "Jogador 1",
    render: (m) => (
      <div>
        <div>{m.playerName1}</div>
        <div className="audit-email">{m.emailPlayer1}</div>
      </div>
    ),
  },
  {
    header: "Jogador 2",
    render: (m) => (
      <div>
        <div>{m.playerName2}</div>
        <div className="audit-email">{m.emailPlayer2}</div>
      </div>
    ),
  },
  {
    header: "Jogo",
    render: (m) => (
      <span className="audit-tag audit-tag--jogo">{m.gameName}</span>
    ),
  },
  { header: "Vencedor", render: (m) => m.winnerName || "—" },
  { header: "Data", render: (m) => formatDate(m.moment) },
];

const ABA_CONFIG = {
  usuarios: { columns: COLUMNS_USUARIOS },
  funcoes: { columns: COLUMNS_FUNCOES },
  partidas: { columns: COLUMNS_PARTIDAS },
};

function CountCard({ label, value, loading }) {
  return (
    <div className="audit-count-card">
      <span className="audit-count-card__value">
        {loading ? "..." : (value ?? 0)}
      </span>
      <span className="audit-count-card__label">{label}</span>
    </div>
  );
}

function Pagination({ data, onPageChange, loading }) {
  const canPrev = data.number > 0;
  const canNext = data.number + 1 < (data.totalPages ?? 0);
  return (
    <div className="audit-pagination">
      <button
        className="audit-btn-outline"
        disabled={!canPrev || loading}
        onClick={() => onPageChange(data.number - 1)}
      >
        Anterior
      </button>
      <span>
        Página {(data.number ?? 0) + 1} de {data.totalPages ?? 1}
      </span>
      <button
        className="audit-btn-outline"
        disabled={!canNext || loading}
        onClick={() => onPageChange(data.number + 1)}
      >
        Próxima
      </button>
    </div>
  );
}

function FuncoesUsuario({ showError }) {
  const [email, setEmail] = useState("");
  const [funcoes, setFuncoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscou, setBuscou] = useState(false);

  const handleBuscar = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setBuscou(false);
    try {
      const res = await AuditoriaService.findFuncoesPorUsuario(email.trim());
      setFuncoes(res);
      setBuscou(true);
    } catch {
      showError("Usuário não encontrado ou erro ao buscar funções.");
      setFuncoes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleBuscar();
  };

  return (
    <div className="audit-funcoes-usuario">
      <div className="audit-funcoes-usuario__search">
        <input
          type="email"
          className="audit-input"
          placeholder="E-mail do usuário"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="audit-btn-primary"
          onClick={handleBuscar}
          disabled={loading || !email.trim()}
        >
          {loading ? "Buscando..." : "Buscar"}
        </button>
      </div>

      {buscou && funcoes.length === 0 && (
        <p className="audit-empty">
          Nenhuma função cadastrada para este usuário.
        </p>
      )}

      {funcoes.map((f) => (
        <div key={f.id} className="audit-funcao-card">
          <div className="audit-funcao-card__header">
            <span className="audit-tag audit-tag--jogo">{f.gameName}</span>
            <code className="audit-funcao-card__nome">{f.functionName}</code>
            <span className="audit-funcao-card__data">
              {f.updatedAt ? formatDate(f.updatedAt) : "—"}
            </span>
          </div>
          <pre className="audit-funcao-card__code">{f.code}</pre>
        </div>
      ))}
    </div>
  );
}

export default function AuditPage() {
  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("usuarios");

  const [usuarios, setUsuarios] = useState(EMPTY_PAGE);
  const [funcoes, setFuncoes] = useState(EMPTY_PAGE);
  const [partidas, setPartidas] = useState(EMPTY_PAGE);

  const [loadingU, setLoadingU] = useState(false);
  const [loadingF, setLoadingF] = useState(false);
  const [loadingP, setLoadingP] = useState(false);

  const [modal, setModal] = useState({
    open: false,
    title: "",
    message: "",
    variant: "default",
  });
  const closeModal = () => setModal((m) => ({ ...m, open: false }));

  const seqU = useRef(0);
  const seqF = useRef(0);
  const seqP = useRef(0);

  const showError = (msg) =>
    setModal({
      open: true,
      title: "Erro ao carregar dados",
      message: msg,
      variant: "error",
    });

  const fetchUsuarios = useCallback(
    async (page = 0) => {
      setLoadingU(true);
      const seq = ++seqU.current;
      try {
        const res = await AuditoriaService.findUsuarios({ from, to, page });
        if (seq === seqU.current) setUsuarios(res);
      } catch {
        showError("Não foi possível carregar os usuários.");
      } finally {
        if (seq === seqU.current) setLoadingU(false);
      }
    },
    [from, to],
  );

  const fetchFuncoes = useCallback(
    async (page = 0) => {
      setLoadingF(true);
      const seq = ++seqF.current;
      try {
        const res = await AuditoriaService.findFuncoesCriadas({
          from,
          to,
          page,
        });
        if (seq === seqF.current) setFuncoes(res);
      } catch {
        showError("Não foi possível carregar as funções.");
      } finally {
        if (seq === seqF.current) setLoadingF(false);
      }
    },
    [from, to],
  );

  const fetchPartidas = useCallback(
    async (page = 0) => {
      setLoadingP(true);
      const seq = ++seqP.current;
      try {
        const res = await AuditoriaService.findPartidas({ from, to, page });
        if (seq === seqP.current) setPartidas(res);
      } catch {
        showError("Não foi possível carregar as partidas.");
      } finally {
        if (seq === seqP.current) setLoadingP(false);
      }
    },
    [from, to],
  );

  useEffect(() => {
    fetchUsuarios(0);
  }, [fetchUsuarios]);
  useEffect(() => {
    fetchFuncoes(0);
  }, [fetchFuncoes]);
  useEffect(() => {
    fetchPartidas(0);
  }, [fetchPartidas]);

  const handlePageChange = (page) => {
    if (abaAtiva === "usuarios") fetchUsuarios(page);
    if (abaAtiva === "funcoes") fetchFuncoes(page);
    if (abaAtiva === "partidas") fetchPartidas(page);
  };

  const activeData =
    abaAtiva === "usuarios"
      ? usuarios
      : abaAtiva === "funcoes"
        ? funcoes
        : partidas;

  const activeLoading =
    abaAtiva === "usuarios"
      ? loadingU
      : abaAtiva === "funcoes"
        ? loadingF
        : loadingP;

  const isCustomAba = abaAtiva === "funcoes-usuario";

  return (
    <div className="audit-page">
      <div className="audit-card">
        <div className="audit-page__header">
          <h1 className="audit-page__title">Auditoria</h1>
          <p className="audit-page__subtitle">Registros de uso por período</p>
        </div>

        {!isCustomAba && (
          <>
            <AuditFilters
              from={from}
              to={to}
              onFromChange={setFrom}
              onToChange={setTo}
            />
            <div className="audit-counts">
              <CountCard
                label="Usuários cadastrados"
                value={usuarios.totalElements}
                loading={loadingU}
              />
              <CountCard
                label="Funções submetidas"
                value={funcoes.totalElements}
                loading={loadingF}
              />
              <CountCard
                label="Partidas realizadas"
                value={partidas.totalElements}
                loading={loadingP}
              />
            </div>
          </>
        )}

        <div className="audit-tabs">
          {ABAS.map((a) => (
            <button
              key={a.key}
              className={`audit-tab ${abaAtiva === a.key ? "audit-tab--active" : ""}`}
              onClick={() => setAbaAtiva(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>

        {isCustomAba ? (
          <FuncoesUsuario showError={showError} />
        ) : (
          <>
            <AuditTable
              columns={ABA_CONFIG[abaAtiva]?.columns ?? []}
              data={activeData}
              loading={activeLoading}
            />
            <Pagination
              data={activeData}
              onPageChange={handlePageChange}
              loading={activeLoading}
            />
          </>
        )}

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
    </div>
  );
}

CountCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  loading: PropTypes.bool,
};

Pagination.propTypes = {
  data: PropTypes.shape({
    number: PropTypes.number,
    totalPages: PropTypes.number,
  }).isRequired,
  onPageChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

FuncoesUsuario.propTypes = {
  showError: PropTypes.func.isRequired,
};
