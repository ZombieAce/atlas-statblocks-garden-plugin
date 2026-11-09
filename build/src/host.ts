/**
 * Must be the first import of the bundle. Atlas expects the application that
 * owns the map to supply its DOM operations and language before its modules
 * run; on a published page those come from the browser itself.
 */
import { installDomHost } from '@atlas/host/dom';
import { setLocale } from '@atlas/i18n';
import { TRANSLATIONS } from '@atlas/i18n/languages';

installDomHost({
  createCanvas: (doc = document, size) => {
    const canvas = doc.createElement('canvas');
    if (size) { canvas.width = size.width; canvas.height = size.height; }
    return canvas;
  },
  createDiv: (parent, cls) => {
    const div = parent.ownerDocument.createElement('div');
    div.className = cls;
    parent.appendChild(div);
    return div;
  },
  createVideo: (doc) => doc.createElement('video'),
  ownerWindow: (node) => (node.ownerDocument ?? document).defaultView ?? window,
  activeDocument: () => document,
});

// Obsidian adds these globals and element helpers; a few modules reach for them.
const g = globalThis as unknown as Record<string, unknown>;
g.activeDocument ??= document;
g.activeWindow ??= window;
g.createEl ??= (tag: string, info?: { cls?: string; text?: string; attr?: Record<string, string> }) => {
  const el = document.createElement(tag);
  if (info?.cls) el.className = info.cls;
  if (info?.text) el.textContent = info.text;
  for (const [k, v] of Object.entries(info?.attr ?? {})) el.setAttribute(k, String(v));
  return el;
};
const proto = Element.prototype as unknown as Record<string, unknown>;
proto.addClass ??= function (this: Element, ...c: string[]) { this.classList.add(...c); };
proto.removeClass ??= function (this: Element, ...c: string[]) { this.classList.remove(...c); };
proto.toggleClass ??= function (this: Element, c: string, on: boolean) { this.classList.toggle(c, on); };
proto.hasClass ??= function (this: Element, c: string) { return this.classList.contains(c); };
proto.empty ??= function (this: Element) { this.replaceChildren(); };
Object.defineProperty(Node.prototype, 'win', { configurable: true, get(this: Node) { return (this.ownerDocument ?? document).defaultView ?? window; } });

setLocale('en', TRANSLATIONS);
