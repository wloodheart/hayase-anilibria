# Hayase AniLibria Extension

Расширение для Hayase, предоставляющее поиск аниме через API AniLibria с торрентами.

## Возможности

- Поиск аниме по названию через AniLibria API
- Получение торрентов с информацией о сидах, личах и размерах
- Поддержка одиночных серий, пакетов и фильмов
- Magnet-ссылки для быстрой загрузки

## Установка

### Локальная разработка

1. Установите зависимости:
   ```bash
   npm install
   ```

2. Скомпилируйте TypeScript:
   ```bash
   npm run build
   ```

3. В Hayase добавьте локальный файл манифеста:
   - Откройте **Settings → Extensions → Repositories**
   - Добавьте путь к файлу `index.json` с префиксом `file:`
   - Например: `file:/home/user/hayase-anilibria/index.json`

### Из GitHub (после публикации)

1. Разместите репозиторий на GitHub
2. В Hayase добавьте URL:
   ```
   https://raw.githubusercontent.com/USER/hayase-anilibria/main/index.json
   ```
   или используйте короткую форму:
   ```
   gh:USER/hayase-anilibria
   ```

## Структура проекта

```
hayase-anilibria/
├── src/
│   └── index.ts          # Исходный код расширения
├── dist/
│   └── index.js          # Скомпилированный JavaScript
├── index.json            # Манифест расширения
├── package.json          # Зависимости и скрипты
├── tsconfig.json         # Конфигурация TypeScript
└── README.md             # Этот файл
```

## Разработка

### Сборка

```bash
# Однократная компиляция
npm run build

# Режим наблюдения (автоматическая пересборка)
npm run watch
```

### Тестирование

Метод `test()` автоматически проверяет доступность API AniLibria при подключении расширения.

## API

Расширение использует **AniLiberty API v1**:
- Базовый URL: `https://anilibria.top/api/v1`
- Документация: https://anilibria.top/api/docs/v1

## Лицензия

MIT
