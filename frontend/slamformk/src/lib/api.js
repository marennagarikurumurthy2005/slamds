import axios from 'axios'
import { clearAccessToken, getAccessToken, setAccessToken } from './session'

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1'

export const rawApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

let refreshPromise = null

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const isUnauthorized = error?.response?.status === 401
    const isAuthRoute = originalRequest?.url?.includes('/auth/')

    if (!isUnauthorized || !originalRequest || originalRequest._retry || isAuthRoute) {
      return Promise.reject(error)
    }

    try {
      originalRequest._retry = true

      refreshPromise =
        refreshPromise ||
        rawApi
          .post('/auth/refresh/')
          .then(({ data }) => {
            setAccessToken(data.access_token)
            return data.access_token
          })
          .catch((refreshError) => {
            clearAccessToken()
            throw refreshError
          })
          .finally(() => {
            refreshPromise = null
      })

      const token = await refreshPromise
      originalRequest.headers = {
        ...originalRequest.headers,
        Authorization: `Bearer ${token}`,
      }
      return api(originalRequest)
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  },
)
