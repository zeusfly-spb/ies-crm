import axios from 'axios';
import { config } from '../config.js';

// Хранилище токенов для каждого пользователя (в продакшене лучше использовать БД)
const userTokens = new Map();

const api = axios.create({
  baseURL: config.api.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Установка токена для пользователя
export function setUserToken(userId, token) {
  userTokens.set(userId, token);
}

// Получение токена пользователя
export function getUserToken(userId) {
  return userTokens.get(userId);
}

// Удаление токена пользователя
export function removeUserToken(userId) {
  userTokens.delete(userId);
}

// Получение API клиента с токеном пользователя
export function getApiClient(userId) {
  const token = getUserToken(userId);
  
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
  
  return api;
}

// Перехватчик для обработки ошибок авторизации
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Токен невалиден или истек
      const userId = error.config?.userId;
      if (userId) {
        removeUserToken(userId);
      }
    }
    return Promise.reject(error);
  }
);

export default api;

