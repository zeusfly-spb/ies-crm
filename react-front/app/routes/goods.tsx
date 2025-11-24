import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { redirect, useNavigate } from "react-router";
import type { Route } from "./+types/goods";
import { useAuth } from '../contexts/AuthContext';
import { useGoods } from '../contexts/GoodsContext';
import './goods.css';

interface Good {
  id: number;
  name: string;
  comment: string;
  count: number;
}

interface FormData {
  id?: number;
  name: string;
  comment: string;
  count: number;
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Управление товарами - IES CRM" },
    { name: "description", content: "IES CRM Goods Management" },
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

export default function GoodsManagement() {
  const navigate = useNavigate();
  const auth = useAuth();
  const goods = useGoods();
  
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formError, setFormError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [goodToDelete, setGoodToDelete] = useState<Good | null>(null);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    comment: '',
    count: 0,
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<'name' | 'count' | 'id'>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Фильтрация и сортировка товаров
  const filteredAndSortedGoods = goods.goods.filter((good) => {
    const query = searchQuery.toLowerCase();
    return (
      good.name.toLowerCase().includes(query) ||
      (good.comment && good.comment.toLowerCase().includes(query)) ||
      good.id.toString().includes(query)
    );
  }).sort((a, b) => {
    let aValue: string | number = a[sortField];
    let bValue: string | number = b[sortField];

    if (sortField === 'name') {
      aValue = aValue.toString().toLowerCase();
      bValue = bValue.toString().toLowerCase();
    }

    if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
    if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field: 'name' | 'count' | 'id') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  useEffect(() => {
    if (auth.token && !auth.user) {
      auth.fetchUser();
    }
    goods.fetchGoods();
  }, []);

  // Auto-focus on name input when form opens
  useEffect(() => {
    if ((isCreating || isEditing) && !isSubmitting) {
      setTimeout(() => {
        const nameInput = document.getElementById('name');
        if (nameInput) {
          nameInput.focus();
        }
      }, 100);
    }
  }, [isCreating, isEditing, isSubmitting]);

  const startCreating = () => {
    setIsCreating(true);
    setIsEditing(false);
    resetForm();
    // Auto-focus will be handled by useEffect below
  };

  const startEditing = (good: Good) => {
    setIsEditing(true);
    setIsCreating(false);
    setFormData({
      id: good.id,
      name: good.name,
      comment: good.comment || '',
      count: good.count,
    });
    setFormError('');
    // Auto-focus will be handled by useEffect below
  };

  const cancelForm = () => {
    setIsCreating(false);
    setIsEditing(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      comment: '',
      count: 0,
    });
    setFormError('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!formData.name.trim()) {
      setFormError('Название товара обязательно');
      return;
    }

    if (formData.count < 0) {
      setFormError('Количество не может быть отрицательным');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && formData.id) {
        await goods.updateGoodData(formData.id, {
          name: formData.name.trim(),
          comment: formData.comment.trim(),
          count: formData.count,
        });
      } else {
        await goods.createGood({
          name: formData.name.trim(),
          comment: formData.comment.trim(),
          count: formData.count,
        });
      }
      
      cancelForm();
    } catch (error: any) {
      setFormError(error.message || 'Ошибка при сохранении товара');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = (good: Good) => {
    setGoodToDelete(good);
    setShowDeleteModal(true);
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setGoodToDelete(null);
  };

  const handleDelete = async () => {
    if (!goodToDelete) return;

    setIsDeleting(true);

    try {
      await goods.deleteGood(goodToDelete.id);
      cancelDelete();
    } catch (error: any) {
      setFormError(error.message || 'Ошибка при удалении товара');
      cancelDelete();
    } finally {
      setIsDeleting(false);
    }
  };

  const goHome = () => {
    navigate('/');
  };

  const handleLogout = async () => {
    await auth.logout();
  };

  return (
    <div className="goods-management">
      <div className="header">
        <h1>Управление товарами</h1>
        <div className="header-actions">
          <button onClick={goHome} className="back-btn">На главную</button>
          <button onClick={handleLogout} className="logout-btn">Выйти</button>
        </div>
      </div>

      {goods.error && !isEditing && !isCreating && (
        <div className="error">
          {goods.error}
        </div>
      )}

      {goods.loading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          Загрузка товаров...
        </div>
      )}

      {/* Форма добавления/редактирования */}
      {(isCreating || isEditing) && (
        <div className="form-section">
          <div className="form-card">
            <div className="form-header">
              <h2>{isEditing ? 'Редактировать товар' : 'Добавить товар'}</h2>
              <button onClick={cancelForm} className="close-btn">&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="goods-form">
              <div className="form-group">
                <label htmlFor="name">Название товара *</label>
                <input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  type="text"
                  required
                  className="form-input"
                  placeholder="Введите название"
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="comment">Комментарий</label>
                <textarea
                  id="comment"
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="form-textarea"
                  placeholder="Введите комментарий (необязательно)"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-group">
                <label htmlFor="count">Количество *</label>
                <input
                  id="count"
                  value={formData.count}
                  onChange={(e) => setFormData({ ...formData, count: Number(e.target.value) })}
                  type="number"
                  min="0"
                  required
                  className="form-input"
                  placeholder="0"
                  disabled={isSubmitting}
                />
              </div>

              {formError && (
                <div className="form-error">
                  {formError}
                </div>
              )}

              <div className="form-actions">
                <button type="button" onClick={cancelForm} className="cancel-btn" disabled={isSubmitting}>
                  Отмена
                </button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Сохранение...' : (isEditing ? 'Сохранить' : 'Добавить')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Список товаров */}
      {!goods.loading && !isCreating && !isEditing && (
        <div className="goods-section">
          <div className="section-header">
            <h2>Список товаров ({filteredAndSortedGoods.length}{goods.goods.length !== filteredAndSortedGoods.length ? ` из ${goods.goods.length}` : ''})</h2>
            <button onClick={startCreating} className="add-btn">+ Добавить товар</button>
          </div>

          {/* Поиск и сортировка */}
          {goods.goods.length > 0 && (
            <div className="controls-section">
              <div className="search-group">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск по названию, комментарию или ID..."
                  className="search-input"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="clear-search-btn" title="Очистить поиск">
                    ✕
                  </button>
                )}
              </div>
            </div>
          )}

          {goods.goods.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">📦</div>
              <h3>Товары не найдены</h3>
              <p>Добавьте первый товар, чтобы начать работу.</p>
            </div>
          ) : filteredAndSortedGoods.length === 0 ? (
            <div className="empty">
              <div className="empty-icon">🔍</div>
              <h3>По вашему запросу ничего не найдено</h3>
              <p>Попробуйте изменить поисковый запрос.</p>
              <button onClick={() => setSearchQuery('')} className="clear-search-link">
                Очистить поиск
              </button>
            </div>
          ) : (
            <>
              {/* Таблица для десктопа */}
              <div className="goods-table-container desktop-table">
                <table className="goods-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Название</th>
                      <th>Комментарий</th>
                      <th>Количество</th>
                      <th>Действия</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedGoods.map((good) => (
                      <tr key={good.id}>
                        <td>{good.id}</td>
                        <td className="name-cell">{good.name}</td>
                        <td className="comment-cell">{good.comment || '-'}</td>
                        <td className="count-cell">{good.count}</td>
                        <td className="actions-cell">
                          <button onClick={() => startEditing(good)} className="edit-btn" title="Редактировать">
                            ✏️
                          </button>
                          <button onClick={() => confirmDelete(good)} className="delete-btn" title="Удалить">
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Карточки для мобильных */}
              <div className="goods-cards mobile-cards">
                {filteredAndSortedGoods.map((good) => (
                  <div key={good.id} className="good-card">
                    <div className="card-header">
                      <div className="card-title-section">
                        <h3 className="card-name">{good.name}</h3>
                        <span className="card-id">ID: {good.id}</span>
                      </div>
                      <div className="card-actions">
                        <button onClick={() => startEditing(good)} className="card-edit-btn" title="Редактировать">
                          ✏️
                        </button>
                        <button onClick={() => confirmDelete(good)} className="card-delete-btn" title="Удалить">
                          🗑️
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="card-row">
                        <span className="card-label">Комментарий:</span>
                        <span className="card-value">{good.comment || '-'}</span>
                      </div>
                      <div className="card-row">
                        <span className="card-label">Количество:</span>
                        <span className="card-count">{good.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Модальное окно подтверждения удаления */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={cancelDelete}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Подтверждение удаления</h3>
              <button onClick={cancelDelete} className="modal-close">&times;</button>
            </div>
            <div className="modal-body">
              <p>Вы уверены, что хотите удалить товар <strong>"{goodToDelete?.name}"</strong>?</p>
              <p className="warning">Это действие нельзя отменить.</p>
            </div>
            <div className="modal-actions">
              <button onClick={cancelDelete} className="cancel-btn">Отмена</button>
              <button onClick={handleDelete} className="delete-confirm-btn" disabled={isDeleting}>
                {isDeleting ? 'Удаление...' : 'Удалить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
