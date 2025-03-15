import { useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";
import PendingChallengeCard from "./PendingChallengeCard";
import AuthContext from "../../context/AuthContext";
import "./PendingChallenges.css";

const PendingChallenges = () => {
  const [challenges, setChallenges] = useState([]);
  const { token } = useContext(AuthContext);

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

  return (
    <div className="pending-challenges">
      <h2>Desafios Pendentes</h2>
      <div className="pending-challenges-grid">
        {challenges.length > 0 ? (
          challenges.map((challenge) => (
            <PendingChallengeCard key={challenge.id} challenge={challenge} />
          ))
        ) : (
          <p>Você não tem desafios pendentes no momento.</p>
        )}
      </div>
    </div>
  );
};

export default PendingChallenges;
