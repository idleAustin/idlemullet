import { GITHUB_URL, type Entry } from '../catalog/games';

/**
 * The homepage terminal as a pure state machine. Components send `Command`s; `step` returns the
 * next state plus the side effects (a sound cue, a URL to open) for the caller to perform.
 */

export type View = 'boot' | 'menu' | 'detail' | 'launching';
export type Action = 'play' | 'github' | 'back';
export type Cue = 'tick' | 'select' | 'deny' | 'back' | 'launch';

export interface SelectorState {
  view: View;
  /** Index into the entries list. */
  selected: number;
  /** Index into `actionsFor(selected entry)` while a cartridge is open. */
  action: number;
  /** Error line shown under the list after opening a locked entry. */
  denial: string | null;
}

export type Command =
  | { type: 'skipBoot' }
  | { type: 'up' }
  | { type: 'down' }
  | { type: 'first' }
  | { type: 'last' }
  /** Point at a row without a sound: mouse hover or a number key. */
  | { type: 'pick'; index: number }
  /** Point at a cartridge button without a sound: mouse hover. */
  | { type: 'focusAction'; index: number }
  | { type: 'enter' }
  | { type: 'back' }
  | { type: 'clearDenial' };

export interface StepResult {
  state: SelectorState;
  cue?: Cue;
  /** Opened in a new tab. Launching a game is handled by the launch progress, not here. */
  visit?: string;
}

export function initialState(skipBoot: boolean): SelectorState {
  return { view: skipBoot ? 'menu' : 'boot', selected: 0, action: 0, denial: null };
}

export function actionsFor(entry: Entry): readonly Action[] {
  if (entry.kind === 'game') return ['play', 'back'];
  if (entry.kind === 'about') return ['github', 'back'];
  return [];
}

const wrap = (index: number, length: number) => ((index % length) + length) % length;

export function step(state: SelectorState, command: Command, entries: readonly Entry[]): StepResult {
  if (command.type === 'clearDenial') return { state: { ...state, denial: null } };
  if (state.view === 'boot') return { state: { ...state, view: 'menu' } };
  if (state.view === 'menu') return stepMenu(state, command, entries);
  if (state.view === 'detail') return stepDetail(state, command, entries);
  if (command.type === 'back') return { state: { ...state, view: 'detail' }, cue: 'back' };
  return { state };
}

function stepMenu(state: SelectorState, command: Command, entries: readonly Entry[]): StepResult {
  const moveTo = (index: number, cue?: Cue): StepResult => {
    const selected = wrap(index, entries.length);
    if (selected === state.selected) return { state };
    return { state: { ...state, selected, denial: null }, cue };
  };
  switch (command.type) {
    case 'up': return moveTo(state.selected - 1, 'tick');
    case 'down': return moveTo(state.selected + 1, 'tick');
    case 'first': return moveTo(0, 'tick');
    case 'last': return moveTo(entries.length - 1, 'tick');
    case 'pick': return command.index < entries.length ? moveTo(command.index) : { state };
    case 'enter': {
      const entry = entries[state.selected];
      if (entry.kind === 'locked') return { state: { ...state, denial: entry.denial }, cue: 'deny' };
      return { state: { ...state, view: 'detail', action: 0, denial: null }, cue: 'select' };
    }
    default: return { state };
  }
}

function stepDetail(state: SelectorState, command: Command, entries: readonly Entry[]): StepResult {
  const actions = actionsFor(entries[state.selected]);
  const moveTo = (index: number, cue?: Cue): StepResult => {
    const action = wrap(index, actions.length);
    return action === state.action ? { state } : { state: { ...state, action }, cue };
  };
  switch (command.type) {
    case 'up': return moveTo(state.action - 1, 'tick');
    case 'down': return moveTo(state.action + 1, 'tick');
    case 'focusAction': return command.index < actions.length ? moveTo(command.index) : { state };
    case 'back': return { state: { ...state, view: 'menu' }, cue: 'back' };
    case 'enter': {
      const action = actions[state.action];
      if (action === 'play') return { state: { ...state, view: 'launching' }, cue: 'launch' };
      if (action === 'github') return { state, cue: 'select', visit: GITHUB_URL };
      return { state: { ...state, view: 'menu' }, cue: 'back' };
    }
    default: return { state };
  }
}

/** Maps a `KeyboardEvent.key` to a command for the current view, or null to let the browser have it. */
export function commandForKey(key: string, view: View): Command | null {
  if (view === 'boot') return { type: 'skipBoot' };
  const back = key === 'Escape' || key === 'Backspace';
  if (view === 'launching') return back ? { type: 'back' } : null;
  if (back) return { type: 'back' };
  if (key === 'Enter' || key === ' ') return { type: 'enter' };
  if (view === 'menu') {
    if (key === 'ArrowUp' || key === 'k') return { type: 'up' };
    if (key === 'ArrowDown' || key === 'j') return { type: 'down' };
    if (key === 'ArrowRight') return { type: 'enter' };
    if (key === 'Home') return { type: 'first' };
    if (key === 'End') return { type: 'last' };
    if (/^[1-9]$/.test(key)) return { type: 'pick', index: Number(key) - 1 };
    return null;
  }
  if (['ArrowUp', 'ArrowLeft', 'k', 'h'].includes(key)) return { type: 'up' };
  if (['ArrowDown', 'ArrowRight', 'j', 'l'].includes(key)) return { type: 'down' };
  return null;
}

/** The terminal's bottom status line: a mode badge and where the cursor is. */
export function statusLine(state: SelectorState, entries: readonly Entry[]) {
  const entry = entries[state.selected];
  if (state.view === 'boot') return { mode: 'BOOT', detail: '', error: false };
  if (state.view === 'launching') return { mode: 'LOADING', detail: entry.slug, error: false };
  if (state.view === 'detail') {
    if (entry.kind === 'game') return { mode: `CART ${entry.no}`, detail: `${entry.slug}  ${entry.version}`, error: false };
    return { mode: 'ABOUT', detail: entry.slug, error: false };
  }
  if (state.denial) return { mode: 'DENIED', detail: entry.slug, error: true };
  return { mode: 'MENU', detail: `${state.selected + 1}/${entries.length}  ${entry.slug}`, error: false };
}
