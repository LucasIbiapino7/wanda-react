import { useState } from "react"
import { createPortal } from "react-dom"
import PropTypes from "prop-types"
import "./CreateClassroomModal.css"

const INITIAL_FORM = {
   name: "",
   gameId: "",
   course: "",
   description: "",
   institution: "",
   city: "",
   state: ""
}

// Enquanto a API nao expuser um catalogo de jogos, o front usa esta lista para montar as opcoes.
const GAME_OPTIONS = [
   { id: 1, key: "jokenpo", label: "Jokempô", icon: "✊" },
   { id: 2, key: "bits", label: "BITS", icon: "⚡" }
]

const STATE_OPTIONS = [
   "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
   "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
   "SP", "SE", "TO"
]

function validateForm(form) {
   const errors = {}

   if (!form.name.trim()) {
      errors.name = "Nome da turma é obrigatório."
   }

   if (!form.gameId) {
      errors.gameId = "Selecione o jogo da turma."
   }

   return errors
}

export default function CreateClassroomModal({ open, onClose, onCreate }) {
   const [form, setForm] = useState(INITIAL_FORM)
   const [fieldErrors, setFieldErrors] = useState({})
   const [submitting, setSubmitting] = useState(false)

   if (!open) {
      return null
   }

   const handleChange = (event) => {
      const { name, value } = event.target

      setForm((current) => ({
         ...current,
         [name]: value
      }))

      setFieldErrors((current) => ({
         ...current,
         [name]: ""
      }))
   }

   const handleSelectGame = (gameId) => {
      setForm((current) => ({
         ...current,
         gameId: String(gameId)
      }))

      setFieldErrors((current) => ({
         ...current,
         gameId: ""
      }))
   }

   const handleSubmit = async (event) => {
      event.preventDefault()

      const errors = validateForm(form)

      if (Object.keys(errors).length > 0) {
         setFieldErrors(errors)
         return
      }

      setSubmitting(true)

      try {
         await onCreate({
            name: form.name.trim(),
            gameId: Number(form.gameId),
            course: form.course.trim() || null,
            description: form.description.trim() || null,
            institution: form.institution.trim() || null,
            city: form.city.trim() || null,
            state: form.state || null
         })

         setForm(INITIAL_FORM)
      } finally {
         setSubmitting(false)
      }
   }

   return createPortal(
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

               <div className="create-classroom-modal__field">
                  <span className="create-classroom-modal__label">
                     Jogo <strong>*</strong>
                  </span>

                  <div className="create-classroom-modal__games">
                     {GAME_OPTIONS.map((game) => {
                        const selected = String(form.gameId) === String(game.id)

                        return (
                           <button
                              key={game.id}
                              type="button"
                              className={`create-classroom-modal__game ${
                                 selected ? "create-classroom-modal__game--selected" : ""
                              } create-classroom-modal__game--${game.key}`}
                              onClick={() => handleSelectGame(game.id)}
                           >
                              <span aria-hidden="true">{game.icon}</span>
                              {game.label}
                           </button>
                        )
                     })}
                  </div>

                  <small className="create-classroom-modal__hint">
                     O jogo não pode ser alterado depois que a turma for criada.
                  </small>

                  {fieldErrors.gameId && (
                     <small className="create-classroom-modal__error">
                        {fieldErrors.gameId}
                     </small>
                  )}
               </div>

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
               <span className="create-classroom-modal__section-label">
                  Dados institucionais
               </span>

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
      </div>,
      document.body
   )
}

CreateClassroomModal.propTypes = {
   open: PropTypes.bool.isRequired,
   onClose: PropTypes.func.isRequired,
   onCreate: PropTypes.func.isRequired
}
