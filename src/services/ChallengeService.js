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
};

export default ChallengeService;
