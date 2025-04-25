import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./ParticipatingTournaments.css";

export default function ParticipatingTournaments() {
  const { token } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [startLoadingId, setStartLoadingId] = useState(null);

  const fetchParticipating = async (pageNum = 0) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await axios.get(
        "http://localhost:8080/tournament/participating",
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { size: 5, page: pageNum },
        }
      );
      setTournaments(data.content);
      setPage(data.number);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error("Erro ao buscar meus torneios:", err);
      setError("Não foi possível carregar seus torneios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParticipating(0);
  }, []);

  const handleStartTournament = async (id) => {
    setStartLoadingId(id);
    try {
      await axios.put(
        `http://localhost:8080/tournament/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchParticipating(page);
    } catch (err) {
      console.log(err);
    } finally {
      setStartLoadingId(null);
    }
  };

  return (
    <section className="participating-section">
      <h2 className="section-title">Meus Torneios</h2>

      {loading && <p>Carregando seus torneios...</p>}
      {error && <p className="error">{error}</p>}

      <div className="tournaments-list">
        {tournaments.map((t) => (
          <div key={t.id} className="tournament-card">
            <h4>{t.name}</h4>
            <p>{t.description}</p>
            <div className="tournament-meta">
              <br />
              Participantes: {t.currentParticipants}/{t.maxParticipants}
            </div>
            <div className="tournament-actions">
              {t.canReady ? (
                <button
                  className="card-button start-button"
                  disabled={startLoadingId === t.id}
                  onClick={() => handleStartTournament(t.id)}
                >
                  {startLoadingId === t.id
                    ? "Aguarde enquanto o torneio acontece…"
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
                <span className="status-tag">{t.status}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={fetchParticipating}
      />

      {!loading && tournaments.length === 0 && (
        <p>Você não está participando de nenhum torneio.</p>
      )}
    </section>
  );
}
