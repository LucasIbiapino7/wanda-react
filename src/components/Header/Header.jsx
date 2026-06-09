import { useContext, useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";
import wandaLogo from "../../assets/logo.png";
import labLogo from "../../assets/telemidia-logo.png";
import profileImg from "../../assets/profile.svg";
import NotificationBell from "../Notifications/NotificationBell.jsx";
import "./Header.css";

export default function Header() {
  const { isAuthenticated, isAdmin, logout } = useContext(AuthContext);

  const profileMenuRef = useRef()
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleProfile = () => setShowProfileMenu((p) => !p);
  const toggleMobileNav = () => setShowMobileNav((p) => !p);

  // Fecha notificações ao clicar fora da aba
  useEffect(() => {
    if (!showProfileMenu){
      return undefined
    }

    const handleClose = (event) => {
      if(profileMenuRef.current && !profileMenuRef.current.contains(event.target)){
        setShowProfileMenu(false)
      }
    }

    document.addEventListener("mousedown", handleClose)

    return () => {
      document.removeEventListener("mousedown", handleClose)
    }
    }, [showProfileMenu])

  return (
    <header className="header" ref={profileMenuRef}>
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
        <Link className="nav-link" to="/classrooms" onClick={toggleMobileNav}>
          Turmas
        </Link>

        {/* Botão visível apenas para admins */}
        {isAuthenticated && isAdmin && (
          <Link
            className="admin-btn"
            to="/admin"
            onClick={toggleMobileNav}
            title="Área do administrador"
          >
            Admin
          </Link>
        )}

        {isAuthenticated && (
          <NotificationBell enabled={isAuthenticated} />
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