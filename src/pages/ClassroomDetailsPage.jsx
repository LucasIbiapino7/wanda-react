import { useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import AuthContext from "../context/AuthContext"
import ClassroomService from "../services/ClassroomService"
import AppModal from "../components/UI/AppModal"
import { getApiError } from "../utils/errors"
import "./ClassroomDetailsPage.css"

function formatDate(raw) {
    if (!raw) {
        return "Data não informada"
    }

    return new Date(raw).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    })
}

// Editar aqui após implementação de escalabilidade
const GAME_LABELS = {
    jokenpo: "Jokenpô",
    bits: "BITS"
}

// Editar aqui após implementação de escalabilidade
function getGameLabel(gameName){
    const pos = String(gameName || "").toLocaleLowerCase()
    return GAME_LABELS[pos] || gameName || "Jogo não informado"
}

function getInitials(name = "") {
   const initials = name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")

   return initials.toUpperCase() || "--"
}

const EMPTY_EDIT_FORM = {
    name: "",
    course: "",
    description: "",
    mural: "",
    institution: "",
    city: "",
    state: "",
}

export default function ClassroomDetailsPage() {
    const { id } = useParams()
    const classroomId = Number(id)
    const navigate = useNavigate()

    const { isAdmin, isInstructor } = useContext(AuthContext)
    const canManage = isAdmin || isInstructor

    const [classroom, setClassroom] = useState(null)
    const [members, setMembers] = useState([])
    const [membersPage, setMembersPage] = useState(0)
    const [membersTotalPages, setMembersTotalPages] = useState(0)

    const [loading, setLoading] = useState(true)
    const [membersLoading, setMembersLoading] = useState(false)
    const [error, setError] = useState("")

    const [activeTab, setActiveTab] = useState("mural")
    const [editing, setEditing] = useState(false)
    const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM)
    const [saving, setSaving] = useState(false)

    const [studentEmail, setStudentEmail] = useState("")
    const [addingStudent, setAddingStudent] = useState(false)
    const [removingStudentId, setRemovingStudentId] = useState(null)
    const [regeneratingCode, setRegeneratingCode] = useState(false)
    const [archiving, setArchiving] = useState(false)

    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "default",
    })
  
    const closeModal = () => {
        setModal((current) => ({
            ...current,
            open: false,
        }))
    }
    
    const showModal = ({ title, message, variant = "default" }) => {
        setModal({
            open: true,
            title,
            message,
            variant,
        })
    }
    
    const [confirmModal, setConfirmModal] = useState({
        open: false,
        title: "",
        message: "",
        action: null
    })

    const closeConfirmModal = () => {
        setConfirmModal({
            open: false,
            title: "",
            message: "",
            action: null,
        })
    }

    const requestConfirmation = ({ title, message, action }) => {
        setConfirmModal({
            open: true,
            title,
            message,
            action,
        })
    }

    const confirmAction = async () => {
        if (confirmModal.action) {
            await confirmModal.action()
        }

        closeConfirmModal()
    }

    const fetchClassroom = useCallback(async () => {
        if (!classroomId) return

        setLoading(true)
        setError("")

        try {
            const data = await ClassroomService.findById(classroomId)
            setClassroom(data)
            setEditForm({
                name: data.name || "",
                course: data.course || "",
                description: data.description || "",
                mural: data.mural || "",
                institution: data.institution || "",
                city: data.city || "",
                state: data.state || "",
            })
        }catch(error){
            setError(getApiError(error))
        }finally{
            setLoading(false)
        }
    }, [classroomId])

    // Carregar membros da página usando callback
    const fetchMembers = useCallback(
        async (nextPage = 0) => {
            if (!classroomId) {
                return
            }

            setMembersLoading(true)
        try {
            const data = await ClassroomService.listMembers(classroomId, {
                page: nextPage,
                size: 20,
            })

            setMembers(data.content ?? [])
            setMembersPage(data.number ?? nextPage)
            setMembersTotalPages(data.totalPages ?? 0)
        }catch(error){
            showModal({
                title: "Erro ao carregar membros",
                message: getApiError(error),
                variant: "error",
            })
        }finally{
            setMembersLoading(false)
        }
    },[classroomId])

    useEffect(() => {
        fetchClassroom()
    }, [fetchClassroom])

    useEffect(() => {
        fetchMembers(0)
    }, [fetchMembers])

    // Membros que já submeteram questão
    const submittedCount = useMemo(() => {
        return members.filter((member) => member.hasSubmitted).length
    }, [members])

    const handleEditChange = (event) => {
        const { name, value } = event.target

        setEditForm((current) => ({
            ...current,
            [name]: value,
        }))
    }

    // Atualiza as turmas
    const handleSaveClassroom = async (event) => {
        event.preventDefault()

        if (!editForm.name.trim()) {
        showModal({
            title: "Nome obrigatório",
            message: "Informe o nome da turma antes de salvar.",
            variant: "error",
        })
        return
        }

        setSaving(true)

        try {
            const updated = await ClassroomService.update(classroomId, {
                name: editForm.name.trim(),
                course: editForm.course.trim() || null,
                description: editForm.description.trim() || null,
                mural: editForm.mural.trim() || null,
                institution: editForm.institution.trim() || null,
                city: editForm.city.trim() || null,
                state: editForm.state.trim() || null,
            })

            setClassroom(updated)
            setEditing(false)

            showModal({
                title: "Turma atualizada",
                message: "As informações da turma foram salvas.",
                variant: "success",
            })
        }catch(error){
            showModal({
                title: "Erro ao editar turma",
                message: getApiError(error),
                variant: "error",
            })
        }finally{
            setSaving(false)
        }
    }

    // Cria novo código de acesso a turma
    const handleRegenerateAccessCode = async () => {
        setRegeneratingCode(true)

        try {
            const updated = await ClassroomService.regenerateAccessCode(classroomId)
            setClassroom(updated)

            showModal({
                title: "Código atualizado",
                message: "Um novo código de acesso foi gerado.",
                variant: "success",
            })
        }catch(error){
            showModal({
                title: "Erro ao gerar código",
                message: getApiError(error),
                variant: "error",
            })
        }finally{
            setRegeneratingCode(false)
        }
    }

    const handleArchive = () => {
        requestConfirmation({
            title: "Arquivar turma",
            message: "Tem certeza que deseja arquivar esta turma? Torneios abertos ou em andamento serão cancelados.",
            action: archiveClassroom,
        })
    }

    const archiveClassroom = async () => {
        setArchiving(true)

        try {
            await ClassroomService.archive(classroomId)
            await fetchClassroom()

            showModal({
                title: "Turma arquivada",
                message: "A turma foi arquivada com sucesso.",
                variant: "success"
            })
        }catch(error){
            showModal({
                title: "Erro ao arquivar turma",
                message: getApiError(error),
                variant: "error"
            })
        }finally{
            setArchiving(false)
        }
    }

    const handleAddStudent = async (event) => {
        event.preventDefault()

        const email = studentEmail.trim()

        if (!email) {
            showModal({
                title: "Email obrigatório",
                message: "Informe o email do aluno.",
                variant: "error",
            })
            return
        }

        setAddingStudent(true)

        try {
            await ClassroomService.addStudentByEmail(classroomId, email)

            setStudentEmail("")
            await fetchMembers(0)

            showModal({
                title: "Aluno adicionado",
                message: "O aluno foi adicionado à turma.",
                variant: "success",
            })
        } catch(err){
            showModal({
                title: "Erro ao adicionar aluno",
                message: getApiError(err),
                variant: "error",
            })
        } finally {
            setAddingStudent(false)
        }
    }

    const removeStudent = async (member) => {
        setRemovingStudentId(member.userId)

        try{
            await ClassroomService.removeStudent(classroomId, member.userId)
            await fetchMembers(membersPage)
            showModal({
                title: "Aluno removido",
                message: "O aluno foi removido da turma.",
                variant: "success"
            })
        }catch(error){
            showModal({
                title: "Erro ao remover aluno",
                message: getApiError(error),
                variant: "error"
        })
        }finally{
            setRemovingStudentId(null)
        }
    }

    // Remover estudante
    const handleRemoveStudent = (member) => {
        requestConfirmation({
            title: "Remover aluno",
            message: `Remover ${member.name} desta turma?`,
            action: () => removeStudent(member)
        })
    }

    // Copiar acess code
    const copyAccessCode = async () => {
        try {
            // Copia código de acesso pra área de transferência
            await navigator.clipboard.writeText(classroom.accessCode)
            showModal({
                title: "Código copiado",
                message: "O código de acesso foi copiado.",
                variant: "success",
            })
        }catch{
            showModal({
                title: "Não foi possível copiar",
            message: "Copie o código manualmente.",
            variant: "error",
            })
        }
    }

    if (loading) {
        return <main className="classroom-details-page">Carregando turma...</main>
    }

    if (error) {
        return (
            <main className="classroom-details-page">
                <section className="classroom-details-error-panel">
                    <p>{error}</p>

                    <button
                        type="button"
                        className="classroom-details-error-panel__button"
                        onClick={() => navigate("/classrooms")}
                    >
                        Voltar para turmas
                    </button>
                </section>
            </main>
        )
    }

    if (!classroom) {
        return null
    }

    const isArchived = classroom.status === "ARCHIVED"
    const gameKey = String(classroom.gameName || "").toLowerCase()

    return (
        <main className="classroom-details-page">
            <nav className="classroom-details-breadcrumb" aria-label="Navegação da turma">
                <button
                    type="button"
                    onClick={() => navigate("/classrooms")}
                >
                    Turmas
                </button>
                <span className="classroom-details-breadcrumb__sep">
                    {">"}
                </span>
                <span className="classroom-details-breadcrumb__current">
                    {classroom.name}
                </span>
            </nav>

            <section className="classroom-details-hero">
                <div className={`classroom-details-hero__accent classroom-details-hero__accent--${gameKey}`} />

                <div className="classroom-details-hero__content">
                    <div className="classroom-details-hero__main">
                        <div className="classroom-details-hero__badges">
                            <span className={isArchived ? "status-badge archived" : "status-badge active"}>
                                {isArchived ? "Arquivada" : "Ativa"}
                            </span>

                            <span className={`game-badge game-badge--${gameKey}`}>
                                {getGameLabel(classroom.gameName)}
                            </span>
                        </div>

                        <h1>{classroom.name}</h1>

                        {classroom.course && (
                            <p className="classroom-details-hero__course">
                                {classroom.course}
                            </p>
                        )}

                        <p className="classroom-details-hero__meta">
                            {classroom.institution || "Instituição não informada"}
                            {classroom.city ? ` · ${classroom.city}` : ""}
                            {classroom.state ? `, ${classroom.state}` : ""}
                        </p>

                        <div className="classroom-details-hero__info-row">
                            <span>              
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                                {members.length} aluno{members.length === 1 ? "" : "s"}
                            </span>
                            <span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                                {classroom.institution || "Instituição não informada"}
                                {classroom.city ? ` · ${classroom.city}` : ""}
                                {classroom.state ? `, ${classroom.state}` : ""}
                            </span>
                            <span>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                                Criada em {formatDate(classroom.createdAt)}
                            </span>
                            {classroom.instructorName && (
                                <span>
                                    Prof. {classroom.instructorName}
                                </span>
                           )}
                        </div>

                        {canManage && (
                            <div className="classroom-details-hero__actions">
                                <button type="button" className="classroom-details-hero__dashboard">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                                    Ver Dashboard
                                </button>

                                <button
                                    type="button"
                                    className="classroom-details-hero__edit"
                                    onClick={() => setEditing((current) => !current)}
                                    disabled={isArchived}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    {editing ? "Cancelar edição" : "Editar"}
                                </button>

                                <button
                                    type="button"
                                    className="classroom-details-hero__archive"
                                    onClick={handleArchive}
                                    disabled={archiving || isArchived}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                    {archiving ? "Arquivando..." : "Arquivar"}
                                </button>
                            </div>
                        )}

                        <p className="classroom-details-hero__meta">
                            Criada em {formatDate(classroom.createdAt)}
                            {classroom.instructorName ? `Prof. ${classroom.instructorName}` : ""}
                        </p>
                    </div>

                    {canManage && (
                        <div className="classroom-details-hero__code">
                            <span>Código de acesso</span>
                            <strong>{classroom.accessCode || "—"}</strong>

                            <div className="classroom-details-hero__code-actions">
                                <button type="button" onClick={copyAccessCode}>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                                    {" "}Copiar
                                </button>

                                <button
                                    type="button"
                                    onClick={handleRegenerateAccessCode}
                                    disabled={regeneratingCode || isArchived}
                                >
                                    {regeneratingCode ? "Gerando..." : "Novo código"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {canManage && (
                    <div className="classroom-details-hero__actions">
                        <button
                            type="button"
                            onClick={() => setEditing((current) => !current)}
                            disabled={isArchived}
                        >
                            {editing ? "Cancelar edição" : "Editar"}
                        </button>

                        <button
                            type="button"
                            className="danger"
                            onClick={handleArchive}
                            disabled={archiving || isArchived}
                        >
                            {archiving ? "Arquivando..." : "Arquivar"}
                        </button>
                    </div>
                )}
            </section>

            {editing && canManage && (
                <section className="classroom-details-card">
                    <h2>Editar turma</h2>

                    <form className="classroom-edit-form" onSubmit={handleSaveClassroom}>
                        <label>
                            Nome
                            <input
                                name="name"
                                value={editForm.name}
                                onChange={handleEditChange}
                                maxLength={255}
                            />
                        </label>

                        <label>
                            Curso / Disciplina
                            <input
                                name="course"
                                value={editForm.course}
                                onChange={handleEditChange}
                            />
                        </label>

                        <label>
                            Descrição
                            <textarea
                                name="description"
                                value={editForm.description}
                                onChange={handleEditChange}
                            />
                        </label>

                        <label>
                            Mural
                            <textarea
                                name="mural"
                                value={editForm.mural}
                                onChange={handleEditChange}
                            />
                        </label>

                        <div className="classroom-edit-form__row">
                            <label>
                                Instituição
                            <input
                                name="institution"
                                value={editForm.institution}
                                onChange={handleEditChange}
                            />
                            </label>

                            <label>
                                Cidade
                                <input
                                    name="city"
                                    value={editForm.city}
                                    onChange={handleEditChange}
                                />
                            </label>

                            <label>
                                Estado
                                <input
                                    name="state"
                                    value={editForm.state}
                                    onChange={handleEditChange}
                                    maxLength={2}
                                />
                            </label>
                        </div>

                        <button type="submit" disabled={saving}>
                            {saving ? "Salvando..." : "Salvar alterações"}
                        </button>
                    </form>
                </section>
            )}

            <div className="classroom-details-tabs">
                <button
                    type="button"
                    className={activeTab === "mural" ? "active" : ""}
                    onClick={() => setActiveTab("mural")}
                >
                    Mural
                </button>

                <button
                    type="button"
                    className={activeTab === "members" ? "active" : ""}
                    onClick={() => setActiveTab("members")}
                >
                    Alunos
                </button>
            </div>

            {activeTab === "mural" && (
                <section className="classroom-details-card">
                    <h2>Mural da turma</h2>

                    {classroom.mural ? (
                        <p className="classroom-mural-text">{classroom.mural}</p>
                    ) : (
                        <p className="classroom-empty-text">
                            Nenhuma mensagem no mural ainda.
                        </p>
                    )}
                </section>
            )}

            {activeTab === "members" && (
                <section className="classroom-details-card">
                    <div className="classroom-members-header">
                        <div>
                            <h2>Membros</h2>
                            <p>
                                {members.length} alunos nesta página · {submittedCount} submeteram
                            </p>
                        </div>
                    </div>

                    {canManage && !isArchived && (
                        <aside className="add-member-card">
                            <span className="add-member-title">Adicionar Aluno</span>
                            <form className="classroom-add-student" onSubmit={handleAddStudent}>
                                <label htmlFor="student-email" className="form-label">
                                    Email
                                </label>
                                <input
                                    id="student-email"
                                    className="form-input"
                                    type="email"
                                    placeholder="email@discente.ufma.br"
                                    value={studentEmail}
                                    onChange={(event) => setStudentEmail(event.target.value)}
                                    disabled={addingStudent}
                                />
                                <span className="form-hint">O aluno precisa ter uma conta no Wanda.</span>
                                <button className="btn-add" type="submit" disabled={addingStudent}>
                                    {addingStudent ? "Adicionando..." : "Adicionar"}
                                </button>
                            </form>
                            <div className="add-member-divider"/>
                            <p className="add-member-hint">Você também pode compartilhar o código de acesso e deixar os alunos entrarem por conta própria.</p>
                        </aside>
                    )}

                    {membersLoading ? (
                        <p>Carregando alunos...</p>
                    ) : members.length === 0 ? (
                        <p className="classroom-empty-text">
                            Nenhum aluno encontrado nesta turma.
                        </p>
                    ) : (
                        <div className="classroom-members-table-wrapper">
                            <table className="classroom-members-table">
                                <thead>
                                    <tr>
                                    <th>Aluno</th>
                                    <th>Função</th>
                                    <th>Entrou em</th>
                                    {canManage && <th />}
                                    </tr>
                                </thead>

                                <tbody>
                                    {members.map((member) => (
                                        <tr key={member.userId}>
                                            <td>
                                               <div className="classroom-member-cell">
                                                  <span className="classroom-member-avatar">
                                                     {getInitials(member.name)}
                                                  </span>
                                                  <span>
                                                     <strong>{member.name}</strong>
                                                     <small>{member.email}</small>
                                                  </span>
                                               </div>
                                            </td>
                                            <td>
                                                <span
                                                    className={
                                                    member.hasSubmitted
                                                        ? "submit-badge submitted"
                                                        : "submit-badge pending"
                                                    }
                                                >
                                                    {member.hasSubmitted ? "Submeteu" : "Pendente"}
                                                </span>
                                            </td>
                                            <td>
                                                {formatDate(member.joinedAt)}
                                            </td>

                                            {canManage && (
                                                <td>
                                                    <button
                                                        type="button"
                                                        className="remove-student-button"
                                                        onClick={() => handleRemoveStudent(member)}
                                                        disabled={removingStudentId === member.userId || isArchived}
                                                    >
                                                    {removingStudentId === member.userId
                                                        ? "Removendo..."
                                                        : "Remover"}
                                                    </button>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {membersTotalPages > 1 && (
                        <div className="classroom-members-pagination">
                            <button
                                type="button"
                                disabled={membersPage <= 0 || membersLoading}
                                onClick={() => fetchMembers(membersPage - 1)}
                            >
                                Anterior
                            </button>

                            <span>
                                Página {membersPage + 1} de {membersTotalPages}
                            </span>

                            <button
                                type="button"
                                disabled={membersPage + 1 >= membersTotalPages || membersLoading}
                                onClick={() => fetchMembers(membersPage + 1)}
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </section>
            )}

            <AppModal
                open={modal.open}
                onClose={closeModal}
                title={modal.title}
                variant={modal.variant}
                primaryAction={{
                    id: "classroom-details-modal-ok",
                    label: "Ok",
                    onClick: closeModal,
                }}
                initialFocus="classroom-details-modal-ok"
            >
                <p>{modal.message}</p>
            </AppModal>

            <AppModal
                open={confirmModal.open}
                onClose={closeConfirmModal}
                title={confirmModal.title}
                variant="default"
                secondaryAction={{
                    id: "classroom-confirm-cancel",
                    label: "Cancelar",
                    onClick: closeConfirmModal,
                }}
                primaryAction={{
                    id: "classroom-confirm-ok",
                    label: "Confirmar",
                    onClick: confirmAction,
                }}
                initialFocus="classroom-confirm-cancel"
            >
                <p>{confirmModal.message}</p>
            </AppModal>
        </main>
    )
}