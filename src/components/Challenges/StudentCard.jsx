import PropTypes from "prop-types";
import "./StudentCard.css";

const StudentCard = ({ student, onOpenChallenge, onBadgeClick }) => {
  const hasNick = student.nickName && String(student.nickName).trim().length > 0;

  return (
    <div className="student-card">
      <div className="avatar">
        <img
          src={`/assets/personagens/${student.characterUrl}`}
          alt={student.characterUrl}
        />
      </div>

      <div className="student-title">
        <h3 className="student-name">{student.name}</h3>
        {hasNick && <span className="student-nick">@{student.nickName}</span>}
      </div>

      <div className="badges-container">
        {student.badges.map((badge) => (
          <img
            key={badge.id}
            src={`/assets/badges/${badge.iconUrl}`}
            alt={badge.name}
            title={badge.name}
            className="badge"
            onClick={() => onBadgeClick(badge)}
          />
        ))}
      </div>

      <div className="buttons-container">
        <button className="btn btn-primary" onClick={onOpenChallenge}>
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
    nickName: PropTypes.string,
    characterUrl: PropTypes.string.isRequired,
    badges: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        name: PropTypes.string.isRequired,
        iconUrl: PropTypes.string.isRequired,
      })
    ).isRequired,
  }).isRequired,
  onOpenChallenge: PropTypes.func.isRequired,
  onBadgeClick: PropTypes.func.isRequired,
};

export default StudentCard;
