import { getApiClient } from './client.js';

export async function fetchGoods(userId) {
  try {
    const api = getApiClient(userId);
    const response = await api.get('/goods');
    return { success: true, goods: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Ошибка при загрузке товаров';
    return { success: false, error: errorMessage };
  }
}

export async function createGood(userId, goodData) {
  try {
    const api = getApiClient(userId);
    const response = await api.post('/goods', goodData);
    return { success: true, good: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Ошибка при создании товара';
    return { success: false, error: errorMessage };
  }
}

export async function updateGood(userId, id, goodData) {
  try {
    const api = getApiClient(userId);
    const response = await api.put(`/goods/${id}`, goodData);
    return { success: true, good: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Ошибка при обновлении товара';
    return { success: false, error: errorMessage };
  }
}

export async function updateGoodCount(userId, id, type, amount) {
  try {
    const api = getApiClient(userId);
    const response = await api.put(`/goods/${id}/count`, {
      type: type, // 'income' или 'expense'
      amount: amount,
    });
    return { success: true, good: response.data };
  } catch (error) {
    const errorMessage = error.response?.data?.error || 
                         error.message || 
                         'Ошибка при обновлении товара';
    return { success: false, error: errorMessage };
  }
}

export async function deleteGood(userId, id) {
  try {
    const api = getApiClient(userId);
    await api.delete(`/goods/${id}`);
    return { success: true };
  } catch (error) {
    const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Ошибка при удалении товара';
    return { success: false, error: errorMessage };
  }
}

