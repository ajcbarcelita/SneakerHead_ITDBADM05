import axios from 'axios'

// base URL from Vite env

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const api = axios.create({
    baseURL: API_BASE,
    headers: { 'Content-Type': 'application/json' },
    // withCredentials: true // enable if you use cookies/sessions
    timeout: 10000
});

export default api
