import PropTypes from "prop-types";
import "./PendingChallengeCard.css";
import RejectedImg from "../../assets/rejected.svg"
import AcceptedImg from "../../assets/accept.svg"

const PendingChallengeCard = ({ challenge }) => {
  return (
    <div className="pending-challenge-card">
      <p className="challenge-text">
        <strong>{challenge.challengerName}</strong> desafiou você!
      </p>
      <p className="challenge-date">
        Enviado em: {new Date(challenge.createdAt).toLocaleString()}
      </p>
      <div className="pending-challenge-item-btns">
        <img src={AcceptedImg} alt="aceitar" />
        <img src={RejectedImg} alt="rejeitar" />
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
  }).isRequired,
};

export default PendingChallengeCard;
