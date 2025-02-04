import PropTypes from "prop-types";
import './ProfileChallenges.css';

function ProfileChallenges({ challenges }) {
  return (
    <div className="profile-challenges">
      <h3>Desafios Recebidos</h3>
      {challenges.length === 0 ? (
        <p>Você não recebeu desafios.</p>
      ) : (
        <ul>
          {challenges.map((challenge) => (
            <li key={challenge.id}>
              <span>{challenge.date} - </span>
              <span>{challenge.challenger} desafiou você: </span>
              <span>{challenge.message}</span>
              <div className="challenge-actions">
                <button>Aceitar</button>
                <button>Recusar</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

ProfileChallenges.propTypes = {
  challenges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired, // ou PropTypes.number, dependendo do tipo de id
      date: PropTypes.string.isRequired,
      challenger: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ProfileChallenges;
