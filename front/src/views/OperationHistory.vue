<template>
  <div class="history-page">
    <div class="header">
      <h1>История операций</h1>
      <div class="header-actions">
        <button @click="goHome" class="back-btn">На главную</button>
        <button @click="goGoodsManagement" class="management-btn">Управление товарами</button>
        <button @click="handleLogout" class="logout-btn">Выйти</button>
      </div>
    </div>

    <div v-if="operationsStore.loading" class="loading">Загрузка истории...</div>
    <div v-else-if="operationsStore.error" class="error">{{ operationsStore.error }}</div>
    <div v-else-if="operationsStore.operations.length === 0" class="empty">
      История операций пока пуста.
    </div>
    <div v-else class="table-wrapper">
      <table class="history-table">
        <thead>
          <tr>
            <th>Дата</th>
            <th>Операция</th>
            <th>Товар</th>
            <th>Количество</th>
            <th>Изменение</th>
            <th>Пользователь</th>
            <th>Описание</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="operation in operationsStore.operations" :key="operation.id">
            <td>{{ formatDate(operation.created_at) }}</td>
            <td>
              <span :class="['badge', badgeClass(operation.operation_type)]">
                {{ operationTypeLabel(operation.operation_type) }}
              </span>
            </td>
            <td>{{ operation.good?.name || 'Удаленный товар' }}</td>
            <td>{{ operation.amount ?? '-' }}</td>
            <td>
              {{ formatCountChange(operation.before_count, operation.after_count) }}
            </td>
            <td>{{ operation.user?.email || '-' }}</td>
            <td>{{ operation.description || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useOperationsStore } from '../stores/operations';

const router = useRouter();
const authStore = useAuthStore();
const operationsStore = useOperationsStore();

onMounted(async () => {
  if (authStore.token && !authStore.user) {
    await authStore.fetchUser();
  }

  await operationsStore.fetchOperations();
});

function goHome() {
  router.push('/');
}

function goGoodsManagement() {
  router.push('/goods');
}

async function handleLogout() {
  await authStore.logout();
}

function operationTypeLabel(type) {
  const map = {
    create: 'Создание',
    update: 'Изменение',
    delete: 'Удаление',
    income: 'Приход',
    expense: 'Расход'
  };

  return map[type] || type;
}

function badgeClass(type) {
  const map = {
    create: 'badge-create',
    update: 'badge-update',
    delete: 'badge-delete',
    income: 'badge-income',
    expense: 'badge-expense'
  };

  return map[type] || 'badge-default';
}

function formatDate(value) {
  if (!value) return '-';

  return new Date(value).toLocaleString('ru-RU');
}

function formatCountChange(beforeCount, afterCount) {
  if (beforeCount === null && afterCount === null) return '-';
  if (beforeCount === null) return `- -> ${afterCount}`;
  if (afterCount === null) return `${beforeCount} -> -`;
  return `${beforeCount} -> ${afterCount}`;
}
</script>

<style scoped>
.history-page {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
  color: #42b883;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.back-btn,
.management-btn,
.logout-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
}

.back-btn {
  background: #3498db;
}

.management-btn {
  background: #42b883;
}

.logout-btn {
  background: #e74c3c;
}

.loading,
.error,
.empty {
  text-align: center;
  padding: 2rem;
}

.error {
  color: #e74c3c;
}

.table-wrapper {
  overflow-x: auto;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.history-table {
  width: 100%;
  border-collapse: collapse;
}

.history-table th,
.history-table td {
  padding: 0.75rem;
  border-bottom: 1px solid #eaeaea;
  text-align: left;
  vertical-align: top;
}

.history-table thead {
  background: #f8f9fa;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-create,
.badge-income {
  background: #e8f7ef;
  color: #1f8b4c;
}

.badge-update {
  background: #eef6ff;
  color: #2a6cc0;
}

.badge-delete,
.badge-expense {
  background: #fdecec;
  color: #c0392b;
}

.badge-default {
  background: #f1f1f1;
  color: #666;
}
</style>
