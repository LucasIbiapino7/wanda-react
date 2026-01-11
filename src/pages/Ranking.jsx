import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import AuthContext from "../context/AuthContext";
import Pagination from "../components/Challenges/Pagination";
import "../components/Ranking/Ranking.css";
import BadgePreviewModal from "../components/Challenges/BadgePreviewModal";

export default function Ranking() {
  const { token } = useContext(AuthContext);

  const [players, setPlayers] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotal] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [previewBadge, setPreviewBadge] = useState(null);
  const closePreview = () => setPreviewBadge(null);

  const fetchRanking = useCallback(
    async (pageNum = 0) => {
      if (!token) return;

      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/profile/ranking`,
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { size: 10, page: pageNum },
          }
        );

        setPlayers(data?.content ?? []);
        setPage(data?.number ?? pageNum);
        setTotal(data?.totalPages ?? 1);
      } catch (err) {
        console.error(err);
        setError("Não foi possível carregar o ranking.");
      } finally {
        setLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    if (token) fetchRanking(0);
  }, [token, fetchRanking]);

  return (
    <div className="rk-container">
      <div className="rk-head">
        <h1 className="rk-title">Ranking Geral</h1>
        <p className="rk-subtitle">
          Veja os melhores jogadores — vitórias, torneios e conquistas.
        </p>
      </div>

      {loading && <p className="rk-msg">Carregando...</p>}
      {error && <p className="rk-msg rk-error">{error}</p>}

      {!loading && !error && players.length === 0 && (
        <p className="rk-msg">Nenhum jogador encontrado.</p>
      )}

      {!loading && players.length > 0 && (
        <div className="rk-table" role="table" aria-label="Ranking geral">
          <div className="rk-row rk-header" role="row">
            <span className="rk-col-rank" role="columnheader">
              #
            </span>
            <span className="rk-col-player" role="columnheader">
              Jogador
            </span>
            <span className="rk-col-wins" role="columnheader">
              Vitórias
            </span>
            <span className="rk-col-tournaments" role="columnheader">
              Torneios
            </span>
            <span className="rk-col-badges rk-badge-col" role="columnheader">
              Badges
            </span>
          </div>

          {players.map((p, idx) => (
            <div className="rk-row" key={p.id} role="row">
              <span className="rk-rank rk-col-rank" role="cell">
                {page * 10 + idx + 1}
              </span>

              <span className="rk-player rk-col-player" role="cell">
                <div
                  className="rk-avatar"
                  style={{
                    backgroundImage: `url(/assets/personagens/${p.characterUrl})`,
                  }}
                  aria-hidden="true"
                />
                <span className="rk-name">{p.name}</span>
              </span>

              <span className="rk-col-wins" role="cell">
                {p.numberOfWinners}
              </span>

              <span className="rk-col-tournaments" role="cell">
                {p.winsTournaments}
              </span>

              <span className="rk-col-badges rk-badge-col" role="cell">
                {p.badges?.length > 0 ? (
                  <>
                    {p.badges.slice(0, 3).map((b) => (
                      <button
                        key={b.id}
                        type="button"
                        className="rk-badge-btn"
                        onClick={() => setPreviewBadge(b)}
                        title={b.name}
                        aria-label={`Ver badge: ${b.name}`}
                      >
                        <img
                          src={`/assets/badges/${b.iconUrl}`}
                          alt={b.name}
                          className="rk-badge"
                        />
                      </button>
                    ))}
                    {p.badges.length > 3 && (
                      <span className="rk-badge-more">
                        +{p.badges.length - 3}
                      </span>
                    )}
                  </>
                ) : (
                  <span className="rk-muted">—</span>
                )}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="rk-pagination">
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={fetchRanking} />
        </div>
      )}

      <BadgePreviewModal badge={previewBadge} onClose={closePreview} />
    </div>
  );
}
