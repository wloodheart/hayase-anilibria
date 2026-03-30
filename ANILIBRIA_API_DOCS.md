# Документация AniLibria API

## Оглавление

1. [Обзор](#обзор)
2. [Версии API](#версии-api)
3. [Базовые URL](#базовые-url)
4. [Поиск тайтлов](#поиск-тайтлов)
5. [Расписание](#расписание)
6. [Обновления](#обновления)
7. [Структура объекта тайтла](#структура-объекта-тайтла)
8. [Дополнительные эндпоинты](#дополнительные-эндпоинты)
9. [Примеры использования](#примеры-использования)

---

## Обзор

**AniLibria API** — это REST API российского аниме-стримингового сервиса AniLibria. Предоставляет доступ к каталогу аниме, расписанию, торрентам и другой информации.

### Возможности

- Поиск тайтлов по названию, жанрам, году, сезону
- Получение расписания выхода серий
- Информация о торрентах (сиды, личи, magnet-ссылки)
- Данные о команде озвучки
- HLS-плеер с ссылками на серии
- WebSocket для real-time обновлений

---

## Версии API

| Версия | Статус | Базовый URL |
|--------|--------|-------------|
| **v1 (AniLiberty)** | ✅ Актуальная | `https://anilibria.top/api/v1` |
| **v3** | ⚠️ Deprecated (отключено 07.08.2025) | `https://api.anilibria.tv/v3` |
| **v2** | ⚠️ Deprecated (отключается 01.07.2025) | `https://api.anilibria.tv/v2` |
| **v1 (legacy)** | ❌ Не рекомендуется | `https://api.anilibria.tv/v1` |

> **Важно:** Для новых проектов используйте **AniLiberty API v1**. Старое API будет полностью отключено.

### Документация

- **AniLiberty v1 (Swagger):** https://anilibria.top/api/docs/v1
- **Альтернативный эндпоинт:** https://api.anilibria.app/api/docs/v1

---

## Базовые URL

### AniLiberty API v1 (Актуальное)

```
https://anilibria.top/api/v1
https://api.anilibria.app/api/v1
```

### Legacy API v3 (Не рекомендуется)

```
https://api.anilibria.tv/v3
```

---

## Поиск тайтлов

### AniLiberty API v1

#### Эндпоинт

```http
GET /api/title
```

#### Параметры запроса

| Параметр | Тип | Описание |
|----------|-----|----------|
| `search` | string | Поисковый запрос по названию |
| `types` | string | Типы тайтлов: `tv`, `movie`, `ona`, `ova` |
| `years` | string | Годы выпуска (диапазон или список) |
| `genres` | string | Жанры (ID или названия) |
| `fields` | string | Фильтрация возвращаемых полей |
| `limit` | integer | Лимит записей (по умолчанию: 5) |
| `offset` | integer | Смещение для пагинации |

#### Пример запроса

```http
GET /api/title?search=наруто&limit=10
```

#### Пример ответа

```json
{
  "status": 200,
  "data": [
    {
      "id": 123,
      "titles": {
        "ru": "Наруто",
        "en": "Naruto",
        "ja": "ナルト"
      },
      "type": "tv",
      "year": 2002,
      "status": "completed",
      "genres": ["action", "adventure", "shounen"]
    }
  ]
}
```

---

### Legacy API v3

#### 1. Базовый поиск (`/v3/title/search`)

```http
GET /v3/title/search
```

**Параметры:**

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `search` | string, ... | Поиск по именам и описанию | - |
| `year` | string, ... | Список годов | - |
| `type` | string, ... | Типы: `MOVIE`, `TV`, `OVA`, `ONA`, `SPECIAL`, `WEB` | - |
| `season_code` | string, ... | Сезоны: `1`-Зима, `2`-Весна, `3`-Лето, `4`-Осень | - |
| `genres` | string, ... | Список жанров | - |
| `voice` | string, ... | Никнеймы озвучки | - |
| `translator` | string, ... | Никнеймы переводчиков | - |
| `editing` | string, ... | Никнеймы редакторов | - |
| `decor` | string, ... | Никнеймы оформителей | - |
| `timing` | string, ... | Никнеймы тайминга | - |
| `filter` | string, ... | Поля для включения в ответ | - |
| `remove` | string, ... | Поля для исключения из ответа | - |
| `include` | string, ... | Файлы в base64: `raw_poster`, `raw_torrent`, `torrent_meta` | - |
| `description_type` | string | `html`, `plain`, `no_view_order` | `plain` |
| `playlist_type` | string | `object`, `array` | `object` |
| `limit` | int | Количество объектов | 5 |
| `after` | int | Пропустить N записей | - |
| `order_by` | string | Поле для сортировки | - |
| `sort_direction` | int | `0`-возрастание, `1`-убывание | 0 |
| `page` | int | Номер страницы | - |
| `items_per_page` | int | Элементов на странице | - |

**Пример:**

```http
GET /v3/title/search?search=судьба апокреф&voice=Amikiri,Silv,Hekomi&filter=id,names,team,genres[0]&limit=10
```

---

#### 2. Расширенный поиск (`/v3/title/search/advanced`)

```http
GET /v3/title/search/advanced
```

**Параметры:**

| Параметр | Тип | Описание | Обязательный |
|----------|-----|----------|--------------|
| `query` | string | Фильтр с логическими операциями | + (или `simple_query`) |
| `simple_query` | string | Упрощённый фильтр | + (или `query`) |
| `filter` | string, ... | Поля для включения | - |
| `remove` | string, ... | Поля для исключения | - |
| `include` | string, ... | Файлы в base64 | - |
| `description_type` | string | Тип описания | `plain` |
| `playlist_type` | string | Формат плейлиста | `object` |
| `limit` | int | Количество объектов | 5 |
| `after` | int | Пропустить N записей | - |
| `order_by` | string | Поле для сортировки | - |
| `sort_direction` | int | `0`-возрастание, `1`-убывание | 0 |
| `page` | int | Номер страницы | - |
| `items_per_page` | int | Элементов на странице | - |

**Примеры запросов:**

```http
# Поиск по сезону и году
GET /v3/title/search/advanced?query={season.code} == 1 and {season.year} == 2020&filter=id,names,in_favorites&order_by=in_favorites&sort_direction=0

# Простой запрос
GET /v3/title/search/advanced?simple_query=status.code==1&limit=10
```

**Поддерживаемые операции в `query`:**

- Сравнения: `==`, `!=`, `<`, `>`, `<=`, `>=`, `~=`, `in`
- Логические: `and`, `or`, `not`
- Математические: `+`, `-`, `*`, `/`, `%`
- Функции: `abs()`, `len()`, `random()`

---

### Legacy API v2

#### Поиск (`/v2/searchTitles`)

```http
GET /v2/searchTitles
```

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `search` | string | Поиск по именам и описанию |
| `year` | string, ... | Годы выхода |
| `season_code` | string, ... | Сезоны (1-4) |
| `genres` | string, ... | Жанры |
| `voice` | string, ... | Озвучка |
| `translator` | string, ... | Переводчики |
| `editing` | string, ... | Редакторы |
| `decor` | string, ... | Оформители |
| `timing` | string, ... | Тайминг |
| `filter` | string, ... | Поля для включения |
| `remove` | string, ... | Поля для исключения |
| `limit` | int | Лимит записей |
| `after` | int | Пропустить N записей |

#### Продвинутый поиск (`/v2/advancedSearch`)

```http
GET /v2/advancedSearch
```

Поддерживает логические выражения в параметре `query`.

---

## Расписание

### AniLiberty API v1

```http
GET /api/schedule
```

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `date` | string | Дата (формат YYYY-MM-DD) |
| `fields` | string | Фильтрация полей |

---

### Legacy API v3

```http
GET /v3/title/schedule
```

**Параметры:**

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `filter` | string, ... | Поля для включения | - |
| `remove` | string, ... | Поля для исключения | - |
| `include` | string, ... | Файлы в base64 | - |
| `days` | string, ... | Дни недели: `0`-Пн, `1`-Вт, ..., `6`-Вс | - |
| `description_type` | string | Тип описания | `plain` |
| `playlist_type` | string | Формат плейлиста | `object` |

**Пример:**

```http
GET /v3/title/schedule?days=5,6
```

**Ответ:**

```json
[
  {
    "day": 5,
    "list": [
      { /* объект тайтла */ }
    ]
  },
  {
    "day": 6,
    "list": [
      { /* объект тайтла */ }
    ]
  }
]
```

---

### Legacy API v2

```http
GET /v2/getSchedule
```

**Параметры:** `days` (список дней), `filter`, `remove`

---

## Обновления

### AniLiberty API v1

```http
GET /api/updates
```

**Параметры:**

| Параметр | Тип | Описание |
|----------|-----|----------|
| `type` | string | Тип обновлений |
| `limit` | integer | Лимит записей |

---

### Legacy API v3

```http
GET /v3/title/updates
```

**Параметры:**

| Параметр | Тип | Описание | По умолчанию |
|----------|-----|----------|--------------|
| `filter` | string, ... | Поля для включения | - |
| `remove` | string, ... | Поля для исключения | - |
| `include` | string, ... | Файлы в base64 | - |
| `limit` | int | Количество объектов | 5 |
| `since` | int | Timestamp | - |
| `description_type` | string | Тип описания | `plain` |
| `playlist_type` | string | Формат плейлиста | `object` |
| `after` | int | Пропустить N записей | - |
| `page` | int | Номер страницы | - |
| `items_per_page` | int | Элементов на странице | - |

**Пример:**

```http
GET /v3/title/updates?filter=posters,type,status&limit=10
```

**Ответ:**

```json
{
  "list": [
    { /* объект тайтла */ }
  ],
  "pagination": {
    "pages": 271,
    "current_page": 0,
    "items_per_page": 5,
    "total_items": 1355
  }
}
```

---

### Legacy API v2

```http
GET /v2/getUpdates
```

Возвращает список тайтлов с последними обновлениями.

---

## Структура объекта тайтла

### AniLiberty API v1

```typescript
{
  id: number;
  titles: {
    ru: string;
    en: string;
    ja: string;
  };
  type: string;           // tv, movie, ona, ova, special
  year: number;
  status: string;         // ongoing, completed, announced, cancelled
  genres: string[];
  description?: string;
  poster?: string;        // URL постера
  trailer?: string;       // URL трейлера
  episodes?: number;      // Количество серий
  duration?: number;      // Длительность серии (мин)
  rating?: number;        // Рейтинг
  team?: {
    voice?: string[];
    translator?: string[];
    editing?: string[];
  };
  torrents?: Torrent[];
  player?: Player;
}
```

---

### Legacy API v3/v2

```typescript
{
  id: number;                    // ID тайтла
  code: string;                  // Код для URL
  names: {
    ru: string;                  // Русское название
    en: string;                  // Английское название
    alternative?: string;        // Альтернативное название
  };
  posters: {
    small: { url: string; raw_base64_file?: string };
    medium: { url: string; raw_base64_file?: string };
    original: { url: string; raw_base64_file?: string };
  };
  status: {
    string: string;              // "Онгоинг", "Завершён"
    code: number;                // 1-В работе, 2-Завершён, 3-Скрыт, 4-Неонгоинг
  };
  type: {
    string: string;              // "TV", "Фильм", "OVA"
    code: number;                // 0-Фильм, 1-TV, 2-OVA, 3-ONA, 4-Спешл, 5-WEB
  };
  genres: string[];              // Список жанров
  team: {
    voice: string[];
    translator: string[];
    editing: string[];
    decor: string[];
    timing: string[];
  };
  season: {
    year: number;
    week_day: number;            // 0-Пн, 6-Вс
    string: string;              // "Зима 2024"
    code: number;                // 1-Зима, 2-Весна, 3-Лето, 4-Осень
  };
  description: string;           // Описание
  player: {
    alternative_player?: string;
    host: string;
    series: {
      [episode: string]: {
        hls: {
          sd?: string;
          hd?: string;
          fullhd?: string;
        };
        sources?: {
          sd?: string;
          hd?: string;
          fullhd?: string;
        };
      };
    };
    playlist?: {
      [episode: string]: {
        hls: {
          sd?: string;
          hd?: string;
          fullhd?: string;
        };
      };
    };
  };
  torrents: {
    series: {
      [quality: string]: {
        id: number;
        hash: string;
        seeders: number;
        leechers: number;
        downloads: number;
        size: number;            // Размер в байтах
        url: string;             // Ссылка на .torrent
        magnet?: string;         // Magnet-ссылка
        quality: string;         // "1080p", "720p"
        series: string;          // Диапазон серий
      }[];
    };
    list?: Torrent[];
  };
  updated: number;               // Timestamp обновления
  last_change: number;           // Timestamp последнего изменения
  blocked?: {
    blocked: boolean;
    bakanim?: boolean;
  };
  in_favorites?: number;         // Количество в избранном
}
```

---

### Вложенные объекты

#### Модель серии (Playlist)

```typescript
{
  id: number;           // Номер серии
  title: string;        // Название серии
  sd: string;           // HLS SD
  hd: string;           // HLS HD
  fullhd?: string;      // HLS FullHD
  srcSd?: string;       // Прямая ссылка SD
  srcHd?: string;       // Прямая ссылка HD
}
```

#### Модель торрента (Torrent)

```typescript
{
  id: number;           // ID торрента
  hash: string;         // Info hash
  seeders: number;      // Сиды
  leechers: number;     // Личи
  downloads: number;    // Загрузки
  quality: string;      // Качество
  series: string;       // Диапазон серий
  size: number;         // Размер в байтах
  url: string;          // Ссылка на .torrent
  magnet?: string;      // Magnet-ссылка
  completed: number;    // Количество загрузок
}
```

#### Модель блокировки (BlockedInfo)

```typescript
{
  blocked: boolean;     // Факт блокировки
  reason?: string;      // Причина
  bakanim?: boolean;    // Блокировка от Bakanim
}
```

---

## Дополнительные эндпоинты

### AniLiberty API v1

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/api/title/{id}` | GET | Детали тайтла по ID |
| `/api/schedule` | GET | Расписание релизов |
| `/api/updates` | GET | Список обновлений |
| `/api/genres` | GET | Список жанров |
| `/api/years` | GET | Список годов |
| `/api/teams` | GET | Участники команды |
| `/api/torrents` | GET | Торренты |
| `/api/feed` | GET | Лента обновлений |

---

### Legacy API v3

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/v3/title/{id}` | GET | Детали тайтла |
| `/v3/title/updates` | GET | Обновления |
| `/v3/title/schedule` | GET | Расписание |
| `/v3/title/search` | GET | Поиск |
| `/v3/title/search/advanced` | GET | Расширенный поиск |
| `/v3/title/random` | GET | Случайный тайтл |
| `/v3/torrent/list` | GET | Список торрентов |
| `/v3/torrent/download/{id}` | GET | Скачать торрент |
| `/v3/years` | GET | Список годов |
| `/v3/genres` | GET | Список жанров |
| `/v3/teams` | GET | Команда проекта |

---

### Legacy API v2

| Эндпоинт | Метод | Описание |
|----------|-------|----------|
| `/v2/getTitle` | GET | Информация о тайтле |
| `/v2/getTitles` | GET | Информация о нескольких тайтлах |
| `/v2/getUpdates` | GET | Обновления тайтлов |
| `/v2/getChanges` | GET | Изменения тайтлов |
| `/v2/getSchedule` | GET | Расписание |
| `/v2/getRandomTitle` | GET | Случайный тайтл |
| `/v2/getYouTube` | GET | YouTube ролики |
| `/v2/getFeed` | GET | Лента обновлений |
| `/v2/getYears` | GET | Список годов |
| `/v2/getGenres` | GET | Список жанров |
| `/v2/getCachingNodes` | GET | Кеш-серверы |
| `/v2/getTeam` | GET | Участники команды |
| `/v2/getSeedStats` | GET | Статистика трекера |
| `/v2/getRSS` | GET | RSS лента |
| `/v2/searchTitles` | GET | Поиск тайтлов |
| `/v2/advancedSearch` | GET | Продвинутый поиск |

#### WebSocket (v2)

```
wss://api.anilibria.tv/v2/ws/
wss://api.anilibria.tv/v2/webSocket/
```

Получение real-time обновлений в формате JSON:

```json
{
  "type": "title_update",
  "data": {
    "title": { /* объект тайтла */ }
  }
}
```

---

## Примеры использования

### JavaScript/TypeScript

#### Поиск тайтла (AniLiberty v1)

```javascript
async function searchTitle(query) {
  const response = await fetch(
    `https://anilibria.top/api/v1/title?search=${encodeURIComponent(query)}&limit=10`
  );
  const data = await response.json();
  return data.data;
}

// Использование
const results = await searchTitle('Наруто');
console.log(results);
```

#### Поиск с фильтрами (Legacy v3)

```javascript
async function searchAnimeV3(search, genres = [], limit = 10) {
  const params = new URLSearchParams({
    search,
    filter: 'id,names,posters,genres,status,type,season',
    limit: limit.toString()
  });
  
  if (genres.length) {
    params.append('genres', genres.join(','));
  }
  
  const response = await fetch(
    `https://api.anilibria.tv/v3/title/search?${params}`
  );
  return await response.json();
}

// Использование
const anime = await searchAnimeV3('атака титанов', ['action', 'drama']);
```

#### Получение расписания

```javascript
async function getSchedule(days = []) {
  const params = new URLSearchParams();
  if (days.length) {
    params.append('days', days.join(','));
  }
  params.append('filter', 'id,names,posters,season,player');
  
  const response = await fetch(
    `https://api.anilibria.tv/v3/title/schedule?${params}`
  );
  return await response.json();
}

// Использование: расписание на Пт, Сб, Вс
const schedule = await getSchedule([4, 5, 6]);
```

#### Получение торрентов

```javascript
async function getTitleTorrents(titleId) {
  const response = await fetch(
    `https://api.anilibria.tv/v3/title/${titleId}?filter=torrents`
  );
  const data = await response.json();
  return data.torrents;
}

// Использование
const torrents = await getTitleTorrents(1234);
torrents.list?.forEach(t => {
  console.log(`${t.quality}: ${t.seeders} seeders, magnet: ${t.magnet}`);
});
```

---

### Python

```python
import requests

BASE_URL = "https://anilibria.top/api/v1"

def search_title(query: str, limit: int = 10):
    """Поиск тайтла по названию"""
    response = requests.get(
        f"{BASE_URL}/title",
        params={"search": query, "limit": limit}
    )
    response.raise_for_status()
    return response.json()["data"]

def get_schedule(date: str = None):
    """Получение расписания"""
    params = {}
    if date:
        params["date"] = date
    response = requests.get(f"{BASE_URL}/schedule", params=params)
    response.raise_for_status()
    return response.json()

def get_updates(limit: int = 10):
    """Получение последних обновлений"""
    response = requests.get(
        f"{BASE_URL}/updates",
        params={"limit": limit}
    )
    response.raise_for_status()
    return response.json()

# Пример использования
if __name__ == "__main__":
    results = search_title("наруто")
    for title in results:
        print(f"{title['titles']['ru']} ({title['year']})")
```

---

### Hayase Extension (для AniLibria)

```javascript
export default new class AniLibria {
  constructor() {
    this.base = 'https://anilibria.top/api/v1'
  }

  /**
   * Поиск тайтла по названию
   */
  async search({ titles, episode }) {
    if (!titles.length) return []

    const query = titles[0]
    const response = await fetch(`${this.base}/title?search=${encodeURIComponent(query)}&limit=5`)
    const data = await response.json()

    if (!data.data || !Array.isArray(data.data)) return []
    
    return data.data.map(this.mapTitleToResult)
  }

  /**
   * Маппинг ответа AniLibria в формат Hayase
   */
  mapTitleToResult(title) {
    return {
      title: title.titles?.ru || title.titles?.en || '',
      link: `https://anilibria.top/title/${title.code || title.id}`,
      hash: '', // AniLibria не предоставляет hash напрямую
      seeders: 0,
      leechers: 0,
      downloads: 0,
      size: 0,
      date: new Date(),
      verified: false,
      type: 'alt',
      accuracy: 'medium',
      metadata: {
        anilibria_id: title.id,
        code: title.code,
        genres: title.genres || [],
        year: title.year,
        status: title.status,
        episodes: title.episodes
      }
    }
  }

  /**
   * Тест доступности API
   */
  async test() {
    try {
      const response = await fetch(`${this.base}/title?limit=1`)
      return response.ok
    } catch {
      return false
    }
  }

  batch = this.search
  movie = this.search
}()
```

---

## Примечания

### Геоблокировка

Некоторый контент может быть заблокирован для пользователей из РФ. API возвращает поле `blocked` в объекте тайтла.

### Rate Limiting

Официальные лимиты не документированы. Рекомендуется:
- Не более 10 запросов в секунду
- Кэширование часто запрашиваемых данных
- Использование пагинации для больших списков

### CORS

API поддерживает CORS запросы из браузеров.

### Изображения

Для корректного отображения постеров используйте базовый URL:
- `https://anilibria.top` + относительный путь из API

---

## Ресурсы

- **Официальный сайт:** https://anilibria.top
- **Telegram разработчиков:** https://t.me/AniLibria_Devs
- **Swagger документация:** https://anilibria.top/api/docs/v1
- **GitHub (deprecated docs):** https://github.com/anilibria/docs
- **Бот поддержки:** @Libria911Bot

---

*Документация актуальна на момент: 30 марта 2026*
