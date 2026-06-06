import { CATALOGS } from './catalogs';

export function createManifest() {
  return {
    id: 'community.netflix-listings',
    version: '0.1.0',
    name: 'Netflix Listings',
    description: 'Browse Netflix movies and series on Netflix',
    types: ['movie', 'series'] as const,
    catalogs: CATALOGS.map(c => ({
      type: c.type,
      id: c.id,
      name: c.title,
    })),
    resources: ['catalog', 'meta'] as const,
    idPrefixes: ['tmdb:'],
  };
}
