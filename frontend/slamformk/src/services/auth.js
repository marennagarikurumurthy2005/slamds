import { api, rawApi } from '../lib/api'

export async function signupRequest(payload) {
  const { data } = await rawApi.post('/auth/signup/', payload)
  return data
}

export async function loginRequest(payload) {
  const { data } = await rawApi.post('/auth/login/', payload)
  return data
}

export async function refreshSessionRequest() {
  const { data } = await rawApi.post('/auth/refresh/')
  return data
}

export async function logoutRequest() {
  const { data } = await rawApi.post('/auth/logout/')
  return data
}

export async function fetchCurrentUser() {
  const { data } = await api.get('/auth/me/')
  return data
}
