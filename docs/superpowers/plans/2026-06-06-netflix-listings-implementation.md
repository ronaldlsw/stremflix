# Netflix Listings Stremio Addon — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a client-side Stremio addon that lists Netflix movies/series via TMDB API, deployed to GitHub Pages.

**Architecture:** TypeScript addon using `stremio-addon-sdk`'s `addonBuilder`, bundled via esbuild, served as static files on GitHub Pages. The addon makes client-side TMDB API calls using the user's API key (configured in Stremio). No stream handler — AIOStream/TorrentIO handles streaming via IMDb ID matching.

**Tech Stack:** TypeScript, stremio-addon-sdk, TMDB API, Jest + ts-jest, esbuild, GitHub Actions

---

### Task 1: Project scaffolding and tooling

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `jest.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "stremio-addon-netflix-listings",
  "version": "0.1.0",
  "description": "Stremio addon providing Netflix listings via TMDB API",
  "type": "module",
  "scripts": {
    "build": "npm run typecheck && npm test && node scripts/build.mjs",
    "test": "jest",
    "typecheck": "tsc --noEmit",
    "dev": "esbuild src/addon.ts --bundle --platform=browser --outfile=dist/addon.bundle.js --watch"
  },
  "devDependencies": {
    "esbuild": "^0.24.0",
    "jest": "^29.7.0",
    "ts-jest": "^29.2.0",
    "typescript": "^5.5.0",
    "@types/jest": "^29.5.0"
  },
  "dependencies": {
    "stremio-addon-sdk": "1.1.x"
  }
}
```

- [ ] **Step 2: Write `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": false,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

- [ ] **Step 3: Write `jest.config.ts`**

```ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
};

export default config;
```

- [ ] **Step 4: Write `.env.example`**

```
TMDB_API_KEY=your_tmdb_api_key_here
```

- [ ] **Step 5: Install dependencies and verify tooling**

Run: `npm install`
Expected: dependencies installed without errors

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: scaffold TypeScript project with Jest and esbuild"
```

---

### Task 2: Define TypeScript types

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: Write `src/types.ts`**

```ts
export interface AddonConfig {
  tmdbApiKey: string;
}

export type ContentType = 'movie' | 'series';

export interface CatalogDefinition {
  id: string;
  type: ContentType;
  title: string;
  tmdbEndpoint: string;
  discoverParams?: Record<string, string | number>;
  sortBy?: string;
}

export interface CatalogItem {
  id: string;
  type: ContentType;
  name: string;
  poster?: string;
  posterShape?: 'poster' | 'landscape' | 'square';
  year?: number;
  imdbRating?: string;
  releaseInfo?: string;
}

export interface MetaDetail {
  id: string;
  type: ContentType;
  name: string;
  poster?: string;
  background?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
  genres?: string[];
  cast?: string[];
  director?: string[];
  runtime?: string;
}

export interface TMDBMovieResult {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TMDBTVResult {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  vote_average: number;
  overview: string;
  genre_ids: number[];
}

export interface TMDBExternalIDs {
  imdb_id: string | null;
}

export interface TMDBMovieDetail extends TMDBMovieResult {
  genres: { id: number; name: string }[];
  runtime: number;
  credits: {
    cast: { name: string }[];
    crew: { name: string; job: string }[];
  };
}

export interface TMDBTVDetail extends TMDBTVResult {
  genres: { id: number; name: string }[];
  episode_run_time: number[];
  credits: {
    cast: { name: string }[];
    crew: { name: string; job: string }[];
  };
}

export interface CatalogResponse {
  metas: CatalogItem[];
  cacheMaxAge?: number;
}

export interface MetaResponse {
  meta: MetaDetail | null;
  cacheMaxAge?: number;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/types.ts
git commit -m "feat: add TypeScript type definitions"
```

---

### Task 3: Write TMDB API client (TDD)

**Files:**
- Create: `src/tmdb.ts`
- Create: `tests/tmdb.test.ts`
- Create: `tests/fixtures/tmdb-responses.ts`

