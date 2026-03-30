# Документация по созданию расширений Hayase

## Оглавление

1. [Обзор](#обзор)
2. [Структура расширения](#структура-расширения)
3. [Типы и интерфейсы TypeScript](#типы-и-интерфейсы-typescript)
4. [Формат манифеста (index.json)](#формат-манифеста-indexjson)
5. [Примеры реализации](#примеры-реализации)
6. [Установка и тестирование](#установка-и-тестирование)

---

## Обзор

**Расширения Hayase** — это плагины, которые позволяют приложению искать контент из внешних источников (торрент-трекеры, NZB-индексы, прямые ссылки).

### Архитектура

- Hayase Core **не содержит** встроенных источников контента
- Расширения подключаются к внешним API/сайтам
- Выполняют поиск по запросу пользователя
- Возвращают стандартизированные результаты в Hayase для агрегации

### Типы расширений

- **Torrent extensions** — поиск торрентов
- **NZB extensions** — поиск NZB-файлов
- **URL extensions** — прямые ссылки на скачивание

### Безопасность (Sandboxing)

Расширения работают в изолированной среде:

**Имеют доступ:**
- Сетевой доступ (HTTP/HTTPS запросы к источнику)
- Видят поисковые запросы пользователя

**Не имеют доступа:**
- Файлы пользователя
- Системные файлы
- История браузера
- Пароли
- Данные других расширений

---

## Структура расширения

Расширение состоит из двух основных файлов:

```
my-extension/
├── index.json    # Манифест расширения
└── index.js      # Код расширения
```

### Файл кода (index.js)

- **Тип модуля:** ES6 (`export default`)
- **Язык:** JavaScript (может быть написан на TypeScript с последующей компиляцией)
- **Экспорт:** Класс или экземпляр класса, реализующий интерфейс источника

---

## Типы и интерфейсы TypeScript

### Базовые типы

```typescript
// Уровень точности источника
export type Accuracy = 'high' | 'medium' | 'low'

// Коды стран (ISO) - сокращённый список
type CountryCodes = 'AD' | 'AE' | 'AF' | 'AG' | 'AI' | 'AL' | 'AM' | 'AO' | 
                    'AQ' | 'AR' | 'AS' | 'AT' | 'AU' | 'AW' | 'AX' | 'AZ' | ... | 'HT'
```

### Интерфейс конфигурации расширения

```typescript
export interface ExtensionConfig {
  name: string                    // Название расширения
  version: string                 // Версия (semver)
  description: string             // Описание
  id: string                      // Уникальный ID (например, "hayase.extension.nyaa")
  type: 'torrent' | 'nzb' | 'url' // Тип расширения
  accuracy: Accuracy              // Уровень точности
  ratio?: 'perma' | number        // Коэффициент качества
  icon: string                    // URL иконки
  media: 'sub' | 'dub' | 'both'   // Тип перевода
  languages: CountryCodes[]       // Языки (для sub/dub)
  update?: string                 // URL файла обновлений
  code: string                    // URL файла кода
  options?: {                     // Опции расширения (необязательно)
    [key: string]: {
      type: 'string' | 'number' | 'boolean'
      description: string
      default: any
    }
  }
}
```

### Результат поиска торрента

```typescript
export interface TorrentResult {
  title: string       // Название торрента
  link: string        // Ссылка на .torrent или magnet-ссылка
  id?: number         // ID (опционально)
  seeders: number     // Количество сидов
  leechers: number    // Количество личей
  downloads: number   // Количество скачиваний
  accuracy: Accuracy  // Уровень точности
  hash: string        // Info hash торрента
  size: number        // Размер в байтах
  date: Date          // Дата загрузки
  type?: 'batch' | 'best' | 'alt'  // Тип результата
}
```

### Параметры запроса поиска

```typescript
export interface TorrentQuery {
  anilistId: number           // AniList ID аниме
  anidbAid?: number           // AniDB anime ID
  anidbEid?: number           // AniDB episode ID
  titles: string[]            // Массив названий и альтернативных названий
  episode?: number            // Номер эпизода
  episodeCount?: number       // Общее количество эпизодов
  resolution: '2160' | '1080' | '720' | '540' | '480' | ''  // Разрешение
  exclusions: string[]        // Ключевые слова для исключения
  type?: 'sub' | 'dub'        // Тип перевода
}
```

### Функция поиска

```typescript
export type SearchFunction = (
  query: TorrentQuery,
  options?: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean'
      description: string
      default: any
    }
  }
) => Promise<TorrentResult[]>
```

### Классы источников

#### TorrentSource

```typescript
export class TorrentSource {
  test: () => Promise<boolean>   // Тест доступности источника
  single: SearchFunction         // Поиск одиночной серии
  batch: SearchFunction          // Поиск пакета серий
  movie: SearchFunction          // Поиск фильма
}
```

#### NZBorURLSource

```typescript
export class NZBorURLSource {
  test: () => Promise<boolean>   // Тест доступности
  search: (
    hash: string,                // BTIH hash
    options?: {
      [key: string]: {
        type: 'string' | 'number' | 'boolean'
        description: string
        default: any
      }
    }
  ) => Promise<string>           // Возвращает URL на NZB или DDL
}
```

---

## Формат манифеста (index.json)

Манифест представляет собой JSON-массив объектов расширений:

```json
[
  {
    "name": "Nyaa",
    "id": "hayase.extension.nyaa",
    "version": "1.0.0",
    "type": "torrent",
    "accuracy": "medium",
    "ratio": 0,
    "media": "sub",
    "languages": ["all"],
    "nsfw": false,
    "icon": "https://example.com/icon.png",
    "update": "https://raw.githubusercontent.com/user/repo/main/index.json",
    "code": "https://raw.githubusercontent.com/user/repo/main/nyaa.js",
    "description": "Поиск торрентов на Nyaa.si"
  }
]
```

### Поля манифеста

| Поле | Тип | Описание |
|------|-----|----------|
| `name` | string | Название расширения |
| `id` | string | Уникальный идентификатор (обратная нотация) |
| `version` | string | Версия в формате semver |
| `type` | string | Тип: `torrent`, `nzb`, `url` |
| `accuracy` | string | Точность: `high`, `medium`, `low` |
| `ratio` | number | Числовой коэффициент качества |
| `media` | string | Тип медиа: `sub`, `dub`, `both` |
| `languages` | array | Массив языков (коды стран или `["all"]`) |
| `nsfw` | boolean | Флаг NSFW-контента |
| `icon` | string | URL иконки расширения |
| `update` | string | URL файла манифеста для обновлений |
| `code` | string | URL файла кода расширения (.js) |
| `description` | string | Описание расширения (опционально) |

### Префиксы URL

Поля `update` и `code` поддерживают префиксы:

- `gh:user/repo` — GitHub (например, `gh:LetMeGetAByte/Hayase-Extensions`)
- `npm:package-name` — NPM
- Прямой URL — любой доступный URL
- `file:` — встроенный код

---

## Примеры реализации

### Базовый шаблон (Source.js)

```javascript
/**
 * @typedef {import('./').TorrentSource} TorrentSource
 */

/**
 * @implements {TorrentSource}
 */
export default class Source {
  /**
   * Поиск одиночной серии
   * @type {import('./').SearchFunction}
   */
  single(options) {
    throw new Error('Source doesn\'t implement single')
  }

  /**
   * Поиск пакета серий
   * @type {import('./').SearchFunction}
   */
  batch(options) {
    throw new Error('Source doesn\'t implement batch')
  }

  /**
   * Поиск фильма
   * @type {import('./').SearchFunction}
   */
  movie(options) {
    throw new Error('Source doesn\'t implement movie')
  }

  /**
   * Тест доступности
   * @type {()=>Promise<boolean>}
   */
  test() {
    throw new Error('Source doesn\'t implement test')
  }
}
```

### Пример: Nyaa.si расширение

```javascript
export default new class Nyaa {
  constructor() {
    this.base = 'https://torrent-search-api-livid.vercel.app/api/nyaa/'
  }

  /**
   * Поиск одиночной серии
   */
  async single({ titles, episode }) {
    if (!titles.length) return []

    const query = this.buildQuery(titles[0], episode)
    const res = await fetch(this.base + query)
    const data = await res.json()

    if (!Array.isArray(data)) return []
    return data.map(this.map)
  }

  batch = this.single
  movie = this.single

  /**
   * Тест доступности API
   */
  async test() {
    try {
      const res = await fetch(this.base + 'one piece')
      return res.ok
    } catch {
      return false
    }
  }

  /**
   * Формирование поискового запроса
   */
  buildQuery(title, episode) {
    return encodeURIComponent(
      title.replace(/[^\w\s-]/g, ' ') + 
      (episode ? ` ${episode}` : '')
    )
  }

  /**
   * Маппинг данных API в формат Hayase
   */
  map(item) {
    const hash = item.Magnet?.match(/btih:([a-fA-F0-9]+)/)?.[1] || ''
    
    return {
      title: item.Name || '',
      link: item.Magnet || '',
      hash,
      seeders: parseInt(item.Seeders || '0'),
      leechers: parseInt(item.Leechers || '0'),
      downloads: parseInt(item.Downloads || '0'),
      size: this.parseSize(item.Size),
      date: new Date(item.DateUploaded),
      verified: false,
      type: 'alt',
      accuracy: 'medium'
    }
  }

  /**
   * Парсинг размера
   */
  parseSize(sizeStr) {
    const match = sizeStr?.match(/([\d.]+)\s*(KiB|MiB|GiB|KB|MB|GB)/)
    if (!match) return 0
    
    const [, value, unit] = match
    const num = parseFloat(value)
    
    const multipliers = {
      'KiB': 1024,
      'MiB': 1024 ** 2,
      'GiB': 1024 ** 3,
      'KB': 1000,
      'MB': 1000 ** 2,
      'GB': 1000 ** 3
    }
    
    return Math.floor(num * (multipliers[unit] || 1))
  }
}()
```

### Пример: Pirate Bay расширение

```javascript
export default new class PirateBay {
  constructor() {
    this.base = 'https://torrent-search-api-livid.vercel.app/api/piratebay/'
  }

  async single({ titles, episode }) {
    if (!titles.length) return []

    const query = this.buildQuery(titles[0], episode)
    const res = await fetch(this.base + query)
    const data = await res.json()

    if (!Array.isArray(data)) return []
    return data.map(this.map)
  }

  batch = this.single
  movie = this.single

  async test() {
    try {
      const res = await fetch(this.base + 'one piece')
      return res.ok
    } catch {
      return false
    }
  }

  buildQuery(title, episode) {
    return encodeURIComponent(
      title.replace(/[^\w\s-]/g, ' ') + 
      (episode ? ` 0${episode}` : '')
    )
  }

  map(item) {
    const hash = item.Magnet?.match(/btih:([a-fA-F0-9]+)/)?.[1] || ''
    
    return {
      title: item.Name || '',
      link: item.Magnet || '',
      hash,
      seeders: parseInt(item.Seeders || '0'),
      leechers: parseInt(item.Leechers || '0'),
      downloads: parseInt(item.Downloads || '0'),
      size: this.parseSize(item.Size),
      date: new Date(item.DateUploaded),
      verified: false,
      type: 'alt',
      accuracy: 'medium'
    }
  }

  parseSize(sizeStr) {
    const match = sizeStr?.match(/([\d.]+)\s*(KiB|MiB|GiB|KB|MB|GB)/)
    if (!match) return 0
    
    const [, value, unit] = match
    const num = parseFloat(value)
    
    const multipliers = {
      'KiB': 1024,
      'MiB': 1024 ** 2,
      'GiB': 1024 ** 3,
      'KB': 1000,
      'MB': 1000 ** 2,
      'GB': 1000 ** 3
    }
    
    return Math.floor(num * (multipliers[unit] || 1))
  }
}()
```

---

## Установка и тестирование

### Локальная разработка

1. Создайте структуру файлов:
   ```
   my-extension/
   ├── index.json
   └── index.js
   ```

2. Заполните `index.json`:
   ```json
   [
     {
       "name": "My Extension",
       "id": "hayase.extension.myext",
       "version": "1.0.0",
       "type": "torrent",
       "accuracy": "medium",
       "ratio": 0,
       "media": "sub",
       "languages": ["all"],
       "icon": "https://via.placeholder.com/64",
       "update": "file:./index.json",
       "code": "file:./index.js"
     }
   ]
   ```

3. Реализуйте `index.js` согласно документации выше

### Публикация

1. Разместите файлы на GitHub или другом хостинге
2. Создайте репозиторий с публичным доступом
3. Используйте URL вида:
   - GitHub: `https://raw.githubusercontent.com/user/repo/main/index.json`
   - С префиксом: `gh:user/repo`

### Установка в Hayase

1. Откройте **Settings → Extensions → Repositories**
2. Добавьте URL вашего `index.json`
3. Расширение появится в списке доступных

### Примеры репозиториев

- **Официальные расширения:**
  - `https://raw.githubusercontent.com/LetMeGetAByte/Hayase-Extensions/main/index.json`
  
- **Сообщество (Nyaa, Sukebei):**
  - `https://raw.githubusercontent.com/ReWelp/HayasexShiru-Extensions/main/hayase/index.json`
  - Короткая форма для Shiru: `gh:ReWelp/HayasexShiru-Extensions/shiru`

---

## Дополнительные ресурсы

- [Extensions Overview](https://wiki.hayase.watch/extensions/overview)
- [FAQ](https://hayase.watch/faq/)
- [GitHub: Hayase-Extensions](https://github.com/LetMeGetAByte/Hayase-Extensions)
- [GitHub: HayasexShiru-Extensions](https://github.com/ReWelp/HayasexShiru-Extensions)

---

*Документация актуальна на момент: 30 марта 2026*
