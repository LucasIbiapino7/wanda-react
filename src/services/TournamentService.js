import api from "./api";

const TournamentService = {
  /**
   * Cria um novo torneio
   * @param {Object} payload - Dados do torneio
   * @param {string} payload.name - Nome do torneio
   * @param {string} payload.description - Descrição
   * @param {string} payload.startTime - Data/hora ISO
   * @param {number} payload.maxParticipants - Quantidade máxima
   * @param {string} payload.gameName - Nome do jogo (ex: "jokenpo", "bits")
   */
  async create(payload) {
    const response = await api.post("/tournament", payload, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  },

  async getOpen({ page = 0, size = 5, searchTerm = "" } = {}) {
    const response = await api.get("/tournament", {
      params: { page, size, searchTerm },
    });
    return response.data;
  },

  async subscribe(tournamentId, password = "") {
    const payload = { tournamentId, password };
    return await api.post("/tournament/subscribe", payload);
  },
};

export default TournamentService;
