import { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import PendingChallengeCard from "./PendingChallengeCard";
import AuthContext from "../../context/AuthContext";
import "./PendingChallenges.css";

const PendingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();

  // Estado para exibir mensagem de erro em um modal
  const [errorMessage, setErrorMessage] = useState("");

  const fetchPendingChallenges = useCallback(async () => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/jokenpo/challenge/pending`;
      const response = await axios.get(url, {
        params: { size: 4 },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      setChallenges(response.data.content);
    } catch (error) {
      console.error("Erro ao buscar desafios pendentes:", error);
    }
  }, [token]);

  useEffect(() => {
    fetchPendingChallenges();
  }, [fetchPendingChallenges]);

  // Função para aceitar ou rejeitar um desafio
  const handleAcceptOrReject = async (challengeId, isAccepted) => {
    try {
      const url = `${import.meta.env.VITE_API_URL}/jokenpo/challenge/isAccepted`;
      const requestBody = {
        challengeId: challengeId,
        accepted: isAccepted,
      };
      const response = await axios.post(url, requestBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const matchId = response.data;
      if (matchId) {
        console.log("Desafio aceito! ID da partida:", matchId);
        navigate(`/matches/${matchId}`);
      } else {
        console.log("Desafio rejeitado (ou retornou null/0).");
      }
      setChallenges((prev) => prev.filter((ch) => ch.id !== challengeId));
    } catch (error) {
      console.error("Erro ao aceitar/rejeitar desafio:", error);

      if (error.response?.status === 404) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage("Ocorreu um erro ao processar o desafio.");
      }
    }
  };

  const closeErrorModal = () => {
    setErrorMessage("");
  };

  return (
    <div className="pending-challenges">
      <h2>Desafios Pendentes</h2>
      <div className="pending-challenges-grid">
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            <PendingChallengeCard
              key={challenge.id}
              challenge={challenge}
              onAcceptOrReject={handleAcceptOrReject}
            />
          ))
        ) : (
          <p>Você não tem desafios pendentes no momento.</p>
        )}
      </div>
      {errorMessage && (
        <div className="modal-overlay-peding-challenges">
          <div className="modal-peding-challenges">
            <p>{errorMessage}</p>
            <button
              className="modal-button-peding-challenges"
              onClick={closeErrorModal}
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingChallenges;
