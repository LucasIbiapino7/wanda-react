import PropTypes from "prop-types";
import './ProfileHeader.css'

function ProfileHeader({ nickname, numberOfMatches, numberOfWinners }) {
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
        </div>
      </div>
      <button className="edit-profile-button">Editar Perfil</button>
    </div>
  );
}

ProfileHeader.propTypes = {
  nickname: PropTypes.string.isRequired,
  numberOfMatches: PropTypes.number,
  numberOfWinners: PropTypes.number
};

export default ProfileHeader;
