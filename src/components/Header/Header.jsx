import { useContext, useState } from "react";
import logo from "../../assets/logo.png";
import { Link, useNavigate } from "react-router-dom";
import profileImg from "../../assets/profile.svg";
import "./Header.css";
import AuthContext from "../../context/AuthContext.jsx";

function Header() {
  const { isAuthenticated, logout } = useContext(AuthContext);

  // Controla exibição do pequeno menu de perfil
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileClick = () => {
    setShowProfileMenu((prev) => !prev);
  };

  const goToProfile = () => {
    setShowProfileMenu(false);
    navigate("/profile"); // ou qualquer rota do seu perfil
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Wanda Logo" className="logo-image" />
        </Link>
      </div>

      <nav className="nav">
        <Link className="nav-link" to="/jokenpo1">
          Enviar Função
        </Link>
        <Link className="nav-link" to="/challenges">
          Desafios
        </Link>
        <Link className="nav-link" to="/tournament">
          Torneios
        </Link>
        <Link className="nav-link" to="/ranking">
          Ranking
        </Link>

        {isAuthenticated && (
          <div className="profile-container">
            <img
              src={profileImg}
              alt="Profile"
              className="profile-image"
              onClick={handleProfileClick}
            />
            {showProfileMenu && (
              <div className="profile-menu">
                <button onClick={goToProfile}>Meu Perfil</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}

export default Header;
