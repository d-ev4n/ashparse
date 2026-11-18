
import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Attach the login token to protected requests.
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('ashparse-token')

  if (token) {
    config.headers.Authorization = `Token ${token}`
  }

  return config
})

// Handle expired or invalid sessions.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login/')
    const isRegisterRequest = error.config?.url?.includes('/auth/register/')

    if (
      error.response?.status === 401 &&
      !isLoginRequest &&
      !isRegisterRequest
    ) {
      sessionStorage.removeItem('ashparse-token')
      sessionStorage.removeItem('ashparse-username')

      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    return Promise.reject(error)
  }
)

export default api
