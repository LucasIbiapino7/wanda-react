import PropTypes from "prop-types";
import "./StudentCard.css";
import CodeImg from "../../assets/code.svg";

const StudentCard = ({ student, onChallenge, onViewFunctions }) => {
  return (
    <div className="student-card">
      <div className="avatar"></div>
      <h3>{student.name}</h3>
      <div className="badges-container">
        {student.badges.map((badge) => (
          <img
            key={badge.id}
            src={`/assets/badges/${badge.iconUrl}`}
            alt={badge.name}
            title={badge.name}
            className="badge"
          />
        ))}
      </div>

      <div className="buttons-container">
        {/* **Mudança aqui**: chamamos onViewFunctions, não passamos student.code */}
        {student.code && (
          <div className="function-icon" data-tooltip="Ver funções" onClick={onViewFunctions}>
            <img src={CodeImg} alt="Código" />
          </div>
        )}
        <button
          className="btn btn-primary"
          onClick={() => onChallenge(student.id)}
        >
          Desafiar
        </button>
      </div>
    </div>
  );
};

StudentCard.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    badges: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        iconUrl: PropTypes.string.isRequired,
      })
    ).isRequired,
    code: PropTypes.string,
    code2: PropTypes.string, 
  }).isRequired,
  onChallenge: PropTypes.func.isRequired,
  onViewFunctions: PropTypes.func.isRequired,  
};

export default StudentCard;
