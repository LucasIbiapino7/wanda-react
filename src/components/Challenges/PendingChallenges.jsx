import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import PendingChallengeCard from "./PendingChallengeCard";
import AuthContext from "../../context/AuthContext";
import "./PendingChallenges.css";

const PendingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const { token } = useContext(AuthContext);

  // Estado para exibir mensagem de erro em um modal
  const [errorMessage, setErrorMessage] = useState("");

  // Função de busca dos desafios pendentes (paginado, size=4)
  const fetchPendingChallenges = useCallback(async () => {
    try {
      const url = "http://localhost:8080/jokenpo/challenge/pending";
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
      const url = "http://localhost:8080/jokenpo/challenge/isAccepted";
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

      // Se o desafio foi aceito e tudo deu certo,
      // o backend retorna um MatchResponseDTO, por ex.:
      // { player1, player2, rounds, playerWinner }
      if (response.data) {
        console.log("Desafio aceito! Informações da partida:", response.data);
        // Aqui você poderia redirecionar para a tela da partida, por exemplo:
        // window.open(`/match/${response.data.matchId}`, "_blank");
      } else {
        // Se for null, significa que foi rejeitado ou algo do tipo
        console.log("Desafio rejeitado (ou retornou null).");
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

  // Função para fechar o modal de erro
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
            <button className="modal-button-peding-challenges" onClick={closeErrorModal}>
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PendingChallenges;
