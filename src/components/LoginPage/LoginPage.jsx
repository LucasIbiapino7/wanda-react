import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../context/AuthContext.jsx";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setSubmitting(true)
    try {
      await login(email.trim(), password);
      navigate("/");
    } catch (err) {
      const status = err?.normalized?.status;
      const apiMsg = err?.normalized?.message;
      if(status === 401){
        setMessage("Email ou senha inválidos.")
      }else if(status === 422) {
        setMessage("Dados inválidos. Verifique os campos.")
      } else{
        setMessage(apiMsg || "Não foi possível fazer login no momento.");
      }
    } finally{
      setSubmitting(false)
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
            autoComplete="username"
            required
          />

          <label htmlFor="password">Senha:</label>
          <input
            type="password"
            id="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          <button type="submit" className="login-button" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
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
