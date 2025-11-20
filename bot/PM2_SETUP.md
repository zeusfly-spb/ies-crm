# Настройка PM2 для запуска бота на сервере

## Установка PM2

Установите PM2 глобально через npm:

```bash
npm install -g pm2
```

## Быстрый старт

1. Перейдите в папку бота:
```bash
cd bot
```

2. Запустите бота через PM2:
```bash
npm run pm2:start
```

3. Сохраните конфигурацию (чтобы бот запускался после перезагрузки сервера):
```bash
npm run pm2:save
npm run pm2:startup
```

После выполнения `pm2:startup` PM2 покажет команду, которую нужно выполнить с правами sudo. Скопируйте и выполните её.

## Управление ботом

### Проверить статус:
```bash
npm run pm2:status
# или
pm2 status
```

### Просмотреть логи:
```bash
npm run pm2:logs
# или
pm2 logs ies-crm-bot
```

### Просмотреть логи в реальном времени:
```bash
pm2 logs ies-crm-bot --lines 50
```

### Перезапустить бота:
```bash
npm run pm2:restart
# или
pm2 restart ies-crm-bot
```

### Остановить бота:
```bash
npm run pm2:stop
# или
pm2 stop ies-crm-bot
```

### Удалить бота из PM2:
```bash
npm run pm2:delete
# или
pm2 delete ies-crm-bot
```

### Просмотреть мониторинг:
```bash
pm2 monit
```

## Автозапуск при перезагрузке сервера

После выполнения `pm2 startup` и команды с sudo, бот будет автоматически запускаться при перезагрузке сервера.

Если нужно обновить автозапуск:
```bash
pm2 unstartup
pm2 startup
# Выполните показанную команду с sudo
pm2 save
```

## Логи

Логи бота сохраняются в папке `logs/`:
- `logs/pm2-out.log` - стандартный вывод
- `logs/pm2-error.log` - ошибки

## Полезные команды PM2

```bash
# Просмотреть все процессы
pm2 list

# Перезапустить все процессы
pm2 restart all

# Остановить все процессы
pm2 stop all

# Очистить все логи
pm2 flush

# Просмотреть информацию о процессе
pm2 describe ies-crm-bot

# Просмотреть использование ресурсов
pm2 monit
```

