import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import api from '../api/client';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => {
    // Безопасное получение токена из localStorage (только в браузере)
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('auth_token');
    }
    return null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = !!token;

  // Устанавливаем токен в заголовки API при изменении
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/login', { email, password });
      
      const newToken = response.data.token;
      const newUser = response.data.user;
      
      setToken(newToken);
      setUser(newUser);
      
      // Сохраняем токен в localStorage (только в браузере)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem('auth_token', newToken);
      }
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return true;
    } catch (err: any) {
      console.error('Login error:', err);
      
      // Обработка ошибок валидации Laravel
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        const firstError = Object.values(errors)[0];
        setError(Array.isArray(firstError) ? firstError[0] : firstError);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Ошибка авторизации. Проверьте подключение к серверу.');
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error('Ошибка при выходе:', err);
    } finally {
      setToken(null);
      setUser(null);
      // Удаляем токен из localStorage (только в браузере)
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem('auth_token');
      }
      delete api.defaults.headers.common['Authorization'];
      // Перенаправляем на страницу входа (только в браузере)
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  };

  const fetchUser = async (): Promise<void> => {
    if (!token) return;

    try {
      const response = await api.get('/user');
      setUser(response.data);
    } catch (err: any) {
      // Если токен невалиден, выходим
      if (err.response?.status === 401) {
        await logout();
      }
    }
  };

  // Загружаем пользователя при наличии токена
  useEffect(() => {
    if (token && !user) {
      fetchUser();
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login,
        logout,
        fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

