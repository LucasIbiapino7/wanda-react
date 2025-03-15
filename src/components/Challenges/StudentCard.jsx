import PropTypes from "prop-types";
import "./StudentCard.css";
import CodeImg from "../../assets/code.svg";

const StudentCard = ({ student, onChallenge }) => {
  return (
    <div className="student-card">
      <div className="avatar"></div>
      <h3>{student.name}</h3>

      <div className="badges-container">
        {student.badges.map((badge, index) => (
          <img
            key={index}
            src={`/assets/badges/${badge}.svg`}
            alt={badge}
            className="badge"
          />
        ))}
      </div>

      <div className="buttons-container">
        {student.code && (
          <div className="function-icon" data-tooltip="Ver função">
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
    badges: PropTypes.arrayOf(PropTypes.string).isRequired,
    code: PropTypes.string, // pode ser string ou undefined
  }).isRequired,
  onChallenge: PropTypes.func.isRequired, // Função para enviar o desafio
};

export default StudentCard;
