import api from "./api"

const AuthService = {
    async Login(email, password){
        const response = await api.post(
            "/auth/login",
            {email, password},
            {skipAuth: true}
        );
        return response.data; // token
    }
}

export default AuthService