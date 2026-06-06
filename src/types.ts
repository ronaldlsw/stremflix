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
