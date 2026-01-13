import axios from "axios"
import { authStore } from "@/store/auth.store"

export const api = axios.create({
  baseURL: '/api',
  headers: {
    "Content-Type": "application/json",
  },
})
api.interceptors.request.use((config) => {
  const token = authStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      authStore.getState().logout()
    }
    return Promise.reject(error)
  }
)