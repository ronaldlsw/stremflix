import { addonBuilder } from 'stremio-addon-sdk';
import { createManifest } from './manifest';
import { CATALOGS, mapTMDBResultToCatalogItem } from './catalogs';
import { TMDBClient } from './tmdb';
import type { AddonConfig, ContentType, CatalogResponse, MetaResponse } from './types';
import type { TMDBMovieDetail, TMDBTVDetail } from './types';

function toTMDBType(type: string): 'movie' | 'tv' {
  return type === 'series' ? 'tv' : 'movie';
}

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
    const tmdbType = toTMDBType(type);

    try {
      let results;

      if (catalog.tmdbEndpoint.startsWith('/trending')) {
        results = await client.trending(tmdbType, page);
      } else if (extra?.search) {
        results = await client.search(tmdbType, extra.search as string);
      } else {
        const params: Record<string, string | number> = {
          ...catalog.discoverParams,
          page,
        };
        if (catalog.sortBy) {
          params.sort_by = catalog.sortBy;
        }
        results = await client.discover(tmdbType, params);
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
    const tmdbType = toTMDBType(type);
    const isMovie = type === 'movie';

    try {
      const detail = (await client.details(tmdbType, tmdbId)) as
        | TMDBMovieDetail
        | TMDBTVDetail;

      const movieDetail = detail as TMDBMovieDetail;
      const tvDetail = detail as TMDBTVDetail;

      let imdbId: string | null = null;
      try {
        const externalIDs = await client.getExternalIDs(tmdbType, tmdbId);
        imdbId = externalIDs.imdb_id;
      } catch {
        // External ID lookup is non-critical
      }

      const meta: MetaResponse['meta'] = {
        id: imdbId || `tmdb:${tmdbId}`,
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
    const tmdbType = toTMDBType(type);

    try {
      const results = await client.search(tmdbType, search);
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
