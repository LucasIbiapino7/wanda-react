import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./ParticipatingTournaments.css";
import TournamentService from "../../services/TournamentService"
import TournamentManagerModal from "./TournamentManagerModal";
import TournamentDetailsModal from "./TournamentDetailsModal";
import SubscribeResultModal from "./SubscribeResultModal";
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

export default function ParticipatingTournaments({ classroomId = null, refreshKey = 0, canManageTournaments = false }) {
  const { token, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startLoadingId, setStartLoadingId] = useState(null);
  const [managerModal, setManagerModal] = useState({ open: false, tournament: null });
  const [detailsModal, setDetailsModal] = useState({ open: false, tournament: null });
  const [errorModal, setErrorModal] = useState({ open: false, message: "" });

  const statusOrder = {
    OPEN: 0,
    RUNNING: 1,
    FINISHED: 2,
    CANCELLED: 3,
    ERROR: 4
  }

  const visibleTournaments = [...(canManageTournaments
    ? tournaments
    : tournaments.filter((t) => t.status !== "ERROR"))]
      .sort((a, b) => {
        const statusDifference = (statusOrder[a.status] ?? 99) - (statusOrder[b.status] ?? 99)

        if (statusDifference !== 0) {
          return statusDifference
        }

        return new Date(b.startTime) - new Date(a.startTime)
      })

  // Estados para permitir entrar em torneio a partir da turma
  const [subscribeModal, setSubscribeModal] = useState({
    open:false,
    success: true,
    message: ""
  })
  const [subscribingId, setSubscribingId] = useState(null)
  const [joinedTournamentIds, setJoinedTournamentIds] = useState(new Set())

  const fetchParticipating = useCallback(
    async (pageNum = 0) => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        // No contexto de uma turma, lista TODOS os torneios da turma
        // (mesmo DTO do /participating). Fora dela, mantém o comportamento global.
        const isClassroomList = Boolean(classroomId)
        const url = classroomId
          ? `${import.meta.env.VITE_API_URL}/tournament/classroom/${classroomId}`
          : `${import.meta.env.VITE_API_URL}/tournament/participating`;
        const { data } = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            size: isClassroomList ? 100 : 5,
            page: isClassroomList ? 0 : pageNum
          },
        });
        setTournaments(data?.content ?? []);
        setTotalPages(isClassroomList ? 0 : data?.totalPages ?? 0);
        setPage(isClassroomList ? 0 : pageNum);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar os torneios.");
      } finally {
        setLoading(false);
      }
    },
    [token, classroomId]
  );

  useEffect(() => {
    if (token) fetchParticipating(page);
  }, [token, page, refreshKey, fetchParticipating]);

  const handleStartTournament = async (id) => {
    setStartLoadingId(id);
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/tournament/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchParticipating(page);
      navigate(`/tournament/${id}`)
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

  const handleOpenDetails = (tournament) => {
    setDetailsModal({ open: true, tournament });
  };

  const handleCloseDetails = () => {
    setDetailsModal({ open: false, tournament: null });
  };

  const handleSubscribe = async (tournamentId) => {
    setSubscribingId(tournamentId)

    try {
      await TournamentService.subscribe(tournamentId)
      // Lida com o botão de entrar em turma
      setJoinedTournamentIds((current) => {
        const next = new Set(current)
        next.add(tournamentId)
        return next
      })

      setSubscribeModal({
        open: true,
        success: true,
        message: "Você entrou no torneio com sucesso."
      })

      fetchParticipating(page)
    } catch (error) {
        const data = error?.response?.data

        setSubscribeModal({
          open: true,
          success: false,
          message:
            data?.message ||
            data?.error ||
            "Tente novamente em alguns instantes.",
        })
    } finally {
      setSubscribingId(null)
    }
  }

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

  const ativos = visibleTournaments.filter(
    (t) => t.status === "OPEN" || t.status === "RUNNING"
  )

  const finalizados = visibleTournaments.filter((t) => t.status === "FINISHED")
  const cancelados = visibleTournaments.filter((t) => t.status === "CANCELLED")
  const comErro = canManageTournaments
    ? visibleTournaments.filter((t) => t.status === "ERROR")
    : []
  // Atualizar quantidade de participantes no torneio automaticamente
  useEffect(() => {
    if (!classroomId || !token) {
      return undefined
    }

    const intervalId = setInterval(() => {
      fetchParticipating(page)
    }, 15000)

    return () => clearInterval(intervalId)
  }, [classroomId, token, page, fetchParticipating])
  
  const renderCardCompleto = (t) => {
    const full = t.currentParticipants >= t.maxParticipants;
    const isCreator = user?.id === t.creator?.id;
    const isOpen = t.status === "OPEN";
    const isRunning = t.status === "RUNNING";
    const isFinished = t.status === "FINISHED";

    let borderColor = "#ffb84d";
    if (t.canReady) borderColor = "#4da6ff";
    else if (t.status === "RUNNING") borderColor = "#4da6ff";
    else if (isFinished) borderColor = "#f0b429";

    const isParticipant = t.participant === true || 
      t.isParticipant === true ||
      t.subscribed === true ||
      joinedTournamentIds.has(t.id)
    const canSubscribe =
      classroomId &&
      t.status === "OPEN" &&
      !full &&
      !isParticipant

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

        {/* {isFinished && t.winnerId && (
          <p className="winner-line">
            🏆 Vencedor: <strong>{t.winnerId.name}</strong>
          </p>
        )} */}

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
            {canSubscribe && (
              <button
                className="card-button"
                disabled={subscribingId === t.id}
                onClick={() => handleSubscribe(t.id)}
              >
                {subscribingId === t.id ? "Entrando..." : "Entrar"}
              </button>
            )}

            {isOpen && isParticipant && classroomId && (
              <span className="status-tag status-tag--joined">
                Inscrito
              </span>
            )}

            {isRunning && isParticipant && classroomId && (
              <span className="status-tag status-tag--joined">
                Participando
              </span>
            )}

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

            {classroomId && !isCreator && (
              <button
                className="card-button card-button--secondary"
                onClick={() => handleOpenDetails(t)}
              >
                Ver detalhes
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
      <h2 className="section-title">
        {classroomId ? "Torneios da turma" : "Meus Torneios"}
      </h2>

      {loading && <p className="loading">Carregando torneios...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && visibleTournaments.length === 0 && (
        <p className="empty-message">
          {classroomId
            ? "Nenhum torneio foi criado para esta turma."
            : "Você não está participando de nenhum torneio."}
        </p>
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

      {detailsModal.open && (
        <TournamentDetailsModal
          tournament={detailsModal.tournament}
          onClose={handleCloseDetails}
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

      <SubscribeResultModal
        isOpen={subscribeModal.open}
        success={subscribeModal.success}
        message={subscribeModal.message}
        onClose={() =>
          setSubscribeModal({
            open: false,
            success: true,
            message: ""
          })
        }
      />
    </section>
  );
}

ParticipatingTournaments.propTypes = {
  classroomId: PropTypes.number,
  refreshKey: PropTypes.number,
  canManageTournaments: PropTypes.bool
};
