import { useState } from "react"
import PropTypes from "prop-types"
import "./ClassroomCard.css"

// Editar se for adicionar mais jogos
const GAME_LABELS = {
   jokenpo: "Jokenpô",
   bits: "BITS"
}

function normalizeGameKey(gameName) {
   return String(gameName || "").toLowerCase()
}

function formatLocation(classroom) {
   const institution = classroom.institution?.trim()
   const city = classroom.city?.trim()
   const state = classroom.state?.trim()
   const place = [city, state].filter(Boolean).join(", ")

   if (institution && place) {
      return `${institution} · ${place}`
   }

   if (institution) {
      return institution
   }

   if (place) {
      return place
   }

   return "Local não cadastrado"
}

function getGameLabel(gameName) {
   const gameKey = normalizeGameKey(gameName)
   return GAME_LABELS[gameKey] || gameName || "Jogo não informado"
}

function getMembersCount(classroom) {
   return (
      classroom.membersCount ??
      classroom.memberCount ??
      classroom.studentsCount ??
      classroom.studentCount ??
      classroom.totalStudents ??
      classroom.totalMembers
   )
}

function getSubmissionProgress(classroom) {
   const submitted = (
      classroom.submittedCount ??
      classroom.submissionsCount ??
      classroom.studentsSubmitted ??
      classroom.membersSubmitted
   )

   const total = getMembersCount(classroom)

   if (submitted === undefined || submitted === null || !total) {
      return null
   }

   const percent = Math.min(100, Math.round((Number(submitted) / Number(total)) * 100))

   return {
      submitted,
      total,
      percent
   }
}

function copyAccessCode(accessCode) {
   if (!accessCode || !navigator?.clipboard) {
      return Promise.resolve(false)
   }

   return navigator.clipboard
      .writeText(accessCode)
      .then(() => true)
      .catch(() => false)
}

export default function ClassroomCard({ classroom, mode, onOpen }) {
  const [copied, setCopied] = useState(false)
  const isArchived = classroom.status === "ARCHIVED"
  const canOpen = !isArchived
  const gameKey = normalizeGameKey(classroom.gameName)
  const membersCount = getMembersCount(classroom)
  const progress = getSubmissionProgress(classroom)
  const hasAccessCode = mode === "instructor" && classroom.accessCode

   const openCard = () => {
      if(!canOpen){
         return
      }
      onOpen(classroom)
   }

   const handleCardKeyDown = (event) => {
      if (!canOpen) {
         return
      }

      if (event.key === "Enter" || event.key === " ") {
         event.preventDefault()
         onOpen(classroom)
      }
   }

   const handleCopyAccessCode = async (event) => {
      event.stopPropagation()
      const success = await copyAccessCode(classroom.accessCode)

      if (success) {
         setCopied(true)      
      }
   }

   return (
      <article   
         className={`classroom-card ${isArchived ? "classroom-card--archived" : ""}`}
         onClick={canOpen ? openCard : undefined}
         onKeyDown={handleCardKeyDown}
         tabIndex={canOpen ? 0 : -1}
         role={canOpen ? "button" : undefined}
      >
         <div className={`classroom-card__accent classroom-card__accent--${gameKey}`} />

         <div className="classroom-card__body">
            <div className="classroom-card__header">
               <div className="classroom-card__heading">
                  <h2 className="classroom-card__title">{classroom.name}</h2>

                  {classroom.course && (
                     <p className="classroom-card__course">{classroom.course}</p>
                  )}

                  <p className="classroom-card__location">{formatLocation(classroom)}</p>
               </div>

               <span
                  className={`classroom-card__status ${
                     isArchived
                        ? "classroom-card__status--archived"
                        : "classroom-card__status--active"
                  }`}
               >
                  {!isArchived && <span className="classroom-card__status-dot" />}
                  {isArchived ? "Arquivada" : "Ativa"}
               </span>
            </div>

            <div className="classroom-card__meta">
               {membersCount !== undefined && membersCount !== null && (
                  <div className="classroom-card__meta-row">
                     <span aria-hidden="true">👥</span>
                     <span>{membersCount} alunos</span>
                  </div>
               )}

               <div className="classroom-card__meta-row">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                  <span className={`classroom-card__game classroom-card__game--${gameKey}`}>
                     {getGameLabel(classroom.gameName)}
                  </span>
               </div>

               {mode === "student" && classroom.instructorName && (
                  <div className="classroom-card__meta-row">
                     <span aria-hidden="true"></span>
                     <span>Prof. {classroom.instructorName}</span>
                  </div>
               )}
            </div>

            {classroom.description && (
               <p className="classroom-card__description">{classroom.description}</p>
            )}

            {progress && (
               <div className="classroom-card__progress">
                  <div className="classroom-card__progress-label">
                     <span>Submeteram a função</span>
                     <strong>
                        {progress.submitted} / {progress.total}
                     </strong>
                  </div>

                  <div className="classroom-card__progress-bar">
                     <div
                        className="classroom-card__progress-fill"
                        style={{ width: `${progress.percent}%` }}
                     />
                  </div>
               </div>
            )}
         </div>

         <div className="classroom-card__footer">
            {hasAccessCode ? (
               <div className="classroom-card__code">
                  <span className="classroom-card__code-label">Código</span>
                  <strong>{classroom.accessCode}</strong>
                  <button
                     type="button"
                     className="classroom-card__copy-button"
                     onClick={handleCopyAccessCode}
                  >
                     <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                     {copied ? "Copiado" : "Copiar"}
                  </button>
               </div>
            ) : (
               <span className="classroom-card__footer-note">
                  {isArchived ? "Turma arquivada" : "Acompanhe sua evolução"}
               </span>
            )}

            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
         </div>
      </article>
   )
}

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
      membersCount: PropTypes.number,
      memberCount: PropTypes.number,
      studentsCount: PropTypes.number,
      studentCount: PropTypes.number,
      totalStudents: PropTypes.number,
      totalMembers: PropTypes.number,
      submittedCount: PropTypes.number,
      submissionsCount: PropTypes.number,
      studentsSubmitted: PropTypes.number,
      membersSubmitted: PropTypes.number
   }).isRequired,
   mode: PropTypes.oneOf(["student", "instructor"]).isRequired,
   onOpen: PropTypes.func.isRequired
}
