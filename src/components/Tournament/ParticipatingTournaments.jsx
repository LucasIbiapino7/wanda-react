import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./ParticipatingTournaments.css";
import TournamentManagerModal from "./TournamentManagerModal";
import AppModal from "../UI/AppModal";

const GAME_LOGOS = {
  jokenpo: "/assets/games/jokenpo-logo.png",
  bits: "/assets/games/bits-logo.png",
};

const STATUS_LABEL = {
  OPEN: "Aberto",
  RUNNING: "Em andamento",
  FINISHED: "Finalizado",
  CANCELLED: "Cancelado",
  ERROR: "Erro",
};

const STATUS_COLOR = {
  OPEN: "#4dac4a",
  RUNNING: "#4da6ff",
  FINISHED: "#aaa",
  CANCELLED: "#ff6b6b",
  ERROR: "#ff4444",
};

export default function ParticipatingTournaments() {
  const { token, user } = useContext(AuthContext);

  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startLoadingId, setStartLoadingId] = useState(null);
  const [managerModal, setManagerModal] = useState({ open: false, tournament: null });
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  const fetchParticipating = useCallback(
    async (pageNum = 0) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/tournament/participating`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { size: 5, page: pageNum },
          }
        );
        setTournaments(data?.content ?? []);
        setTotalPages(data?.totalPages ?? 0);
        setPage(pageNum);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar seus torneios.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) fetchParticipating(page);
  }, [token, page, fetchParticipating]);

  const handleStartTournament = async (id) => {
    setStartLoadingId(id);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/tournament/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchParticipating(page);
    } catch (err) {
      const data = err?.response?.data;
      const msg = data?.message || data?.error || "Não foi possível iniciar o torneio. Tente novamente.";
      setErrorModal({ open: true, message: msg });
    } finally {
      setStartLoadingId(null);
    }
  };

  const handleOpenManager = (tournament) => {
    setManagerModal({ open: true, tournament });
  };

  const handleCloseManager = () => {
    setManagerModal({ open: false, tournament: null });
    fetchParticipating(page);
  };

  const renderCountdown = (startTime, status) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start - now;
    if (status === "FINISHED") return "Finalizado";
    if (status === "CANCELLED") return "Cancelado";
    if (diffMs <= 0) return "Em andamento";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  const creatorDisplay = (creator) =>
    creator?.nickname?.trim() ? creator.nickname : creator?.name || "—";

  const ativos = tournaments.filter(
    (t) => t.status === "OPEN" || t.status === "RUNNING"
  );
  const finalizados = tournaments.filter((t) => t.status === "FINISHED");
  const cancelados = tournaments.filter((t) => t.status === "CANCELLED");
  const comErro = tournaments.filter((t) => t.status === "ERROR");

  const renderCardCompleto = (t) => {
    const full = t.currentParticipants >= t.maxParticipants;
    const isCreator = user?.id === t.creator?.id;
    const isFinished = t.status === "FINISHED";

    let borderColor = "#ffb84d";
    if (t.canReady) borderColor = "#4da6ff";
    else if (t.status === "RUNNING") borderColor = "#4da6ff";
    else if (isFinished) borderColor = "#f0b429";

    const gameKey = String(t.game?.name || "").toLowerCase().trim();
    const gameLogo = GAME_LOGOS[gameKey] || null;

    return (
      <div
        key={t.id}
        className={`tournament-card ${isFinished ? "tournament-card--finished" : ""}`}
        style={{ borderLeft: `6px solid ${borderColor}` }}
      >
        <div className="card-header">
          <h4 className="card-title">{t.name}</h4>
          <span
            className="status-badge"
            style={{ backgroundColor: STATUS_COLOR[t.status] ?? "#888" }}
          >
            {STATUS_LABEL[t.status] ?? t.status}
          </span>
        </div>

        <p className="creator-line">
          Criado por: <strong>{creatorDisplay(t.creator)}</strong>
        </p>

        {isFinished && t.winnerId && (
          <p className="winner-line">
            🏆 Vencedor: <strong>{t.winnerId.name}</strong>
          </p>
        )}

        {t.game && (
          <div className="game-info">
            <div className="game-row">
              {gameLogo && (
                <img
                  src={gameLogo}
                  className="game-logo"
                  alt={`Logo ${t.game?.name ?? "jogo"}`}
                  onError={(e) => { e.currentTarget.style.display = "none"; }}
                />
              )}
              <div className="game-name">
                {String(t.game.name || "").toUpperCase()}
              </div>
            </div>
            {t.game.description && (
              <div className="game-description">{t.game.description}</div>
            )}
          </div>
        )}

        <p className="card-description">{t.description}</p>

        <div className="tournament-meta">
          <span>Início: {new Date(t.startTime).toLocaleString()}</span>
          {!isFinished && (
            <span>Começa em: {renderCountdown(t.startTime, t.status)}</span>
          )}
          <span>Participantes: {t.currentParticipants}/{t.maxParticipants}</span>
        </div>

        {!isFinished && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${Math.min(100, (t.currentParticipants / t.maxParticipants) * 100 || 0)}%`,
              }}
            />
          </div>
        )}

        <div className="tournament-actions">
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end", flexWrap: "wrap" }}>
            {t.canReady && (
              <button
                className="card-button start-button"
                disabled={startLoadingId === t.id}
                onClick={() => handleStartTournament(t.id)}
              >
                {startLoadingId === t.id ? "Preparando torneio..." : "Iniciar Torneio"}
              </button>
            )}

            {isFinished && (
              <button
                className="card-button result-button"
                onClick={() => window.open(`/tournament/${t.id}`, "_blank")}
              >
                🏆 Ver Resultado
              </button>
            )}

            {t.status === "OPEN" && isCreator && (
              <button
                className="card-button manage-button"
                onClick={() => handleOpenManager(t)}
              >
                ⚙ Gerenciar
              </button>
            )}

            {!t.canReady && t.status !== "FINISHED" && t.status !== "OPEN" && t.status !== "CANCELLED" && t.status !== "ERROR" && (
              <span className="status-tag">
                {full ? "Lotado" : STATUS_LABEL[t.status] ?? t.status}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCardCancelado = (t) => (
    <div
      key={t.id}
      className="tournament-card tournament-card--cancelled"
      style={{ borderLeft: "6px solid #ff6b6b" }}
    >
      <div className="card-header">
        <h4 className="card-title card-title--muted">{t.name}</h4>
        <span className="status-badge" style={{ backgroundColor: "#ff6b6b" }}>
          Cancelado
        </span>
      </div>
      <p className="creator-line">
        Criado por: <strong>{creatorDisplay(t.creator)}</strong>
      </p>
      {t.game && (
        <div className="game-row" style={{ marginTop: "0.5rem" }}>
          <div className="game-name cancelled-game-name">
            {String(t.game.name || "").toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );

  const renderCardErro = (t) => {
    const isCreator = user?.id === t.creator?.id;

    return (
      <div
        key={t.id}
        className="tournament-card tournament-card--error"
        style={{ borderLeft: "6px solid #ff4444" }}
      >
        <div className="card-header">
          <h4 className="card-title">{t.name}</h4>
          <span className="status-badge" style={{ backgroundColor: "#ff4444" }}>
            ⚠️ Erro
          </span>
        </div>

        <p className="creator-line">
          Criado por: <strong>{creatorDisplay(t.creator)}</strong>
        </p>

        {t.game && (
          <div className="game-row" style={{ marginTop: "0.5rem" }}>
            <div className="game-name cancelled-game-name">
              {String(t.game.name || "").toUpperCase()}
            </div>
          </div>
        )}

        {t.errorContext && (
          <div className="error-context">
            <p className="error-context-label">Detalhes do erro:</p>
            <p className="error-context-text">{t.errorContext}</p>
          </div>
        )}

        {isCreator && (
          <div className="tournament-actions">
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button
                className="card-button manage-button"
                onClick={() => handleOpenManager(t)}
              >
                ⚙ Gerenciar
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="participating-section">
      <h2 className="section-title">Meus Torneios</h2>

      {loading && <p className="loading">Carregando seus torneios...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && tournaments.length === 0 && (
        <p className="empty-message">Você não está participando de nenhum torneio.</p>
      )}

      {ativos.length > 0 && (
        <div className="tournament-group">
          <p className="group-label">🟢 Ativos</p>
          <div className="tournaments-list">
            {ativos.map(renderCardCompleto)}
          </div>
        </div>
      )}

      {finalizados.length > 0 && (
        <div className="tournament-group">
          <p className="group-label">🏆 Finalizados</p>
          <div className="tournaments-list">
            {finalizados.map(renderCardCompleto)}
          </div>
        </div>
      )}

      {comErro.length > 0 && (
        <div className="tournament-group">
          <p className="group-label">⚠️ Com erro</p>
          <div className="tournaments-list">
            {comErro.map(renderCardErro)}
          </div>
        </div>
      )}

      {cancelados.length > 0 && (
        <div className="tournament-group">
          <p className="group-label">⬜ Cancelados</p>
          <div className="tournaments-list">
            {cancelados.map(renderCardCancelado)}
          </div>
        </div>
      )}

      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {managerModal.open && (
        <TournamentManagerModal
          tournament={managerModal.tournament}
          onClose={handleCloseManager}
        />
      )}

      <AppModal
        open={errorModal.open}
        onClose={() => setErrorModal({ open: false, message: "" })}
        title="Erro ao iniciar torneio"
        variant="error"
        primaryAction={{
          id: "close-error-modal",
          label: "Ok",
          onClick: () => setErrorModal({ open: false, message: "" }),
        }}
        initialFocus="close-error-modal"
      >
        <p>{errorModal.message}</p>
      </AppModal>
    </section>
  );
}