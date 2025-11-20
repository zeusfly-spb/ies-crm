import { fetchGoods, createGood, updateGood, updateGoodCount, deleteGood } from '../api/goods.js';
import { getUserToken } from '../api/client.js';
import { showMainMenu, showGoodsMenu, showGoodActionsMenu } from '../keyboards/menu.js';
import { getUserState, setUserState, clearUserState } from './auth.js';

export async function handleGoodsList(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  await ctx.reply('⏳ Загрузка товаров...');
  const result = await fetchGoods(userId);
  
  if (!result.success) {
    await ctx.reply(`❌ Ошибка: ${result.error}`);
    return;
  }
  
  if (result.goods.length === 0) {
    await ctx.reply('📦 Товары не найдены.', showGoodsMenu());
    return;
  }
  
  // Формируем список товаров
  let message = '📦 Список товаров:\n\n';
  result.goods.forEach((good, index) => {
    message += `${index + 1}. ${good.name}\n`;
    message += `   ID: ${good.id}\n`;
    message += `   Количество: ${good.count}\n`;
    if (good.comment) {
      message += `   Комментарий: ${good.comment}\n`;
    }
    message += '\n';
  });
  
  await ctx.reply(message, showGoodsMenu());
}

export async function handleGoodsMenu(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  await ctx.reply('📦 Управление товарами:', showGoodsMenu());
}

export async function handleCreateGood(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  setUserState(userId, { step: 'creating_name', data: {} });
  await ctx.reply('📝 Создание нового товара\n\nВведите название товара:');
}

export async function handleUpdateGood(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  setUserState(userId, { step: 'updating_id', data: {} });
  await ctx.reply('✏️ Редактирование товара\n\nВведите ID товара для редактирования:');
}

export async function handleDeleteGood(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  setUserState(userId, { step: 'deleting_id', data: {} });
  await ctx.reply('🗑️ Удаление товара\n\nВведите ID товара для удаления:');
}

export async function handleGoodActions(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  await ctx.reply('⚙️ Действия с товарами:', showGoodActionsMenu());
}

export async function handleIncome(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  setUserState(userId, { step: 'income_id', data: {} });
  await ctx.reply('➕ Приход товара\n\nВведите ID товара:');
}

export async function handleExpense(ctx) {
  const userId = ctx.from.id;
  const token = getUserToken(userId);
  
  if (!token) {
    await ctx.reply('❌ Вы не авторизованы. Используйте /start для авторизации.');
    return;
  }
  
  setUserState(userId, { step: 'expense_id', data: {} });
  await ctx.reply('➖ Расход товара\n\nВведите ID товара:');
}

