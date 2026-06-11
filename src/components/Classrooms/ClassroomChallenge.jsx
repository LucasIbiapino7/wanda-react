import { useState, useCallback, useContext, useEffect, useMemo } from "react"
import PropTypes from "prop-types"
import AuthContext from "../../context/AuthContext"
import ChallengeService from "../../services/ChallengeService"
import ClassroomService from "../../services/ClassroomService"
import AppModal from "../UI/AppModal"
import PendingChallengeCard from "../Challenges/PendingChallengeCard"
import { getApiError } from "../../utils/errors"

const MEMBERS_PER_PAGE = 8

export default function ClassroomChallenge({
    classroom,
    members,
    canManage
}){
    const [challenges, setChallenges] = useState([])
    const [myChallenges, setMyChallenges] = useState([])
    const [loading, setLoading] = useState(false)
    const [creatingFor, setCreatingFor] = useState(null)
    const [busyIds, setBusyIds] = useState(new Set())

    // Lista COMPLETA de membros (buscada aqui), pra permitir desafiar qualquer
    // aluno — não apenas a primeira página que a página da turma carrega.
    const [allMembers, setAllMembers] = useState(members || [])
    const [memberSearch, setMemberSearch] = useState("")
    const [memberPage, setMemberPage] = useState(0)

    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "default",
        matchId: null
    })

    const { user } = useContext(AuthContext)
    const classroomId = classroom.id
    const gameName = classroom.gameName

    const closeModal = () => {
        setModal((current) => ({
            ...current,
            open: false,
            matchId: null
        }))
    }

    const fetchChallenges = useCallback (async () => {
        if (!classroomId){
            return
        }

        setLoading(true)
        try{
            // Busca os desafios divididos em todos e os prospostos apenas
            const mineData = await ChallengeService.listMineByClassroom(classroomId, {
                    page: 0,
                    size: 10
            })
            setMyChallenges(mineData?.content ?? [])

            const allData = await ChallengeService.listByClassroom(classroomId, {
                page: 0,
                size: 10
            })
            setChallenges(allData?.content ?? [])

        } catch(error){
            setModal({
                open: true,
                title: "Erro ao carregar desafios",
                message: getApiError(error),
                variant: "error",
                matchId: null
            })

        } finally{
            setLoading(false)
        }
    }, [classroomId])

    useEffect(() => {
        fetchChallenges()
    }, [fetchChallenges])

    // Traz todos os membros da turma de uma vez (escala de turma), pra o painel
    // de desafio poder alcançar qualquer aluno e oferecer busca por nome.
    const fetchAllMembers = useCallback(async () => {
        if (!classroomId) {
            return
        }
        try {
            const data = await ClassroomService.listMembers(classroomId, {
                page: 0,
                size: 500
            })
            setAllMembers(data?.content ?? [])
        } catch (error) {
            // silencioso: se falhar, mantém o que já houver (inclusive o vindo via prop)
        }
    }, [classroomId])

    useEffect(() => {
        fetchAllMembers()
    }, [fetchAllMembers])

    // sempre que a busca muda, volta pra primeira página da lista
    useEffect(() => {
        setMemberPage(0)
    }, [memberSearch])

    const handleCreateChallenge = async (student) => {
        setCreatingFor(student.userId)

        try{
            await ChallengeService.create({
                challengedId: student.userId,
                gameName: gameName,
                classroomId: classroomId
            })

            setModal({
                open: true,
                title: "Desafio enviado",
                message: `O desafio para ${student.name} foi enviado`,
                variant: "success",
                matchId: null
            })

            fetchChallenges()
        } catch (error){
            setModal({
                open: true,
                title: "Não foi possível enviar o desafio",
                message: getApiError(error),
                variant: "error",
                matchId: null
            })

        } finally{
            setCreatingFor(null)
        }
    }

    // Aceitar/recusar um desafio recebido. Reusa o mesmo fluxo da página global:
    // isAccepted cria a partida e devolve o matchId (quando aceito).
    const handleAcceptOrReject = async (challengeId, accepted, opponentName = "") => {
        setBusyIds((prev) => new Set(prev).add(challengeId))
        try {
            const matchId = await ChallengeService.isAccepted({ challengeId, accepted })

            // tira da lista local imediatamente (feedback instantâneo)
            setMyChallenges((prev) => prev.filter((ch) => ch.id !== challengeId))

            if (accepted && matchId) {
                setModal({
                    open: true,
                    title: "Desafio aceito!",
                    message: `A partida contra ${opponentName || "seu oponente"} foi realizada com sucesso.`,
                    variant: "success",
                    matchId
                })
            } else if (accepted && !matchId) {
                setModal({
                    open: true,
                    title: "Desafio aceito",
                    message: "A partida foi processada, mas não foi possível obter o replay.",
                    variant: "success",
                    matchId: null
                })
            } else {
                setModal({
                    open: true,
                    title: "Desafio recusado",
                    message: "O desafio foi recusado.",
                    variant: "default",
                    matchId: null
                })
            }

            // ressincroniza o painel "Todos os desafios da turma"
            fetchChallenges()
        } catch (error) {
            setModal({
                open: true,
                title: "Não foi possível processar o desafio",
                message: getApiError(error),
                variant: "error",
                matchId: null
            })
        } finally {
            setBusyIds((prev) => {
                const next = new Set(prev)
                next.delete(challengeId)
                return next
            })
        }
    }

    const handleModalPrimary = () => {
        if (modal.matchId) {
            window.open(`/matches/${modal.matchId}`, "_blank")
        }
        closeModal()
    }

    // membros desafiáveis: todos menos eu, aplicando a busca por nome/e-mail
    const membrosFiltrados = useMemo(() => {
        const term = memberSearch.trim().toLowerCase()
        return allMembers
            .filter((member) => member.userId && member.userId !== user?.id)
            .filter((member) => {
                if (!term) return true
                return (
                    (member.name || "").toLowerCase().includes(term) ||
                    (member.email || "").toLowerCase().includes(term)
                )
            })
    }, [allMembers, memberSearch, user?.id])

    const totalMemberPages = Math.max(
        1,
        Math.ceil(membrosFiltrados.length / MEMBERS_PER_PAGE)
    )
    const paginaAtual = Math.min(memberPage, totalMemberPages - 1)
    const membrosVisiveis = membrosFiltrados.slice(
        paginaAtual * MEMBERS_PER_PAGE,
        paginaAtual * MEMBERS_PER_PAGE + MEMBERS_PER_PAGE
    )

    // "Meus desafios pendentes" tem dois casos: os que EU recebi (posso aceitar)
    // e os que EU enviei (aguardando o outro). O /me da turma traz ambos.
    const recebidos = myChallenges.filter((c) => c.challengerId !== user?.id)
    const enviados = myChallenges.filter((c) => c.challengerId === user?.id)

    return(
        <section className="classroom-details-card classroom-challenges-card">
            <div className="classroom-section-header">
                <div>
                    <p className="classroom-section-eyebrow">Desafios da turma</p>
                    <h2>Desafios</h2>
                </div>

                <span className="classroom-section-meta">
                    {gameName?.toUpperCase() || "Jogo da turma"}
                </span>
            </div>

            {loading && (
                <p className="classroom-empty-text">Carregando desafios...</p>
            )}

            {!loading && (
                <div className="classroom-challenges-layout">
                    <div className="classroom-challenges-panel">
                        <h3>Meus desafios pendentes</h3>

                        {recebidos.length === 0 && enviados.length === 0 ? (
                            <p className="classroom-empty-text">
                                Você não tem desafios pendentes nesta turma.
                            </p>
                        ) : (
                            <>
                                {recebidos.length > 0 && (
                                    <div className="classroom-challenges-list">
                                        {recebidos.map((challenge) => (
                                            <PendingChallengeCard
                                                key={challenge.id}
                                                challenge={challenge}
                                                onAcceptOrReject={handleAcceptOrReject}
                                                disabled={busyIds.has(challenge.id)}
                                            />
                                        ))}
                                    </div>
                                )}

                                {enviados.length > 0 && (
                                    <div className="classroom-challenges-list">
                                        {enviados.map((challenge) => (
                                            <article
                                                key={challenge.id}
                                                className="classroom-challenge-row"
                                            >
                                                <span>Você desafiou</span>
                                                <strong>{challenge.challengedName}</strong>
                                                <small>{challenge.gameName}</small>
                                                <small>· aguardando aceitação</small>
                                            </article>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    <div className="classroom-challenges-panel">
                        <h3>Desafiar aluno</h3>

                        <input
                            type="text"
                            className="classroom-challenge-search"
                            placeholder="Buscar aluno por nome ou e-mail..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                        />

                        {membrosFiltrados.length === 0 ? (
                            <p className="classroom-empty-text">
                                {memberSearch
                                    ? "Nenhum aluno encontrado para essa busca."
                                    : "Nenhum aluno disponível para desafio."}
                            </p>
                        ) : (
                            <>
                                <div className="classroom-challenge-members">
                                    {membrosVisiveis.map((member) => (
                                        <div
                                            key={member.userId}
                                            className="classroom-challenge-member"
                                        >
                                            <div>
                                                <strong>{member.name}</strong>
                                                <span>{member.email}</span>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => handleCreateChallenge(member)}
                                                disabled={creatingFor === member.userId}
                                            >
                                                {creatingFor === member.userId
                                                    ? "Enviando..."
                                                    : "Desafiar"}
                                            </button>
                                        </div>
                                    ))}
                                </div>

                                {totalMemberPages > 1 && (
                                    <div className="classroom-challenge-pagination">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMemberPage((p) => Math.max(0, p - 1))
                                            }
                                            disabled={paginaAtual === 0}
                                        >
                                            ← Anterior
                                        </button>
                                        <span>
                                            {paginaAtual + 1} / {totalMemberPages}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setMemberPage((p) =>
                                                    Math.min(totalMemberPages - 1, p + 1)
                                                )
                                            }
                                            disabled={paginaAtual >= totalMemberPages - 1}
                                        >
                                            Próximo →
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {canManage && (
                        <div className="classroom-challenges-panel classroom-challenges-panel--wide">
                            <h3>Todos os desafios da turma</h3>

                            {challenges.length === 0 ? (
                                <p className="classroom-empty-text">
                                    Nenhum desafio foi criado nesta turma.
                                </p>
                            ) : (
                                <div className="classroom-challenges-list">
                                    {challenges.map((challenge) => (
                                        <article
                                            key={challenge.id}
                                            className="classroom-challenge-row"
                                        >
                                            <strong>{challenge.challengerName}</strong>
                                            <span>desafiou</span>
                                            <strong>{challenge.challengedName}</strong>
                                            <small>{challenge.gameName}</small>
                                        </article>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            <AppModal
                open={modal.open}
                onClose={closeModal}
                title={modal.title}
                variant={modal.variant}
                primaryAction={{
                    id: "classroom-challenge-modal-ok",
                    label: modal.matchId ? "Ver replay" : "Ok",
                    onClick: handleModalPrimary
                }}
                initialFocus="classroom-challenge-modal-ok"
            >
                <p>{modal.message}</p>
            </AppModal>
        </section>
    )
}

ClassroomChallenge.propTypes = {
    classroom: PropTypes.shape({
        id: PropTypes.number.isRequired,
        gameName: PropTypes.string.isRequired
    }).isRequired,
    members: PropTypes.arrayOf(
        PropTypes.shape({
            userId: PropTypes.number.isRequired,
            name: PropTypes.string.isRequired,
            email: PropTypes.string
        })
    ).isRequired,
    canManage: PropTypes.bool.isRequired
}

