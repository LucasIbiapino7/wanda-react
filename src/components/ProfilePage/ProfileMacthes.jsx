import PropTypes from "prop-types";
import './ProfileMatches.css'

function ProfileMatches({ matches }) {
  return (
    <div className="profile-matches">
      <h3>Histórico de Partidas</h3>
      {matches.length === 0 ? (
        <p>Você ainda não jogou nenhuma partida.</p>
      ) : (
        <ul>
          {matches.map((match) => (
            <li key={match.id}>
              <span>{match.date} - </span>
              <span> vs {match.opponent} - </span>
              <span>Resultado: {match.result}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

ProfileMatches.propTypes = {
  matches: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired, // ou 'number', dependendo de como o 'id' é tratado
      date: PropTypes.string.isRequired, // ou 'instanceOf(Date)', se o tipo for realmente Date
      opponent: PropTypes.string.isRequired,
      result: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default ProfileMatches;
