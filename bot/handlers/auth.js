import { login, logout, fetchUser } from '../api/auth.js';
import { getUserToken } from '../api/client.js';
import { showMainMenu } from '../keyboards/menu.js';

// Хранилище состояний пользователей (в продакшене лучше использовать БД)
const userStates = new Map();

export function getUserState(userId) {
  return userStates.get(userId) || { step: null, data: {} };
}

export function setUserState(userId, state) {
  userStates.set(userId, state);
}

export function clearUserState(userId) {
  userStates.delete(userId);
}

export async function handleStart(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (token) {
    // Пользователь уже авторизован
    const userResult = await fetchUser(userId);
    if (userResult.success) {
      await ctx.reply(
        `Добро пожаловать, ${userResult.user.name || userResult.user.email}!\n\n` +
        'Вы уже авторизованы. Используйте меню для работы с товарами.',
        showMainMenu()
      );
      return;
    }
  }
  
  // Пользователь не авторизован
  setUserState(userId, { step: 'waiting_email', data: {} });
  await ctx.reply(
    '👋 Добро пожаловать в IES CRM!\n\n' +
    'Для начала работы необходимо авторизоваться.\n\n' +
    'Введите ваш email:'
  );
}

export async function handleMessage(ctx) {
  const userId = ctx.from.id;
  const state = getUserState(userId);
  const text = ctx.message.text;
  
  if (state.step === 'waiting_email') {
    setUserState(userId, { step: 'waiting_password', data: { email: text } });
    await ctx.reply('Введите ваш пароль:');
  } else if (state.step === 'waiting_password') {
    const email = state.data.email;
    await ctx.reply('⏳ Выполняется авторизация...');
    
    const result = await login(userId, email, text);
    
    if (result.success) {
      clearUserState(userId);
      await ctx.reply(
        `✅ Авторизация успешна!\n\n` +
        `Добро пожаловать, ${result.user.name || result.user.email}!`,
        showMainMenu()
      );
    } else {
      await ctx.reply(
        `❌ Ошибка авторизации: ${result.error}\n\n` +
        'Попробуйте еще раз. Введите email:'
      );
      setUserState(userId, { step: 'waiting_email', data: {} });
    }
  }
}

export async function handleLogout(ctx) {
  const userId = ctx.from.id;
  await logout(userId);
  clearUserState(userId);
  await ctx.reply(
    '👋 Вы вышли из системы.\n\n' +
    'Для повторной авторизации используйте команду /start'
  );
}

