import axios from 'axios'

// base URL from Vite env

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    // withCredentials: true // enable if you use cookies/sessions
    timeout: 10000
});

// Adding a req interceptor
api.interceptors.request.use((config) => {
    // Prefer localStorage first, fallback to sessionStorage
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

export default api
