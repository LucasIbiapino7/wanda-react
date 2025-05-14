import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Enviando dados...");

    try {
      await login(email, password);
      setMessage("Login bem-sucedido!");
      navigate("/");
    } catch (error) {
      setMessage(error.data.error);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <h2 className="login-title">Bem-vindo(a)!</h2>
        <p className="login-subtitle">Faça login para continuar</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        {message && <p className="login-message">{message}</p>}

        <div className="login-footer">
          <p>
            Não tem conta?{" "}
            <span className="login-link" onClick={() => navigate("/register")}>
              Cadastre-se
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
