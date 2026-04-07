import { api } from '../lib/api'

export async function listAdminSlams(params = {}) {
  const { data } = await api.get('/slams/admin/', { params })
  return data
}

export async function listAdminUsers(params = {}) {
  const { data } = await api.get('/auth/admin/users/', { params })
  return data
}

export async function getAdminUserDetail(userId) {
  const { data } = await api.get(`/auth/admin/users/${userId}/`)
  return data
}

export async function resetUserPassword(userId, payload = {}) {
  const { data } = await api.post(`/auth/admin/users/${userId}/reset-password/`, payload)
  return data
}
