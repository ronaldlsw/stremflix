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

  it('registers 6 catalog resources', () => {
    const manifest = createManifest();
    const catalogs = manifest.catalogs;
    expect(catalogs).toBeDefined();
    expect(catalogs!.length).toBeGreaterThanOrEqual(6);
  });

  it('includes catalog and meta resources but not search', () => {
    const manifest = createManifest();
    expect(manifest.resources).toContain('catalog');
    expect(manifest.resources).toContain('meta');
    expect(manifest.resources).not.toContain('search');
  });

  it('has no config section', () => {
    const manifest = createManifest();
    expect('config' in manifest).toBe(false);
    expect('behaviorHints' in manifest).toBe(false);
  });
});
