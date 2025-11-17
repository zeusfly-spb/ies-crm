<template>
  <div class="home">
    <div class="header">
      <h1>IES CRM - Список товаров</h1>
      <div class="header-actions">
        <button @click="goToManagement" class="management-btn">Управление товарами</button>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </div>
    </div>
    
    <div v-if="goodsStore.loading" class="loading">
      Загрузка товаров...
    </div>
    
    <div v-if="goodsStore.error" class="error">
      {{ goodsStore.error }}
    </div>
    
    <div v-if="!goodsStore.loading && !goodsStore.error" class="goods-list">
      <div v-if="goodsStore.goods.length === 0" class="empty">
        Товары не найдены
      </div>
      
      <div v-else>
        <div class="view-controls">
          <button 
            @click="viewMode = 'grid'" 
            :class="['view-btn', { active: viewMode === 'grid' }]"
            title="Сетка"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <rect x="12" y="2" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <rect x="2" y="12" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
              <rect x="12" y="12" width="6" height="6" stroke="currentColor" stroke-width="1.5" fill="none"/>
            </svg>
          </button>
          <button 
            @click="viewMode = 'list'" 
            :class="['view-btn', { active: viewMode === 'list' }]"
            title="Список"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <line x1="2" y1="4" x2="18" y2="4" stroke="currentColor" stroke-width="1.5"/>
              <line x1="2" y1="10" x2="18" y2="10" stroke="currentColor" stroke-width="1.5"/>
              <line x1="2" y1="16" x2="18" y2="16" stroke="currentColor" stroke-width="1.5"/>
            </svg>
          </button>
        </div>
        
        <div v-if="viewMode === 'grid'" class="goods-grid">
          <div 
            v-for="good in goodsStore.goods" 
            :key="good.id" 
            class="good-card"
            @click="openModal(good)"
          >
            <h3 class="good-name">{{ good.name }}</h3>
            <p class="good-comment">{{ good.comment }}</p>
            <div class="good-count">
              <span class="count-label">Количество:</span>
              <span class="count-value">{{ good.count }}</span>
            </div>
          </div>
        </div>
        
        <div v-else class="goods-list-view">
          <div 
            v-for="good in goodsStore.goods" 
            :key="good.id" 
            class="good-list-item"
            @click="openModal(good)"
          >
            <div class="list-item-content">
              <h3 class="list-item-name">{{ good.name }}</h3>
              <p class="list-item-comment">{{ good.comment }}</p>
            </div>
            <div class="list-item-count">
              <span class="count-value">{{ good.count }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно для изменения количества -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>{{ selectedGood?.name }}</h2>
          <button @click="closeModal" class="modal-close">&times;</button>
        </div>
        
        <div v-if="!operationType" class="operation-select">
          <button 
            @click="operationType = 'income'" 
            class="operation-btn income-btn"
          >
            Приход
          </button>
          <button 
            @click="operationType = 'expense'" 
            class="operation-btn expense-btn"
          >
            Расход
          </button>
        </div>
        
        <div v-else class="amount-input-section">
          <div class="form-group">
            <label>
              {{ operationType === 'income' ? 'Количество для прихода' : 'Количество для расхода' }}
            </label>
            <input
              v-model.number="amount"
              type="number"
              min="1"
              :max="operationType === 'expense' ? selectedGood?.count : undefined"
              class="amount-input"
              placeholder="Введите количество"
              @keyup.enter="handleSubmit"
            />
            <div v-if="validationError" class="validation-error">
              {{ validationError }}
            </div>
            <div v-if="operationType === 'expense' && selectedGood" class="available-count">
              Доступно: {{ selectedGood.count }}
            </div>
          </div>
          
          <div class="modal-actions">
            <button @click="resetForm" class="cancel-btn">Отмена</button>
            <button 
              @click="handleSubmit" 
              :disabled="isSubmitDisabled"
              class="submit-btn"
            >
              ОК
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useGoodsStore } from '../stores/goods'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const goodsStore = useGoodsStore()
const authStore = useAuthStore()
const viewMode = ref('grid')
const showModal = ref(false)
const selectedGood = ref(null)
const operationType = ref(null) // 'income' или 'expense'
const amount = ref(null)
const validationError = ref('')
const isSubmitting = ref(false)

const availableCount = computed(() => {
  return selectedGood.value?.count || 0
})

