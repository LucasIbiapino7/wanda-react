import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PendingChallengeCard from "./PendingChallengeCard";
import AuthContext from "../../context/AuthContext";
import ChallengeService from "../../services/ChallengeService";
import AppModal from "../UI/AppModal";
import "./PendingChallenges.css";

const PendingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // paginação
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 5;

  const [busyIds, setBusyIds] = useState(new Set());

  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchPendingChallenges = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const data = await ChallengeService.listPending({ page: p, size });
      setChallenges(data?.content ?? []);
      setTotalPages(data?.totalPages ?? 1);
    } catch (error) {
      console.error("Erro ao buscar desafios pendentes:", error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.normalized?.message ||
          "Não conseguimos carregar seus desafios pendentes."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchPendingChallenges(page);
  }, [token, page, fetchPendingChallenges]);

  const handleAcceptOrReject = async (challengeId, isAccepted) => {
    setBusyIds((prev) => new Set(prev).add(challengeId));
    try {
      const matchId = await ChallengeService.decide({
        challengeId,
        accepted: isAccepted,
      });
      setChallenges((prev) => prev.filter((ch) => ch.id !== challengeId));
      if (isAccepted && matchId) {
        navigate(`/matches/${matchId}`);
      }
    } catch (error) {
      console.error("Erro ao aceitar/rejeitar desafio:", error);
      setErrorMessage(
        error?.response?.data?.error ||
          error?.normalized?.message ||
          "Ops! Não foi possível concluir essa ação."
      );
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(challengeId);
        return next;
      });
    }
  };

  const closeErrorModal = () => {
    setErrorMessage("");
  };

  return (
    <div className="pending-challenges">
      <h2>Desafios Pendentes</h2>

      {loading ? (
        <div className="pending-loading" role="status" aria-live="polite">
          Carregando desafios…
        </div>
      ) : (
        <div className="pending-challenges-grid">
          {challenges.length > 0 ? (
            challenges.map((challenge) => (
              <PendingChallengeCard
                key={challenge.id}
                challenge={challenge}
                onAcceptOrReject={handleAcceptOrReject}
                disabled={busyIds.has(challenge.id)}
              />
            ))
          ) : (
            <p>Você não tem desafios pendentes no momento.</p>
          )}
        </div>
      )}

      {!loading && totalPages > 1 && (
        <div className="pending-pagination">
          <button
            className="btn"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← Anteriores
          </button>
          <span className="pending-page-indicator">
            Página {page + 1} de {totalPages}
          </span>
          <button
            className="btn"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page + 1 >= totalPages}
          >
            Próximos →
          </button>
        </div>
      )}

      <AppModal
        open={!!errorMessage}
        onClose={closeErrorModal}
        title="Algo deu errado"
        variant="error"
        description={errorMessage}
        primaryAction={{
          id: "pending-err-ok",
          label: "Ok",
          onClick: closeErrorModal,
        }}
        initialFocus="pending-err-ok"
      />
    </div>
  );
};

export default PendingChallenges;
