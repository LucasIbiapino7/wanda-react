import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setMessage("Por favor, insira um email válido.");
      return;
    }
    if (password.length < 6) {
      setMessage("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    const name = `${firstName.trim()} ${lastName.trim()}`;
    setMessage("Enviando dados...");
    try {
      const response = await axios.post("http://localhost:8080/auth/register", {
        email,
        name,
        password,
      });
      if (response.status === 200) {
        setMessage("Cadastro realizado com sucesso! Redirecionando...");
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      const err = error.response?.data?.error || "Erro ao registrar.";
      setMessage(err);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Crie sua conta</h2>
        <p className="register-subtitle">
          Preencha os campos para se cadastrar
        </p>
        <form className="register-form" onSubmit={handleSubmit}>
          <label htmlFor="firstName">Nome:</label>
          <input
            id="firstName"
            type="text"
            placeholder="Digite seu nome"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />

          <label htmlFor="lastName">Sobrenome:</label>
          <input
            id="lastName"
            type="text"
            placeholder="Digite seu sobrenome"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="register-button">
            Cadastrar
          </button>
        </form>
        {message && <p className="register-message">{message}</p>}
      </div>
    </div>
  );
}

export default Register;
