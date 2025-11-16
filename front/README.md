# IES CRM - Frontend

Фронтенд приложение на Vue 3 для системы управления товарами.

## Технологии

- **Vue 3** - прогрессивный JavaScript фреймворк
- **Vite** - быстрый сборщик и dev-сервер
- **Vue Router** - маршрутизация
- **Pinia** - управление состоянием
- **Axios** - HTTP клиент для работы с API

## Установка

```bash
npm install
```

## Разработка

Запуск dev-сервера:

```bash
npm run dev
```

Приложение будет доступно по адресу `http://localhost:5173`

## Сборка

Сборка для production:

```bash
npm run build
```

## Структура проекта

```
src/
  ├── api/          # Настройка axios и API запросы
  ├── components/   # Vue компоненты
  ├── router/       # Конфигурация Vue Router
  ├── stores/       # Pinia stores
  ├── views/        # Страницы приложения
  ├── App.vue       # Главный компонент
  └── main.js       # Точка входа
```

## Настройка API

Создайте файл `.env` в корне проекта и укажите URL бэкенда:

```
VITE_API_URL=http://localhost/api
```
