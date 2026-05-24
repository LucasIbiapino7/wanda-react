export function getApiError(err){
    return(
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.normalized?.message ||
        "Não foi possível concluir a solicitação."
    )
}