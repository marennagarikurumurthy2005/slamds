import { api } from '../lib/api'

export async function listSlams() {
  const { data } = await api.get('/slams/')
  return data
}

export async function getSlam(slamId) {
  const { data } = await api.get(`/slams/${slamId}/`)
  return data
}

export async function createSlam(payload) {
  const { data } = await api.post('/slams/', payload)
  return data
}

export async function updateSlam(slamId, payload) {
  const { data } = await api.patch(`/slams/${slamId}/`, payload)
  return data
}

export async function deleteSlam(slamId) {
  await api.delete(`/slams/${slamId}/`)
}
