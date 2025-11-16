import axios from 'axios'
import router from '../router'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Добавляем токен из localStorage при инициализации
const token = localStorage.getItem('auth_token')
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Перехватчик ответов для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен невалиден или истек
      localStorage.removeItem('auth_token')
      delete api.defaults.headers.common['Authorization']
      
      // Перенаправляем на страницу входа, если не находимся там
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default api