- [ ] **Step 1: Write test fixtures**

Create `tests/fixtures/tmdb-responses.ts`:

```ts
export const mockTrendingMoviesResponse = {
  results: [
    {
      id: 550,
      title: "Fight Club",
      poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
      backdrop_path: "/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
      release_date: "1999-10-15",
      vote_average: 8.4,
      overview: "A ticking-Loss and disillusioned office worker finds himself...",
      genre_ids: [18, 53],
    },
  ],
  page: 1,
  total_pages: 10,
  total_results: 200,
};

export const mockTrendingTVResponse = {
  results: [
    {
      id: 1399,
      name: "Game of Thrones",
      poster_path: "/u3bZgnGQ9T01sWNBdA7o7rWYKLb.jpg",
      backdrop_path: "/suopoADq0kQQYZzEkChWj7Wiw7O.jpg",
      first_air_date: "2011-04-17",
      vote_average: 8.4,
      overview: "Seven noble families fight for control of the mythical land of Westeros.",
      genre_ids: [10765, 18],
    },
  ],
  page: 1,
  total_pages: 5,
  total_results: 100,
};

export const mockExternalIDsResponse = {
  imdb_id: "tt0137523",
};

export const mockMovieDetailResponse = {
  id: 550,
  title: "Fight Club",
  poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
  backdrop_path: "/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg",
  release_date: "1999-10-15",
  vote_average: 8.4,
  overview: "A ticking-Loss...",
  runtime: 139,
  genres: [{ id: 18, name: "Drama" }, { id: 53, name: "Thriller" }],
  credits: {
    cast: [{ name: "Brad Pitt" }, { name: "Edward Norton" }],
    crew: [{ name: "David Fincher", job: "Director" }],
  },
};

export const mockDiscoverResponse = {
  results: [mockTrendingMoviesResponse.results[0]],
  page: 1,
  total_pages: 10,
  total_results: 100,
};
```

- [ ] **Step 2: Write failing tests for TMDB client**

Create `tests/tmdb.test.ts`:

```ts
import { TMDBClient } from '../../src/tmdb';
import {
  mockTrendingMoviesResponse,
  mockTrendingTVResponse,
  mockExternalIDsResponse,
  mockMovieDetailResponse,
  mockDiscoverResponse,
} from './fixtures/tmdb-responses';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('TMDBClient', () => {
  const apiKey = 'test-api-key';
  let client: TMDBClient;

  beforeEach(() => {
    client = new TMDBClient(apiKey);
    mockFetch.mockReset();
  });

  describe('trending', () => {
    it('fetches trending movies', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingMoviesResponse),
      });

      const result = await client.trending('movie');
      expect(result).toEqual(mockTrendingMoviesResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/movie/week?api_key=test-api-key&page=1'
      );
    });

    it('fetches trending TV', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingTVResponse),
      });

      const result = await client.trending('tv');
      expect(result).toEqual(mockTrendingTVResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/trending/tv/week?api_key=test-api-key&page=1'
      );
    });

    it('passes page parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingMoviesResponse),
      });

      await client.trending('movie', 2);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('page=2')
      );
    });
  });

  describe('discover', () => {
    it('discovers with watch provider filter', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDiscoverResponse),
      });

      const result = await client.discover('movie', {
        with_watch_providers: '8',
        watch_region: 'US',
      });

      expect(result).toEqual(mockDiscoverResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('with_watch_providers=8')
      );
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('watch_region=US')
      );
    });
  });

  describe('getExternalIDs', () => {
    it('returns external IDs for a movie', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockExternalIDsResponse),
      });

      const result = await client.getExternalIDs('movie', 550);
      expect(result).toEqual(mockExternalIDsResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.themoviedb.org/3/movie/550/external_ids?api_key=test-api-key'
      );
    });
  });

  describe('details', () => {
    it('returns movie details', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockMovieDetailResponse),
      });

      const result = await client.details('movie', 550);
      expect(result).toEqual(mockMovieDetailResponse);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/movie/550')
      );
    });
  });

  describe('search', () => {
    it('searches movies with query', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTrendingMoviesResponse),
      });

      const result = await client.search('movie', 'Fight Club');
      expect(result).toEqual(mockTrendingMoviesResponse.results);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('query=Fight+Club')
      );
    });
  });

  describe('error handling', () => {
    it('throws on non-ok response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
      });

      await expect(client.trending('movie')).rejects.toThrow('TMDB API error: 401');
    });

    it('throws on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(client.trending('movie')).rejects.toThrow('Network error');
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npx jest tests/tmdb.test.ts -v`
Expected: FAIL — "Cannot find module '../src/tmdb'"

