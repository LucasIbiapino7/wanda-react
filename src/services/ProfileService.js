import api from "./api"

const ProfileService = {
    async getMe(){
        const response = await api.get(
            "/profile",
            { skipAuth: false }
        );
        return response.data;
    },

    async updateCharacter(characterUrl){
        await api.put(
            "/profile/character",
            { characterUrl },
            { skipAuth: false },
        );
        return true;
    },

    async updateNickname(nickname){
        await api.put(
            "/profile/nickname",
            { nickname },
            { skipAuth: false }
        );
        return true;
    }
}

export default ProfileService