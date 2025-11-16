<template>
  <div class="login-container">
    <div class="login-card">
      <h1 class="login-title">IES CRM</h1>
      <p class="login-subtitle">Вход в систему</p>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div v-if="authStore.error" class="error-message">
          {{ authStore.error }}
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="admin@test.com"
            class="form-input"
            :disabled="authStore.loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            placeholder="password"
            class="form-input"
            :disabled="authStore.loading"
          />
        </div>
        
        <button
          type="submit"
          class="login-button"
          :disabled="authStore.loading"
        >
          <span v-if="authStore.loading">Вход...</span>
          <span v-else>Войти</span>
        </button>
      </form>
      
      <div class="login-hint">
        <p>Тестовые учетные данные:</p>
        <p><strong>Email:</strong> admin@test.com</p>
        <p><strong>Пароль:</strong> password</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')

async function handleLogin() {
  try {
    await authStore.login(email.value, password.value)
    router.push('/')
  } catch (error) {
    // Ошибка уже обработана в store
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #fff;
  padding: 2rem;
  position: relative;
}

.login-card {
  background: #fff;
  border: 2px solid #e8f5e9;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(66, 184, 131, 0.2);
  padding: 2.5rem;
  width: 100%;
  max-width: 400px;
  transition: all 0.3s ease;
  transform: translateY(-15%);
  position: relative;
}

.login-card:hover {
  border-color: #42b883;
  box-shadow: 0 8px 30px rgba(66, 184, 131, 0.25);
}

.login-title {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}

.login-subtitle {
  color: #7f8c8d;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1rem;
}

.login-form {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 3px rgba(66, 184, 131, 0.1);
}

.form-input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.error-message {
  background-color: #fee;
  color: #e74c3c;
  padding: 0.75rem;
  border-radius: 6px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  border: 1px solid #e74c3c;
}

.login-button {
  width: 100%;
  padding: 0.75rem;
  background: #42b883;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
}

.login-button:hover:not(:disabled) {
  background: #35a372;
  transform: translateY(-1px);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  background: #95a5a6;
  cursor: not-allowed;
}

.login-hint {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 1rem;
  font-size: 0.85rem;
  color: #7f8c8d;
  border: 1px solid #e0e0e0;
}

.login-hint p {
  margin: 0.25rem 0;
}

.login-hint p:first-child {
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #2c3e50;
}

.login-hint strong {
  color: #2c3e50;
}
</style>

