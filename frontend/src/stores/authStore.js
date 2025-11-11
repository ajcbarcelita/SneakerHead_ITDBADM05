import { defineStore } from 'pinia'
import { ref } from 'vue'
import * as authService from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)
  const errors = ref({}) // validation errors from backend or general message

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

  return { user, loading, errors, register, login, clearErrors }
})