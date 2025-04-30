import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./OpenTournaments.css";
import SubscribeResultModal from "./SubscribeResultModal";
import LockIcon from "../../assets/lock.svg"; 
import PublicIcon from "../../assets/public.svg"; 

export default function OpenTournaments() {
  const { token } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSuccess, setModalSuccess] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

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
      setError("Não foi possível carregar os torneios.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments(0);
  }, []);

  const handleSubscribe = async (tournamentId) => {
    try {
      const payload = { tournamentId, password: "" };
      await axios.post(
        "http://localhost:8080/tournament/subscribe",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalSuccess(true);
      setModalMessage("Você entrou no torneio com sucesso!");
      fetchTournaments(page);
    } catch (err) {
      const msg = err.response?.data?.error ||
        "Ocorreu um erro ao tentar se inscrever no torneio.";
      setModalSuccess(false);
      setModalMessage(msg);
    } finally {
      setModalOpen(true);
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

  return (
    <div className="open-tournaments">
      <h2 className="section-title">Torneios Abertos</h2>
      {loading && <p className="loading">Carregando torneios...</p>}
      {error && <p className="error">{error}</p>}
      <div className="tournaments-grid">
        {tournaments.map((t) => {
          const full = t.currentParticipants >= t.maxParticipants;
          return (
            <div key={t.id} className="tournament-card">
              <div className="card-header">
                <h4 className="card-title">{t.name}</h4>
                <div className="card-badges">
                  <span className="badge-status status">{t.status}</span>
                  <img
                    src={t.asPrivate ? LockIcon : PublicIcon}
                    alt={t.asPrivate ? "Privado" : "Público"}
                    className="badge-icon"
                  />
                </div>
              </div>
              <p className="card-description">{t.description}</p>
              <div className="card-meta">
                <span>Início: {new Date(t.startTime).toLocaleString()}</span>
                <span>Começa em: {renderCountdown(t.startTime)}</span>
                <span>Participantes: {t.currentParticipants}/{t.maxParticipants}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${(t.currentParticipants / t.maxParticipants) * 100}%` }}
                />
              </div>
              <div className="card-actions">
                <button
                  className="card-button"
                  disabled={full || t.status !== 'OPEN'}
                  onClick={() => handleSubscribe(t.id)}
                >
                  {full ? 'Lotado' : 'Entrar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!loading && tournaments.length === 0 && (
        <p className="empty-message">Não há torneios abertos no momento.</p>
      )}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={fetchTournaments}
      />
      <SubscribeResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        success={modalSuccess}
        message={modalMessage}
      />
    </div>
  );
}
