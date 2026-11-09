import './host';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { frontmatterCreature } from '@atlas/creatures/linkedCreature';
import { builtInTemplate } from '@atlas/statblocks/library/builtInTemplates';
import { builtInEntry, readTemplateFile } from '@atlas/statblocks/library/templateFiles';
import { AUTO_TEMPLATE_ID } from '@atlas/statblocks/model/autoTemplate';
import type { LibraryTemplate, ResolvedStatblock, TemplateLookup } from '@atlas/statblocks/model/resolvedTypes';
import { frontmatterSource } from '@atlas/statblocks/notes/statblockSource';
import { StatblockSheet } from '@atlas/statblocks/render/StatblockSheet';
import { resolveFantasy, resolveNative } from '@atlas/statblocks/resolve/resolveStatblock';
import { createGardenApp } from './gardenApp';
import { runtime } from './runtime';

const PLUGIN_ID = 'atlas-statblocks';
const MOUNT_SELECTOR = '.atlas-statblock-mount';

/** What the build hook leaves in each mount: the note's path and its properties. */
interface MountData {
  path: string;
  frontmatter: Record<string, unknown>;
}

interface CustomTemplateFile { path: string; text: string }

const app = createGardenApp();
const base = ((): string => {
  const src = (document.currentScript as HTMLScriptElement | null)?.src ?? '';
  const at = src.indexOf(`/plugins/${PLUGIN_ID}/`);
  return at >= 0 ? src.slice(0, at + 1) : '/';
})();
runtime.siteBase = base;

async function fetchJson<T>(name: string): Promise<T | null> {
  try {
    const response = await fetch(`${base}plugins/${PLUGIN_ID}/${name}`);
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

let ready: Promise<TemplateLookup> | null = null;

/** Built-in templates, then any the garden publishes (`templates.json`, written at build time from notes). */
function templateLookup(): Promise<TemplateLookup> {
  ready ??= (async (): Promise<TemplateLookup> => {
    const [links, custom] = await Promise.all([
      fetchJson<Record<string, string>>('links.json'),
      fetchJson<CustomTemplateFile[]>('templates.json'),
    ]);
    if (links) runtime.links = links;
    const byId = new Map<string, LibraryTemplate>();
    for (const file of custom ?? []) {
      const entry = readTemplateFile(file.path, file.text).entry;
      if (entry && !byId.has(entry.template.id)) byId.set(entry.template.id, entry);
    }
    return {
      get: (id: string): LibraryTemplate | null => {
        const builtIn = builtInTemplate(id);
        return builtIn ? builtInEntry(builtIn) : (byId.get(id) ?? null);
      },
    };
  })();
  return ready;
}

function resolve(data: MountData, templates: TemplateLookup): ResolvedStatblock | null {
  const source = frontmatterSource(data.frontmatter);
  if (source?.kind === 'atlas') return resolveNative(data.path, source, data.frontmatter, templates);
  if (source?.kind === 'fs-frontmatter') {
    // Fantasy Statblocks frontmatter, with that plugin absent: Atlas draws it with the auto template.
    const creature = frontmatterCreature(data.frontmatter, data.path);
    return resolveFantasy(data.path, source, creature, { loaded: false, layoutName: null });
  }
  return null;
}

function GardenStatblock({ statblock }: { statblock: ResolvedStatblock }): React.JSX.Element | null {
  const { template } = statblock;
  if (!template) return null;
  return (
    <div
      className="atlas-vtt-plugin atlas-fantasy-statblock atlas-linked-statblock atlas-garden-statblock"
      data-template-status={statblock.templateStatus ?? undefined}
    >
      <StatblockSheet
        template={template}
        name={statblock.lookName ?? AUTO_TEMPLATE_ID}
        fields={statblock.fields}
        variant="full"
        app={app}
        sourcePath={statblock.path}
        rollBonuses="preview"
      />
    </div>
  );
}

function message(mount: HTMLElement, text: string): void {
  const note = document.createElement('p');
  note.className = 'atlas-garden-statblock-message';
  note.textContent = text;
  mount.replaceChildren(note);
}

async function mountOne(mount: HTMLElement, templates: TemplateLookup): Promise<void> {
  const raw = mount.getAttribute('data-statblock');
  if (!raw) return;
  try {
    const data = JSON.parse(raw) as MountData;
    mount.removeAttribute('data-statblock');
    const statblock = resolve(data, templates);
    if (!statblock?.template) {
      message(mount, 'This note has no statblock Atlas can draw (it needs "statblock: true" and an "atlas-template").');
      return;
    }
    if (statblock.templateStatus === 'missing') {
      console.warn(`[atlas-statblocks] Template "${(statblock.source as { templateId?: string }).templateId}" is not built in and was not published; "${data.path}" is drawn with the auto layout.`);
    }
    mount.replaceChildren();
    createRoot(mount).render(<GardenStatblock statblock={statblock} />);
  } catch (error) {
    console.error('[atlas-statblocks] Could not draw a statblock', error);
    message(mount, 'This statblock could not be drawn.');
  }
}

/** Draws every statblock fence on the page; safe to call again after the page changes. */
export async function mountAll(root: ParentNode = document): Promise<void> {
  const mounts = Array.from(root.querySelectorAll<HTMLElement>(`${MOUNT_SELECTOR}:not([data-atlas-ready])`));
  if (mounts.length === 0) return;
  mounts.forEach((mount) => mount.setAttribute('data-atlas-ready', 'true'));
  const templates = await templateLookup();
  await Promise.all(mounts.map((mount) => mountOne(mount, templates)));
}

(window as unknown as { AtlasStatblocks: { mountAll: typeof mountAll } }).AtlasStatblocks = { mountAll };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => void mountAll());
else void mountAll();
