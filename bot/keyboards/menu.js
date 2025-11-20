import { Markup } from 'telegraf';

export function showMainMenu() {
  return Markup.keyboard([
    ['📦 Список товаров', '⚙️ Управление товарами'],
    ['➕ Приход', '➖ Расход'],
    ['🚪 Выйти']
  ]).resize();
}

export function showGoodsMenu() {
  return Markup.keyboard([
    ['➕ Добавить товар', '✏️ Редактировать товар'],
    ['🗑️ Удалить товар', '📋 Список товаров'],
    ['🔙 Главное меню']
  ]).resize();
}

export function showGoodActionsMenu() {
  return Markup.keyboard([
    ['➕ Приход товара', '➖ Расход товара'],
    ['🔙 Главное меню']
  ]).resize();
}

export function showCancelButton() {
  return Markup.keyboard([['❌ Отмена']]).resize();
}

