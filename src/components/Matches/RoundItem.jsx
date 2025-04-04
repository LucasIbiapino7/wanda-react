import { useState } from "react";
import PropTypes from "prop-types";
import "./RoundItem.css";

function RoundItem({ round, index, player1, player2 }) {
  const [open, setOpen] = useState(false);

  // Determina o "vencedor do turno"
  // Se round.playerWinTurn === 1 => player1, === 2 => player2, === 0 => Empate
  let roundResult = "Empate";
  if (round.playerWinTurn === 1) {
    roundResult = `Vencedor: ${player1.name}`;
  } else if (round.playerWinTurn === 2) {
    roundResult = `Vencedor: ${player2.name}`;
  }

  const handleToggle = () => {
    setOpen(!open);
  };

  return (
    <div className={`round-item ${open ? "open" : ""}`}>
      <div className="round-header" onClick={handleToggle}>
        <strong>Turno {round.turnNumber || index + 1}</strong> — {roundResult}
        <span className="accordion-icon">{open ? "▲" : "▼"}</span>
      </div>

      {open && (
        <div className="round-content">
          {round.plays?.map((play, j) => {
            let outcome = "Empate";
            if (play.winnerOfPlay === 1) {
              outcome = `Ganhou: ${player1.name}`;
            } else if (play.winnerOfPlay === 2) {
              outcome = `Ganhou: ${player2.name}`;
            }

            return (
              <div key={j} className="move">
                <div>
                  <strong>Jogada {play.playNumber}</strong>
                </div>
                {play.player1LogicChoice && (
                  <div>Lógica Player1: {play.player1LogicChoice}</div>
                )}
                {play.player2LogicChoice && (
                  <div>Lógica Player2: {play.player2LogicChoice}</div>
                )}
                <div>
                  Cartas: P1 = {play.playerCard1}, P2 = {play.playerCard2}
                </div>
                <div>Resultado: {outcome}</div>
                {play.tie && <div>(Empate)</div>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

RoundItem.propTypes = {
  round: PropTypes.shape({
    turnNumber: PropTypes.number,
    playerWinTurn: PropTypes.number.isRequired,
    plays: PropTypes.arrayOf(
      PropTypes.shape({
        playNumber: PropTypes.number.isRequired,
        playerCard1: PropTypes.string.isRequired,
        playerCard2: PropTypes.string.isRequired,
        winnerOfPlay: PropTypes.number,
        tie: PropTypes.bool,
        player1LogicChoice: PropTypes.string,
        player2LogicChoice: PropTypes.string,
      })
    ),
  }).isRequired,
  index: PropTypes.number.isRequired,
  player1: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
  player2: PropTypes.shape({
    name: PropTypes.string.isRequired,
  }).isRequired,
};

export default RoundItem;
