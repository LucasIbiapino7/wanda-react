import api from "./api"

const NotificationService = {
    async getUnseen() {
        const response = await api.get("/notification/unseen")
        return response.data
    },

    async markAllSeen() {
        await api.patch("/notification/seen")
    }
}

export default NotificationService