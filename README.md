# Netflix Listings — Stremio Addon

Browse Netflix movies and series directly in [Stremio](https://www.stremio.com/). Uses [TMDB](https://www.themoviedb.org/) to discover trending, new, and popular titles available on Netflix.

## Features

- **6 catalogs:** Trending Movies, Trending Series, New Movies, New Series, Popular Movies, Popular Series
- **Search** across Netflix titles
- **Metadata** with poster, synopsis, cast, genres, ratings
- **Configurable** — enter your own TMDB API key when adding the addon
- **Works with AIOStream/TorrentIO** — uses IMDb IDs for automatic stream matching

## Prerequisites

- A free [TMDB API key](https://www.themoviedb.org/signup) (get one at TMDB → Settings → API)

## Adding to Stremio

1. **Open Stremio**
2. **Addons** → **Add from URL**
3. Enter: `https://<your-username>.github.io/netflix-listings/`
4. Paste your **TMDB API Key** when prompted
5. Browse the Netflix catalogs

Streams will be provided automatically by other addons you have installed (AIOStream, TorrentIO, etc.).

## Development

```bash
npm install
npm run dev       # Watch mode build
npm test          # Run tests
npm run build     # Full build (typecheck → test → bundle)
```

## Deploy to GitHub Pages

1. Create a GitHub repository and push:
   ```bash
   git remote add origin https://github.com/<username>/netflix-listings.git
   git push -u origin master
   ```
2. In GitHub repo **Settings → Pages**, set source to **GitHub Actions**
3. On every push to `master`, GitHub Actions runs tests, builds, and deploys

## Architecture

The addon runs client-side in Stremio's internal runtime. It makes direct TMDB API calls using the user's API key. Catalog and metadata are fetched live — no pre-built data files.

- `src/addon.ts` — Defines catalog, meta, and search handlers
- `src/tmdb.ts` — TMDB API client wrapper
- `src/catalogs.ts` — Catalog configurations (extensible array — add more by appending)
- `dist/` — Build output deployed to GitHub Pages

## Tech Stack

TypeScript, stremio-addon-sdk, TMDB API, Jest, esbuild, GitHub Actions
