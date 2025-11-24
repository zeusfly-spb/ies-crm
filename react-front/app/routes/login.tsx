import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, redirect } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import type { Route } from './+types/login';
import './login.css';

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Вход в систему - IES CRM' },
    { name: 'description', content: 'Вход в систему IES CRM' },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  // clientLoader выполняется только на клиенте, но добавляем проверку для безопасности
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('auth_token');
    if (token) {
      throw redirect('/');
    }
  }
  return null;
}

export default function Login() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await auth.login(email, password);
      navigate('/');
    } catch (error) {
      // Ошибка уже обработана в context
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">IES CRM</h1>
        <p className="login-subtitle">Вход в систему</p>
        
        <form onSubmit={handleLogin} className="login-form">
          {auth.error && (
            <div className="error-message">
              {auth.error}
            </div>
          )}
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Адрес электронной почты"
              className="form-input"
              disabled={auth.loading}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Пароль"
              className="form-input"
              disabled={auth.loading}
            />
          </div>
          
          <button
            type="submit"
            className="login-button"
            disabled={auth.loading}
          >
            {auth.loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </div>
    </div>
  );
}
