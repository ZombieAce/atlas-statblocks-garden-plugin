/** There is no asset library on a published site. */
export type TokenAsset = { path: string; imagePath?: string; statblockPath?: string };

const service = {
  findTokenAssetByImagePath: (): null => null,
  getAssets: (): never[] => [],
  getCollections: (): never[] => [],
  getCollectionSettings: (): Record<string, never> => ({}),
  getDefaultCollectionId: (): null => null,
  loadedCollections: (): never[] => [],
  loadedTokenAssets: (): never[] => [],
};

export class AssetService {
  static getInstance(): typeof service { return service; }
}
