import type {
  TMDBMovieResult,
  TMDBTVResult,
  TMDBExternalIDs,
  TMDBMovieDetail,
  TMDBTVDetail,
} from './types';

type TMDBResult = TMDBMovieResult | TMDBTVResult;

const BASE_URL = 'https://api.themoviedb.org/3';

export class TMDBClient {
  constructor(private apiKey: string) {}

  private async request<T>(path: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${BASE_URL}${path}`);
    url.searchParams.set('api_key', this.apiKey);
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    return response.json() as Promise<T>;
  }

  async trending(type: 'movie' | 'tv', page: number = 1): Promise<TMDBResult[]> {
    const data = await this.request<{ results: TMDBResult[] }>(
      `/trending/${type}/week`,
      { page }
    );
    return data.results;
  }

  async discover(
    type: 'movie' | 'tv',
    params: Record<string, string | number>
  ): Promise<TMDBResult[]> {
    const data = await this.request<{ results: TMDBResult[] }>(
      `/discover/${type}`,
      params
    );
    return data.results;
  }

  async getExternalIDs(type: 'movie' | 'tv', id: number): Promise<TMDBExternalIDs> {
    return this.request<TMDBExternalIDs>(`/${type}/${id}/external_ids`);
  }

  async details(type: 'movie' | 'tv', id: number): Promise<TMDBMovieDetail | TMDBTVDetail> {
    return this.request<TMDBMovieDetail | TMDBTVDetail>(
      `/${type}/${id}`,
      { append_to_response: 'credits' }
    );
  }

  async search(type: 'movie' | 'tv', query: string): Promise<TMDBResult[]> {
    const data = await this.request<{ results: TMDBResult[] }>(
      `/search/${type}`,
      { query }
    );
    return data.results;
  }
}
