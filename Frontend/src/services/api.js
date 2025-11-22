import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default {

  uploadExcel(file) {
    const formData = new FormData()
    formData.append('file', file)
    return apiClient.post('/cargar-excel/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  getTransacciones() {
    return apiClient.get('/transacciones/?procesada=false')
  },

  createTransaccion(data) {
    return apiClient.post('/transacciones/', data)
  },

  deleteTransaccion(id) {
    return apiClient.delete(`/transacciones/${id}/`)
  },

  createAsientoContable(data) {
    return apiClient.post('/asiento-contable/', data)
  },
  getAsientosContables() {
    return apiClient.get('/asiento-contable/')
  },

  getCuentas() {
    return apiClient.get('/cuentas/')
  },
}