// Обработка состояний создания/редактирования товаров
export async function handleGoodState(ctx) {
  const userId = ctx.from.id;
  const state = getUserState(userId);
  const text = ctx.message.text;
  
  if (state.step === 'creating_name') {
    setUserState(userId, { step: 'creating_comment', data: { name: text } });
    await ctx.reply('Введите комментарий (или отправьте "-" для пропуска):');
  } else if (state.step === 'creating_comment') {
    setUserState(userId, { step: 'creating_count', data: { ...state.data, comment: text === '-' ? '' : text } });
    await ctx.reply('Введите количество:');
  } else if (state.step === 'creating_count') {
    const count = parseInt(text);
    if (isNaN(count) || count < 0) {
      await ctx.reply('❌ Некорректное количество. Введите число >= 0:');
      return;
    }
    
    await ctx.reply('⏳ Создание товара...');
    const result = await createGood(userId, {
      name: state.data.name,
      comment: state.data.comment || '',
      count: count,
    });
    
    clearUserState(userId);
    
    if (result.success) {
      await ctx.reply(`✅ Товар "${result.good.name}" успешно создан!`, showMainMenu());
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`, showMainMenu());
    }
  } else if (state.step === 'updating_id') {
    const id = parseInt(text);
    if (isNaN(id)) {
      await ctx.reply('❌ Некорректный ID. Введите число:');
      return;
    }
    setUserState(userId, { step: 'updating_name', data: { id } });
    await ctx.reply('Введите новое название (или отправьте "-" для пропуска):');
  } else if (state.step === 'updating_name') {
    setUserState(userId, { step: 'updating_comment', data: { ...state.data, name: text === '-' ? null : text } });
    await ctx.reply('Введите новый комментарий (или отправьте "-" для пропуска):');
  } else if (state.step === 'updating_comment') {
    setUserState(userId, { step: 'updating_count', data: { ...state.data, comment: text === '-' ? null : text } });
    await ctx.reply('Введите новое количество (или отправьте "-" для пропуска):');
  } else if (state.step === 'updating_count') {
    const updateData = {};
    if (state.data.name !== null) updateData.name = state.data.name;
    if (state.data.comment !== null) updateData.comment = state.data.comment;
    if (text !== '-') {
      const count = parseInt(text);
      if (isNaN(count) || count < 0) {
        await ctx.reply('❌ Некорректное количество. Введите число >= 0 или "-":');
        return;
      }
      updateData.count = count;
    }
    
    await ctx.reply('⏳ Обновление товара...');
    const result = await updateGood(userId, state.data.id, updateData);
    
    clearUserState(userId);
    
    if (result.success) {
      await ctx.reply(`✅ Товар успешно обновлен!`, showMainMenu());
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`, showMainMenu());
    }
  } else if (state.step === 'deleting_id') {
    const id = parseInt(text);
    if (isNaN(id)) {
      await ctx.reply('❌ Некорректный ID. Введите число:');
      return;
    }
    
    await ctx.reply('⏳ Удаление товара...');
    const result = await deleteGood(userId, id);
    
    clearUserState(userId);
    
    if (result.success) {
      await ctx.reply(`✅ Товар с ID ${id} успешно удален!`, showMainMenu());
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`, showMainMenu());
    }
  } else if (state.step === 'income_id') {
    const id = parseInt(text);
    if (isNaN(id)) {
      await ctx.reply('❌ Некорректный ID. Введите число:');
      return;
    }
    setUserState(userId, { step: 'income_amount', data: { id } });
    await ctx.reply('Введите количество для прихода:');
  } else if (state.step === 'income_amount') {
    const amount = parseInt(text);
    if (isNaN(amount) || amount <= 0) {
      await ctx.reply('❌ Некорректное количество. Введите число > 0:');
      return;
    }
    
    await ctx.reply('⏳ Обновление товара...');
    const result = await updateGoodCount(userId, state.data.id, 'income', amount);
    
    clearUserState(userId);
    
    if (result.success) {
      await ctx.reply(`✅ Приход товара выполнен! Текущее количество: ${result.good.count}`, showMainMenu());
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`, showMainMenu());
    }
  } else if (state.step === 'expense_id') {
    const id = parseInt(text);
    if (isNaN(id)) {
      await ctx.reply('❌ Некорректный ID. Введите число:');
      return;
    }
    setUserState(userId, { step: 'expense_amount', data: { id } });
    await ctx.reply('Введите количество для расхода:');
  } else if (state.step === 'expense_amount') {
    const amount = parseInt(text);
    if (isNaN(amount) || amount <= 0) {
      await ctx.reply('❌ Некорректное количество. Введите число > 0:');
      return;
    }
    
    await ctx.reply('⏳ Обновление товара...');
    const result = await updateGoodCount(userId, state.data.id, 'expense', amount);
    
    clearUserState(userId);
    
    if (result.success) {
      await ctx.reply(`✅ Расход товара выполнен! Текущее количество: ${result.good.count}`, showMainMenu());
    } else {
      await ctx.reply(`❌ Ошибка: ${result.error}`, showMainMenu());
    }
  }
}

