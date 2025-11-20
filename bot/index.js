import { Telegraf } from 'telegraf';
import { config } from './config.js';
import { handleStart, handleMessage, handleLogout, getUserState } from './handlers/auth.js';
import {
  handleGoodsList,
  handleGoodsMenu,
  handleCreateGood,
  handleUpdateGood,
  handleDeleteGood,
  handleIncome,
  handleExpense,
  handleGoodState,
} from './handlers/goods.js';
import { showMainMenu } from './keyboards/menu.js';

const bot = new Telegraf(config.telegram.token);

// Обработка команды /start
bot.command('start', handleStart);

// Обработка команды /logout
bot.command('logout', handleLogout);

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const userId = ctx.from.id;
  const state = getUserState(userId);
  const text = ctx.message.text;
  
  // Проверяем, находится ли пользователь в процессе создания/редактирования
  if (state.step && (
      state.step.startsWith('creating_') || 
      state.step.startsWith('updating_') ||
      state.step.startsWith('deleting_') ||
      state.step.startsWith('income_') ||
      state.step.startsWith('expense_') ||
      state.step === 'waiting_email' ||
      state.step === 'waiting_password'
    )) {
    // Обрабатываем состояние
    if (state.step === 'waiting_email' || state.step === 'waiting_password') {
      await handleMessage(ctx);
    } else {
      await handleGoodState(ctx);
    }
    return;
  }
  
  // Обработка кнопок меню
  switch (text) {
    case '📦 Список товаров':
      await handleGoodsList(ctx);
      break;
    case '⚙️ Управление товарами':
      await handleGoodsMenu(ctx);
      break;
    case '➕ Приход':
      await handleIncome(ctx);
      break;
    case '➖ Расход':
      await handleExpense(ctx);
      break;
    case '🚪 Выйти':
      await handleLogout(ctx);
      break;
    case '➕ Добавить товар':
      await handleCreateGood(ctx);
      break;
    case '✏️ Редактировать товар':
      await handleUpdateGood(ctx);
      break;
    case '🗑️ Удалить товар':
      await handleDeleteGood(ctx);
      break;
    case '📋 Список товаров':
      await handleGoodsList(ctx);
      break;
    case '🔙 Главное меню':
      await ctx.reply('Главное меню:', showMainMenu());
      break;
    case '➕ Приход товара':
      await handleIncome(ctx);
      break;
    case '➖ Расход товара':
      await handleExpense(ctx);
      break;
    default:
      await ctx.reply('Неизвестная команда. Используйте меню.');
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error(`Ошибка для пользователя ${ctx.from.id}:`, err);
  ctx.reply('Произошла ошибка. Попробуйте позже.');
});

// Запуск бота
console.log('🤖 Бот запущен...');
bot.launch();

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

