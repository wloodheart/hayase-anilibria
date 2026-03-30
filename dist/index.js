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
            const url = `${this.base}/title?search=${encodeURIComponent(searchQuery)}&limit=10`;
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
                for (const title of data.data) {
                    const titleResults = this.extractTorrents(title, episode);
                    results.push(...titleResults);
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
                const response = await fetch(`${this.base}/title?limit=1`);
                return response.ok;
            }
            catch {
                return false;
            }
        };
    }
    /**
     * Извлечение торрентов из тайтла
     */
    extractTorrents(title, episode) {
        const torrents = title.torrents?.list;
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
                }];
        }
        return torrents.map((torrent) => {
            const result = {
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
            };
            // Добавляем magnet-ссылку если есть
            if (torrent.magnet) {
                result.link = torrent.magnet;
            }
            return result;
        });
    }
    /**
     * Определение типа результата
     */
    getResultType(series, episode) {
        // Если диапазон серий содержит тире или дефис - это пакет
        if (series.includes('-') || series.includes('/')) {
            return 'batch';
        }
        // Если указан конкретный эпизод и он совпадает
        if (episode !== undefined) {
            const episodeNum = parseInt(series, 10);
            if (!isNaN(episodeNum) && episodeNum === episode) {
                return 'best';
            }
        }
        return 'alt';
    }
}();