- [ ] **Step 4: Write minimal implementation**

Create `src/tmdb.ts`:

```ts
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
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx jest tests/tmdb.test.ts -v`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/tmdb.ts tests/tmdb.test.ts tests/fixtures/tmdb-responses.ts
git commit -m "feat: add TMDB API client with tests"
```

---

### Task 4: Write catalog definitions and mapper (TDD)

**Files:**
- Create: `src/catalogs.ts`
- Create: `tests/catalogs.test.ts`

- [ ] **Step 1: Write failing test for catalog module**

Create `tests/catalogs.test.ts`:

```ts
import { CATALOGS, mapTMDBResultToCatalogItem } from '../src/catalogs';
import type { TMDBMovieResult, TMDBTVResult } from '../src/types';

describe('CATALOGS', () => {
  it('defines 6 catalogs', () => {
    expect(CATALOGS).toHaveLength(6);
  });

  it('has correct structure for each catalog', () => {
    for (const catalog of CATALOGS) {
      expect(catalog).toHaveProperty('id');
      expect(catalog).toHaveProperty('type');
      expect(catalog).toHaveProperty('title');
      expect(catalog).toHaveProperty('tmdbEndpoint');
    }
  });

  it('includes trending movie catalog', () => {
    const trending = CATALOGS.find(c => c.id === 'netflix-trending-movie');
    expect(trending).toBeDefined();
    expect(trending!.type).toBe('movie');
  });

  it('includes trending series catalog', () => {
    const trending = CATALOGS.find(c => c.id === 'netflix-trending-series');
    expect(trending).toBeDefined();
    expect(trending!.type).toBe('series');
  });

  it('includes new movie catalog', () => {
    const newMovies = CATALOGS.find(c => c.id === 'netflix-new-movie');
    expect(newMovies).toBeDefined();
    expect(newMovies!.type).toBe('movie');
  });

  it('includes new series catalog', () => {
    const newSeries = CATALOGS.find(c => c.id === 'netflix-new-series');
    expect(newSeries).toBeDefined();
    expect(newSeries!.type).toBe('series');
  });
});

