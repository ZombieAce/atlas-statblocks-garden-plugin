/**
 * A small, safe Markdown renderer for statblock text on a published site.
 * Obsidian draws statblock values with its own Markdown engine; a garden has
 * none in the browser, so this covers what statblock text uses: marks, links,
 * wiki links, images, lists, quotes, tables and paragraphs. Every character of
 * the source is escaped; only the tags written here reach the page.
 */

export type LinkResolver = (target: string, sourcePath: string) => string | null;

export interface MarkdownContext {
  resolveLink: LinkResolver;
  resolveImage: (target: string, sourcePath: string) => string;
  sourcePath: string;
}

const escapeHtml = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const SAFE_URL = /^(?:https?:|mailto:|\/|#|\.{0,2}\/)/i;
const safeUrl = (url: string): string => (SAFE_URL.test(url.trim()) ? url.trim() : '');

const noteName = (target: string): string => {
  const name = target.split('#')[0]!.split('/').pop() ?? '';
  return name.replace(/\.md$/i, '');
};

function wikiLink(inner: string, embed: boolean, ctx: MarkdownContext): string {
  const [rawTarget = '', ...rest] = inner.split('|');
  const alias = rest.join('|').trim();
  const target = rawTarget.trim();
  if (embed) {
    const src = ctx.resolveImage(target, ctx.sourcePath);
    const size = /^\d+(?:x\d+)?$/.test(alias) ? alias.split('x') : [];
    const dims = size[0] ? ` width="${size[0]}"${size[1] ? ` height="${size[1]}"` : ''}` : '';
    return src ? `<img src="${escapeHtml(src)}" alt="${escapeHtml(noteName(target))}"${dims} loading="lazy">` : '';
  }
  const label = alias || (target.includes('#') && !target.startsWith('#') ? `${noteName(target)} > ${target.split('#')[1]}` : noteName(target) || target.replace(/^#/, ''));
  const href = target.startsWith('#') ? target : ctx.resolveLink(target.split('#')[0] ?? target, ctx.sourcePath);
  if (!href) return `<span class="atlas-sb-unresolved-link">${escapeHtml(label)}</span>`;
  const anchor = target.includes('#') && !target.startsWith('#') ? `#${target.split('#')[1]!.toLowerCase().replace(/\s+/g, '-')}` : '';
  return `<a class="internal-link" data-href="${escapeHtml(target)}" href="${escapeHtml(href + anchor)}">${escapeHtml(label)}</a>`;
}

/** Inline Markdown to HTML. */
export function renderInline(source: string, ctx: MarkdownContext): string {
  const stash: string[] = [];
  const keep = (html: string): string => `\u0000${stash.push(html) - 1}\u0000`;
  let text = source;

  text = text.replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_m, _t, code: string) => keep(`<code>${escapeHtml(code.trim())}</code>`));
  text = text.replace(/\\([\\`*_{}[\]()#+\-.!|~=<>$%])/g, (_m, ch: string) => keep(escapeHtml(ch)));
  text = text.replace(/(!?)\[\[([^\]]+)\]\]/g, (_m, bang: string, inner: string) => keep(wikiLink(inner, bang === '!', ctx)));
  text = text.replace(/(!?)\[([^\]]*)\]\(\s*<?([^)>]*?)>?(?:\s+"[^"]*")?\s*\)/g, (_m, bang: string, label: string, url: string) => {
    if (bang) {
      const src = /^https?:/i.test(url) ? url : ctx.resolveImage(decodeURI(url), ctx.sourcePath);
      return src ? keep(`<img src="${escapeHtml(src)}" alt="${escapeHtml(label)}" loading="lazy">`) : '';
    }
    if (/^https?:|^mailto:/i.test(url)) {
      return keep(`<a href="${escapeHtml(safeUrl(url))}" rel="noopener noreferrer" target="_blank">${escapeHtml(label)}</a>`);
    }
    const target = decodeURI(url).replace(/\.md$/i, '');
    const href = url.startsWith('#') ? url : ctx.resolveLink(target, ctx.sourcePath);
    return href
      ? keep(`<a class="internal-link" data-href="${escapeHtml(target)}" href="${escapeHtml(href)}">${escapeHtml(label)}</a>`)
      : keep(`<span class="atlas-sb-unresolved-link">${escapeHtml(label)}</span>`);
  });
  text = text.replace(/(^|[\s(])(https?:\/\/[^\s<)]+)/g, (_m, lead: string, url: string) =>
    `${lead}${keep(`<a href="${escapeHtml(url)}" rel="noopener noreferrer" target="_blank">${escapeHtml(url)}</a>`)}`);

  text = escapeHtml(text);
  text = text
    .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(?=\S)([\s\S]*?\S)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^\w*])__(?=\S)([\s\S]*?\S)__(?![\w])/g, '$1<strong>$2</strong>')
    .replace(/\*(?=\S)([\s\S]*?\S)\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_(?=\S)([\s\S]*?\S)_(?![\w])/g, '$1<em>$2</em>')
    .replace(/~~(?=\S)([\s\S]*?\S)~~/g, '<del>$1</del>')
    .replace(/==(?=\S)([\s\S]*?\S)==/g, '<mark>$1</mark>')
    .replace(/\n/g, '<br>');
  // eslint-disable-next-line no-control-regex
  return text.replace(/\u0000(\d+)\u0000/g, (_m, i: string) => stash[Number(i)] ?? '');
}

const BULLET = /^\s{0,3}[-*+]\s+(.*)$/;
const NUMBERED = /^\s{0,3}\d{1,9}[.)]\s+(.*)$/;
const QUOTE = /^\s{0,3}>\s?(.*)$/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.*?)\s*#*\s*$/;
const TABLE_RULE = /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/;

const cells = (line: string): string[] => line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|'));

/** Block Markdown to HTML (paragraphs, lists, quotes, headings, tables, rules). */
export function renderMarkdown(source: string, ctx: MarkdownContext): string {
  const lines = source.replace(/\r\n?/g, '\n').split('\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i]!;
    if (line.trim() === '') { i += 1; continue; }

    const heading = HEADING.exec(line);
    if (heading) { out.push(`<h${heading[1]!.length}>${renderInline(heading[2]!, ctx)}</h${heading[1]!.length}>`); i += 1; continue; }
    if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) { out.push('<hr>'); i += 1; continue; }

    if (line.includes('|') && TABLE_RULE.test(lines[i + 1] ?? '')) {
      const head = cells(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i]!.includes('|') && lines[i]!.trim() !== '') { rows.push(cells(lines[i]!)); i += 1; }
      const th = head.map((c) => `<th>${renderInline(c, ctx)}</th>`).join('');
      const body = rows.map((r) => `<tr>${r.map((c) => `<td>${renderInline(c, ctx)}</td>`).join('')}</tr>`).join('');
      out.push(`<table><thead><tr>${th}</tr></thead><tbody>${body}</tbody></table>`);
      continue;
    }

    const list = BULLET.test(line) ? BULLET : NUMBERED.test(line) ? NUMBERED : null;
    if (list) {
      const tag = list === BULLET ? 'ul' : 'ol';
      const items: string[] = [];
      while (i < lines.length && list.test(lines[i]!)) { items.push(`<li>${renderInline(list.exec(lines[i]!)![1]!, ctx)}</li>`); i += 1; }
      out.push(`<${tag}>${items.join('')}</${tag}>`);
      continue;
    }

    if (QUOTE.test(line)) {
      const quoted: string[] = [];
      while (i < lines.length && QUOTE.test(lines[i]!)) { quoted.push(QUOTE.exec(lines[i]!)![1]!); i += 1; }
      out.push(`<blockquote>${renderMarkdown(quoted.join('\n'), ctx)}</blockquote>`);
      continue;
    }

    const para: string[] = [];
    while (i < lines.length && lines[i]!.trim() !== '' && !HEADING.test(lines[i]!) && !BULLET.test(lines[i]!) && !NUMBERED.test(lines[i]!) && !QUOTE.test(lines[i]!)) {
      para.push(lines[i]!); i += 1;
    }
    out.push(`<p>${renderInline(para.join('\n'), ctx)}</p>`);
  }
  return out.join('');
}
