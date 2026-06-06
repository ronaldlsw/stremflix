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
