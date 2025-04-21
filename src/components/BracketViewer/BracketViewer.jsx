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

  if (error) return <div className="bracket-error">{error}</div>;
  if (!bracket)
    return <div className="bracket-loading">Carregando bracket...</div>;

  const { rounds } = bracket;
  const round = rounds[currentRound];

  return (
    <div className="bracket-container">
      <h2 className="bracket-title">
        {round.name} ({currentRound + 1} de {rounds.length})
      </h2>

      <div className="bracket-nav">
        <button
          className="bracket-nav-button"
          onClick={() => setCurrentRound((i) => i - 1)}
          disabled={currentRound === 0}
        >
          ← Anterior
        </button>
        <button
          className="bracket-nav-button"
          onClick={() => setCurrentRound((i) => i + 1)}
          disabled={currentRound === rounds.length - 1}
        >
          Próxima →
        </button>
      </div>

      <div className="round-column-container">
        <div className="round-column">
          {round.matches.map((match) => (
            <div key={match.matchId} className="match-card">
              <div className="match-players">
                <span className="player-name">{match.player1Name}</span>
                <span className="vs-text">vs</span>
                <span className="player-name">{match.player2Name}</span>
              </div>
              <button
                className="replay-button"
                onClick={() =>
                  window.open(`/matches/${match.matchId}`, "_blank")
                }
              >
                ▶ Rever partida
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

BracketViewer.propTypes = {
  tournamentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};
