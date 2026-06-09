import api from "./api"

const DashBoardService = {

    // Busca dados da Visão geral
    async getOverview(classroomId, from, to) {
        const response = await api.get(`/classroom/${classroomId}/dashboard/overview`, { params: { from , to }});
        return response.data;
    },

    // Busca as informações de engajamento de cada participante da turma
    async getEngagement(classroomId, from, to, page = 0, size = 20) {
        const response = await api.get(`/classroom/${classroomId}/dashboard/engagement`, {params: {from, to, page, size}});
        return response.data;
    },

    // Busca o ranking da turma, usada na aba de competição
    async getRanking(classroomId) {
        const response = await api.get(`/classroom/${classroomId}/dashboard/ranking`);
        return response.data;
    },

    // Busca as partidas mais recentes da turma
    async getRecentMatches(classroomId, page = 0, size = 8) {
        const response = await api.get(`/classroom/${classroomId}/dashboard/matches`, {params: {page, size}});
        return response.data;
    }
}

export default DashBoardService;