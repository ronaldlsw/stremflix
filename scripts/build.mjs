import esbuild from 'esbuild';
import { writeFileSync, cpSync, mkdirSync, readdirSync, statSync } from 'fs';
import { join, dirname } from 'path';

const TMDB_API_KEY = process.env.TMDB_API_KEY;
if (!TMDB_API_KEY) {
  console.error('Fatal: TMDB_API_KEY environment variable is required');
  process.exit(1);
}

const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const CATALOGS = [
  {
    id: 'netflix-trending-movie', type: 'movie', title: 'Netflix Trending Movies',
    fetch: () => tmdbFetch('/trending/movie/week'),
  },
  {
    id: 'netflix-trending-series', type: 'series', title: 'Netflix Trending Series',
    fetch: () => tmdbFetch('/trending/tv/week'),
  },
  {
    id: 'netflix-new-movie', type: 'movie', title: 'Netflix New Movies',
    fetch: () => tmdbFetch('/discover/movie', {
      with_watch_providers: '8', watch_region: 'US', sort_by: 'primary_release_date.desc',
    }),
  },
  {
    id: 'netflix-new-series', type: 'series', title: 'Netflix New Series',
    fetch: () => tmdbFetch('/discover/tv', {
      with_watch_providers: '8', watch_region: 'US', sort_by: 'first_air_date.desc',
    }),
  },
  {
    id: 'netflix-popular-movie', type: 'movie', title: 'Netflix Popular Movies',
    fetch: () => tmdbFetch('/discover/movie', {
      with_watch_providers: '8', watch_region: 'US', sort_by: 'vote_count.desc',
    }),
  },
  {
    id: 'netflix-popular-series', type: 'series', title: 'Netflix Popular Series',
    fetch: () => tmdbFetch('/discover/tv', {
      with_watch_providers: '8', watch_region: 'US', sort_by: 'vote_count.desc',
    }),
  },
];

async function tmdbFetch(path, params = {}) {
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, String(v));
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB ${res.status} for ${url}`);
  return res.json();
}

async function tmdbFetchWithRetry(path, params = {}, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await tmdbFetch(path, params);
    } catch (err) {
      if (attempt === retries) throw err;
      const wait = (attempt + 1) * 1000;
      console.warn(`  Retry ${attempt + 1}/${retries} for ${path} in ${wait}ms`);
      await sleep(wait);
    }
  }
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function extractYear(dateStr) {
  if (!dateStr) return undefined;
  const y = parseInt(dateStr.split('-')[0], 10);
  return isNaN(y) ? undefined : y;
}

function mapToCatalogItem(r, type) {
  const isMovie = type === 'movie';
  return {
    id: `tmdb:${r.id}`,
    type,
    name: isMovie ? r.title : r.name,
    poster: r.poster_path ? `${IMAGE_BASE}/w500${r.poster_path}` : undefined,
    posterShape: 'poster',
    year: extractYear(isMovie ? r.release_date : r.first_air_date),
    imdbRating: r.vote_average > 0 ? String(r.vote_average) : undefined,
  };
}

function writeJSON(filePath, data) {
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function dirSize(dir) {
  let size = 0;
  for (const entry of readdirSync(dir, { recursive: true })) {
    const p = join(dir, entry);
    try { if (statSync(p).isFile()) size += statSync(p).size; } catch {}
  }
  return Math.round(size / 1024);
}

async function main() {
  mkdirSync('dist', { recursive: true });

  // 1. Bundle the addon JavaScript
  console.log('[1/4] Bundling addon...');
  esbuild.buildSync({
    entryPoints: ['src/addon.ts'],
    bundle: true,
    platform: 'node',
    outfile: 'dist/addon.bundle.js',
  });
  cpSync('src/index.html', 'dist/index.html');

  // 2. Fetch all catalogs
  console.log('[2/4] Fetching catalogs...');
  const seen = new Map();

  for (const catalog of CATALOGS) {
    process.stdout.write(`  ${catalog.title}... `);
    try {
      const data = await tmdbFetchWithRetry(catalog.fetch());
      const items = (data.results || []).map(r => mapToCatalogItem(r, catalog.type));

      writeJSON(`dist/catalog/${catalog.type}/${catalog.id}.json`, {
        metas: items, cacheMaxAge: 86400,
      });

      for (const item of items) {
        if (!seen.has(item.id)) {
          seen.set(item.id, { type: catalog.type, tmdbId: parseInt(item.id.replace('tmdb:', ''), 10) });
        }
      }
      console.log(`${items.length} items`);
    } catch (err) {
      console.error(`FAILED: ${err.message}`);
    }
  }

  // 3. Fetch meta for all unique items
  const entries = [...seen.entries()];
  console.log(`[3/4] Fetching meta for ${entries.length} unique items...`);

  const CONCURRENCY = 3;
  const BATCH_DELAY = 1200;
  let metaOk = 0, metaFail = 0;

  for (let i = 0; i < entries.length; i += CONCURRENCY) {
    const batch = entries.slice(i, i + CONCURRENCY);

    await Promise.all(batch.map(async ([itemId, info]) => {
      try {
        const detail = await tmdbFetchWithRetry(`/${info.type}/${info.tmdbId}`, { append_to_response: 'credits' });
        const externalIds = await tmdbFetchWithRetry(`/${info.type}/${info.tmdbId}/external_ids`);

        const isMovie = info.type === 'movie';
        const meta = {
          id: externalIds.imdb_id || itemId,
          type: info.type,
          name: isMovie ? detail.title : detail.name,
          poster: detail.poster_path ? `${IMAGE_BASE}/w500${detail.poster_path}` : undefined,
          background: detail.backdrop_path ? `${IMAGE_BASE}/w1280${detail.backdrop_path}` : undefined,
          description: detail.overview,
          releaseInfo: isMovie ? detail.release_date : detail.first_air_date,
          imdbRating: String(detail.vote_average),
          genres: detail.genres?.map(g => g.name) || [],
          cast: detail.credits?.cast?.slice(0, 10).map(c => c.name) || [],
          director: detail.credits?.crew?.filter(c => c.job === 'Director').map(c => c.name) || [],
          runtime: isMovie
            ? `${detail.runtime} min`
            : (detail.episode_run_time?.[0] ? `${detail.episode_run_time[0]} min` : undefined),
        };

        writeJSON(`dist/meta/${info.type}/${itemId}.json`, { meta, cacheMaxAge: 86400 });
        metaOk++;
        process.stdout.write('+');
      } catch (err) {
        metaFail++;
        process.stdout.write('x');
      }
    }));

    if (i + CONCURRENCY < entries.length) {
      await sleep(BATCH_DELAY);
    }
  }
  console.log(`\n  ✓ ${metaOk} OK, ✗ ${metaFail} failed`);

  // 4. Write manifest
  console.log('[4/4] Writing manifest...');
  writeJSON('dist/manifest.json', {
    id: 'community.netflix-listings',
    version: '0.1.0',
    name: 'Netflix Listings',
    description: 'Browse Netflix movies and series available on Netflix',
    types: ['movie', 'series'],
    catalogs: CATALOGS.map(c => ({ type: c.type, id: c.id, name: c.title })),
    resources: ['catalog', 'meta'],
    idPrefixes: ['tmdb:'],
  });

  const size = dirSize('dist');
  console.log(`\nBuild complete! ${size}KB in dist/`);
  console.log(`  ${CATALOGS.length} catalogs, ${metaOk} meta entries`);
}

main().catch(err => {
  console.error('\nBuild failed:', err.message);
  process.exit(1);
});
