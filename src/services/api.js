import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL, // Colocar no .env
  timeout: 15000,
});

// pega o token do session storage
function getToken() {
  return sessionStorage.getItem("token");
}

// desmontar sessaõ e ir para a página de Login
function hardLogout() {
  sessionStorage.removeItem("token");
  window.location.assign("/login");
}

// Monta a requisição com authorization quando não for "skipAuth"
api.interceptors.request.use(
    (config) => {
        if(config.skipAuth){
            const token = getToken();
            if(token){
                config.headers.Authorization = `Bearer ${token}`
            }
        }
        return config
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error?.response?.status;
    const data = error?.response?.data;
    const norm = {
      status: status ?? 0,
      message:
        data?.message ||
        data?.error ||
        "Ocorreu um erro ao processar sua solicitação.",
      path: data?.path,
      timestamp: data?.timestamp,
    };

    // 401 → não autenticado / token inválido
    if (status === 401) {
      // se ocorrer fora do /auth/login, forçar logout
      const isLoginRequest =
        error?.config?.url?.includes("/auth/login") ||
        error?.config?.skipAuth === true; // reforço
      if (!isLoginRequest) {
        hardLogout();
      }
    }

    // 403 → autenticado
    if (status === 403) {
      // tela decide o que mostrar, exmplo: "acesso negado"
    }

    error.normalized = norm;
    return Promise.reject(error);
  }
);

export default api