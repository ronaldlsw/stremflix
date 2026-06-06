# Netflix Listings — Stremio Addon

Browse Netflix movies and series directly in [Stremio](https://www.stremio.com/). Uses [TMDB](https://www.themoviedb.org/) to discover trending, new, and popular titles available on Netflix.

## Features

- **6 catalogs:** Trending Movies, Trending Series, New Movies, New Series, Popular Movies, Popular Series
- **Metadata** with poster, synopsis, cast, genres, ratings
- **Works with AIOStream/TorrentIO** — uses IMDb IDs for automatic stream matching
- **Daily refresh** — GitHub Actions fetches fresh TMDB data every day

## Adding to Stremio

1. **Open Stremio**
2. **Addons** → **Add from URL**
3. Enter: `https://ronaldlsw.github.io/stremflix/manifest.json`

Streams will be provided automatically by other addons you have installed (AIOStream, TorrentIO, etc.).

## Development

```bash
npm install
TMDB_API_KEY=your_key node scripts/build.mjs   # Build with live TMDB data
npm test                                         # Run tests
```

## Deployment

This addon uses **pre-built static files** deployed to GitHub Pages. A GitHub Actions workflow:

- Runs **daily at 6AM UTC** (`cron: 0 6 * * *`)
- Runs on **every push** to `master`
- Fetches live TMDB data, generates static catalog/meta JSON files
- Deploys to GitHub Pages

**Setup:**
1. Add your TMDB API key as a GitHub Secret named `TMDB_API_KEY` in your repo settings
2. GitHub Actions handles the rest

## Architecture

Data is pre-built at deploy time, not fetched live. GitHub Actions generates all catalog and meta JSON files using the TMDB API, then publishes them as static files.

```
GitHub Actions (daily + on push)
  └─┬─ Fetches TMDB data with API key from Secrets
    ├─ Generates catalog/*.json
    ├─ Generates meta/*.json
    └─ Deploys to GitHub Pages
         │
Stremio fetches pre-built JSON directly from GitHub Pages
```

- `src/addon.ts` — Defines catalog and meta handlers
- `src/tmdb.ts` — TMDB API client wrapper
- `src/catalogs.ts` — Catalog configurations (extensible array)
- `scripts/build.mjs` — Build script that fetches TMDB and generates static files
- `dist/` — Build output deployed to GitHub Pages

## Tech Stack

TypeScript, stremio-addon-sdk, TMDB API, Jest, esbuild, GitHub Actions, GitHub Pages
