import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";
import wandaLogo from "../../assets/logo.png";
import labLogo from "../../assets/telemidia-logo.png";
import profileImg from "../../assets/profile.svg";
import "./Header.css";

export default function Header() {
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleProfile = () => setShowProfileMenu((p) => !p);
  const toggleMobileNav = () => setShowMobileNav((p) => !p);

  return (
    <header className="header">
      <div className="logo-group">
        <Link to="/">
          <img src={wandaLogo} alt="Wanda" className="logo-main" />
        </Link>
        <img src={labLogo} alt="Lab" className="logo-lab" />
      </div>

      <div className="hamburger" onClick={toggleMobileNav} aria-label="Abrir menu">
        <span />
        <span />
        <span />
      </div>

      <nav className={`nav ${showMobileNav ? "open" : ""}`}>
        <Link className="nav-link" to="/games" onClick={toggleMobileNav}>
          Jogos
        </Link>
        <Link className="nav-link" to="/challenges" onClick={toggleMobileNav}>
          Desafios
        </Link>
        <Link className="nav-link" to="/tournament" onClick={toggleMobileNav}>
          Torneios
        </Link>
        <Link className="nav-link" to="/ranking" onClick={toggleMobileNav}>
          Ranking
        </Link>

        {/* Botão visível apenas para admins */}
        {isAuthenticated && isAdmin && (
          <Link
            className="admin-btn"
            to="/admin/users"
            onClick={toggleMobileNav}
            title="Gerenciar usuários"
          >
            Admin
          </Link>
        )}

        {isAuthenticated && (
          <div className="profile-container">
            <img
              src={profileImg}
              alt="Perfil"
              className="profile-image"
              onClick={toggleProfile}
            />
            {showProfileMenu && (
              <div className="profile-menu">
                <button
                  onClick={() => {
                    toggleMobileNav();
                    navigate("/profile");
                  }}
                >
                  Meu Perfil
                </button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </nav>
    </header>
  );
}
