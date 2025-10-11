import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PendingChallengeCard from "./PendingChallengeCard";
import AuthContext from "../../context/AuthContext";
import ChallengeService from "../../services/ChallengeService";
import AppModal from "../UI/AppModal";
import "./PendingChallenges.css";

// Extração de mensagens do backend (mesma função do Challenge.jsx)
function extractApiError(err) {
  const status = err?.response?.status ?? err?.normalized?.status ?? 0;
  const data = err?.response?.data;
  const backendMsg = data?.error || data?.message;
  const normalizedMsg = err?.normalized?.message;
  const msg =
    backendMsg ||
    normalizedMsg ||
    (status === 0
      ? "Falha de conexão. Tente novamente."
      : "Erro ao processar o desafio.");
  return { status, message: msg };
}

const PendingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  // paginação
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const size = 5;

  const [busyIds, setBusyIds] = useState(new Set());

  // controle do modal de partida
  const [matchModal, setMatchModal] = useState({
    open: false,
    phase: "loading", // "loading" | "success"
    opponent: "",
    matchId: null,
  });

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
      const { message } = extractApiError(error);
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) fetchPendingChallenges(page);
  }, [token, page, fetchPendingChallenges]);

  const handleAcceptOrReject = async (challengeId, isAccepted, opponentName = "") => {
    setBusyIds((prev) => new Set(prev).add(challengeId));

    // Se aceitou, abre o modal de "partida em andamento"
    if (isAccepted) {
      setMatchModal({
        open: true,
        phase: "loading",
        opponent: opponentName,
        matchId: null,
      });
    }

    try {
      const matchId = await ChallengeService.isAccepted({
        challengeId,
        accepted: isAccepted,
      });

      // Remove da lista local
      setChallenges((prev) => prev.filter((ch) => ch.id !== challengeId));

      if (isAccepted && matchId) {
        // Troca a fase do modal para "success"
        setMatchModal({
          open: true,
          phase: "success",
          opponent: opponentName,
          matchId,
        });
      } else if (isAccepted && !matchId) {
        // Falhou silenciosamente (mas aceitou)
        setMatchModal({
          open: true,
          phase: "success",
          opponent: opponentName,
          matchId: null,
        });
      }
    } catch (err) {
      const { status, message } = extractApiError(err);

      let title = "Não conseguimos processar seu desafio!";
      if (status === 0) title = "Falha de conexão";
      else if (status >= 500) title = "Erro no servidor";

      setErrorMessage(message);
      setMatchModal((m) => ({ ...m, open: false }));

      console.error("handleAcceptOrReject error:", { status, message, err });
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(challengeId);
        return next;
      });
    }
  };

  const closeErrorModal = () => setErrorMessage("");

  const handleCloseMatchModal = () => {
    setMatchModal({ open: false, phase: "loading", opponent: "", matchId: null });
  };

  const handleViewReplay = () => {
    if (matchModal.matchId) {
      window.open(`/matches/${matchModal.matchId}`, "_blank");
    }
    handleCloseMatchModal();
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

      {/* Modal de erro */}
      <AppModal
        open={!!errorMessage}
        onClose={closeErrorModal}
        title="Algo deu errado"
        variant="error"
        primaryAction={{
          id: "pending-err-ok",
          label: "Ok",
          onClick: closeErrorModal,
        }}
        initialFocus="pending-err-ok"
      >
        <p>{errorMessage}</p>
      </AppModal>

      {/* Modal de Partida (duas fases) */}
      {matchModal.open && (
        <AppModal
          open={matchModal.open}
          onClose={handleCloseMatchModal}
          title={
            matchModal.phase === "loading"
              ? "Partida em andamento..."
              : "Partida concluída!"
          }
          variant={matchModal.phase === "loading" ? "info" : "success"}
          primaryAction={
            matchModal.phase === "success"
              ? {
                  id: "view-replay",
                  label: "Ver replay agora",
                  onClick: handleViewReplay,
                }
              : null
          }
          initialFocus={matchModal.phase === "success" ? "view-replay" : undefined}
        >
          {matchModal.phase === "loading" ? (
            <div className="match-loading-container">
              <div className="spinner" />
              <p>
                ⚔️ Realizando partida
                {matchModal.opponent ? ` contra ${matchModal.opponent}` : ""}…
              </p>
            </div>
          ) : (
            <div>
              <p>
                A partida contra{" "}
                <strong>{matchModal.opponent || "seu oponente"}</strong> foi
                realizada com sucesso!
              </p>
              <div className="modal-actions-inline">
                <button className="btn btn-ghost" onClick={handleCloseMatchModal}>
                  Continuar aqui
                </button>
              </div>
            </div>
          )}
        </AppModal>
      )}
    </div>
  );
};

export default PendingChallenges;
