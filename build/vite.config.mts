/**
 * Builds the browser bundle of the garden plugin from Atlas VTT's own
 * statblock renderer. Run through `build.mjs`, which fetches Atlas at the
 * pinned commit and passes its path in ATLAS_SRC.
 */
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const atlas = path.resolve(process.env.ATLAS_SRC ?? path.join(here, '.atlas'));
const atlasApp = path.join(atlas, 'src/app');

/**
 * Parts of Atlas that belong to the map (dice rolling, token assets, the
 * Fantasy Statblocks bridge) are replaced by inert versions: a published page
 * draws a statblock and nothing more. Keys are Atlas source paths.
 */
const STUBS: Record<string, string> = {
  'src/app/services/statblockDiceLinks': 'statblockDiceLinks.ts',
  'src/app/services/statblockHitPoints': 'statblockHitPoints.ts',
  'src/app/services/statblockRolls': 'statblockRolls.ts',
  'src/app/services/AssetService': 'AssetService.ts',
  'src/app/services/FantasyStatblocksService': 'FantasyStatblocksService.ts',
  'src/app/services/SettingsService': 'SettingsService.ts',
  'src/app/i18n/languages': 'languages.ts',
};

function stubAtlasServices(): Plugin {
  return {
    name: 'atlas-garden-stubs',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer) return null;
      let target: string;
      if (source.startsWith('@atlas/')) target = path.join(atlasApp, source.slice('@atlas/'.length));
      else if (source.startsWith('.')) target = path.resolve(path.dirname(importer), source);
      else if (path.isAbsolute(source)) target = source;
      else return null;
      const rel = path.relative(atlas, target).split(path.sep).join('/');
      const stub = STUBS[rel];
      return stub ? path.join(here, 'stubs', stub) : null;
    },
  };
}

export default defineConfig({
  root: here,
  plugins: [stubAtlasServices(), react()],
  css: { preprocessorOptions: { scss: { quietDeps: true, silenceDeprecations: ['import', 'legacy-js-api'] } } },
  resolve: {
    alias: {
      obsidian: path.join(here, 'src/obsidian-shim.ts'),
      '@atlas': atlasApp,
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
    __ATLAS_RELEASE_BUILD__: 'true',
  },
  build: {
    outDir: path.join(here, 'dist'),
    emptyOutDir: true,
    cssCodeSplit: false,
    sourcemap: false,
    minify: 'esbuild',
    lib: { entry: path.join(here, 'src/entry.tsx'), formats: ['iife'], name: 'AtlasStatblocksBundle', fileName: () => 'atlas-statblocks.js' },
    rollupOptions: { output: { assetFileNames: () => 'atlas-statblocks-base.css' } },
  },
});
