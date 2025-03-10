import PropTypes from "prop-types";
import "./ProfileHeader.css";

function ProfileHeader({ nickname, numberOfMatches, numberOfWinners, badges }) {
  return (
    <div className="profile-header">
      <div className="profile-info">
        <div className="profile-placeholder">
          {/* Placeholder para imagem de perfil */}
          <span className="profile-icon">👤</span>
        </div>
        <div className="profile-text">
          <h2>{nickname}</h2>
          <p>Partidas: {numberOfMatches}</p>
          <p>Vitórias: {numberOfWinners}</p>
          {badges && badges.length > 0 && (
            <div className="profile-badges">
              {badges.map((badge) => (
                <div key={badge.id} className="badge">
                  <span className="badge-icon">🏆</span>
                  <span className="badge-name">{badge.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <button className="edit-profile-button">Editar Perfil</button>
    </div>
  );
}

ProfileHeader.propTypes = {
  nickname: PropTypes.string.isRequired,
  numberOfMatches: PropTypes.number,
  numberOfWinners: PropTypes.number,
  badges: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      // Você pode incluir outras propriedades, como description ou iconUrl, se necessário.
    })
  ),
};

export default ProfileHeader;
