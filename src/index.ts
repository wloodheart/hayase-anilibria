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
interface AniLibriaRelease {
    id: number
    alias: string
    name: {
        main: string
        english: string
        alternative: string | null
    }
    year: number
    type: {
        value: string
        description: string
    }
    torrents?: AniLibriaTorrent[]
}

interface AniLibriaTorrent {
    id: number
    hash: string
    size: number
    magnet: string
    seeders: number
    leechers: number
    completed_times: number
    quality: {
        value: string
    }
    description: string
    label: string
    created_at: string
}

interface AniLibriaSearchResponse {
    data: AniLibriaRelease[]
    meta: {
        pagination: {
            total: number
            count: number
        }
    }
}

interface AniLibriaReleaseWithTorrents {
    torrents: AniLibriaTorrent[]
}

/**
 * Hayase extension для AniLibria
 */
export default new class AniLibria {
    private readonly base = 'https://anilibria.top/api/v1'

    /**
     * Поиск одиночной серии
     */
    single: SearchFunction = async ({titles, episode}) => {
        if (!titles.length) return []

        const searchQuery = titles[0]
        // Используем include для получения только нужных полей
        const url = `${this.base}/anime/catalog/releases?f[search]=${encodeURIComponent(searchQuery)}&limit=10&include=id,name,year,type`
        
        try {
            const response = await fetch(url)
            
            if (!response.ok) {
                console.error(`AniLibria API error: ${response.status} ${response.statusText}`)
                return []
            }

            const data: AniLibriaSearchResponse = await response.json()
            
            if (!data.data || !Array.isArray(data.data)) {
                console.error('AniLibria API: invalid response format', data)
                return []
            }

            const results: TorrentResult[] = []

            // Для каждого найденного релиза получаем торренты с include
            for (const release of data.data) {
                const torrentResults = await this.getReleaseTorrents(release.id, release, episode)
                results.push(...torrentResults)
            }

            return results
        } catch (error) {
            console.error('AniLibria API fetch error:', error)
            return []
        }
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
            const response = await fetch(`${this.base}/anime/catalog/releases?limit=1&include=id`)
            return response.ok
        } catch {
            return false
        }
    }

    /**
     * Получение торрентов для релиза
     */
    private async getReleaseTorrents(releaseId: number, release: AniLibriaRelease, episode?: number): Promise<TorrentResult[]> {
        try {
            // Используем include для получения только нужных полей торрентов
            const include = 'torrents.hash,torrents.size,torrents.magnet,torrents.seeders,torrents.leechers,torrents.completed_times,torrents.quality,torrents.description,torrents.created_at'
            const response = await fetch(`${this.base}/anime/releases/${releaseId}?include=${include}`)
            
            if (!response.ok) {
                console.error(`Failed to fetch torrents for release ${releaseId}: ${response.status}`)
                return []
            }

            const torrentsData: AniLibriaReleaseWithTorrents = await response.json()
            
            if (!torrentsData.torrents || !Array.isArray(torrentsData.torrents)) {
                return []
            }

            return torrentsData.torrents.map(torrent => this.mapTorrentToResult(torrent, release, episode))
        } catch (error) {
            console.error(`Error fetching torrents for release ${releaseId}:`, error)
            return []
        }
    }

    /**
     * Маппинг торрента в формат Hayase
     */
    private mapTorrentToResult(torrent: AniLibriaTorrent, release: AniLibriaRelease, episode?: number): TorrentResult {
        const title = `${release.name.main || release.name.english} [${torrent.quality.value}] ${torrent.description ? `- ${torrent.description}` : ''}`
        
        return {
            title,
            link: torrent.magnet,
            hash: torrent.hash,
            seeders: torrent.seeders,
            leechers: torrent.leechers,
            downloads: torrent.completed_times,
            size: torrent.size,
            date: new Date(torrent.created_at),
            verified: true,
            type: this.getResultType(torrent.description, episode),
            accuracy: 'high'
        }
    }

    /**
     * Определение типа результата
     */
    private getResultType(description: string, episode?: number): 'batch' | 'best' | 'alt' {
        // Если диапазон серий содержит тире — это пакет
        if (description.includes('-')) {
            return 'batch'
        }

        // Если указан конкретный эпизод и он совпадает
        if (episode !== undefined) {
            const episodeNum = parseInt(description, 10)
            if (!isNaN(episodeNum) && episodeNum === episode) {
                return 'best'
            }
        }

        return 'alt'
    }
}()
