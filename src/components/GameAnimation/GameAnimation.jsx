// GameAnimation.jsx
import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import ScoreBoard from "./ScoreBoard.jsx";
import "./Styles.css";
import CardsBattle from "./CardsBattle.jsx";

const GameAnimation = ({ matchReport }) => {
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  // Resetar estados quando receber novo relatório
  useEffect(() => {
    setCurrentTurnIndex(0);
    setCurrentPlayIndex(0);
    setIsPlaying(true);
  }, [matchReport]);

  const currentTurn = matchReport?.turns?.[currentTurnIndex];
  const currentPlay = currentTurn?.plays?.[currentPlayIndex];

  useEffect(() => {
    if (!isPlaying || !currentTurn || !matchReport) return;

    const timeout = setTimeout(() => {
      if (currentPlayIndex < currentTurn.plays.length - 1) {
        setCurrentPlayIndex((prev) => prev + 1);
      } else if (currentTurnIndex < matchReport.turns.length - 1) {
        setCurrentTurnIndex((prev) => prev + 1);
        setCurrentPlayIndex(0);
      } else {
        setIsPlaying(false);
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [currentPlayIndex, isPlaying, currentTurn, matchReport, currentTurnIndex]);

  if (!matchReport || !currentTurn) {
    return <div>Carregando jogo...</div>;
  }

  console.log("currentPlay.player1Card" + currentPlay.player1Card);
  console.log("currentPlay.player1Card" + currentPlay.player2Card);

  return (
    <div className="game-container">
      <ScoreBoard
        player1={matchReport.player1}
        player2={matchReport.player2}
        currentTurn={currentTurn}
      />

      <div className="play-area">
        <div className="player-cards">
          <h4>{matchReport.player1.name}</h4>
          <CardsBattle
            selectedCard={currentPlay.playerCard1}
            winnerCard={
              currentPlay.winnerOfPlay === 1 ? currentPlay.playerCard1 : null
            }
          />
        </div>
        <div className="player-cards">
          <h4>{matchReport.player2.name}</h4>
          <CardsBattle
            selectedCard={currentPlay.playerCard2}
            winnerCard={
              currentPlay.winnerOfPlay === 2 ? currentPlay.playerCard2 : null
            }
          />
        </div>
      </div>

      <div className="controls">
        <button onClick={() => setIsPlaying(!isPlaying)}>
          {isPlaying ? "⏸️ Pausar" : "▶️ Continuar"}
        </button>
      </div>
    </div>
  );
};

GameAnimation.propTypes = {
  matchReport: PropTypes.shape({
    matchId: PropTypes.number,
    player1: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    player2: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }).isRequired,
    turns: PropTypes.arrayOf(
      PropTypes.shape({
        turnNumber: PropTypes.number.isRequired,
        plays: PropTypes.arrayOf(
          PropTypes.shape({
            playNumber: PropTypes.number.isRequired,
            player1Card: PropTypes.string.isRequired,
            player2Card: PropTypes.string.isRequired,
            winnerOfPlay: PropTypes.number.isRequired,
            tie: PropTypes.bool.isRequired,
          })
        ).isRequired,
        tie: PropTypes.number.isRequired,
        player1Winners: PropTypes.number.isRequired,
        player2Winners: PropTypes.number.isRequired,
        playerWinTurn: PropTypes.number.isRequired,
      })
    ).isRequired,
    playerWinner: PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
    }),
  }),
};

export default GameAnimation;