describe('mapTMDBResultToCatalogItem', () => {
  it('maps a movie result to catalog item with IMDb ID resolution', () => {
    const movieResult: TMDBMovieResult = {
      id: 550,
      title: 'Fight Club',
      poster_path: '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
      backdrop_path: '/hZkgoQYus5dXo3H8T7Uef6DNknx.jpg',
      release_date: '1999-10-15',
      vote_average: 8.4,
      overview: 'A description',
      genre_ids: [18],
    };

    const item = mapTMDBResultToCatalogItem(movieResult, 'movie');
    expect(item.name).toBe('Fight Club');
    expect(item.type).toBe('movie');
    expect(item.year).toBe(1999);
    expect(item.imdbRating).toBe('8.4');
    expect(item.poster).toContain('pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg');
  });

  it('maps a TV result to catalog item', () => {
    const tvResult: TMDBTVResult = {
      id: 1399,
      name: 'Game of Thrones',
      poster_path: '/u3bZgnGQ9T01sWNBdA7o7rWYKLb.jpg',
      backdrop_path: '/suopoADq0kQQYZzEkChWj7Wiw7O.jpg',
      first_air_date: '2011-04-17',
      vote_average: 8.4,
      overview: 'Seven noble families...',
      genre_ids: [18],
    };

    const item = mapTMDBResultToCatalogItem(tvResult, 'series');
    expect(item.name).toBe('Game of Thrones');
    expect(item.type).toBe('series');
    expect(item.year).toBe(2011);
    expect(item.imdbRating).toBe('8.4');
  });

  it('handles missing dates gracefully', () => {
    const movieResult: Partial<TMDBMovieResult> = {
      id: 1,
      title: 'No Date',
      poster_path: null,
      backdrop_path: null,
      release_date: '',
      vote_average: 0,
      overview: '',
      genre_ids: [],
    };

    const item = mapTMDBResultToCatalogItem(movieResult as TMDBMovieResult, 'movie');
    expect(item.year).toBeUndefined();
    expect(item.poster).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx jest tests/catalogs.test.ts -v`
Expected: FAIL — "Cannot find module '../src/catalogs'"

- [ ] **Step 3: Write minimal implementation**

Create `src/catalogs.ts`:

```ts
import type { CatalogDefinition, CatalogItem, TMDBMovieResult, TMDBTVResult, ContentType } from './types';

export const CATALOGS: CatalogDefinition[] = [
  {
    id: 'netflix-trending-movie',
    type: 'movie',
    title: 'Netflix Trending Movies',
    tmdbEndpoint: '/trending/movie/week',
  },
  {
    id: 'netflix-trending-series',
    type: 'series',
    title: 'Netflix Trending Series',
    tmdbEndpoint: '/trending/tv/week',
  },
  {
    id: 'netflix-new-movie',
    type: 'movie',
    title: 'Netflix New Movies',
    tmdbEndpoint: '/discover/movie',
    discoverParams: { with_watch_providers: '8', watch_region: 'US' },
    sortBy: 'primary_release_date.desc',
  },
  {
    id: 'netflix-new-series',
    type: 'series',
    title: 'Netflix New Series',
    tmdbEndpoint: '/discover/tv',
    discoverParams: { with_watch_providers: '8', watch_region: 'US' },
    sortBy: 'first_air_date.desc',
  },
  {
    id: 'netflix-popular-movie',
    type: 'movie',
    title: 'Netflix Popular Movies',
    tmdbEndpoint: '/discover/movie',
    discoverParams: { with_watch_providers: '8', watch_region: 'US' },
    sortBy: 'vote_count.desc',
  },
  {
    id: 'netflix-popular-series',
    type: 'series',
    title: 'Netflix Popular Series',
    tmdbEndpoint: '/discover/tv',
    discoverParams: { with_watch_providers: '8', watch_region: 'US' },
    sortBy: 'vote_count.desc',
  },
];

function extractYear(dateString: string): number | undefined {
  const year = parseInt(dateString.split('-')[0], 10);
  return isNaN(year) ? undefined : year;
}

export function mapTMDBResultToCatalogItem(
  result: TMDBMovieResult | TMDBTVResult,
  type: ContentType
): CatalogItem {
  const isMovie = type === 'movie';
  const dateField = isMovie
    ? (result as TMDBMovieResult).release_date
    : (result as TMDBTVResult).first_air_date;

  return {
    id: `tmdb:${result.id}`,
    type,
    name: isMovie
      ? (result as TMDBMovieResult).title
      : (result as TMDBTVResult).name,
    poster: result.poster_path
      ? `https://image.tmdb.org/t/p/w500${result.poster_path}`
      : undefined,
    posterShape: 'poster',
    year: extractYear(dateField),
    imdbRating: result.vote_average > 0 ? String(result.vote_average) : undefined,
  };
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx jest tests/catalogs.test.ts -v`
Expected: All tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/catalogs.ts tests/catalogs.test.ts
git commit -m "feat: add catalog definitions and result mapper with tests"
```

---

### Task 5: Write main addon module (TDD)

**Files:**
- Create: `src/addon.ts`
- Create: `src/manifest.ts`
- Create: `src/config.ts`
- Create: `tests/manifest.test.ts`
- Create: `tests/addon.test.ts`

- [ ] **Step 1: Write config schema**

Create `src/config.ts`:

```ts
export const ADDON_CONFIG = {
  key: 'tmdbApiKey',
  type: 'text',
  title: 'TMDB API Key',
  required: true,
};
```

- [ ] **Step 2: Write failing tests**

Create `tests/manifest.test.ts`:

```ts
import { createManifest } from '../src/manifest';

describe('createManifest', () => {
  it('returns a valid manifest with all required fields', () => {
    const manifest = createManifest();
    expect(manifest.id).toBe('community.netflix-listings');
    expect(manifest.version).toBe('0.1.0');
    expect(manifest.name).toBe('Netflix Listings');
    expect(manifest.types).toContain('movie');
    expect(manifest.types).toContain('series');
  });

  it('includes config for TMDB API key', () => {
    const manifest = createManifest();
    expect(manifest.behaviorHints?.configurable).toBe(true);
    expect(manifest.config?.length).toBeGreaterThan(0);
    expect(manifest.config![0].key).toBe('tmdbApiKey');
  });

  it('registers catalog resources', () => {
    const manifest = createManifest();
    const catalogs = manifest.catalogs;
    expect(catalogs).toBeDefined();
    expect(catalogs!.length).toBeGreaterThanOrEqual(6);
  });

  it('includes meta resource', () => {
    const manifest = createManifest();
    expect(manifest.resources).toContain('meta');
  });
});
```

Create `tests/addon.test.ts`:

```ts
import { addonBuilder } from 'stremio-addon-sdk';
import { createAddonInterface } from '../src/addon';

jest.mock('stremio-addon-sdk', () => ({
  addonBuilder: jest.fn().mockImplementation((manifest) => ({
    defineCatalogHandler: jest.fn().mockReturnThis(),
    defineMetaHandler: jest.fn().mockReturnThis(),
    defineSearchHandler: jest.fn().mockReturnThis(),
    getInterface: jest.fn().mockReturnValue({ manifest, mock: true }),
  })),
}));

describe('createAddonInterface', () => {
  it('returns an addon interface object', () => {
    const result = createAddonInterface();
    expect(result).toBeDefined();
    expect(result.manifest).toBeDefined();
  });

  it('defines catalog, meta, and search handlers', () => {
    createAddonInterface();
    expect(addonBuilder).toHaveBeenCalled();
    const builder = (addonBuilder as jest.Mock).mock.results[0].value;
    expect(builder.defineCatalogHandler).toHaveBeenCalled();
    expect(builder.defineMetaHandler).toHaveBeenCalled();
    expect(builder.defineSearchHandler).toHaveBeenCalled();
  });
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `npx jest tests/manifest.test.ts tests/addon.test.ts -v`
Expected: FAIL

- [ ] **Step 4: Write manifest module**

Create `src/manifest.ts`:

```ts
import { CATALOGS } from './catalogs';
import { ADDON_CONFIG } from './config';

export function createManifest() {
  return {
    id: 'community.netflix-listings',
    version: '0.1.0',
    name: 'Netflix Listings',
    description: 'Browse Netflix movies and series via TMDB',
    types: ['movie', 'series'] as const,
    catalogs: CATALOGS.map(c => ({
      type: c.type,
      id: c.id,
      name: c.title,
    })),
    resources: ['catalog', 'meta', 'search'] as const,
    behaviorHints: {
      configurable: true,
    },
    config: [ADDON_CONFIG],
    idPrefixes: ['tmdb:'],
  };
}
```

- [ ] **Step 5: Write main addon module**

Create `src/addon.ts`:

```ts
import { addonBuilder } from 'stremio-addon-sdk';
import { createManifest } from './manifest';
import { CATALOGS, mapTMDBResultToCatalogItem } from './catalogs';
import { TMDBClient } from './tmdb';
import type { AddonConfig, ContentType, CatalogResponse, MetaResponse } from './types';
import type { TMDBMovieDetail, TMDBTVDetail } from './types';

export function createAddonInterface() {
  const manifest = createManifest();
  const builder = new addonBuilder(manifest);

  builder.defineCatalogHandler(async ({ type, id, extra }) => {
    const config = (extra as any)?.config as AddonConfig | undefined;
    if (!config?.tmdbApiKey) {
      return { metas: [] };
    }

    const client = new TMDBClient(config.tmdbApiKey);
    const catalog = CATALOGS.find(c => c.id === id);
    if (!catalog) {
      return { metas: [] };
    }

    const page = parseInt(extra?.page as string, 10) || 1;

    try {
      let results;

      if (catalog.tmdbEndpoint.startsWith('/trending')) {
        results = await client.trending(type as 'movie' | 'tv', page);
      } else {
        const params: Record<string, string | number> = {
          ...catalog.discoverParams,
          page,
        };
        if (catalog.sortBy) {
          params.sort_by = catalog.sortBy;
        }
        if (extra?.search) {
          results = await client.search(type as 'movie' | 'tv', extra.search as string);
        } else {
          results = await client.discover(type as 'movie' | 'tv', params);
        }
      }

      const metas = results.map(r => mapTMDBResultToCatalogItem(r, type as ContentType));

      const response: CatalogResponse = {
        metas,
        cacheMaxAge: 3600,
      };

      return response;
    } catch {
      return { metas: [] };
    }
  });

  builder.defineMetaHandler(async ({ type, id, extra }) => {
    const config = (extra as any)?.config as AddonConfig | undefined;
    if (!config?.tmdbApiKey) {
      return { meta: null };
    }

    const client = new TMDBClient(config.tmdbApiKey);
    const tmdbId = parseInt(id.replace('tmdb:', ''), 10);

    try {
      const detail = (await client.details(type as 'movie' | 'tv', tmdbId)) as
        | TMDBMovieDetail
        | TMDBTVDetail;

      const isMovie = type === 'movie';
      const movieDetail = detail as TMDBMovieDetail;
      const tvDetail = detail as TMDBTVDetail;

      const externalIDs = await client.getExternalIDs(type as 'movie' | 'tv', tmdbId);

      const meta: MetaResponse['meta'] = {
        id: externalIDs.imdb_id
          ? `${externalIDs.imdb_id.replace('tt', 'tt')}`
          : `tmdb:${tmdbId}`,
        type: type as ContentType,
        name: isMovie ? movieDetail.title : tvDetail.name,
        poster: detail.poster_path
          ? `https://image.tmdb.org/t/p/w500${detail.poster_path}`
          : undefined,
        background: detail.backdrop_path
          ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`
          : undefined,
        description: detail.overview,
        releaseInfo: isMovie ? movieDetail.release_date : tvDetail.first_air_date,
        imdbRating: String(detail.vote_average),
        genres: detail.genres.map(g => g.name),
        cast: detail.credits?.cast?.slice(0, 10).map(c => c.name) || [],
        director: detail.credits?.crew
          ?.filter(c => c.job === 'Director')
          .map(c => c.name) || [],
        runtime: isMovie
          ? `${movieDetail.runtime} min`
          : tvDetail.episode_run_time?.length
            ? `${tvDetail.episode_run_time[0]} min`
            : undefined,
      };

      return { meta, cacheMaxAge: 86400 };
    } catch {
      return { meta: null };
    }
  });

  builder.defineSearchHandler(async ({ type, extra, search }) => {
    const config = (extra as any)?.config as AddonConfig | undefined;
    if (!config?.tmdbApiKey || !search) {
      return { metas: [] };
    }

    const client = new TMDBClient(config.tmdbApiKey);

    try {
      const results = await client.search(type as 'movie' | 'tv', search);
      const metas = results.map(r => mapTMDBResultToCatalogItem(r, type as ContentType));
      return { metas, cacheMaxAge: 3600 };
    } catch {
      return { metas: [] };
    }
  });

  return builder.getInterface();
}

const addonInterface = createAddonInterface();
export default addonInterface;
```

- [ ] **Step 6: Run tests to verify they pass**

Run: `npx jest -v`
Expected: All tests PASS

- [ ] **Step 7: Commit**

```bash
git add src/addon.ts src/manifest.ts src/config.ts tests/manifest.test.ts tests/addon.test.ts
git commit -m "feat: add main addon module with catalog, meta, and search handlers"
```

---

### Task 6: Create landing page and build configuration

**Files:**
- Create: `src/index.html`
- Create: `scripts/build.mjs`

- [ ] **Step 1: Create landing page HTML**

Create `src/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Netflix Listings - Stremio Addon</title>
  <script src="addon.bundle.js"></script>
  <style>
    body { font-family: sans-serif; text-align: center; padding: 40px; background: #141414; color: #fff; }
    h1 { color: #e50914; }
    a { color: #e50914; }
  </style>
</head>
<body>
  <h1>Netflix Listings</h1>
  <p>Stremio addon for browsing Netflix movies and series.</p>
  <p>Add this URL to Stremio to install.</p>
</body>
</html>
```

- [ ] **Step 2: Create build script**

Create `scripts/build.mjs`:

```js
import esbuild from 'esbuild';
import { writeFileSync, cpSync, mkdirSync } from 'fs';

mkdirSync('dist', { recursive: true });

esbuild.buildSync({
  entryPoints: ['src/addon.ts'],
  bundle: true,
  platform: 'browser',
  outfile: 'dist/addon.bundle.js',
});

cpSync('src/index.html', 'dist/index.html');

const manifest = {
  id: 'community.netflix-listings',
  version: '0.1.0',
  name: 'Netflix Listings',
  description: 'Browse Netflix movies and series via TMDB',
  types: ['movie', 'series'],
  catalogs: [
    { type: 'movie', id: 'netflix-trending-movie', name: 'Netflix Trending Movies' },
    { type: 'series', id: 'netflix-trending-series', name: 'Netflix Trending Series' },
    { type: 'movie', id: 'netflix-new-movie', name: 'Netflix New Movies' },
    { type: 'series', id: 'netflix-new-series', name: 'Netflix New Series' },
    { type: 'movie', id: 'netflix-popular-movie', name: 'Netflix Popular Movies' },
    { type: 'series', id: 'netflix-popular-series', name: 'Netflix Popular Series' },
  ],
  resources: ['catalog', 'meta', 'search'],
  behaviorHints: { configurable: true },
  config: [{ key: 'tmdbApiKey', type: 'text', title: 'TMDB API Key', required: true }],
  idPrefixes: ['tmdb:'],
};

writeFileSync('dist/manifest.json', JSON.stringify(manifest, null, 2));
```

- [ ] **Step 3: Run build to verify**

Run: `npm run build`
Expected: `dist/` contains `addon.bundle.js`, `index.html`, `manifest.json`

- [ ] **Step 4: Commit**

```bash
git add src/index.html scripts/build.mjs
git commit -m "chore: add landing page and build script"
```

---

### Task 7: Set up GitHub Actions deploy workflow

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Write GitHub Actions workflow**

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - run: npm ci

      - run: npm test

      - run: npm run build

      - uses: actions/configure-pages@v4

      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "ci: add GitHub Actions deploy workflow for GitHub Pages"
```

---

### Task 8: Clean up legacy files

**Files:**
- Remove: `addon.js`
- Remove: `server.js`

- [ ] **Step 1: Delete legacy files and update .gitignore**

```bash
git rm addon.js server.js
```

Update `.gitignore` to include `dist/`:

```
node_modules
dist
.env
```

- [ ] **Step 2: Run full test suite to confirm nothing is broken**

Run: `npx jest -v`
Expected: All tests PASS

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "chore: remove legacy JavaScript files, update gitignore"
```

---

### Task 9: Final verification

- [ ] **Step 1: Type check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Run all tests**

Run: `npx jest`
Expected: All tests pass

- [ ] **Step 3: Verify build output**

Run: `npm run build`
Expected: `dist/` contains `addon.bundle.js`, `index.html`, `manifest.json`

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: finalize implementation"
```