// Валидация в реальном времени
watch([amount, operationType], () => {
  if (amount.value !== null && amount.value !== '' && !Number.isNaN(amount.value)) {
    validateAmount()
  } else {
    validationError.value = ''
  }
})

const isAmountProvided = computed(() => {
  return (
    amount.value !== null &&
    amount.value !== '' &&
    !Number.isNaN(amount.value)
  )
})

const isSubmitDisabled = computed(() => {
  return (
    isSubmitting.value ||
    !operationType.value ||
    !isAmountProvided.value ||
    Boolean(validationError.value)
  )
})

onMounted(async () => {
  // Проверяем авторизацию при загрузке
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser()
  }
  goodsStore.fetchGoods()
})

function openModal(good) {
  selectedGood.value = good
  showModal.value = true
  operationType.value = null
  amount.value = null
  validationError.value = ''
}

function closeModal() {
  showModal.value = false
  resetForm()
}

function resetForm() {
  operationType.value = null
  amount.value = null
  validationError.value = ''
}

function validateAmount() {
  validationError.value = ''
  
  if (amount.value === null || amount.value === '' || isNaN(amount.value) || !isFinite(amount.value)) {
    validationError.value = 'Введите корректное количество'
    return false
  }
  
  const numAmount = Number(amount.value)
  
  if (numAmount <= 0) {
    validationError.value = 'Количество должно быть больше 0'
    return false
  }
  
  if (!Number.isInteger(numAmount)) {
    validationError.value = 'Количество должно быть целым числом'
    return false
  }
  
  if (operationType.value === 'expense' && numAmount > availableCount.value) {
    validationError.value = `Недостаточно товара. Доступно: ${availableCount.value}`
    return false
  }
  
  return true
}

async function handleSubmit() {
  if (!validateAmount()) {
    return
  }
  
  if (isSubmitting.value) {
    return
  }
  
  isSubmitting.value = true
  
  try {
    await goodsStore.updateGood(selectedGood.value.id, operationType.value, amount.value)
    closeModal()
  } catch (error) {
    validationError.value = error.message || 'Ошибка при обновлении товара'
  } finally {
    isSubmitting.value = false
  }
}

function goToManagement() {
  router.push('/goods')
}

async function handleLogout() {
  await authStore.logout()
}
</script>

<style scoped>
.home {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
}

@media (max-width: 768px) {
  .home {
    padding: 1rem;
  }
}

