import esbuild from 'esbuild';
import { writeFileSync, cpSync, mkdirSync } from 'fs';

mkdirSync('dist', { recursive: true });

esbuild.buildSync({
  entryPoints: ['src/addon.ts'],
  bundle: true,
  platform: 'node',
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
