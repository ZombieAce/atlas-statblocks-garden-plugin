/** Fantasy Statblocks is an Obsidian plugin; a published site never has it. */
export type FantasyStatblocksCreature = Record<string, unknown> & { name?: string };

export type FantasyStatblocksApi = never;
export const noteBasename = (notePath: string): string => notePath.split('/').pop()?.replace(/\.md$/, '') ?? '';
export const resolveLayout = (): null => null;
export const getFantasyStatblocksApi = (): null => null;
export const isFantasyStatblocksAvailable = (): boolean => false;
export const isBestiaryResolved = (): boolean => true;
export const hasCreatureForNotePath = (): boolean => false;
export const bestiaryCreatureByName = (): null => null;
export const resolveCreatureFromFence = async (): Promise<null> => null;
export const allLayouts = (): never[] => [];
export const defaultLayout = (): null => null;
export const findLayout = (): null => null;
export const layoutForCreature = (): null => null;
