<template>
  <div class="goods-management">
    <div class="header">
      <h1>Управление товарами</h1>
      <div class="header-actions">
        <button @click="goHome" class="back-btn">На главную</button>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </div>
    </div>

    <div v-if="goodsStore.error && !isEditing && !isCreating" class="error">
      {{ goodsStore.error }}
    </div>

    <div v-if="goodsStore.loading" class="loading">
      Загрузка товаров...
    </div>

    <!-- Форма добавления/редактирования -->
    <div v-if="isCreating || isEditing" class="form-section">
      <div class="form-card">
        <div class="form-header">
          <h2>{{ isEditing ? 'Редактировать товар' : 'Добавить товар' }}</h2>
          <button @click="cancelForm" class="close-btn">&times;</button>
        </div>

        <form @submit.prevent="handleSubmit" class="goods-form">
          <div class="form-group">
            <label for="name">Название товара *</label>
            <input
              id="name"
              v-model="formData.name"
              type="text"
              required
              class="form-input"
              placeholder="Введите название"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-group">
            <label for="comment">Комментарий</label>
            <textarea
              id="comment"
              v-model="formData.comment"
              class="form-textarea"
              placeholder="Введите комментарий (необязательно)"
              rows="3"
              :disabled="isSubmitting"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="count">Количество *</label>
            <input
              id="count"
              v-model.number="formData.count"
              type="number"
              min="0"
              required
              class="form-input"
              placeholder="0"
              :disabled="isSubmitting"
            />
          </div>

          <div v-if="formError" class="form-error">
            {{ formError }}
          </div>

          <div class="form-actions">
            <button type="button" @click="cancelForm" class="cancel-btn" :disabled="isSubmitting">
              Отмена
            </button>
            <button type="submit" class="submit-btn" :disabled="isSubmitting">
              <span v-if="isSubmitting">Сохранение...</span>
              <span v-else>{{ isEditing ? 'Сохранить' : 'Добавить' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Список товаров -->
    <div v-if="!goodsStore.loading && !isCreating && !isEditing" class="goods-section">
      <div class="section-header">
        <h2>Список товаров ({{ goodsStore.goods.length }})</h2>
        <button @click="startCreating" class="add-btn">+ Добавить товар</button>
      </div>

      <div v-if="goodsStore.goods.length === 0" class="empty">
        Товары не найдены. Добавьте первый товар.
      </div>

      <template v-else>
        <!-- Таблица для десктопа -->
        <div class="goods-table-container desktop-table">
          <table class="goods-table">
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
              <tr v-for="good in goodsStore.goods" :key="good.id">
                <td>{{ good.id }}</td>
                <td class="name-cell">{{ good.name }}</td>
                <td class="comment-cell">{{ good.comment || '-' }}</td>
                <td class="count-cell">{{ good.count }}</td>
                <td class="actions-cell">
                  <button @click="startEditing(good)" class="edit-btn" title="Редактировать">
                    ✏️
                  </button>
                  <button @click="confirmDelete(good)" class="delete-btn" title="Удалить">
                    🗑️
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Карточки для мобильных -->
        <div class="goods-cards mobile-cards">
          <div 
            v-for="good in goodsStore.goods" 
            :key="good.id" 
            class="good-card"
          >
            <div class="card-header">
              <div class="card-title-section">
                <h3 class="card-name">{{ good.name }}</h3>
                <span class="card-id">ID: {{ good.id }}</span>
              </div>
              <div class="card-actions">
                <button @click="startEditing(good)" class="card-edit-btn" title="Редактировать">
                  ✏️
                </button>
                <button @click="confirmDelete(good)" class="card-delete-btn" title="Удалить">
                  🗑️
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="card-row">
                <span class="card-label">Комментарий:</span>
                <span class="card-value">{{ good.comment || '-' }}</span>
              </div>
              <div class="card-row">
                <span class="card-label">Количество:</span>
                <span class="card-count">{{ good.count }}</span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <!-- Модальное окно подтверждения удаления -->
    <div v-if="showDeleteModal" class="modal-overlay" @click.self="cancelDelete">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Подтверждение удаления</h3>
          <button @click="cancelDelete" class="modal-close">&times;</button>
        </div>
        <div class="modal-body">
          <p>Вы уверены, что хотите удалить товар <strong>"{{ goodToDelete?.name }}"</strong>?</p>
          <p class="warning">Это действие нельзя отменить.</p>
        </div>
        <div class="modal-actions">
          <button @click="cancelDelete" class="cancel-btn">Отмена</button>
          <button @click="handleDelete" class="delete-confirm-btn" :disabled="isDeleting">
            <span v-if="isDeleting">Удаление...</span>
            <span v-else>Удалить</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useGoodsStore } from '../stores/goods'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const goodsStore = useGoodsStore()
const authStore = useAuthStore()

const isCreating = ref(false)
const isEditing = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const formError = ref('')
const showDeleteModal = ref(false)
const goodToDelete = ref(null)

const formData = reactive({
  name: '',
  comment: '',
  count: 0
})

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
  goodsStore.fetchGoods()
})

