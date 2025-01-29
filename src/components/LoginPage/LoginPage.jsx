import { useState } from "react";
import "./LoginPage.css"

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Exemplo de estado para exibir mensagens
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage("Enviando dados...");
    // Aqui teremos a requisição ao backend
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
      </div>
    </div>
  );
}

export default LoginPage;
