/**
 * Stands in for the `obsidian` module in the garden bundle. The statblock
 * renderer imports Obsidian classes and helpers; on a published page none of
 * them exist, so the ones that matter (Markdown, links, platform) are small
 * working versions and the rest are inert classes that satisfy the imports.
 */

import { renderMarkdown } from './markdown';
import { resolveImageUrl, resolveNoteUrl } from './runtime';

class Stub { constructor(..._args: unknown[]) { /* inert */ } }
export class App extends Stub {}
export class Component extends Stub {
  load(): void {} unload(): void {} onload(): void {} onunload(): void {}
  register(): void {} registerEvent(): void {} addChild(): void {}
}
export class TAbstractFile extends Stub { path = ''; name = ''; }
export class TFile extends TAbstractFile { extension = ''; basename = ''; }
export class TFolder extends TAbstractFile {}
export class Events extends Stub {}
export class Notice extends Stub {}
export class Modal extends Stub {}
export class Menu extends Stub {}
export class Scope extends Stub {}
export class View extends Stub {}
export class ItemView extends View {}
export class FileView extends View {}
export class MarkdownView extends View {}
export class MarkdownRenderChild extends Component {}
export class Plugin extends Component {}
export class PluginSettingTab extends Stub {}
export class Setting extends Stub {}
export class SuggestModal extends Modal {}
export class FuzzySuggestModal extends SuggestModal {}
export class EditorSuggest extends Stub {}
export class AbstractInputSuggest extends Stub {}
export class FileSystemAdapter extends Stub {}
export class WorkspaceLeaf extends Stub {}
export class Workspace extends Stub {}
export class Editor extends Stub {}
export class BasesView extends Stub {}

export const MarkdownRenderer = {
  async render(_app: unknown, markdown: string, el: HTMLElement, sourcePath: string): Promise<void> {
    el.innerHTML = renderMarkdown(markdown, {
      sourcePath,
      resolveLink: (target) => resolveNoteUrl(target),
      resolveImage: (target) => resolveImageUrl(target),
    });
  },
};

export const Keymap = { isModEvent: (event: MouseEvent): boolean => event.ctrlKey || event.metaKey };
export const Platform = { isMacOS: /Mac/i.test(globalThis.navigator?.platform ?? ''), isDesktop: true, isMobile: false };
export const normalizePath = (path: string): string => path.replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\/|\/$/g, '');
export const apiVersion = '1.8.7';
export const requireApiVersion = (): boolean => true;
const noop = (): void => {};
export const addIcon = noop, setIcon = noop, displayTooltip = noop, loadPdfJs = noop, resolveSubpath = noop;
export const stripHeading = (text: string): string => text;
export const debounce = <T extends (...args: never[]) => unknown>(fn: T): T => fn;
export const getFrontMatterInfo = (): { exists: boolean } => ({ exists: false });
export const getLanguage = (): string => 'en';
export const parseFrontMatterAliases = (): string[] => [];
export const parseYaml = (text: string): unknown => JSON.parse(text);
export const stringifyYaml = (value: unknown): string => JSON.stringify(value);
export const prepareFuzzySearch = (): (() => null) => () => null;
export const requestUrl = async (): Promise<unknown> => ({});
export const base64ToArrayBuffer = noop;
