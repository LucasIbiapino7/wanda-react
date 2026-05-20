import PropTypes from "prop-types"
import "./ClassroomCard.css"

// Editar aqui após implementação de escalabilidade
const GAME_LABELS = {
    jokenpo: "Jokenpô",
    bits: "BITS"
}

function formatLocation(classroom) {
    const institution = classroom.institution?.trim()
    const city = classroom.city?.trim()
    const state = classroom.state?.trim()

    // Formatar com espaço cidade e estado
    const place = [city,state].filter(Boolean).join(", ")

    if(institution && place){
        return `${institution} · ${place}`
    }

    if (institution){
        return institution
    }

    if (place){
        return place
    }

    return "Local não cadastrado"
}

// Retorna nome do jogo
// Editar aqui após implementação de escalabilidade
function getGameLabel(gameName){
    const pos = String(gameName || "").toLocaleLowerCase()
    return GAME_LABELS[pos] || gameName || "Jogo não informado"
}

export default function ClassroomCard({ classroom, mode, onOpen }){
    const isArchived = classroom.status === "ARCHIVED"
    const gameKey = String(classroom.gameName || "").toLowerCase()

  return (
    <article className={`classroom-card ${isArchived ? "classroom-card--archived" : ""}`}>
      <div className={`classroom-card__accent classroom-card__accent--${gameKey}`} />

      <div className="classroom-card__body">
        <div className="classroom-card__header">
          <div>
            <h2 className="classroom-card__title">{classroom.name}</h2>

            {classroom.course && (
              <p className="classroom-card__course">{classroom.course}</p>
            )}

            <p className="classroom-card__location">
              {formatLocation(classroom)}
            </p>
          </div>

          <span
            className={`classroom-card__status ${
              isArchived
                ? "classroom-card__status--archived"
                : "classroom-card__status--active"
            }`}
          >
            {isArchived ? "Arquivada" : "Ativa"}
          </span>
        </div>

        <div className="classroom-card__meta">
          <span className={`classroom-card__game classroom-card__game--${gameKey}`}>
            {getGameLabel(classroom.gameName)}
          </span>

          {mode === "student" && classroom.instructorName && (
            <span>Prof. {classroom.instructorName}</span>
          )}
        </div>

        {classroom.description && (
          <p className="classroom-card__description">
            {classroom.description}
          </p>
        )}
      </div>

      <div className="classroom-card__footer">
        {mode === "instructor" && !isArchived && (
          <div className="classroom-card__code">
            <span className="classroom-card__code-label">Código</span>
            <strong>{classroom.accessCode}</strong>
          </div>
        )}

        <button
          type="button"
          className="classroom-card__button"
          onClick={() => onOpen(classroom)}
        >
          Acessar turma
        </button>
      </div>
    </article>
  );
}

// Definição dos atributos recebidos por classroom
// React confirma natureza dos dados recebidos
ClassroomCard.propTypes = {
  classroom: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    course: PropTypes.string,
    description: PropTypes.string,
    status: PropTypes.string,
    accessCode: PropTypes.string,
    institution: PropTypes.string,
    city: PropTypes.string,
    state: PropTypes.string,
    gameName: PropTypes.string,
    instructorName: PropTypes.string,
  }).isRequired,
  mode: PropTypes.oneOf(["student", "instructor"]).isRequired,
  onOpen: PropTypes.func.isRequired,
};