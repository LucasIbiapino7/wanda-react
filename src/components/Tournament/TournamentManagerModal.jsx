import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import TournamentService from "../../services/TournamentService";
import "./TournamentManagerModal.css";

export default function TournamentManagerModal({ tournament, onClose }) {
  const isError = tournament.status === "ERROR";
  const [tab, setTab] = useState("edit");

  const [form, setForm] = useState({
    name: tournament.name,
    description: tournament.description,
    startTime: tournament.startTime
      ? tournament.startTime.slice(0, 16)
      : "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [participants, setParticipants] = useState([]);
  const [loadingParticipants, setLoadingParticipants] = useState(false);
  const [participantsError, setParticipantsError] = useState(null);

  const [cancelling, setCancelling] = useState(false);
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => {
    if (tab === "participants") {
      fetchParticipants();
    }
  }, [tab]);

  const fetchParticipants = async () => {
    setLoadingParticipants(true);
    setParticipantsError(null);
    try {
      const data = await TournamentService.getParticipants(tournament.id);
      setParticipants(data.participants ?? []);
    } catch {
      setParticipantsError("Não foi possível carregar os participantes.");
    } finally {
      setLoadingParticipants(false);
    }
  };

  const validateFields = () => {
    const errors = {};
    if (!form.name.trim()) errors.name = "O nome é obrigatório.";
    else if (form.name.length < 3 || form.name.length > 40)
      errors.name = "O nome precisa ter entre 3 e 40 caracteres.";
    if (!form.description.trim()) errors.description = "A descrição é obrigatória.";
    else if (form.description.length < 5 || form.description.length > 80)
      errors.description = "A descrição precisa ter entre 5 e 80 caracteres.";
    return errors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setFormError(null);
    setFormSuccess(null);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    const errors = validateFields();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      let iso = form.startTime;
      if (iso && iso.length === 16) iso = iso + ":00";

      await TournamentService.update(tournament.id, {
        name: form.name,
        description: form.description,
        startTime: iso || null,
      });
      setFormSuccess("Torneio atualizado com sucesso!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erro ao atualizar o torneio.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await TournamentService.cancel(tournament.id);
      onClose();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Erro ao cancelar o torneio.";
      setFormError(msg);
      setConfirmCancel(false);
    } finally {
      setCancelling(false);
    }
  };

  const renderCancelBlock = () => (
    <>
      <div className="tm-divider" />
      {!confirmCancel ? (
        <button
          type="button"
          className="tm-btn tm-btn--danger"
          onClick={() => setConfirmCancel(true)}
        >
          Cancelar torneio
        </button>
      ) : (
        <div className="tm-confirm-cancel">
          <p>Tem certeza? Esta ação não pode ser desfeita.</p>
          <div className="tm-confirm-actions">
            <button
              type="button"
              className="tm-btn"
              onClick={() => setConfirmCancel(false)}
              disabled={cancelling}
            >
              Voltar
            </button>
            <button
              type="button"
              className="tm-btn tm-btn--danger"
              onClick={handleCancel}
              disabled={cancelling}
            >
              {cancelling ? "Cancelando..." : "Confirmar cancelamento"}
            </button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="tm-overlay" onClick={onClose}>
      <div className="tm-container" onClick={(e) => e.stopPropagation()}>

        <button className="tm-close" onClick={onClose} aria-label="Fechar">×</button>

        <h3 className="tm-title">{tournament.name}</h3>
        <p className="tm-subtitle">Gerenciamento do torneio</p>

        {/* Modo ERROR — só cancelar */}
        {isError && (
          <div className="tm-error-block">
            <p className="tm-error-block-title">⚠️ Este torneio encontrou um erro durante a execução.</p>
            {tournament.errorContext && (
              <p className="tm-error-block-context">{tournament.errorContext}</p>
            )}
            <p className="tm-error-block-hint">
              Você pode cancelar este torneio e criar um novo quando estiver pronto.
            </p>
            {formError && <p className="tm-error">⚠️ {formError}</p>}
            {renderCancelBlock()}
          </div>
        )}

        {/* Modo OPEN — editar + participantes + cancelar */}
        {!isError && (
          <>
            <div className="tm-tabs">
              <button
                className={`tm-tab ${tab === "edit" ? "tm-tab--active" : ""}`}
                onClick={() => setTab("edit")}
              >
                ✏️ Editar
              </button>
              <button
                className={`tm-tab ${tab === "participants" ? "tm-tab--active" : ""}`}
                onClick={() => setTab("participants")}
              >
                👥 Participantes
              </button>
            </div>

            {tab === "edit" && (
              <form className="tm-form" onSubmit={handleSubmitEdit}>
                <label>
                  Nome
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Nome do torneio"
                  />
                  {fieldErrors.name && (
                    <small className="tm-field-error">{fieldErrors.name}</small>
                  )}
                </label>

                <label>
                  Descrição
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="Descrição do torneio"
                  />
                  {fieldErrors.description && (
                    <small className="tm-field-error">{fieldErrors.description}</small>
                  )}
                </label>

                <label>
                  Data de início
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={form.startTime}
                    onChange={handleChange}
                  />
                </label>

                {formError && <p className="tm-error">⚠️ {formError}</p>}
                {formSuccess && <p className="tm-success">✓ {formSuccess}</p>}

                <button
                  type="submit"
                  className="tm-btn tm-btn--primary"
                  disabled={submitting}
                >
                  {submitting ? "Salvando..." : "Salvar alterações"}
                </button>

                {renderCancelBlock()}
              </form>
            )}

            {tab === "participants" && (
              <div className="tm-participants">
                {loadingParticipants && <p className="tm-loading">Carregando...</p>}
                {participantsError && <p className="tm-error">{participantsError}</p>}
                {!loadingParticipants && participants.length === 0 && (
                  <p className="tm-empty">Nenhum participante inscrito ainda.</p>
                )}
                {participants.map((p) => (
                  <div key={p.id} className="tm-participant-row">
                    <span className="tm-participant-name">{p.name}</span>
                    <span className="tm-participant-email">{p.email}</span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}

TournamentManagerModal.propTypes = {
  tournament: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string,
    startTime: PropTypes.string,
    status: PropTypes.string,
    errorContext: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};