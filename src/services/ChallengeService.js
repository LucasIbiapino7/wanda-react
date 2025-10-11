import api from "./api";

const ChallengeService = {
  /**
   * Cria um desafio para um jogo específico
   * @param {{ challengedId: number, gameName: "jokenpo" | "bits" }}
   */
  async create({ challengedId, gameName }) {
    const res = await api.post("/challenge", { challengedId, gameName }, { skipAuth: false });
    return res.data; 
  },

  async listPending({ page = 0, size = 5 }) {
    const res = await api.get("/challenge/pending", { params: { page, size } });
    return res.data;
  },

  /**
   * Body: { challengeId: Long, accepted: Boolean }
   * Retorno:
   *  - Long (matchId) quando accepted=true e a partida é criada com sucesso
   *  - null quando accepted=false
   */
  async isAccepted({ challengeId, accepted }) {
    const response = await api.post("/challenge/isAccepted", { challengeId, accepted });
    return response.data;
  },
};

export default ChallengeService;
