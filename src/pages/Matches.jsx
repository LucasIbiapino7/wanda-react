import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import Arena from "../components/Arena/Arena";
import MatchService from "../services/MatchService";
import AppModal from "../components/UI/AppModal";

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

  if (loading) {
    return (
      <div className="loading-replay-container">
        <p className="loading-text">🎮 Carregando replay da partida...</p>
        <div className="loading-spinner" />
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

  return (
    <>
      <Arena duelData={match} />

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
