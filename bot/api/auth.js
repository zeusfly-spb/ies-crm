import { getApiClient, setUserToken, removeUserToken } from './client.js';

export async function login(userId, email, password) {
  try {
    const api = getApiClient(userId);
    const response = await api.post('/login', { email, password });
    
    if (response.data.token) {
      setUserToken(userId, response.data.token);
      return {
        success: true,
        user: response.data.user,
      };
    }
    
    return { success: false, error: 'Токен не получен' };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.response?.data?.error ||
                         error.message || 
                         'Ошибка авторизации';
    return { success: false, error: errorMessage };
  }
}

export async function logout(userId) {
  try {
    const api = getApiClient(userId);
    await api.post('/logout');
  } catch (error) {
    console.error('Ошибка при выходе:', error);
  } finally {
    removeUserToken(userId);
  }
}

export async function fetchUser(userId) {
  try {
    const api = getApiClient(userId);
    const response = await api.get('/user');
    return { success: true, user: response.data };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

