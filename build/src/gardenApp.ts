import type { App } from 'obsidian';
import { TFile } from 'obsidian';
import { resolveImageUrl, resolveNoteUrl } from './runtime';

function fileAt(path: string): TFile {
  const file = new TFile();
  const name = path.slice(path.lastIndexOf('/') + 1);
  const dot = name.lastIndexOf('.');
  file.path = path;
  file.name = name;
  file.extension = dot > 0 ? name.slice(dot + 1) : '';
  file.basename = dot > 0 ? name.slice(0, dot) : name;
  return file;
}

/**
 * The slice of Obsidian's `App` the statblock renderer reads, answered from
 * the published site: vault paths become image URLs, links become note URLs,
 * and a click on an internal link navigates there.
 */
export function createGardenApp(): App {
  const app = {
    vault: {
      getFileByPath: (path: string): TFile => fileAt(path),
      getAbstractFileByPath: (path: string): TFile => fileAt(path),
      getResourcePath: (file: TFile): string => resolveImageUrl(file.path),
      on: (): object => ({}),
      offref: (): void => {},
    },
    metadataCache: {
      getFirstLinkpathDest: (path: string): TFile => fileAt(path),
      on: (): object => ({}),
      offref: (): void => {},
    },
    workspace: {
      openLinkText: async (target: string): Promise<void> => {
        const url = resolveNoteUrl(target);
        if (url) window.location.assign(url);
      },
      trigger: (): void => {},
      onLayoutReady: (callback: () => void): void => callback(),
    },
  };
  return app as unknown as App;
}
