// src/components/Tournament/OpenTournaments.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import Pagination from "../Challenges/Pagination";
import "./OpenTournaments.css";
import SubscribeResultModal from "./SubscribeResultModal";

export default function OpenTournaments() {
  const { token } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // estados para o modal de resultado
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
      console.error("Erro ao buscar torneios:", err);
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
      const response = await axios.post(
        "http://localhost:8080/tournament/subscribe",
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setModalSuccess(true);
      setModalMessage("Você entrou no torneio com sucesso!");
      // opcional: re‑carregar lista para atualizar número de inscritos
      fetchTournaments(page);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        "Ocorreu um erro ao tentar se inscrever no torneio.";
      setModalMessage(msg);
      setModalSuccess(false);
    } finally {
      setModalOpen(true);
    }
  };

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
              <button
                className="card-button"
                onClick={() => handleSubscribe(t.id)}
              >
                Entrar
              </button>
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

      <SubscribeResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        success={modalSuccess}
        message={modalMessage}
      />
    </div>
  );
}
