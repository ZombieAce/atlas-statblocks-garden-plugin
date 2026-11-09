/**
 * What the page knows about the garden around a statblock: where notes and
 * images live. Filled in by the entry point from files the plugin's build
 * hooks write beside the site.
 */

export interface GardenRuntime {
  /** Lower-cased note path (no folder prefix, no extension) → the note's URL. */
  links: Record<string, string>;
  /** Where the garden serves vault images: `<base>img/user/<vault path>`. */
  siteBase: string;
}

export const runtime: GardenRuntime = { links: {}, siteBase: '/' };

const stripNote = (target: string): string => {
  let t = target.trim().split('#')[0] ?? '';
  try { t = decodeURI(t); } catch { /* keep as written */ }
  return t.replace(/^\/+/, '').replace(/\.md$/i, '').toLowerCase();
};

/** The URL of the note a link names (a path or a bare note name), or null when the garden holds no such note. */
export function resolveNoteUrl(target: string): string | null {
  const wanted = stripNote(target);
  if (!wanted) return null;
  const exact = runtime.links[wanted];
  if (exact) return exact;
  const byName = Object.keys(runtime.links).find((key) => key === wanted || key.endsWith(`/${wanted}`));
  return byName ? runtime.links[byName]! : null;
}

/** The URL a vault image is served from. */
export function resolveImageUrl(target: string): string {
  let path = target.trim().split('#')[0] ?? '';
  try { path = decodeURI(path); } catch { /* keep as written */ }
  path = path.replace(/^\/+/, '');
  return path ? `${runtime.siteBase}img/user/${path.split('/').map(encodeURIComponent).join('/')}` : '';
}
