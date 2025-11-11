import { defineStore } from 'pinia'
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import * as authService from '@/services/authService'
import{ jwtDecode}from 'jwt-decode'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const errors = ref({}) // validation errors from backend or general message
  const router = useRouter()

  function restoreUser() {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (!token) return null

    try {
      const decoded = jwtDecode(token)
      const now = Date.now() / 1000
      if (decoded.exp && decoded.exp < now) {
        // token expired
        logout()
        return null
      }

      return {
        user_id: decoded.user_id,
        email: decoded.email,
        role_id: decoded.role_id,
        role_name: decoded.role_name
      }
    } catch (err) {
      console.error('Failed to decode token:', err)
      logout()
      return null
    }
  }

  user.value = restoreUser() // restore on store initialization

  async function register(payload) {
    loading.value = true
    errors.value = {}
    try {
      const data = await authService.register(payload)
      // adapt to whatever your backend returns (e.g. data.user / message)
      user.value = data.user ?? null
      return { success: true, data }
    } catch (err) {
      if (err?.response?.data) {
        // backend validation format: { errors: { field: 'message' } } or { message }
        const body = err.response.data
        errors.value = body.errors ?? { _global: body.message ?? 'Registration failed' }
      } else {
        errors.value = { _global: err.message ?? 'Network error' }
      }
      return { success: false, errors: errors.value }
    } finally {
      loading.value = false
    }
  }

  async function login(payload) {
      loading.value = true
      errors.value = {}
      try {
        const data = await authService.login(payload)
       
        user.value = data.user ?? null

        if (payload.rememberMe) {
          localStorage.setItem('accessToken', data.accessToken)
        } else {
          sessionStorage.setItem('accessToken', data.accessToken)
        }

        return { success: true, data }
      } catch (err) {
        if (err?.response?.data) {
          const body = err.response.data
          errors.value = body.errors ?? { _global: body.message ?? 'Login failed' }
        } else {
          errors.value = { _global: err.message ?? 'Network error' }
        }
        return { success: false, errors: errors.value }
    } finally {
      loading.value = false
    }
  }

  function clearErrors() {
    errors.value = {}
  }

  function logout() {
    user.value = null
    localStorage.removeItem('accessToken')
    sessionStorage.removeItem('accessToken')
    router.push('/login')
  }

  return { user, loading, errors, register, login, clearErrors, logout }
})