import api from "./api"

const cleanSpaces = (s) => s.replace(/\s+/g, " ").trim();

const AuthService = {
    async Login(email, password){
        const response = await api.post(
            "/auth/login",
            {email, password},
            {skipAuth: true}
        );
        return response.data; // token
    },

    async register({firstName, lastName, email, password}){
        const name = cleanSpaces(`${firstName} ${lastName}`)
        console.log(name)
        console.log(email)
        console.log(password)
        const response = await api.post(
            "/auth/register",
            { name, email, password },
            { skipAuth: true }
        )
        return response.data; // 200 sem body
    }
}

export default AuthService