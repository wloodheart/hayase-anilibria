// Типы для Hayase extension
export interface TorrentResult {
    title: string
    link: string
    hash: string
    seeders: number
    leechers: number
    downloads: number
    size: number
    date: Date
    verified: boolean
    type?: 'batch' | 'best' | 'alt'
    accuracy: 'high' | 'medium' | 'low'
}

export interface TorrentQuery {
    anilistId: number
    anidbAid?: number
    anidbEid?: number
    titles: string[]
    episode?: number
    episodeCount?: number
    resolution: '2160' | '1080' | '720' | '540' | '480' | ''
    exclusions: string[]
    type?: 'sub' | 'dub'
}

export type SearchFunction = (query: TorrentQuery) => Promise<TorrentResult[]>

// Типы для AniLibria API
interface AniLibriaTitle {
    id: number
    code?: string
    titles: {
        ru: string
        en: string
        ja: string
    }
    type: string
    year: number
    status: string
    genres: string[]
    episodes?: number
    torrents?: {
        list?: AniLibriaTorrent[]
    }
}

interface AniLibriaTorrent {
    id: number
    hash: string
    seeders: number
    leechers: number
    downloads: number
    size: number
    quality: string
    series: string
    url: string
    magnet?: string
}

/**
 * Hayase extension для AniLibria
 */
export default class AniLibria {
    private readonly base = 'https://anilibria.top/api/v1'

    /**
     * Поиск одиночной серии
     */
    single: SearchFunction = async ({titles, episode}) => {
        if (!titles.length) return []

        const searchQuery = titles[0]
        const response = await fetch(
            `${this.base}/title?search=${encodeURIComponent(searchQuery)}&limit=10`
        )

        if (!response.ok) return []

        const data = await response.json()
        if (!data.data || !Array.isArray(data.data)) return []

        const results: TorrentResult[] = []

        for (const title of data.data) {
            const titleResults = this.extractTorrents(title, episode)
            results.push(...titleResults)
        }

        return results
    }

    /**
     * Поиск пакета серий
     */
    batch: SearchFunction = async (query) => {
        return this.single(query)
    }

    /**
     * Поиск фильма
     */
    movie: SearchFunction = async (query) => {
        return this.single(query)
    }

    /**
     * Тест доступности API
     */
    test = async (): Promise<boolean> => {
        try {
            const response = await fetch(`${this.base}/title?limit=1`)
            return response.ok
        } catch {
            return false
        }
    }

    /**
     * Извлечение торрентов из тайтла
     */
    private extractTorrents(title: AniLibriaTitle, episode?: number): TorrentResult[] {
        const torrents = title.torrents?.list
        if (!torrents || torrents.length === 0) {
            // Если торрентов нет, возвращаем заглушку с ссылкой на тайтл
            return [{
                title: title.titles.ru || title.titles.en || '',
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
            }]
        }

        return torrents.map((torrent) => {
            const result: TorrentResult = {
                title: `${title.titles.ru || title.titles.en || ''} [${torrent.quality}]`,
                link: torrent.url,
                hash: torrent.hash,
                seeders: torrent.seeders,
                leechers: torrent.leechers,
                downloads: torrent.downloads,
                size: torrent.size,
                date: new Date(),
                verified: true,
                type: this.getResultType(torrent.series, episode),
                accuracy: 'high'
            }

            // Добавляем magnet-ссылку если есть
            if (torrent.magnet) {
                result.link = torrent.magnet
            }

            return result
        })
    }

    /**
     * Определение типа результата
     */
    private getResultType(series: string, episode?: number): 'batch' | 'best' | 'alt' {
        // Если диапазон серий содержит тире или дефис - это пакет
        if (series.includes('-') || series.includes('/')) {
            return 'batch'
        }

        // Если указан конкретный эпизод и он совпадает
        if (episode !== undefined) {
            const episodeNum = parseInt(series, 10)
            if (!isNaN(episodeNum) && episodeNum === episode) {
                return 'best'
            }
        }

        return 'alt'
    }
}
