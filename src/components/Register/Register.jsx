import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import AuthService from "../../services/AuthService";
import "./Register.css";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Register() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [globalMsg, setGlobalMsg] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const navigate = useNavigate();
  const firstErrorRef = useRef(null);

  const emptyErrs = { firstName: "", lastName: "", email: "", password: "" };

  const focusFirstError = () => {
    const map = [
      ["firstName", "firstName"],
      ["lastName", "lastName"],
      ["email", "email"],
      ["password", "password"],
    ];
    for (const [key, id] of map) {
      if (fieldErrors[key]) {
        const el = document.getElementById(id);
        if (el) el.focus();
        return;
      }
    }
    if (firstErrorRef.current) firstErrorRef.current.focus();
  };

  const validate = () => {
    const errs = { ...emptyErrs };

    const name = `${firstName} ${lastName}`.replace(/\s+/g, " ").trim();
    if (name.length < 2 || name.length > 30) {
      const msg = "O nome completo deve ter entre 2 e 30 caracteres.";
      errs.firstName = msg;
      errs.lastName = msg;
    }
    if (!emailRegex.test(email)) {
      errs.email = "Email inválido.";
    }
    if (password.length < 6 || password.length > 50) {
      errs.password = "A senha deve conter entre 6 e 50 caracteres.";
    }

    setFieldErrors(errs);
    setTimeout(focusFirstError, 0);
    return !Object.values(errs).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalMsg("");

    if (!validate()) return;

    setSubmitting(true);
    try {
      await AuthService.register({ firstName, lastName, email, password });
      setGlobalMsg("Cadastro realizado com sucesso! Redirecionando para o login...");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      const status = err?.normalized?.status;
      const data = err?.response?.data;

      if (status === 422 && Array.isArray(data?.errors)) {
        const nextErrors = { ...emptyErrs };
        data.errors.forEach((it) => {
          if (it.fieldName === "name") {
            nextErrors.firstName = it.message;
            nextErrors.lastName = it.message;
          }
          if (it.fieldName === "email") {
            nextErrors.email = it.message;
          }
          if (it.fieldName === "password") {
            nextErrors.password = it.message;
          }
        });
        setFieldErrors(nextErrors);
        setTimeout(focusFirstError, 0);
      } else if (status === 400) {
        setFieldErrors({
          ...emptyErrs,
          email: data?.error || "Esse email já está sendo usado.",
        });
        setTimeout(focusFirstError, 0);
      } else {
        setGlobalMsg(err?.normalized?.message || "Não foi possível concluir o cadastro.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <h2 className="register-title">Crie sua conta</h2>
        <p className="register-subtitle">Preencha os campos para se cadastrar</p>

        <form className="register-form" onSubmit={handleSubmit} noValidate>
          <label htmlFor="firstName">Nome:</label>
          <input
            id="firstName"
            type="text"
            placeholder="Digite seu nome"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            aria-invalid={!!fieldErrors.firstName}
            aria-describedby="firstName-error"
            required
          />
          {fieldErrors.firstName && (
            <span id="firstName-error" className="field-error">
              {fieldErrors.firstName}
            </span>
          )}

          <label htmlFor="lastName">Sobrenome:</label>
          <input
            id="lastName"
            type="text"
            placeholder="Digite seu sobrenome"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            aria-invalid={!!fieldErrors.lastName}
            aria-describedby="lastName-error"
            required
          />
          {fieldErrors.lastName && (
            <span id="lastName-error" className="field-error">
              {fieldErrors.lastName}
            </span>
          )}

          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            aria-invalid={!!fieldErrors.email}
            aria-describedby="email-error"
            required
          />
          {fieldErrors.email && (
            <span id="email-error" className="field-error">
              {fieldErrors.email}
            </span>
          )}

          <label htmlFor="password">Senha:</label>
          <input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!fieldErrors.password}
            aria-describedby="password-error"
            required
          />
          {fieldErrors.password && (
            <span id="password-error" className="field-error">
              {fieldErrors.password}
            </span>
          )}

          <button type="submit" className="register-button" disabled={submitting}>
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        {globalMsg && (
          <p
            className="register-message"
            tabIndex={-1}
            ref={firstErrorRef}
            role="status"
            aria-live="polite"
          >
            {globalMsg}
          </p>
        )}
      </div>
    </div>
  );
}