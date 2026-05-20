import api from "./api"

const ClassroomService = {
    // Criar nova turma
    async create(payload){
        const response = await api.post("/classroom", payload)
        return response.data
    },

    // Entrar em turma
    async join(acessCode){
        const response = await api.post("/classroom/join", {acessCode})
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
    }
}

export default ClassroomService