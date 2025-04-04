import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import RoundItem from "./RoundItem";
import "./MatchesDetails.css";

function MatchDetails() {
  const { id } = useParams();
  const { token } = useContext(AuthContext);

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Definimos uma função assíncrona para buscar os dados da partida
    const fetchMatchDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const url = `http://localhost:8080/jokenpo/match/${id}`;
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        console.log(response.data)
        setMatch(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados da partida:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    // Chama a função assíncrona dentro do useEffect
    fetchMatchDetails();
  }, [id, token]);

  if (loading) {
    return <div className="match-details">Carregando partida...</div>;
  }

  if (error || !match) {
    return (
      <div className="match-details">
        Erro ao carregar os detalhes da partida.
      </div>
    );
  }

  const player1 = match.player1;
  const player2 = match.player2;
  const rounds = match.rounds || [];
  const winner = match.playerWinner;

  return (
    <div className="match-details">
      {/* Seção dos jogadores */}
      <div className="players-info">
        <div
          className={`player ${
            winner && winner.id === player1.id ? "winner" : ""
          }`}
        >
          <div className="name">{player1.name}</div>
        </div>
        <div
          className={`player ${
            winner && winner.id === player2.id ? "winner" : ""
          }`}
        >
          <div className="name">{player2.name}</div>
        </div>
      </div>

      {/* Lista de turnos (RoundItem) */}
      <div className="rounds">
        {rounds.map((round, index) => (
          <RoundItem
            key={index}
            round={round}
            index={index}
            player1={player1}
            player2={player2}
          />
        ))}
      </div>

      {/* Vencedor final da partida */}
      <div className="match-winner">
        {winner ? (
          <p>Vencedor da partida: {winner.name}</p>
        ) : (
          <p>A partida terminou empatada!</p>
        )}
      </div>
    </div>
  );
}

export default MatchDetails;
