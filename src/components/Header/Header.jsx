import logo from "../../assets/logo.png";
import { Link } from "react-router-dom";
import "./Header.css"

function Header() {
  return (
    <header className="header">
      <div className="logo">
        <Link to="/">
          <img src={logo} alt="Wanda Logo" className="logo-image" />
        </Link>
      </div>
      <nav className="nav">
        <Link className="nav-link" to="/enviar">
          Enviar Função
        </Link>
        <Link className="nav-link" to="/sobre">
          Jokenpo
        </Link>
      </nav>
    </header>
  );
}

export default Header;