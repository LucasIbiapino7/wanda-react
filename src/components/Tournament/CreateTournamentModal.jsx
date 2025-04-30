import { useState } from "react";
import PropTypes from "prop-types";
import "./CreateTournamentModal.css";

export default function CreateTournamentModal({ isOpen, onClose, onCreate }) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    startTime: "",
    maxParticipants: 8,
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // normaliza datetime-local para ISO completo (com segundos)
    let iso = form.startTime;
    if (iso && iso.length === 16) iso = iso + ":00";

    setSubmitting(true);
    await onCreate({
      ...form,
      startTime: iso,
      maxParticipants: Number(form.maxParticipants),
    });
    setSubmitting(false);
  };

  if (!isOpen) return null;

  return (
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
          ×
        </button>
        <h3 className="modal-title-tournament">Criar novo torneio</h3>
        <form className="modal-form-tournament" onSubmit={handleSubmit}>
          <label>
            Nome
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              minLength={3}
              maxLength={40}
            />
          </label>
          <label>
            Descrição
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              minLength={5}
              maxLength={80}
            />
          </label>
          <label>
            Início
            <input
              type="datetime-local"
              name="startTime"
              value={form.startTime}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Nº de participantes
            <select
              name="maxParticipants"
              value={form.maxParticipants}
              onChange={handleChange}
            >
              <option value={8}>8</option>
              <option value={16}>16</option>
              <option value={32}>32</option>
            </select>
          </label>
          <button
            type="submit"
            className="modal-submit-button-tournament"
            disabled={submitting}
          >
            {submitting ? "Criando…" : "Criar torneio"}
          </button>
        </form>
      </div>
    </div>
  );
}

CreateTournamentModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};
