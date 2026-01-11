import api from "./api";

export const PROFILE = Object.freeze({
  INSTRUCTOR: "INSTRUCTOR",
  STUDENT: "STUDENT",
});

const UserService = {
  /**
   * Busca paginada por nome ou e-mail.
   * Back: GET /auth?q=&page=&size=
   * Aceita q = null ou "" para listar todos.
   */
  async search({ q, page = 0, size = 20 } = {}) {
    const params = { page, size };
    const hasQuery = q != null && String(q).trim() !== "";
    params.q = hasQuery ? String(q).trim() : null;

    const response = await api.get("/auth", { params });
    return response.data; // Page<UserMinDto>
  },

  /**
   * Atualiza o profile do usuário.
   * Back: PUT /auth/updateProfile
   * Body: { userId: number, type: "INSTRUCTOR" | "STUDENT" }
   * Retorno esperado: 204 No Content (res.data será undefined)
   */
  async updateProfile({ userId, type }) {
    const payload = { userId, type };
    const res = await api.put("/auth/updateProfile", payload);
    return res.data;
  },
};

export default UserService;
