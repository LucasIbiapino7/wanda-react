import { useCallback, useContext, useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import AuthContext from "../context/AuthContext"
import ClassroomService from "../services/ClassroomService"
import ClassroomCard from "../components/Classrooms/ClassroomCard"
import CreateClassroomModal from "../components/Classrooms/CreateClassroomModal"
import AppModal from "../components/UI/AppModal"
import { getApiError } from "../utils/errors"
import "./ClassroomPage.css"

const STATUS = {
   ACTIVE: "ACTIVE",
   ARCHIVED: "ARCHIVED"
}

export default function ClassroomPage() {
   const navigate = useNavigate()
   const { isAdmin, isInstructor, loading: authLoading } = useContext(AuthContext)

   const mode = isAdmin || isInstructor ? "instructor" : "student"

   const [status, setStatus] = useState(STATUS.ACTIVE)
   const [classrooms, setClassrooms] = useState([])
   const [page, setPage] = useState(0)
   const [totalPages, setTotalPages] = useState(0)
   const [loading, setLoading] = useState(false)
   const [error, setError] = useState("")

   const [createModalOpen, setCreateModalOpen] = useState(false)
   const [accessCode, setAccessCode] = useState("")
   const [joining, setJoining] = useState(false)

   const [feedbackModal, setFeedbackModal] = useState({
      open: false,
      title: "",
      message: "",
      variant: "default"
   })

   const closeFeedbackModal = () => {
      setFeedbackModal((current) => ({
         ...current,
         open: false
      }))
   }

   const fetchClassrooms = useCallback(
      async (nextPage = 0, nextStatus = status) => {
         if (authLoading) {
            return
         }

         setLoading(true)
         setError("")

         try {
            const params = {
               status: nextStatus,
               page: nextPage,
               size: 10
            }

            const data =
               mode === "instructor"
                  ? await ClassroomService.listInstructorClassrooms(params)
                  : await ClassroomService.listStudentClassrooms(params)

            setClassrooms(data.content ?? [])
            setPage(data.number ?? nextPage)
            setTotalPages(data.totalPages ?? 0)
         } catch (error) {
            setError(getApiError(error))
         } finally {
            setLoading(false)
         }
      },
      [authLoading, mode, status]
   )

   useEffect(() => {
      fetchClassrooms(0, status)
   }, [fetchClassrooms, status])

   const handleChangeStatus = (nextStatus) => {
      setStatus(nextStatus)
      setPage(0)
   }

   const openClassroom = (classroom) => {
      navigate(`/classrooms/${classroom.id}`)
   }

   const handleCreateClassroom = async (payload) => {
      try {
         await ClassroomService.create(payload)

         setCreateModalOpen(false)
         setStatus(STATUS.ACTIVE)
         await fetchClassrooms(0, STATUS.ACTIVE)

         setFeedbackModal({
            open: true,
            title: "Turma criada",
            message: "A turma foi criada com sucesso.",
            variant: "success"
         })
      } catch (error) {
         setFeedbackModal({
            open: true,
            title: "Erro ao criar turma",
            message: getApiError(error),
            variant: "error"
         })

         throw error
      }
   }

   const handleJoinClassroom = async (event) => {
      event.preventDefault()

      const normalizedCode = accessCode.trim().toUpperCase()

      if (!normalizedCode) {
         setFeedbackModal({
            open: true,
            title: "Código obrigatório",
            message: "Informe o código da turma para continuar.",
            variant: "error"
         })
         return
      }

      setJoining(true)

      try {
         await ClassroomService.join(normalizedCode)

         setAccessCode("")
         setStatus(STATUS.ACTIVE)
         await fetchClassrooms(0, STATUS.ACTIVE)

         setFeedbackModal({
            open: true,
            title: "Entrada confirmada",
            message: "Você entrou na turma com sucesso.",
            variant: "success"
         })
      } catch (err) {
         setFeedbackModal({
            open: true,
            title: "Erro ao entrar na turma",
            message: getApiError(err),
            variant: "error"
         })
      } finally {
         setJoining(false)
      }
   }

   const title = mode === "instructor" ? "Instructor" : "Aluno"
   const subtitle =
      mode === "instructor"
         ? "Gerencie suas turmas e acompanhe o progresso dos alunos."
         : "Acesse suas turmas e acompanhe sua evolução."
   const showInitialLoading = loading && classrooms.length === 0
   const showEmptyState = !loading && !error && classrooms.length === 0

    return (
        <main className="classrooms-page">
            <div className="classrooms-page__header">
                <div className="classrooms-page__title-group">
                    <span className="classrooms-page__eyebrow">{title}</span>
                    <h1>Minhas Turmas</h1>
                    <p>{subtitle}</p>
                </div>

                {mode === "instructor" && (
                    <button
                        type="button"
                        className="classrooms-page__primary-button"
                        onClick={() => setCreateModalOpen(true)}
                    >
                        <span>+ Nova Turma</span>     
                    </button>
                )}
            </div>

         {mode === "student" && (
            <section className="classrooms-page__join-card">
               <div className="classrooms-page__join-copy">
                  <h2>Entrar em uma turma</h2>
                  <p>Use o código enviado pelo professor.</p>
               </div>

               <form className="classrooms-page__join-form" onSubmit={handleJoinClassroom}>
                  <input
                     type="text"
                     maxLength={6}
                     placeholder="A3F9K2"
                     aria-label="Código da turma"
                     value={accessCode}
                     onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                     disabled={joining}
                  />

                  <button type="submit" disabled={joining}>
                     {joining ? "Entrando..." : "Entrar"}
                  </button>
               </form>
            </section>
         )}

         <div className="classrooms-page__tabs">
            <button
               type="button"
               className={status === STATUS.ACTIVE ? "active" : ""}
               onClick={() => handleChangeStatus(STATUS.ACTIVE)}
            >
               Ativas
               {status === STATUS.ACTIVE && (
                  <span>{classrooms.length}</span>
               )}
            </button>

            <button
               type="button"
               className={status === STATUS.ARCHIVED ? "active" : ""}
               onClick={() => handleChangeStatus(STATUS.ARCHIVED)}
            >
               Arquivadas
               {status === STATUS.ARCHIVED && (
                  <span>{classrooms.length}</span>
               )}
            </button>
         </div>

         {showInitialLoading && (
            <p className="classrooms-page__message">Carregando turmas...</p>
         )}

         {error && (
            <div className="classrooms-page__error">
               <p>{error}</p>
            </div>
         )}

         {showEmptyState && (
            <p className="classrooms-page__message">Nenhuma turma encontrada.</p>
         )}

         <section className="classrooms-page__grid">
            {classrooms.map((classroom) => (
               <ClassroomCard
                  key={classroom.id}
                  classroom={classroom}
                  mode={mode}
                  onOpen={openClassroom}
               />
            ))}
         </section>

         {!loading && totalPages > 1 && (
            <div className="classrooms-page__pagination">
               <button
                  type="button"
                  disabled={page <= 0}
                  onClick={() => fetchClassrooms(page - 1, status)}
               >
                  Anterior
               </button>

               <span>
                  Página {page + 1} de {totalPages}
               </span>

               <button
                  type="button"
                  disabled={page + 1 >= totalPages}
                  onClick={() => fetchClassrooms(page + 1, status)}
               >
                  Próxima
               </button>
            </div>
         )}

         <CreateClassroomModal
            open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onCreate={handleCreateClassroom}
         />

         <AppModal
            open={feedbackModal.open}
            onClose={closeFeedbackModal}
            title={feedbackModal.title}
            variant={feedbackModal.variant}
            primaryAction={{
               id: "classroom-feedback-ok",
               label: "Ok",
               onClick: closeFeedbackModal
            }}
            initialFocus="classroom-feedback-ok"
         >
            <p>{feedbackModal.message}</p>
         </AppModal>
      </main>
   )
}
