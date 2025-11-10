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
      loading.value = false
      return { success: true, data }
    } catch (err) {
      loading.value = false
      if (err?.response?.data) {
        // backend validation format: { errors: { field: 'message' } } or { message }
        const body = err.response.data
        errors.value = body.errors ?? { _global: body.message ?? 'Registration failed' }
      } else {
        errors.value = { _global: err.message ?? 'Network error' }
      }
      return { success: false, errors: errors.value }
    }
  }

  function clearErrors() {
    errors.value = {}
  }

  return { user, loading, errors, register, clearErrors }
})