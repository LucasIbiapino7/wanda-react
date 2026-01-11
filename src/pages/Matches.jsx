import { useState, useEffect, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";

import Arena from "../components/Arena/Arena";
import MatchService from "../services/MatchService";
import AppModal from "../components/UI/AppModal";
import BitsReplayPage from "../pages/BitsReplayPage";

function Matches() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
    variant: "error",
  });

  useEffect(() => {
    if (!id || !token) return;

    const fetchMatch = async () => {
      setLoading(true);
      try {
        const data = await MatchService.findById(id);
        setMatch(data);
      } catch (err) {
        console.error("Erro ao buscar dados da partida:", err);

        const message =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Não conseguimos carregar o replay da partida. Tente novamente mais tarde.";

        setErrorModal({
          open: true,
          message,
          variant: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMatch();
  }, [id, token]);

  const closeModal = () =>
    setErrorModal((prev) => ({ ...prev, open: false }));

  // Backend novo: { game, payload }
  // Fallback: caso algum endpoint ainda devolva direto o payload
  const replayPayload = useMemo(() => {
    if (!match) return null;
    return match?.payload ?? match;
  }, [match]);

  const gameKey = useMemo(() => {
    const name = match?.game?.name ?? match?.gameName ?? "";
    return String(name).toLowerCase().trim();
  }, [match]);

  if (loading) {
    return (
      <div className="loading-replay-container">
        <p className="loading-text">🎮 Carregando replay da partida...</p>
        <div className="loading-spinner" />

        <AppModal
          open={errorModal.open}
          onClose={closeModal}
          title="Erro ao carregar replay"
          variant={errorModal.variant}
          primaryAction={{
            id: "close-error",
            label: "Fechar",
            onClick: closeModal,
          }}
          initialFocus="close-error"
        >
          <p>{errorModal.message}</p>
        </AppModal>
      </div>
    );
  }

  if (!match) {
    return (
      <>
        <div className="loading-replay-container">
          <p>Nenhum replay encontrado.</p>
        </div>

        <AppModal
          open={errorModal.open}
          onClose={closeModal}
          title="Erro ao carregar replay"
          variant={errorModal.variant}
          primaryAction={{
            id: "close-error",
            label: "Fechar",
            onClick: closeModal,
          }}
          initialFocus="close-error"
        >
          <p>{errorModal.message}</p>
        </AppModal>
      </>
    );
  }

  const renderReplay = () => {
    if (!replayPayload) {
      return (
        <div className="loading-replay-container">
          <p>Nenhum payload de replay encontrado.</p>
        </div>
      );
    }

    if (gameKey === "bits") {
      return <BitsReplayPage duel={replayPayload} />;
    }

    if (gameKey === "jokenpo") {
      return <Arena duelData={replayPayload} />;
    }

    return (
      <div className="loading-replay-container">
        <p>
          Jogo não suportado para replay:{" "}
          <b>{match?.game?.name ?? match?.gameName ?? "desconhecido"}</b>
        </p>
      </div>
    );
  };

  return (
    <>
      {renderReplay()}

      <AppModal
        open={errorModal.open}
        onClose={closeModal}
        title="Erro ao carregar replay"
        variant={errorModal.variant}
        primaryAction={{
          id: "close-error",
          label: "Fechar",
          onClick: closeModal,
        }}
        initialFocus="close-error"
      >
        <p>{errorModal.message}</p>
      </AppModal>
    </>
  );
}

export default Matches;