@media (max-width: 480px) {
  .home {
    padding: 0.75rem;
  }
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.management-btn {
  padding: 0.5rem 1rem;
  background: #3498db;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.management-btn:hover {
  background: #2980b9;
}

h1 {
  color: #42b883;
  margin: 0;
  font-size: 1.75rem;
}

@media (max-width: 768px) {
  .header {
    margin-bottom: 1.5rem;
  }
  
  h1 {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 1rem;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .management-btn,
  .logout-btn {
    width: 100%;
  }
  
  h1 {
    font-size: 1.25rem;
  }
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #e74c3c;
  color: #fff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: background-color 0.2s;
  white-space: nowrap;
}

@media (max-width: 480px) {
  .logout-btn {
    width: 100%;
    padding: 0.6rem 1rem;
    font-size: 0.95rem;
  }
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

@media (max-width: 768px) {
  .loading,
  .error,
  .empty {
    padding: 1.5rem;
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .loading,
  .error,
  .empty {
    padding: 1rem;
    font-size: 0.95rem;
  }
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

.goods-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;
}

@media (max-width: 1200px) {
  .goods-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .goods-grid {
    grid-template-columns: 1fr;
  }
}

.good-card {
  background: #fff;
  border: 2px solid #e8f5e9;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
  cursor: pointer;
}

@media (max-width: 768px) {
  .good-card {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
  .good-card {
    padding: 1rem;
    border-radius: 10px;
  }
}

.good-card:hover {
  transform: translateY(-4px);
  border-color: #42b883;
  box-shadow: 0 8px 20px rgba(66, 184, 131, 0.25);
}

.good-name {
  color: #2c3e50;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .good-name {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .good-name {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }
}

.good-comment {
  color: #7f8c8d;
  margin-bottom: 1rem;
  line-height: 1.5;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .good-comment {
    font-size: 0.9rem;
  }
}

@media (max-width: 480px) {
  .good-comment {
    font-size: 0.85rem;
    margin-bottom: 0.75rem;
  }
}

.good-count {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #e0e0e0;
}

.count-label {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.count-value {
  color: #42b883;
  font-size: 1.1rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .count-value {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .count-value {
    font-size: 0.95rem;
  }
}

.view-controls {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

@media (max-width: 480px) {
  .view-controls {
    margin-bottom: 1rem;
    padding: 0.4rem;
  }
}

.view-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: 1px solid #e0e0e0;
  background: #fff;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  color: #7f8c8d;
}

.view-btn:hover {
  background: #f0f0f0;
  border-color: #42b883;
  color: #42b883;
}

.view-btn.active {
  background: #42b883;
  border-color: #42b883;
  color: #fff;
}

.goods-list-view {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 2rem;
}

.good-list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  border: 2px solid #e8f5e9;
  border-radius: 12px;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  cursor: pointer;
}

@media (max-width: 768px) {
  .good-list-item {
    padding: 0.875rem 1.25rem;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

@media (max-width: 480px) {
  .good-list-item {
    padding: 0.75rem 1rem;
    border-radius: 10px;
    flex-direction: column;
    align-items: flex-start;
  }
}

.good-list-item:hover {
  transform: translateX(4px);
  border-color: #42b883;
  box-shadow: 0 4px 12px rgba(66, 184, 131, 0.25);
}

.list-item-content {
  flex: 1;
  min-width: 0;
}

.list-item-name {
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
  font-size: 1.1rem;
  font-weight: 600;
}

@media (max-width: 768px) {
  .list-item-name {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .list-item-name {
    font-size: 0.95rem;
    margin-bottom: 0.375rem;
  }
}

.list-item-comment {
  color: #7f8c8d;
  margin: 0;
  line-height: 1.5;
  font-size: 0.9rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .list-item-comment {
    font-size: 0.85rem;
  }
}

@media (max-width: 480px) {
  .list-item-comment {
    font-size: 0.8rem;
    white-space: normal;
    overflow: visible;
    text-overflow: unset;
  }
}

.list-item-count {
  margin-left: 1.5rem;
  flex-shrink: 0;
}

@media (max-width: 768px) {
  .list-item-count {
    margin-left: 0;
  }
}

@media (max-width: 480px) {
  .list-item-count {
    margin-left: 0;
    width: 100%;
    padding-top: 0.5rem;
    border-top: 1px solid #e0e0e0;
  }
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
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
  font-weight: 600;
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

.operation-select {
  display: flex;
  gap: 1rem;
  padding: 2rem 1.5rem;
  justify-content: center;
}

.operation-btn {
  flex: 1;
  padding: 1rem 2rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: #fff;
}

.income-btn {
  color: #27ae60;
  border-color: #27ae60;
}

.income-btn:hover {
  background: #27ae60;
  color: #fff;
}

.expense-btn {
  color: #e74c3c;
  border-color: #e74c3c;
}

.expense-btn:hover {
  background: #e74c3c;
  color: #fff;
}

.amount-input-section {
  padding: 1.5rem;
}

.amount-input-section .form-group {
  margin-bottom: 1.5rem;
}

.amount-input-section label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
}

.amount-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.amount-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.available-count {
  margin-top: 0.5rem;
  color: #7f8c8d;
  font-size: 0.9rem;
}

.validation-error {
  margin-top: 0.5rem;
  color: #e74c3c;
  font-size: 0.9rem;
}

.modal-actions {
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

.cancel-btn:hover {
  background: #e0e0e0;
}

.submit-btn {
  background: #42b883;
  color: #fff;
}

.submit-btn:hover:not(:disabled) {
  background: #35a372;
}

.submit-btn:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .modal-content {
    max-width: 90%;
  }
  
  .modal-header {
    padding: 1.25rem;
  }
  
  .modal-header h2 {
    font-size: 1.25rem;
  }
  
  .operation-select {
    padding: 1.5rem 1rem;
    flex-direction: column;
  }
  
  .operation-btn {
    padding: 0.875rem 1.5rem;
    font-size: 1rem;
  }
  
  .amount-input-section {
    padding: 1.25rem;
  }
}

@media (max-width: 480px) {
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
  
  .modal-header h2 {
    font-size: 1.1rem;
  }
  
  .operation-select {
    padding: 1.25rem 0.75rem;
    gap: 0.75rem;
  }
  
  .amount-input-section {
    padding: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}
</style>

