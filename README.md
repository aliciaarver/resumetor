## Установка

1. Клонируй репо.
2. Поставь зависимости одной командой:
   ```bash
   npm run install:all
   ```
   (можно и руками: `npm install` в корне, потом `npm install` в `backend` и `frontend`).
3. По желанию — `backend/.env` для дефолтных токенов (всё то же самое можно ввести в LoginScreen после старта):
   ```
   YOUTRACK_URL=https://yourcompany.youtrack.cloud
   YOUTRACK_TOKEN=perm:ваш-токен
   FIGMA_TOKEN=ваш-figma-токен
   ```

## Запуск

```bash
npm run dev
```

Поднимает бэк (`localhost:3001`) и фронт (`localhost:5173`) параллельно, вывод обоих в одном терминале с цветными префиксами `[backend]` / `[frontend]`. Ctrl+C гасит оба сразу.

Открой http://localhost:5173

### Запуск по отдельности (если зачем-то нужно)

```bash
npm run dev:backend
npm run dev:frontend
```
