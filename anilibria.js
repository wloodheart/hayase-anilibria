/**
 * Hayase extension для AniLibria
 */
export default new class AniLibria {
    constructor() {
        this.base = 'https://anilibria.top/api/v1';
        /**
         * Поиск одиночной серии
         */
        this.single = async ({ titles, episode }) => {
            if (!titles.length)
                return [];
            const searchQuery = titles[0];
            const url = `${this.base}/anime/catalog/releases?f[search]=${encodeURIComponent(searchQuery)}&limit=10`;
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    console.error(`AniLibria API error: ${response.status} ${response.statusText}`);
                    return [];
                }
                const data = await response.json();
                if (!data.data || !Array.isArray(data.data)) {
                    console.error('AniLibria API: invalid response format', data);
                    return [];
                }
                const results = [];
                // Для каждого найденного релиза получаем торренты
                for (const release of data.data) {
                    const torrentResults = await this.getReleaseTorrents(release, episode);
                    results.push(...torrentResults);
                }
                return results;
            }
            catch (error) {
                console.error('AniLibria API fetch error:', error);
                return [];
            }
        };
        /**
         * Поиск пакета серий
         */
        this.batch = async (query) => {
            return this.single(query);
        };
        /**
         * Поиск фильма
         */
        this.movie = async (query) => {
            return this.single(query);
        };
        /**
         * Тест доступности API
         */
        this.test = async () => {
            try {
                const response = await fetch(`${this.base}/anime/catalog/releases?limit=1`);
                return response.ok;
            }
            catch {
                return false;
            }
        };
    }
    /**
     * Получение торрентов для релиза
     */
    async getReleaseTorrents(release, episode) {
        try {
            const response = await fetch(`${this.base}/anime/torrents/release/${release.id}`);
            if (!response.ok) {
                console.error(`Failed to fetch torrents for release ${release.id}: ${response.status}`);
                return [];
            }
            const torrentsData = await response.json();
            if (!torrentsData.data || !Array.isArray(torrentsData.data)) {
                return [];
            }
            return torrentsData.data.map(torrent => this.mapTorrentToResult(torrent, release, episode));
        }
        catch (error) {
            console.error(`Error fetching torrents for release ${release.id}:`, error);
            return [];
        }
    }
    /**
     * Маппинг торрента в формат Hayase
     */
    mapTorrentToResult(torrent, release, episode) {
        const title = `${release.name.main || release.name.english} [${torrent.quality.value}] ${torrent.description ? `- ${torrent.description}` : ''}`;
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
        };
    }
    /**
     * Определение типа результата
     */
    getResultType(description, episode) {
        // Если диапазон серий содержит тире — это пакет
        if (description.includes('-')) {
            return 'batch';
        }
        // Если указан конкретный эпизод и он совпадает
        if (episode !== undefined) {
            const episodeNum = parseInt(description, 10);
            if (!isNaN(episodeNum) && episodeNum === episode) {
                return 'best';
            }
        }
        return 'alt';
    }
}();
