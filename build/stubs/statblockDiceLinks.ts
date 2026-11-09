/** A published statblock does not roll: dice notation stays as readable text. */
export type HitPointsRollHandler = (formula: string, abilityName: string | undefined) => void;
export interface RollChoice { label: string; side: 'advantage' | 'disadvantage' | null; roll: () => void }
export type RollMenuOpener = (choices: readonly RollChoice[], at: { x: number; y: number }, link: HTMLElement) => void;

export const linkDiceIn = (): void => {};
export const attachDiceRolling = (): (() => void) => () => {};
export const diceLinkProps = (matched: string): { className: string; 'data-formula': string } => ({
  className: 'atlas-dice-formula',
  'data-formula': matched,
});
