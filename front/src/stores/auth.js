import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import api from '../api';
import router from '../router';

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null);
  const token = ref(localStorage.getItem('auth_token') || null);
  const loading = ref(false);
  const error = ref(null);

  // Устанавливаем токен в заголовки API при инициализации
  if (token.value) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
  }

  const isAuthenticated = computed(() => !!token.value);

  async function login(email, password) {
    loading.value = true;
    error.value = null;

    try {
      console.log('Attempting login with:', { email, apiUrl: api.defaults.baseURL });
      const response = await api.post('/login', { email, password });
      console.log('Login response:', response.data);
      
      token.value = response.data.token;
      user.value = response.data.user;
      
      localStorage.setItem('auth_token', token.value);
      api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`;
      
      return true;
    } catch (err) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      // Обработка ошибок валидации Laravel
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        error.value = Array.isArray(firstError) ? firstError[0] : firstError;
      } else if (err.response?.data?.message) {
        error.value = err.response.data.message;
      } else if (err.message) {
        error.value = err.message;
      } else {
        error.value = 'Ошибка авторизации. Проверьте подключение к серверу.';
      }
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    } finally {
      token.value = null;
      user.value = null;
      localStorage.removeItem('auth_token');
      delete api.defaults.headers.common['Authorization'];
      router.push('/login');
    }
  }

  async function fetchUser() {
    if (!token.value) return;

    try {
      const response = await api.get('/user');
      user.value = response.data;
    } catch (err) {
      // Если токен невалиден, выходим
      if (err.response?.status === 401) {
        await logout();
      }
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    fetchUser
  };
});