function startCreating() {
  isCreating.value = true
  isEditing.value = false
  resetForm()
}

function startEditing(good) {
  isEditing.value = true
  isCreating.value = false
  formData.name = good.name
  formData.comment = good.comment || ''
  formData.count = good.count
  formData.id = good.id
  formError.value = ''
}

function cancelForm() {
  isCreating.value = false
  isEditing.value = false
  resetForm()
}

function resetForm() {
  formData.name = ''
  formData.comment = ''
  formData.count = 0
  formData.id = null
  formError.value = ''
}

async function handleSubmit() {
  formError.value = ''
  
  if (!formData.name.trim()) {
    formError.value = 'Название товара обязательно'
    return
  }

  if (formData.count < 0) {
    formError.value = 'Количество не может быть отрицательным'
    return
  }

  isSubmitting.value = true

  try {
    if (isEditing.value) {
      await goodsStore.updateGoodData(formData.id, {
        name: formData.name.trim(),
        comment: formData.comment.trim(),
        count: formData.count
      })
    } else {
      await goodsStore.createGood({
        name: formData.name.trim(),
        comment: formData.comment.trim(),
        count: formData.count
      })
    }
    
    cancelForm()
  } catch (error) {
    formError.value = error.message || 'Ошибка при сохранении товара'
  } finally {
    isSubmitting.value = false
  }
}

function confirmDelete(good) {
  goodToDelete.value = good
  showDeleteModal.value = true
}

function cancelDelete() {
  showDeleteModal.value = false
  goodToDelete.value = null
}

async function handleDelete() {
  if (!goodToDelete.value) return

  isDeleting.value = true

  try {
    await goodsStore.deleteGood(goodToDelete.value.id)
    cancelDelete()
  } catch (error) {
    formError.value = error.message || 'Ошибка при удалении товара'
    cancelDelete()
  } finally {
    isDeleting.value = false
  }
}

function goHome() {
  router.push('/')
}

async function handleLogout() {
  await authStore.logout()
}
</script>

