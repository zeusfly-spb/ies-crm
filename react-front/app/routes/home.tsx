import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/home";
import { useAuth } from '../contexts/AuthContext';
import { useGoods } from '../contexts/GoodsContext';
import './home.css';

interface Good {
  id: number;
  name: string;
  comment: string;
  count: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "IES CRM - Список товаров" },
    { name: "description", content: "IES CRM Home Page" },
  ];
}

export async function clientLoader({}: Route.ClientLoaderArgs) {
  if (typeof window !== 'undefined' && window.localStorage) {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      throw redirect('/login');
    }
  } else {
    throw redirect('/login');
  }
  return null;
}

export default function Home() {
  const navigate = useNavigate();
  const auth = useAuth();
  const goods = useGoods();
  
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [selectedGood, setSelectedGood] = useState<Good | null>(null);
  const [operationType, setOperationType] = useState<'income' | 'expense' | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (auth.token && !auth.user) {
      auth.fetchUser();
    }
    goods.fetchGoods();
  }, []);

  useEffect(() => {
    if (amount !== '' && amount !== null && !isNaN(Number(amount))) {
      validateAmount();
    } else {
      setValidationError('');
    }
  }, [amount, operationType]);

  const openModal = (good: Good) => {
    setSelectedGood(good);
    setShowModal(true);
    setOperationType(null);
    setAmount('');
    setValidationError('');
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const resetForm = () => {
    setOperationType(null);
    setAmount('');
    setValidationError('');
  };

  const validateAmount = (): boolean => {
    setValidationError('');
    
    if (amount === '' || amount === null || isNaN(Number(amount)) || !isFinite(Number(amount))) {
      setValidationError('Введите корректное количество');
      return false;
    }
    
    const numAmount = Number(amount);
    
    if (numAmount <= 0) {
      setValidationError('Количество должно быть больше 0');
      return false;
    }
    
    if (!Number.isInteger(numAmount)) {
      setValidationError('Количество должно быть целым числом');
      return false;
    }
    
    if (operationType === 'expense' && selectedGood && numAmount > selectedGood.count) {
      setValidationError(`Недостаточно товара. Доступно: ${selectedGood.count}`);
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateAmount() || !operationType || !selectedGood) {
      return;
    }
    
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await goods.updateGood(selectedGood.id, operationType, Number(amount));
      closeModal();
    } catch (error: any) {
      setValidationError(error.message || 'Ошибка при обновлении товара');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToManagement = () => {
    navigate('/goods');
  };

  const handleLogout = async () => {
    await auth.logout();
  };

  const isAmountProvided = amount !== '' && amount !== null && !isNaN(Number(amount));
  const isSubmitDisabled = isSubmitting || !operationType || !isAmountProvided || Boolean(validationError);

  return (
    <div className="home">
      <div className="header">
        <h1>IES CRM - Список товаров</h1>
        <div className="header-actions">
          <button onClick={goToManagement} className="management-btn">
            Управление товарами
          </button>
          <button onClick={handleLogout} className="logout-btn">
            Выйти
          </button>
        </div>
      </div>
      
      {goods.loading && (
        <div className="loading">
          Загрузка товаров...
        </div>
      )}
      
      {goods.error && (
        <div className="error">
          {goods.error}
        </div>
      )}
      
      {!goods.loading && !goods.error && (
        <div className="goods-list">
          {goods.goods.length === 0 ? (
            <div className="empty">
              Товары не найдены
            </div>
          ) : (
            <div>
              <div className="view-controls">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  title="Сетка"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="12" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="2" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                    <rect x="12" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  title="Список"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <line x1="2" y1="4" x2="18" y2="4" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" strokeWidth="1.5"/>
                    <line x1="2" y1="16" x2="18" y2="16" stroke="currentColor" strokeWidth="1.5"/>
                  </svg>
                </button>
              </div>
              
              {viewMode === 'grid' ? (
                <div className="goods-grid">
                  {goods.goods.map((good) => (
                    <div
                      key={good.id}
                      className="good-card"
                      onClick={() => openModal(good)}
                    >
                      <h3 className="good-name">{good.name}</h3>
                      <p className="good-comment">{good.comment}</p>
                      <div className="good-count">
                        <span className="count-label">Количество:</span>
                        <span className="count-value">{good.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="goods-list-view">
                  {goods.goods.map((good) => (
                    <div
                      key={good.id}
                      className="good-list-item"
                      onClick={() => openModal(good)}
                    >
                      <div className="list-item-content">
                        <h3 className="list-item-name">{good.name}</h3>
                        <p className="list-item-comment">{good.comment}</p>
                      </div>
                      <div className="list-item-count">
                        <span className="count-value">{good.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Модальное окно для изменения количества */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedGood?.name}</h2>
              <button onClick={closeModal} className="modal-close">&times;</button>
            </div>
            
            {!operationType ? (
              <div className="operation-select">
                <button
                  onClick={() => setOperationType('income')}
                  className="operation-btn income-btn"
                >
                  Приход
                </button>
                <button
                  onClick={() => setOperationType('expense')}
                  className="operation-btn expense-btn"
                >
                  Расход
                </button>
              </div>
            ) : (
              <div className="amount-input-section">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>
                      {operationType === 'income' ? 'Количество для прихода' : 'Количество для расхода'}
                    </label>
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                      type="number"
                      min="1"
                      max={operationType === 'expense' ? selectedGood?.count : undefined}
                      className="amount-input"
                      placeholder="Введите количество"
                      onKeyUp={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    {validationError && (
                      <div className="validation-error">
                        {validationError}
                      </div>
                    )}
                    {operationType === 'expense' && selectedGood && (
                      <div className="available-count">
                        Доступно: {selectedGood.count}
                      </div>
                    )}
                  </div>
                  
                  <div className="modal-actions">
                    <button type="button" onClick={resetForm} className="cancel-btn">
                      Отмена
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitDisabled}
                      className="submit-btn"
                    >
                      ОК
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
