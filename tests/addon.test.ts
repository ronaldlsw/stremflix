import { addonBuilder } from 'stremio-addon-sdk';
import { createAddonInterface } from '../src/addon';

jest.mock('stremio-addon-sdk', () => ({
  addonBuilder: jest.fn().mockImplementation((manifest) => ({
    defineCatalogHandler: jest.fn().mockReturnThis(),
    defineMetaHandler: jest.fn().mockReturnThis(),
    defineSearchHandler: jest.fn().mockReturnThis(),
    getInterface: jest.fn().mockReturnValue({ manifest, mock: true }),
  })),
}));

describe('createAddonInterface', () => {
  it('returns an addon interface object', () => {
    const result = createAddonInterface();
    expect(result).toBeDefined();
    expect(result.manifest).toBeDefined();
  });

  it('defines catalog, meta, and search handlers', () => {
    createAddonInterface();
    expect(addonBuilder).toHaveBeenCalled();
    const builder = (addonBuilder as jest.Mock).mock.results[0].value;
    expect(builder.defineCatalogHandler).toHaveBeenCalled();
    expect(builder.defineMetaHandler).toHaveBeenCalled();
    expect(builder.defineSearchHandler).toHaveBeenCalled();
  });
});
