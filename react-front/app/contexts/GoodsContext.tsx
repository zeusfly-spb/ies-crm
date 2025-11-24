import React, { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import api from '../api/client';

interface Good {
  id: number;
  name: string;
  comment: string;
  count: number;
}

interface GoodsContextType {
  goods: Good[];
  loading: boolean;
  error: string | null;
  fetchGoods: () => Promise<void>;
  updateGood: (id: number, type: 'income' | 'expense', amount: number) => Promise<Good>;
  createGood: (goodData: Omit<Good, 'id'>) => Promise<Good>;
  updateGoodData: (id: number, goodData: Omit<Good, 'id'>) => Promise<Good>;
  deleteGood: (id: number) => Promise<boolean>;
}

const GoodsContext = createContext<GoodsContextType | undefined>(undefined);

export const useGoods = () => {
  const context = useContext(GoodsContext);
  if (!context) {
    throw new Error('useGoods must be used within a GoodsProvider');
  }
  return context;
};

interface GoodsProviderProps {
  children: ReactNode;
}

export const GoodsProvider: React.FC<GoodsProviderProps> = ({ children }) => {
  const [goods, setGoods] = useState<Good[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGoods = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/goods');
      setGoods(response.data);
    } catch (err: any) {
      const errorMessage = err.message || 'Ошибка при загрузке товаров';
      setError(errorMessage);
      console.error('Ошибка загрузки товаров:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateGood = useCallback(async (id: number, type: 'income' | 'expense', amount: number): Promise<Good> => {
    setError(null);

    try {
      const response = await api.put(`/goods/${id}/count`, {
        type,
        amount,
      });

      // Обновляем товар в списке
      setGoods(prevGoods => 
        prevGoods.map(g => g.id === id ? response.data : g)
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Ошибка при обновлении товара';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const createGood = useCallback(async (goodData: Omit<Good, 'id'>): Promise<Good> => {
    setError(null);

    try {
      const response = await api.post('/goods', goodData);
      setGoods(prevGoods => [...prevGoods, response.data]);
      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при создании товара';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const updateGoodData = useCallback(async (id: number, goodData: Omit<Good, 'id'>): Promise<Good> => {
    setError(null);

    try {
      const response = await api.put(`/goods/${id}`, goodData);

      // Обновляем товар в списке
      setGoods(prevGoods =>
        prevGoods.map(g => g.id === id ? response.data : g)
      );

      return response.data;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при обновлении товара';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteGood = useCallback(async (id: number): Promise<boolean> => {
    setError(null);

    try {
      await api.delete(`/goods/${id}`);

      // Удаляем товар из списка
      setGoods(prevGoods => prevGoods.filter(g => g.id !== id));

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Ошибка при удалении товара';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  return (
    <GoodsContext.Provider
      value={{
        goods,
        loading,
        error,
        fetchGoods,
        updateGood,
        createGood,
        updateGoodData,
        deleteGood,
      }}
    >
      {children}
    </GoodsContext.Provider>
  );
};
