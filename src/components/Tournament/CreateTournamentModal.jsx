import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import PropTypes from "prop-types";
import "./CreateTournamentModal.css";

const GAMES = [
  { key: "jokenpo", label: "Jokenpo", icon: "/assets/games/jokenpo-logo.png" },
  { key: "bits", label: "BITS", icon: "/assets/games/bits-logo.png" },
];

// Retorno tempo de inicio do jogo default (apos 5 minutos)
function getInitialStartTime() {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 5)

  // Deixar no formato do input datetime-local
  const offset = date.getTimezoneOffset()
  const localDate = new Date(date.getTime() - offset * 60000)

  return localDate.toISOString().slice(0,16)
}

function getInitialForm(gameName){
  return{
    name: "",
    description: "",
    startTime: getInitialStartTime(),
    maxParticipants: 8,
    gameName: gameName || "jokenpo"
  }
}
export default function CreateTournamentModal({ isOpen, onClose, onCreate, gameName = "" }) {
  const [form, setForm] = useState(() => getInitialForm(gameName))

  const [errors, setErrors] = useState([]); // erros do backend
  const [fieldErrors, setFieldErrors] = useState({}); // validações inline do front
  const [submitting, setSubmitting] = useState(false);

  useEffect(()=>{
    if(!isOpen){
      return 
    }

    setForm(getInitialForm(gameName))
    setFieldErrors({})
    setErrors([])
  }, [isOpen, gameName])

  if (!isOpen) {
    return null
  }

  const validateFields = () => {
    const newErrors = {};

    if (!form.name.trim()) {
      newErrors.name = "O nome é obrigatório."
    }
    else if (form.name.length < 3 || form.name.length > 40){
      newErrors.name = "O nome precisa ter entre 3 e 40 caracteres.";
    }

    if (form.description.trim().length > 80){
      newErrors.description = "A descrição precisa ter no máximo 80 caracteres."
    } 

    if (!form.startTime) {
      newErrors.startTime = "A data de início é obrigatória.";
    }

    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" })); // limpa erro do campo
  };

  const handleSelectGame = (key) => {
    setForm((f) => ({ ...f, gameName: key }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors([]);
    const validation = validateFields();

    if (Object.keys(validation).length > 0) {
      setFieldErrors(validation);
      return;
    }

    setSubmitting(true);

    let iso = form.startTime;
    if (iso && iso.length === 16) {
      iso = iso + ":00"
    }

    try {
      await onCreate({
        ...form,
        description: form.description.trim() || null,
        startTime: iso,
        maxParticipants: Number(form.maxParticipants),
      });
      onClose(); // sucesso → fecha modal
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) {
        setErrors(data.errors.map((e) => `${e.fieldName}: ${e.message}`));
      } else {
        setErrors([
          data?.message || data?.error || "Erro ao criar torneio. Tente novamente.",
        ]);
      }
    } finally {
      setSubmitting(false);
    }
  };
  return createPortal(
    <div className="modal-overlay-tournament" onClick={onClose}>
      <div
        className="modal-container-tournament"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close-button-tournament"
          onClick={onClose}
          aria-label="Fechar"
        >
          x
        </button>

        <h3 className="modal-title-tournament">Criar novo torneio</h3>
        <p className="modal-subtitle-tournament">
          Defina as informações básicas do torneio.
        </p>

        <form className="modal-form-tournament" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Digite o nome do torneio"
            />
            {fieldErrors.name && (
              <small className="field-error">{fieldErrors.name}</small>
            )}
          </label>

          <label>
            Descrição
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva o torneio..."
            />
            {fieldErrors.description && (
              <small className="field-error">{fieldErrors.description}</small>
            )}
          </label>

          <label>
            Início
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
            />
            {fieldErrors.startTime && (
              <small className="field-error">{fieldErrors.startTime}</small>
            )}
          </label>

          <label>
            Quantidade de participantes
            <select
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={handleChange}
            >
              <option value={4}>4</option>
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={32}>32</option>
            </select>
          </label>

          <p className="game-label">
            {gameName ? "Jogo da turma" : "Selecione o jogo:"}
          </p>

          <div className="game-grid">
            {GAMES.map((g) => {
                const selected = form.gameName === g.key
                const disabled = Boolean(gameName) && gameName !== g.key

                return (
                  <button
                      key={g.key}
                      type="button"
                      className={`game-card ${selected ? "selected" : ""}`}
                      onClick={() => !gameName && handleSelectGame(g.key)}
                      disabled={disabled}
                  >
                      <img src={g.icon} alt={g.label} />
                      <span>{g.label}</span>
                  </button>
                )
            })}
          </div>

          {errors.length > 0 && (
            <div className="error-messages">
              {errors.map((msg, idx) => (
                <p key={idx} className="error-text">{msg}</p>
              ))}
            </div>
          )}

          <button
            type="submit"
            className="modal-submit-button-tournament"
            disabled={submitting}
          >
            {submitting ? "Criando…" : "Criar torneio"}
          </button>
        </form>
      </div>
    </div>, 
    document.body
  );
}

CreateTournamentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
  gameName: PropTypes.string
};