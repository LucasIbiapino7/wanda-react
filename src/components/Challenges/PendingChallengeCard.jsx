import PropTypes from 'prop-types';
import "./PendingChallengeCard.css";

const PendingChallengeCard = ({ challenge }) => {
  return (
    <div className="pending-challenge-card">
      <p className="challenge-text">
        <strong>{challenge.challengerName}</strong> desafiou <strong>{challenge.challengedName}</strong>
      </p>
      <p className="challenge-date">
        Enviado em: {new Date(challenge.createdAt).toLocaleString()}
      </p>
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
