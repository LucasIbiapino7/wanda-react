// src/components/Tournament/OpenTournaments.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./OpenTournaments.css";

export default function OpenTournaments() {
  const { token } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTournaments = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get("http://localhost:8080/tournament", {
        headers: { Authorization: `Bearer ${token}` },
        params: { size: 5, searchTerm: "", page: pageNum },
      });
      setTournaments(data.content);
      setPage(data.number);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao buscar torneios:", err);
      setError("Não foi possível carregar os torneios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments(0);
  }, []);

  return (
    <div className="open-tournaments">
      <h2 className="section-title">Torneios Abertos</h2>

      {loading && <p className="loading">Carregando torneios...</p>}
      {error && <p className="error">{error}</p>}

      <div className="tournaments-grid">
        {tournaments.map((t) => (
          <div key={t.id} className="tournament-card">
            <h4 className="card-title">{t.name}</h4>
            <p className="card-description">{t.description}</p>
            <div className="card-meta">
              <span>Início: {new Date(t.startTime).toLocaleString()}</span>
              <span>
                Participantes: {t.currentParticipants}/{t.maxParticipants}
              </span>
            </div>
            <div className="card-actions">
              <button className="card-button">Entrar</button>
            </div>
          </div>
        ))}
      </div>

      {!loading && tournaments.length === 0 && (
        <p className="empty-message">Não há torneios abertos no momento.</p>
      )}

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={fetchTournaments}
      />
    </div>
  );
}
