import api from './api.js'

export async function register(payload) {
  const res = await api.post('/register', payload)
  return res.data
}

export async function login(payload) {
  const res = await api.post('/login', payload)
  return res.data
}