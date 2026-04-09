import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TournamentService from "../../services/TournamentService";
import "./TournamentDetailsModal.css";

const GAME_LOGOS = {
  jokenpo: "/assets/games/jokenpo-logo.png",
  bits: "/assets/games/bits-logo.png",
};

export default function TournamentDetailsModal({ tournament, onClose, onSubscribe }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subscribing, setSubscribing] = useState(false);

  const full = tournament.currentParticipants >= tournament.maxParticipants;

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await TournamentService.getParticipants(tournament.id);
        setDetails(data);
      } catch {
        setError("Não foi possível carregar os detalhes do torneio.");
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [tournament.id]);

  const handleSubscribe = async () => {
    setSubscribing(true);
    try {
      await onSubscribe(tournament.id);
      onClose();
    } finally {
      setSubscribing(false);
    }
  };

  const renderCountdown = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start - now;
    if (diffMs <= 0) return "Já começou";
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  const gameKey = String(tournament.game?.name || "").toLowerCase().trim();
  const gameLogo = GAME_LOGOS[gameKey] || null;

  return (
    <div className="td-overlay" onClick={onClose}>
      <div className="td-container" onClick={(e) => e.stopPropagation()}>

        <button className="td-close" onClick={onClose} aria-label="Fechar">×</button>

        {/* Cabeçalho */}
        <div className="td-header">
          {gameLogo && (
            <img
              src={gameLogo}
              className="td-game-logo"
              alt={tournament.game?.name}
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div>
            <h3 className="td-title">{tournament.name}</h3>
            <p className="td-creator">
              Criado por: <strong>{tournament.creator?.name}</strong>
            </p>
          </div>
        </div>

        {/* Descrição */}
        <p className="td-description">{tournament.description}</p>

        {/* Metadados */}
        <div className="td-meta">
          <div className="td-meta-item">
            <span className="td-meta-label">Jogo</span>
            <span className="td-meta-value">
              {tournament.game?.name?.toUpperCase() || "—"}
            </span>
          </div>
          <div className="td-meta-item">
            <span className="td-meta-label">Início</span>
            <span className="td-meta-value">
              {new Date(tournament.startTime).toLocaleString()}
            </span>
          </div>
          <div className="td-meta-item">
            <span className="td-meta-label">Começa em</span>
            <span className="td-meta-value">{renderCountdown(tournament.startTime)}</span>
          </div>
          <div className="td-meta-item">
            <span className="td-meta-label">Vagas</span>
            <span className="td-meta-value">
              {tournament.currentParticipants}/{tournament.maxParticipants}
            </span>
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="td-progress-bar">
          <div
            className="td-progress-fill"
            style={{
              width: `${Math.min(100, (tournament.currentParticipants / tournament.maxParticipants) * 100)}%`,
            }}
          />
        </div>

        {/* Participantes */}
        <div className="td-participants-section">
          <p className="td-participants-title">
            Participantes inscritos ({tournament.currentParticipants})
          </p>

          {loading && <p className="td-loading">Carregando...</p>}
          {error && <p className="td-error">{error}</p>}

          {!loading && details && details.participants.length === 0 && (
            <p className="td-empty">Nenhum participante inscrito ainda. Seja o primeiro!</p>
          )}

          {!loading && details && details.participants.length > 0 && (
            <div className="td-participants-list">
              {details.participants.map((p) => (
                <div key={p.id} className="td-participant-row">
                  <span className="td-participant-name">{p.name}</span>
                  {p.nickname && (
                    <span className="td-participant-nick">@{p.nickname}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ação */}
        <div className="td-actions">
          <button className="td-btn td-btn--secondary" onClick={onClose}>
            Fechar
          </button>
          <button
            className="td-btn td-btn--primary"
            disabled={full || subscribing || tournament.status !== "OPEN"}
            onClick={handleSubscribe}
          >
            {subscribing ? "Entrando..." : full ? "Lotado" : "Entrar no torneio"}
          </button>
        </div>

      </div>
    </div>
  );
}

TournamentDetailsModal.propTypes = {
  tournament: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    startTime: PropTypes.string,
    currentParticipants: PropTypes.number,
    maxParticipants: PropTypes.number,
    status: PropTypes.string,
    creator: PropTypes.shape({ name: PropTypes.string }),
    game: PropTypes.shape({ name: PropTypes.string }),
  }).isRequired,
  onClose: PropTypes.func.isRequired,
  onSubscribe: PropTypes.func.isRequired,
};