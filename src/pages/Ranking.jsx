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
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get(
          "http://localhost:8080/jokenpo/ranking",
          {
            headers: { Authorization: `Bearer ${token}` },
            params: { size: 10, page: pageNum },
          }
        );

        setPlayers(data.content);
        setPage(data.number);
        setTotal(data.totalPages);
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
      <h1 className="rk-title">Ranking Geral</h1>

      {loading && <p className="rk-msg">Carregando...</p>}
      {error && <p className="rk-msg rk-error">{error}</p>}

      {!loading && players.length > 0 && (
        <div className="rk-table">
          <div className="rk-row rk-header">
            <span>#</span>
            <span>Jogador</span>
            <span>Vitórias</span>
            <span>Torneios</span>
            <span className="rk-badge-col">Badges</span>
          </div>

          {players.map((p, idx) => (
            <div className="rk-row" key={p.id}>
              <span className="rk-rank">{page * 10 + idx + 1}</span>

              <span className="rk-player">
                <div
                  className="rk-avatar"
                  style={{
                    backgroundImage: `url(/assets/personagens/${p.characterUrl})`,
                  }}
                />
                <span className="rk-name">{p.name}</span>
              </span>

              <span>{p.numberOfWinners}</span>
              <span>{p.winsTournaments}</span>

              <span className="rk-badge-col">
                {p.badges.slice(0, 3).map((b) => (
                  <img
                    key={b.id}
                    src={`/assets/badges/${b.iconUrl}`}
                    alt={b.name}
                    title={b.name}
                    className="rk-badge"
                    onClick={() => setPreviewBadge(b)}
                  />
                ))}
                {p.badges.length === 0 && "-"}
              </span>
            </div>
          ))}
        </div>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={(p) => fetchRanking(p)}
      />
      <BadgePreviewModal badge={previewBadge} onClose={closePreview} />
    </div>
  );
}
