import api from "./api";

const FunctionService = {
    async getSaved(functionName){
        const { data } = await api.get(`/api/function/${functionName}`, { skipAuth: false })
        return data;
    },

    async feedback( { code, assistantStyle, functionName, gameName }){
        const response = await api.post("/api/function/feedback", {
            code,
            assistantStyle,
            functionName,
            gameName
        });
        return response.data
    },

    async run({ code, assistantStyle, functionName, gameName }){
        const response = await api.post("/api/function/run", {
            code, 
            assistantStyle,
            functionName,
            gameName
        });
        return response.data;
    },

    async submit({ code, assistantStyle, functionName, gameName }) {
    const response = await api.put("/api/function", {
      code,
      assistantStyle,
      functionName,
      gameName,
    });
    return response.data;
  },

  async sendUserFeedback({ feedbackId, feedbackUser }) {
    const response = await api.put("/feedback/user", {
      feedbackId,
      feedbackUser,
    });
    return response.data; 
  },

}

export default FunctionService