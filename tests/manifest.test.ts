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
