export interface Rss {
    id: number;
    name: string;
    start: number;
    pre: number;
    rating: number;
    description: string;
    updateUrl: string;
    updatedAt: number;
    _check: boolean;
    user: string;
    _type: 'Manga' | 'Anime';
}
