import api from "./api"

const ClassroomService = {
    // Criar nova turma
    async create(payload){
        const response = await api.post("/classroom", payload)
        return response.data
    },

    // Entrar em turma
    async join(accessCode){
        const response = await api.post("/classroom/join", {accessCode})
        return response.data
    },

    // Busca de salas de um professor
    async listInstructorClassrooms({ status = "ACTIVE", page = 0, size = 10} = {}) {
        const response = await api.get("/classroom", {
            params: {
                status,
                page,
                size
            }
        })
        return response.data
    },

    // Busca de salas de um estudante
    async listStudentClassrooms({ status = "ACTIVE", page = 0, size = 10} = {}){
        const response = await api.get("/classroom/student", {
            params: {
                status,
                page,
                size
            }
        })
        return response.data
    },

    async listMine({ page = 0, size = 10 } = {}) {
        const response = await api.get("/challenge/me", {
            params: { page, size }
        })

        return response.data
    },

    // Buscar sala específica por ID
    async findById(classroomId){
        const response = await api.get(`/classroom/${classroomId}`)
        return response.data
    },

    // Atualizar sala
    async update(classroomId, payload){
        const response = await api.patch(`/classroom/${classroomId}`, payload)
        return response.data
    },

    // Arquivar sala
    async archive(classroomId){
        await api.patch(`/classroom/${classroomId}/archive`)
    },

    // Gerar novo código de acesso pra turma
    async regenerateAccessCode(classroomId){
        const response = await api.post(`/classroom/${classroomId}/access-code`)
        return response.data
    },

    // Adicionar estudante por email
    async addStudentByEmail(classroomId, email){
        await api.post(`/classroom/${classroomId}/students`, { email })
    },

    // Remover estudante
    async removeStudent(classroomId, studentId){
        await api.delete(`/classroom/${classroomId}/students/${studentId}`)
    },

    // Listar membros
    async listMembers(classroomId, { page = 0, size = 20} = {}){
        const response = await api.get(`/classroom/${classroomId}/members`, {
            params: {page, size}
        })

        return response.data
    }
}

export default ClassroomService