// src/services/api.ts
import axios from 'axios'
import { getIdToken } from './firebase'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001' })

api.interceptors.request.use(async (config) => {
  try {
    const token = await getIdToken()
    config.headers.Authorization = `Bearer ${token}`
  } catch {}
  return config
})

export default api
