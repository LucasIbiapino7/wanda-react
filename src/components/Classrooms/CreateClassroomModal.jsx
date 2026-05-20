import { useState } from "react"
import PropTypes from "prop-types"
import "./CreateClassroomModal.css"


const INITIAL_FORM = {
  name: "",
  gameId: "",
  course: "",
  description: "",
  institution: "",
  city: "",
  state: "",
  mural: "",
}

// A confirmar com o backend
const GAME_OPTIONS = [
  { id: 1, label: "Jokenpô"},
  { id: 2, label: "BITS"}
]

const STATE_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO",
]

function validarForm(form){
  const errors = {}

  if (!form.name.trim()){
    errors.name = "Nome da turma é obrigatório."
  }

  if(!form.gameId){
    errors.gameId = "Selecione o jogo da turma."
  }

  return errors
}

export default function CreateClassroomModal({ open, onClose, onCreate}){
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  if (!open){
    return null
  }

  // Atualiza campos de input durante uso e erros
  const handleChange = (e) => {
    const {name, value} = e.target

    setForm((current) => ({
      ...current,
      [name]: value
    }))

    setFieldErrors((current) => ({
      ...current,
      [name]: ""
    }))
  }

  const handleSubmit = async(event) => {
    event.preventDefault()

    const errors = validarForm(form)

    if(Object.keys(errors).length > 0){
      setFieldErrors(errors)
      return
    }

    setSubmitting(true)

    try{
      await onCreate({
        name: form.name.trim(),
        gameId: Number(form.gameId),
        course: form.course.trim() || null,
        description: form.description.trim() || null,
        institution: form.institution.trim() || null,
        city: form.city.trim() || null,
        state: form.state || null,
        mural: form.mural.trim() || null,
      })

      setForm(INITIAL_FORM)
    } finally{
      setSubmitting(false)
    }
  }

  return (
    <div className="create-classroom-modal__overlay" onMouseDown={onClose}>
      <div
        className="create-classroom-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-classroom-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="create-classroom-modal__header">
          <h2 id="create-classroom-title">Nova Turma</h2>

          <button
            type="button"
            className="create-classroom-modal__close"
            onClick={onClose}
            aria-label="Fechar modal"
          >
            ×
          </button>
        </div>

        <form className="create-classroom-modal__form" onSubmit={handleSubmit}>
          <label>
            Nome da turma <span>*</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Ex: Turma A - Manhã"
              maxLength={255}
            />
            {fieldErrors.name && (
              <small className="create-classroom-modal__error">
                {fieldErrors.name}
              </small>
            )}
          </label>

          <label>
            Jogo <span>*</span>
            <select name="gameId" value={form.gameId} onChange={handleChange}>
              <option value="">Selecione o jogo</option>
              {GAME_OPTIONS.map((game) => (
                <option key={game.id} value={game.id}>
                  {game.label}
                </option>
              ))}
            </select>
            {fieldErrors.gameId && (
              <small className="create-classroom-modal__error">
                {fieldErrors.gameId}
              </small>
            )}
          </label>

          <label>
            Curso / Disciplina
            <input
              type="text"
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Ex: Engenharia de Computação"
              maxLength={100}
            />
          </label>

          <label>
            Descrição
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Descreva o objetivo da turma..."
              maxLength={1500}
            />
          </label>

          <div className="create-classroom-modal__divider" />

          <label>
            Instituição
            <input
              type="text"
              name="institution"
              value={form.institution}
              onChange={handleChange}
              placeholder="Ex: UFMA"
              maxLength={100}
            />
          </label>

          <div className="create-classroom-modal__row">
            <label>
              Cidade
              <input
                type="text"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Ex: São Luís"
                maxLength={50}
              />
            </label>

            <label>
              Estado
              <select name="state" value={form.state} onChange={handleChange}>
                <option value="">UF</option>
                {STATE_OPTIONS.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label>
            Mural
            <textarea
              name="mural"
              value={form.mural}
              onChange={handleChange}
              placeholder="Mensagem inicial para os alunos..."
              maxLength={1500}
            />
          </label>

          <div className="create-classroom-modal__actions">
            <button type="button" onClick={onClose} disabled={submitting}>
              Cancelar
            </button>

            <button type="submit" disabled={submitting}>
              {submitting ? "Criando..." : "Criar Turma"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

CreateClassroomModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
}