<style scoped>
.goods-management {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header h1 {
  color: #42b883;
  margin: 0;
  font-size: 1.75rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.back-btn,
.logout-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.back-btn {
  background: #3498db;
  color: #fff;
}

.back-btn:hover {
  background: #2980b9;
}

.logout-btn {
  background: #e74c3c;
  color: #fff;
}

.logout-btn:hover {
  background: #c0392b;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
  font-size: 1.1rem;
}

.error {
  color: #e74c3c;
  background-color: #fee;
  border: 1px solid #e74c3c;
  border-radius: 8px;
}

.empty {
  color: #7f8c8d;
}

/* Форма */
.form-section {
  margin-bottom: 2rem;
}

.form-card {
  background: #fff;
  border: 2px solid #e8f5e9;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
  background: #f8f9fa;
}

.form-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-btn {
  background: none;
  border: none;
  font-size: 2rem;
  color: #7f8c8d;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #e0e0e0;
  color: #2c3e50;
}

.goods-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-input:disabled,
.form-textarea:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.form-textarea {
  resize: vertical;
}

.form-error {
  margin-top: 0.5rem;
  color: #e74c3c;
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #f0f0f0;
  color: #2c3e50;
}

.cancel-btn:hover:not(:disabled) {
  background: #e0e0e0;
}

.submit-btn {
  background: #42b883;
  color: #fff;
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled,
.cancel-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Список товаров */
.goods-section {
  margin-top: 2rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.section-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.add-btn {
  padding: 0.75rem 1.5rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #35a372;
}

.goods-table-container {
  overflow-x: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* Карточки для мобильных */
.goods-cards {
  display: none;
}

.good-card {
  background: #fff;
  border: 2px solid #e8f5e9;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.good-card:hover {
  border-color: #42b883;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.25);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #e0e0e0;
}

.card-title-section {
  flex: 1;
  min-width: 0;
}

.card-name {
  margin: 0 0 0.25rem 0;
  color: #2c3e50;
  font-size: 1.1rem;
  font-weight: 600;
  word-wrap: break-word;
}

.card-id {
  color: #7f8c8d;
  font-size: 0.85rem;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 0.75rem;
  flex-shrink: 0;
}

.card-edit-btn,
.card-delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.card-edit-btn:hover {
  background: #e8f5e9;
  transform: scale(1.1);
}

.card-delete-btn:hover {
  background: #fee;
  transform: scale(1.1);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.card-label {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
  flex-shrink: 0;
}

.card-value {
  color: #2c3e50;
  font-size: 0.9rem;
  text-align: right;
  word-wrap: break-word;
  flex: 1;
}

.card-count {
  color: #42b883;
  font-size: 1rem;
  font-weight: 600;
}

.goods-table {
  width: 100%;
  border-collapse: collapse;
}

.goods-table thead {
  background: #f8f9fa;
}

.goods-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2c3e50;
  border-bottom: 2px solid #e0e0e0;
  font-size: 0.95rem;
}

.goods-table td {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  color: #2c3e50;
}

.goods-table tbody tr:hover {
  background: #f8f9fa;
}

.goods-table tbody tr:last-child td {
  border-bottom: none;
}

.name-cell {
  font-weight: 500;
}

.comment-cell {
  color: #7f8c8d;
  max-width: 300px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.count-cell {
  font-weight: 600;
  color: #42b883;
}

.actions-cell {
  white-space: nowrap;
}

.edit-btn,
.delete-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  margin-right: 0.5rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.edit-btn:hover {
  background: #e8f5e9;
  transform: scale(1.1);
}

.delete-btn:hover {
  background: #fee;
  transform: scale(1.1);
}

/* Модальное окно */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  width: 100%;
  max-width: 500px;
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
}

.modal-close {
  background: none;
  border: none;
  font-size: 2rem;
  color: #7f8c8d;
  cursor: pointer;
  line-height: 1;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #f0f0f0;
  color: #2c3e50;
}

.modal-body {
  padding: 1.5rem;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.warning {
  color: #e74c3c;
  font-weight: 500;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e0e0e0;
}

.delete-confirm-btn {
  flex: 1;
  padding: 0.75rem;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
}

.delete-confirm-btn:hover:not(:disabled) {
  background: #c0392b;
}

.delete-confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Адаптивность */
@media (max-width: 1024px) {
  .goods-table th,
  .goods-table td {
    padding: 0.875rem 0.75rem;
    font-size: 0.95rem;
  }
  
  .comment-cell {
    max-width: 200px;
  }
}

@media (max-width: 768px) {
  /* Показываем карточки, скрываем таблицу */
  .desktop-table {
    display: none;
  }
  
  .mobile-cards {
    display: block;
  }
}

@media (max-width: 768px) {
  .goods-management {
    padding: 1rem;
  }

  .header {
    margin-bottom: 1.5rem;
  }

  .header h1 {
    font-size: 1.5rem;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .section-header h2 {
    font-size: 1.35rem;
  }

  .add-btn {
    width: 100%;
    padding: 0.875rem;
  }

  .goods-table {
    font-size: 0.9rem;
  }

  .goods-table th,
  .goods-table td {
    padding: 0.75rem 0.5rem;
  }

  .comment-cell {
    max-width: 150px;
  }

  .form-header {
    padding: 1.25rem;
  }

  .form-header h2 {
    font-size: 1.35rem;
  }

  .goods-form {
    padding: 1.25rem;
  }

  .form-group {
    margin-bottom: 1.25rem;
  }

  .form-group label {
    font-size: 0.9rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.65rem;
    font-size: 0.95rem;
  }

  .modal-content {
    max-width: 90%;
  }

  .modal-header {
    padding: 1.25rem;
  }

  .modal-header h3 {
    font-size: 1.15rem;
  }

  .modal-body {
    padding: 1.25rem;
  }

  .modal-actions {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .goods-management {
    padding: 0.75rem;
  }

  .header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
    gap: 0.75rem;
  }

  .back-btn,
  .logout-btn {
    width: 100%;
    padding: 0.6rem 1rem;
    font-size: 0.95rem;
  }

  .header h1 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .section-header {
    margin-bottom: 1rem;
  }

  .section-header h2 {
    font-size: 1.15rem;
    margin-bottom: 0.75rem;
  }

  .add-btn {
    font-size: 0.95rem;
    padding: 0.75rem 1rem;
  }

  .form-header {
    padding: 1rem;
  }

  .form-header h2 {
    font-size: 1.15rem;
  }

  .close-btn {
    width: 28px;
    height: 28px;
    font-size: 1.75rem;
  }

  .goods-form {
    padding: 1rem;
  }

  .form-group {
    margin-bottom: 1rem;
  }

  .form-group label {
    font-size: 0.85rem;
    margin-bottom: 0.4rem;
  }

  .form-input,
  .form-textarea {
    padding: 0.6rem;
    font-size: 0.9rem;
  }

  .form-error {
    font-size: 0.85rem;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;
    margin-top: 1.25rem;
  }

  .cancel-btn,
  .submit-btn {
    padding: 0.7rem;
    font-size: 0.95rem;
  }

  .good-card {
    padding: 0.875rem;
    margin-bottom: 0.875rem;
  }

  .card-header {
    margin-bottom: 0.875rem;
    padding-bottom: 0.625rem;
  }

  .card-name {
    font-size: 1rem;
  }

  .card-id {
    font-size: 0.8rem;
  }

  .card-actions {
    gap: 0.4rem;
    margin-left: 0.5rem;
  }

  .card-edit-btn,
  .card-delete-btn {
    font-size: 1.1rem;
    padding: 0.2rem 0.4rem;
  }

  .card-body {
    gap: 0.625rem;
  }

  .card-label {
    font-size: 0.85rem;
  }

  .card-value {
    font-size: 0.85rem;
  }

  .card-count {
    font-size: 0.95rem;
  }

  .modal-overlay {
    padding: 0.5rem;
  }

  .modal-content {
    max-width: 100%;
    border-radius: 12px;
  }

  .modal-header {
    padding: 1rem;
  }

  .modal-header h3 {
    font-size: 1.1rem;
  }

  .modal-close {
    width: 28px;
    height: 28px;
    font-size: 1.75rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-body p {
    font-size: 0.9rem;
    margin: 0.4rem 0;
  }

  .modal-actions {
    flex-direction: column;
    gap: 0.75rem;
    padding: 1rem;
  }

  .delete-confirm-btn {
    padding: 0.7rem;
    font-size: 0.95rem;
  }

  .loading,
  .error,
  .empty {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 360px) {
  .goods-management {
    padding: 0.5rem;
  }

  .header h1 {
    font-size: 1.1rem;
  }

  .section-header h2 {
    font-size: 1rem;
  }

  .form-header h2 {
    font-size: 1rem;
  }

  .good-card {
    padding: 0.75rem;
    margin-bottom: 0.75rem;
  }

  .card-name {
    font-size: 0.95rem;
  }

  .card-id {
    font-size: 0.75rem;
  }

  .card-label {
    font-size: 0.8rem;
  }

  .card-value {
    font-size: 0.8rem;
  }

  .card-count {
    font-size: 0.9rem;
  }
}
</style>

