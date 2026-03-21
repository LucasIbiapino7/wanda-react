import api from './api'

const formater = (date, endOfDay = false) => {
  if (!date) return undefined
  const d = new Date(date)
  if (endOfDay) {
    d.setHours(23, 59, 59, 999)
  } else {
    d.setHours(0, 0, 0, 0)
  }
  return d.toISOString().slice(0, 19)
}

const AuditoriaService = {

  async findUsuarios({ from, to, page = 0, size = 20 } = {}) {
    const response = await api.get('/admin/auditoria/usuarios', {
      params: { from: formater(from), to: formater(to, true), page, size },
    })
    return response.data
  },

  async findFuncoesCriadas({ from, to, page = 0, size = 20 } = {}) {
    const response = await api.get('/admin/auditoria/funcoes', {
      params: { from: formater(from), to: formater(to, true), page, size },
    })
    return response.data
  },

  async findFuncoesAtualizadas({ from, to, page = 0, size = 20 } = {}) {
    const response = await api.get('/admin/auditoria/funcoes/atualizadas', {
      params: { from: formater(from), to: formater(to, true), page, size },
    })
    return response.data
  },

  async findPartidas({ from, to, page = 0, size = 20 } = {}) {
    const response = await api.get('/admin/auditoria/partidas', {
      params: { from:formater(from), to: formater(to, true), page, size },
    })
    return response.data
  },
}

export default AuditoriaService