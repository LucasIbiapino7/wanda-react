import { useEffect, useState, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import PropTypes from "prop-types"
import NotificationService from "../../services/NotificationService"
import BellIcon from "../../assets/bell.png"
import "./NotificationBell.css"

function getNotificationText(notification) {
    const labels = {
        NEW_CLASSROOM: "Você foi adicionado a uma nova turma.",
        TOURNAMENT_FINISHED: "Um torneio foi finalizado.",
        CHALLENGE_RECEIVED: "Você recebeu um novo desafio.",
        CHALLENGE_RESULT: "O resultado de um desafio está disponível"
    }

    return labels[notification.type] || "Nova notificação"
}

function getNotificationRoute(notification){
    const routes = {
        NEW_CLASSROOM: `/classrooms/${notification.referenceId}`,
        TOURNAMENT_FINISHED: `/tournament/${notification.referenceId}`,
        CHALLENGE_RECEIVED: "/challenges",
        CHALLENGE_RESULT: `/matches/${notification.referenceId}`
    }

    return routes[notification.type] || null
}

export default function NotificationBell({ enabled }){
    const navigate = useNavigate()
    const bellRef = useRef()
    const [open, setOpen] = useState(false)
    const [notifications, setNotifications] = useState([])
    const [loading, setLoading] = useState(false)

    const naoLidas = notifications.length

    const fetchNotifications = useCallback(async () => {
        if (!enabled){
            return
        }

        setLoading(true)

        try{
            const data = await NotificationService.getUnseen()
            setNotifications(data ?? [])
        } catch(error){
            console.error("Erro ao buscar notificações" + error)
        } finally{
            setLoading(false)
        }
    }, [enabled])

    useEffect(()=>{
        fetchNotifications()
    }, [fetchNotifications])

    const handleToggle = () => {
        setOpen((current) => !current)

        if(!open){
            fetchNotifications()
        }
    }

    const handleOpenNotification = async (notification) => {
        const route = getNotificationRoute(notification)

        try{
            await NotificationService.markAllSeen()
            setNotifications([])
            setOpen(false)

            if (route){
                navigate(route)
            }
        } catch(error){
            console.error("Erro ao marcar notificações como visualizadas" + error)
        }
    }

    const handleMarkAllAsSeen = async () => {
        try{
            await NotificationService.markAllSeen()
            setNotifications([])
            setOpen(false)
        } catch(error){
            console.error("Erro ao marcar as notificações como visualizadas" + error)
        }
    }

    // Fecha notificações ao clicar fora da aba
    useEffect(() => {
        if (!open){
            return undefined
        }

        const handleClose = (event) => {
            if(bellRef.current && !bellRef.current.contains(event.target)){
                setOpen(false)
            }
        }

        document.addEventListener("mousedown", handleClose)

        return () => {
            document.removeEventListener("mousedown", handleClose)
        }
    }, [open])

    if (!enabled){
        return null
    }

    return (
        <div className="notification-bell" ref={bellRef}>
            <button
                type="button"
                className="notification-bell__button"
                onClick={handleToggle}
                aria-label="Notificações"
                aria-expanded={open}
            >
                <span aria-hidden="true" className="bell-icon-area">
                    <img src={BellIcon} alt="Sino de notificações" className="bell-icon"/>
                </span>

                {naoLidas > 0 && (
                    <span className="notification-bell__badge">
                        {naoLidas > 9 ? "9+" : naoLidas}
                    </span>
                )}
            </button>

            {open && (
                <div className="notification-bell__menu">
                    <div className="notification-bell__header">
                        <strong>Notificações</strong>

                        {naoLidas > 0 && (
                            <button
                                type="button"
                                onClick={handleMarkAllAsSeen}
                            >
                                Marcar como vistas
                            </button>
                        )}
                    </div>

                    {loading && (
                        <p className="notification-bell__state">Carregando...</p>
                    )}

                    {!loading && notifications.length === 0 && (
                        <p className="notification-bell__state">
                            Nenhuma notificação nova.
                        </p>
                    )}

                    {!loading && notifications.map((notification) => (
                        <button
                            key={notification.id}
                            type="button"
                            className="notification-bell__item"
                            onClick={() => handleOpenNotification(notification)}
                        >
                            <span>
                                {getNotificationText(notification)}
                            </span>

                            {notification.createdAt && (
                                <small>
                                    {new Date(notification.createdAt).toLocaleString()}
                                </small>
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}

NotificationBell.propTypes = {
    enabled: PropTypes.bool.isRequired
}