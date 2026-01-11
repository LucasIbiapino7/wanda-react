import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./ParticipatingTournaments.css";

const GAME_LOGOS = {
  jokenpo: "/assets/games/jokenpo-logo.png",
  bits: "/assets/games/bits-logo.png",
};

export default function ParticipatingTournaments() {
  const { token } = useContext(AuthContext);

  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startLoadingId, setStartLoadingId] = useState(null);

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

        // estado é fonte da verdade
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
      console.error(err);
    } finally {
      setStartLoadingId(null);
    }
  };

  const renderCountdown = (startTime, status) => {
    const now = new Date();
    const start = new Date(startTime);
    const diffMs = start - now;

    if (status === "FINISHED") return "Finalizado";
    if (diffMs <= 0) return "Em andamento";

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hrs = Math.floor((diffMs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffMs / (1000 * 60)) % 60);

    return `${days}d ${hrs}h ${mins}m`;
  };

  const creatorDisplay = (creator) =>
    creator?.nickname?.trim() ? creator.nickname : creator?.name || "—";

  return (
    <section className="participating-section">
      <h2 className="section-title">Meus Torneios</h2>

      {loading && <p className="loading">Carregando seus torneios...</p>}
      {error && <p className="error">{error}</p>}

      <div className="tournaments-list">
        {tournaments.map((t) => {
          const full = t.currentParticipants >= t.maxParticipants;

          let borderColor = "#ffb84d";
          if (t.canReady) borderColor = "#4da6ff";
          else if (t.status === "FINISHED") borderColor = "#ccc";

          const gameKey = String(t.game?.name || "").toLowerCase().trim();
          const gameLogo = GAME_LOGOS[gameKey] || null;

          return (
            <div
              key={t.id}
              className="tournament-card"
              style={{ borderLeft: `6px solid ${borderColor}` }}
            >
              <div className="card-header">
                <h4 className="card-title">{t.name}</h4>
                <span className="status-pill">{t.status}</span>
              </div>

              <p className="creator-line">
                Criado por: <strong>{creatorDisplay(t.creator)}</strong>
              </p>
              {t.game && (
                <div className="game-info">
                  <div className="game-row">
                    {gameLogo ? (
                      <img
                        src={gameLogo}
                        className="game-logo"
                        alt={`Logo ${t.game?.name ?? "jogo"}`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}

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
                <span>Começa em: {renderCountdown(t.startTime, t.status)}</span>
                <span>
                  Participantes: {t.currentParticipants}/{t.maxParticipants}
                </span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${Math.min(
                      100,
                      (t.currentParticipants / t.maxParticipants) * 100 || 0
                    )}%`,
                  }}
                />
              </div>

              <div className="tournament-actions">
                {t.canReady ? (
                  <button
                    className="card-button start-button"
                    disabled={startLoadingId === t.id}
                    onClick={() => handleStartTournament(t.id)}
                  >
                    {startLoadingId === t.id
                      ? "Preparando torneio..."
                      : "Iniciar Torneio"}
                  </button>
                ) : t.status === "FINISHED" ? (
                  <button
                    className="card-button play-button"
                    onClick={() => window.open(`/tournament/${t.id}`, "_blank")}
                  >
                    ▶ Ver Resultado
                  </button>
                ) : (
                  <span className="status-tag">{full ? "Lotado" : t.status}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {!loading && totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
      )}

      {!loading && tournaments.length === 0 && (
        <p className="empty-message">
          Você não está participando de nenhum torneio.
        </p>
      )}
    </section>
  );
}
