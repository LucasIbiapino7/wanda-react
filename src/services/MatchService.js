import api from "./api";

const MatchService = {
  async list({ page = 0, size = 5 } = {}) {
    const response = await api.get("/match", {
      skipAuth: false,
      params: { page, size },
    });
    return response.data;
  },

  async findById(id) {
    const response = await api.get(`/match/${id}`, { skipAuth: false });
    return response.data;
  },
};

export default MatchService;