import { useState, useCallback, useContext, useEffect } from "react"
import PropTypes from "prop-types"
import AuthContext from "../../context/AuthContext"
import ChallengeService from "../../services/ChallengeService"
import AppModal from "../UI/AppModal"
import { getApiError } from "../../utils/errors"

export default function ClassroomChallenge({
    classroom,
    members,
    canManage
}){
    const [challenges, setChallenges] = useState([])
    const [myChallenges, setMyChallenges] = useState([])
    const [loading, setLoading] = useState(false)
    const [creatingFor, setCreatingFor] = useState(null)
    const [modal, setModal] = useState({
        open: false,
        title: "",
        message: "",
        variant: "default"
    })

    const { user } = useContext(AuthContext)
    const classroomId = classroom.id
    const gameName = classroom.gameName

    const closeModal = () => {
        setModal((current) => ({
            ...current,
            open: false
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
                variant: "error"
            })

        } finally{
            setLoading(false)
        }
    }, [classroomId])

    useEffect(() => {
        fetchChallenges()
    }, [fetchChallenges])

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
                variant: "success"
            })

            fetchChallenges()
        } catch (error){
            setModal({
                open: true,
                title: "Não foi possível enviar o desafio",
                message: getApiError(error),
                variant: "error"
            })

        } finally{
            setCreatingFor(null)
        }
    }

    const membrosDaTurma = members.filter((member) => {
        return member.userId && member.userId !== user?.id 
    })

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

                        {myChallenges.length === 0 ? (
                            <p className="classroom-empty-text">
                                Você não tem desafios pendentes nesta turma.
                            </p>
                        ) : (
                            <div className="classroom-challenges-list">
                                {myChallenges.map((challenge) => (
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

                    <div className="classroom-challenges-panel">
                        <h3>Desafiar aluno</h3>

                        {membrosDaTurma.length === 0 ? (
                            <p className="classroom-empty-text">
                                Nenhum aluno disponível para desafio.
                            </p>
                        ) : (
                            <div className="classroom-challenge-members">
                                {membrosDaTurma.map((member) => (
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
                    label: "Ok",
                    onClick: closeModal
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

