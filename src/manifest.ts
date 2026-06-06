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
