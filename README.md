## Установка

1. Клонируй репо
2. Создай файл `backend/.env` и заполни токены:
   ```
   YOUTRACK_URL=https://yourcompany.youtrack.cloud
   YOUTRACK_TOKEN=perm:ваш-токен
   FIGMA_TOKEN=ваш-figma-токен
   ```
3. Установи зависимости:
   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```

## Запуск

```bash
# Терминал 1 — бэкенд
cd backend && npm run dev

# Терминал 2 — фронтенд
cd frontend && npm run dev
```

Открой http://localhost:5173
