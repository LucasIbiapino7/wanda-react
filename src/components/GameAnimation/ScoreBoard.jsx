import PropTypes from "prop-types";
import "./Styles.css"

const ScoreBoard = ({ player1, player2, currentTurn }) => {
  return (
    <div className="score-board">
      <div className="player-score">
        <h3>{player1.name}</h3>
        <p>Vitórias: {currentTurn.player1Winners}</p>
      </div>

      <div className="turn-info">
        <p>Turno: {currentTurn.turnNumber}</p>
        <p>Empates: {currentTurn.tie}</p>
      </div>

      <div className="player-score">
        <h3>{player2.name}</h3>
        <p>Vitórias: {currentTurn.player2Winners}</p>
      </div>
    </div>
  );
};

ScoreBoard.propTypes = {
  player1: PropTypes.object.isRequired,
  player2: PropTypes.object.isRequired,
  currentTurn: PropTypes.object.isRequired,
};

export default ScoreBoard;
