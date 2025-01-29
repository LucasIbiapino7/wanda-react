import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from "../../context/AuthContext.js"
import "./LoginPage.css"

function  LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Exemplo de estado para exibir mensagens
  const [message, setMessage] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('Enviando dados...');

    try {
      await login(email, password);
      setMessage('Login bem-sucedido!');
      navigate('/home');
    } catch (error) {
      console.error(error);
      setMessage('Credenciais inválidas ou erro no servidor.');
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
      </div>
    </div>
  );
}

export default LoginPage;
