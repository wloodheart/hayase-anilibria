# Hayase AniLibria Extension — Контекст проекта

## Обзор проекта

Этот каталог содержит документацию и ресурсы для разработки **Hayase extension** для интеграции с **AniLibria** — российским аниме-стриминговым сервисом.

**Цель:** Создание расширения для приложения Hayase, которое позволит искать и находить аниме-тайтлы через API AniLibria.

---

## Структура каталога

```
hayase-anilibria/
├── .qwen/                          # Конфигурация Qwen Code
├── QWEN.md                         # Этот файл — контекст проекта
├── HAYASE_EXTENSION_DOCS.md        # Документация по созданию расширений Hayase
└── ANILIBRIA_API_DOCS.md           # Документация AniLibria API
```

---

## Ключевые документы

### 1. HAYASE_EXTENSION_DOCS.md

Полная документация по разработке расширений для Hayase:

- **Архитектура расширений:** типы (torrent, nzb, url), sandboxing, безопасность
- **TypeScript интерфейсы:** `TorrentSource`, `SearchFunction`, `TorrentResult`, `TorrentQuery`
- **Формат манифеста:** структура `index.json` с полями `id`, `name`, `version`, `type`, `accuracy` и др.
- **Примеры реализации:** базовый шаблон, Nyaa.si, Pirate Bay
- **Установка и тестирование:** локальная разработка, публикация на GitHub, установка в Hayase

**Основные эндпоинты для расширения:**
```javascript
export default class Source {
  single(options)  // Поиск одиночной серии
  batch(options)   // Поиск пакета серий
  movie(options)   // Поиск фильма
  test()           // Тест доступности
}
```

---

### 2. ANILIBRIA_API_DOCS.md

Документация API AniLibria для интеграции:

- **Версии API:**
  - ✅ **AniLiberty v1** (актуальное): `https://anilibria.top/api/v1`
  - ⚠️ **v3** (deprecated, отключено 07.08.2025)
  - ⚠️ **v2** (deprecated, отключается 01.07.2025)

- **Ключевые эндпоинты для поиска:**
  | Эндпоинт | Метод | Описание |
  |----------|-------|----------|
  | `/api/title` | GET | Поиск тайтлов по названию |
  | `/api/schedule` | GET | Расписание релизов |
  | `/api/updates` | GET | Последние обновления |

- **Структура ответа:**
  ```typescript
  {
    id: number;
    titles: { ru: string; en: string; ja: string };
    type: string;           // tv, movie, ona, ova
    year: number;
    status: string;         // ongoing, completed
    genres: string[];
    episodes?: number;
    torrents?: Torrent[];
    player?: Player;
  }
  ```

---

## Рекомендуемый подход к разработке

### 1. Выбор API

Используйте **AniLiberty API v1** (`https://anilibria.top/api/v1`) — это актуальная версия с долгосрочной поддержкой.

### 2. Структура расширения

```
hayase-anilibria-extension/
├── src/
│   ├── index.ts          # Исходный код расширения
│   └── types.ts          # TypeScript типы для Hayase
├── dist/
│   └── index.js          # Скомпилированный JavaScript
├── index.json            # Манифест расширения
├── package.json          # Зависимости и скрипты сборки
├── tsconfig.json         # Конфигурация TypeScript
└── README.md             # Документация расширения
```

### 3. Пример минимального расширения (TypeScript)

```typescript
import type { TorrentSource, TorrentResult, TorrentQuery, SearchFunction } from './types'

export default class AniLibria implements TorrentSource {
  private base = 'https://anilibria.top/api/v1'

  search: SearchFunction = async ({ titles }) => {
    if (!titles.length) return []
    
    const response = await fetch(
      `${this.base}/title?search=${encodeURIComponent(titles[0])}&limit=10`
    )
    const data = await response.json()
    
    if (!data.data) return []
    
    return data.data.map(this.mapTitleToResult)
  }

  private mapTitleToResult = (title: any): TorrentResult => ({
    title: title.titles?.ru || title.titles?.en || '',
    link: `https://anilibria.top/title/${title.code || title.id}`,
    hash: '',
    seeders: 0,
    leechers: 0,
    downloads: 0,
    size: 0,
    date: new Date(),
    verified: false,
    type: 'alt',
    accuracy: 'medium'
  })

  test = async (): Promise<boolean> => {
    try {
      const res = await fetch(`${this.base}/title?limit=1`)
      return res.ok
    } catch {
      return false
    }
  }

  batch = this.search
  movie = this.search
}
```

### 4. Манифест (index.json)

```json
[
  {
    "name": "AniLibria",
    "id": "hayase.extension.anilibria",
    "version": "1.0.0",
    "type": "torrent",
    "accuracy": "high",
    "ratio": 0,
    "media": "both",
    "languages": ["RU"],
    "icon": "https://anilibria.top/icon.png",
    "update": "gh:user/hayase-anilibria-extension",
    "code": "gh:user/hayase-anilibria-extension/dist/index.js",
    "description": "Поиск аниме через AniLibria API"
  }
]
```

---

## Полезные ссылки

- **Hayase Wiki:** https://wiki.hayase.watch/extensions/overview
- **AniLibria API (Swagger):** https://anilibria.top/api/docs/v1
- **Telegram разработчиков AniLibria:** https://t.me/AniLibria_Devs
- **GitHub расширения (примеры):**
  - https://github.com/LetMeGetAByte/Hayase-Extensions
  - https://github.com/ReWelp/HayasexShiru-Extensions

---

## Конвенции разработки

- **Язык:** TypeScript (с компиляцией в JavaScript ES6 модули)
- **Стиль кода:** Следовать примерам из официальных расширений
- **Именование:** camelCase для функций/переменных, PascalCase для классов
- **Обработка ошибок:** Возвращать пустой массив `[]` при ошибках, не выбрасывать исключения
- **Тестирование:** Реализовать метод `test()` для проверки доступности API
- **Сборка:** Компиляция TypeScript в JavaScript для публикации

---

*Последнее обновление: 30 марта 2026*
