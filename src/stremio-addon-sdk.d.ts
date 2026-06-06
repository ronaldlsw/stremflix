declare module 'stremio-addon-sdk' {
  interface Manifest {
    id: string;
    version: string;
    name: string;
    description?: string;
    types: readonly string[];
    catalogs?: Array<{
      type: string;
      id: string;
      name: string;
    }>;
    resources?: readonly string[];
    behaviorHints?: {
      configurable?: boolean;
    };
    config?: Array<{
      key: string;
      type: string;
      title: string;
      required?: boolean;
    }>;
    idPrefixes?: string[];
  }

  interface AddonInterface {
    manifest: Manifest;
    get: (path: string) => any;
  }

  interface CatalogHandlerArgs {
    type: string;
    id: string;
    extra?: Record<string, any>;
  }

  interface MetaHandlerArgs {
    type: string;
    id: string;
    extra?: Record<string, any>;
  }

  interface SearchHandlerArgs {
    type: string;
    search: string;
    extra?: Record<string, any>;
  }

  export class addonBuilder {
    constructor(manifest: Manifest);
    defineCatalogHandler(handler: (args: CatalogHandlerArgs) => Promise<any>): this;
    defineMetaHandler(handler: (args: MetaHandlerArgs) => Promise<any>): this;
    defineSearchHandler(handler: (args: SearchHandlerArgs) => Promise<any>): this;
    getInterface(): AddonInterface;
  }
}
