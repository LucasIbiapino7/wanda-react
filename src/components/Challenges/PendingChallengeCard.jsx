import PropTypes from "prop-types";
import "./PendingChallengeCard.css";
import RejectedImg from "../../assets/rejected.svg";
import AcceptedImg from "../../assets/accept.svg";

const PendingChallengeCard = ({ challenge, onAcceptOrReject, disabled = false }) => {
  const gameIcon = `/assets/games/${String(challenge.gameName || "").toLowerCase()}.png`;

  const dt = new Date(challenge.createdAt);
  const dateStr = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" }).format(dt);
  const timeStr = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(dt);
  const sentLabel = `${dateStr} • ${timeStr}`;

  return (
    <div className="pending-challenge-card">
      <img
        src={gameIcon}
        alt={challenge.gameName}
        className="challenge-game-icon"
        onError={(e) => {
          e.currentTarget.style.visibility = "hidden";
        }}
      />

      <div className="pending-card-titles">
        <p className="challenge-text">
          <strong>{challenge.challengerName}</strong> desafiou você!
        </p>
        <div className="meta-row">
          <span className="challenge-game-name">
            {String(challenge.gameName || "").toUpperCase()}
          </span>
          <span className="challenge-date">{sentLabel}</span>
        </div>
      </div>

      <div className="pending-challenge-item-btns">
        <button
          className="circle-btn ok"
          onClick={() => onAcceptOrReject(challenge.id, true)}
          aria-label="Aceitar desafio"
          title="Aceitar"
          disabled={disabled}
          aria-busy={disabled}
        >
          <img src={AcceptedImg} alt="" />
        </button>
        <button
          className="circle-btn no"
          onClick={() => onAcceptOrReject(challenge.id, false)}
          aria-label="Rejeitar desafio"
          title="Rejeitar"
          disabled={disabled}
          aria-busy={disabled}
        >
          <img src={RejectedImg} alt="" />
        </button>
      </div>
    </div>
  );
};

PendingChallengeCard.propTypes = {
  challenge: PropTypes.shape({
    id: PropTypes.number.isRequired,
    challengerId: PropTypes.number.isRequired,
    challengedName: PropTypes.string.isRequired,
    challengerName: PropTypes.string.isRequired,
    createdAt: PropTypes.string.isRequired,
    gameName: PropTypes.string.isRequired,
  }).isRequired,
  onAcceptOrReject: PropTypes.func.isRequired,
  disabled: PropTypes.bool,
};

export default PendingChallengeCard;
