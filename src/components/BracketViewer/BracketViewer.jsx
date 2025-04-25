// src/components/BracketViewer/BracketViewer.jsx
import { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../context/AuthContext";
import "./BracketViewer.css";
import PropTypes from "prop-types";

export default function BracketViewer({ tournamentId }) {
  const { token } = useContext(AuthContext);
  const [bracket, setBracket] = useState(null);
  const [currentRound, setCurrentRound] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchBracket() {
      try {
        const response = await axios.get(
          `http://localhost:8080/tournament/${tournamentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setBracket(response.data);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.response?.data?.message ||
          err.message;
        setError(msg);
      }
    }
    fetchBracket();
  }, [tournamentId, token]);

  if (error) return <div className="bv-error">{error}</div>;
  if (!bracket) return <div className="bv-loading">Carregando bracket...</div>;

  const { rounds } = bracket;
  const round = rounds[currentRound];

  return (
    <div className="bv-container">
      <h2 className="bv-title">
        {round.name} ({currentRound + 1} de {rounds.length})
      </h2>

      <div className="bv-nav">
        <button
          className="bv-nav-button"
          onClick={() => setCurrentRound((i) => i - 1)}
          disabled={currentRound === 0}
        >
          ← Anterior
        </button>
        <button
          className="bv-nav-button"
          onClick={() => setCurrentRound((i) => i + 1)}
          disabled={currentRound === rounds.length - 1}
        >
          Próxima →
        </button>
      </div>

      <div className="bv-rounds-wrapper">
        <div className="bv-round">
          {round.matches.map((match) => {
            const winnerIsP1 = match.winnerId === match.player1Id;
            return (
              <div key={match.matchId} className="bv-match-card">
                <div className="bv-match-players">
                  <span
                    className={
                      "bv-player-name" + (winnerIsP1 ? " bv-winner" : "")
                    }
                  >
                    {match.player1Name}
                  </span>
                  <span className="bv-vs">vs</span>
                  <span
                    className={
                      "bv-player-name" + (!winnerIsP1 ? " bv-winner" : "")
                    }
                  >
                    {match.player2Name}
                  </span>
                </div>
                <button
                  className="bv-replay-button"
                  onClick={() =>
                    window.open(`/matches/${match.matchId}`, "_blank")
                  }
                >
                  ▶ Assista a partida
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

BracketViewer.propTypes = {
  tournamentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
