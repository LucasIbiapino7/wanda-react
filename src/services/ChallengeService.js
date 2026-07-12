import api from "./api";

const ChallengeService = {
  /**
   * Cria um desafio para um jogo específico
   * @param {{ challengedId: number, gameName: "jokenpo" | "bits" }}
   */
  async create({ challengedId, gameName, classroomId = null }) {
    const payload = {
      challengedId,
      gameName
    }

    if (classroomId){
      payload.classroomId = classroomId
    }

    const response = await api.post("/challenge", payload, { skipAuth: false });
    return response.data; 
  },

  async listPending({ page = 0, size = 5 }) {
    const response = await api.get("/challenge/pending", 
      { params: { page, size } 
    });
    return response.data;
  },

  async listByClassroom( classroomId, { page = 0, size = 10} = {}){
    const response = await api.get(`/challenge/classroom/${classroomId}`, {
      params: { page, size}
    })

    return response.data
  },

  async listMineByClassroom(classroomId, { page = 0, size = 10} = {}){
    const response = await api.get(`/challenge/classroom/${classroomId}/me`, {
      params: { page, size }
    })

    return response.data
  },

  // Lista desafios do usuário logado em qualquer turma/contexto,
  // incluindo pendentes, recusados e finalizados com matchId para replay.
  async listMine({ page = 0, size = 10 } = {}) {
    const response = await api.get("/challenge/me", {
      params: { page, size }
    })

    return response.data
  },

  /**
   * Body: { challengeId: Long, accepted: Boolean }
   * Retorno:
   *  - Long (matchId) quando accepted=true e a partida é criada com sucesso
   *  - null quando accepted=false
   */
  async isAccepted({ challengeId, accepted }) {
    const response = await api.post("/challenge/isAccepted", { 
      challengeId, 
      accepted 
    });
    return response.data;
  },
};

export default ChallengeService;
