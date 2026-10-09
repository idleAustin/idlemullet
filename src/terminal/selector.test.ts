import { describe, expect, it } from 'vitest';
import { ENTRIES, GITHUB_URL, countByStatus, gamesSummary, type Entry, type LockedEntry } from '../catalog/games';
import { actionsFor, commandForKey, initialState, statusLine, step, type Command, type SelectorState } from './selector';

/**
 * A catalog with every kind of entry, so the selector's rules are tested independently of which
 * games happen to be listed today.
 */
const LOCKED_ENTRY: LockedEntry = { kind: 'locked', slug: 'cart-02', no: '02', mask: '████', status: 'dev', denial: 'cart 02: nothing here yet.' };
const SAMPLE: readonly Entry[] = [ENTRIES.find(entry => entry.kind === 'game')!, LOCKED_ENTRY, ENTRIES.find(entry => entry.kind === 'about')!];
const GAME = 0, LOCKED = 1, ABOUT = 2;

/** Runs commands from `state`, returning the final state and every cue played along the way. */
function run(state: SelectorState, ...commands: Command[]) {
  const cues: string[] = [];
  for (const command of commands) {
    const result = step(state, command, SAMPLE);
    state = result.state;
    if (result.cue) cues.push(result.cue);
  }
  return { state, cues };
}

const menu = initialState(true);
const at = (selected: number): SelectorState => ({ ...menu, selected });

describe('the catalog', () => {
  it('lists idleDistribution first and about.txt last', () => {
    expect(ENTRIES[0]).toMatchObject({ kind: 'game', slug: 'idle-distribution', title: 'idleDistribution' });
    expect(ENTRIES.at(-1)?.kind).toBe('about');
  });

  it('gives every entry a unique slug and number', () => {
    expect(new Set(ENTRIES.map(entry => entry.slug)).size).toBe(ENTRIES.length);
    const numbered = ENTRIES.filter(entry => entry.no !== '--');
    expect(new Set(numbered.map(entry => entry.no)).size).toBe(numbered.length);
  });

  it('summarizes live games, mentioning games in progress only when there are some', () => {
    expect(countByStatus(SAMPLE)).toEqual({ live: 1, inProgress: 1 });
    expect(gamesSummary(SAMPLE)).toBe('1 live · 1 in progress');
    expect(gamesSummary(ENTRIES)).toBe(`${countByStatus(ENTRIES).live} live`);
  });
});

describe('boot', () => {
  it('starts in boot unless the boot was already seen', () => {
    expect(initialState(false).view).toBe('boot');
    expect(initialState(true).view).toBe('menu');
  });

  it('drops into the menu on any command', () => {
    expect(run(initialState(false), { type: 'down' }).state).toEqual(menu);
  });
});

describe('the menu', () => {
  it('wraps the cursor at both ends', () => {
    expect(run(menu, { type: 'up' }).state.selected).toBe(SAMPLE.length - 1);
    expect(run(at(SAMPLE.length - 1), { type: 'down' }).state.selected).toBe(0);
  });

  it('ticks on keyboard moves but not when the mouse points at a row', () => {
    expect(run(menu, { type: 'down' }).cues).toEqual(['tick']);
    expect(run(menu, { type: 'pick', index: ABOUT })).toEqual({ state: at(ABOUT), cues: [] });
  });

  it('ignores a number key past the end of the list', () => {
    expect(run(menu, { type: 'pick', index: 8 }).state).toEqual(menu);
  });

  it('refuses a locked entry with its denial and stays on the menu', () => {
    const { state, cues } = run(at(LOCKED), { type: 'enter' });
    expect(state).toEqual({ ...at(LOCKED), denial: LOCKED_ENTRY.denial });
    expect(cues).toEqual(['deny']);
  });

  it('clears a denial when the cursor moves or the timer runs out', () => {
    const denied = run(at(LOCKED), { type: 'enter' }).state;
    expect(run(denied, { type: 'down' }).state.denial).toBeNull();
    expect(run(denied, { type: 'clearDenial' }).state).toEqual(at(LOCKED));
  });

  it('opens a game on its first action', () => {
    expect(run(menu, { type: 'enter' })).toEqual({ state: { ...menu, view: 'detail', action: 0 }, cues: ['select'] });
  });
});

describe('an open cartridge', () => {
  const open = run(menu, { type: 'enter' }).state;

  it('offers play then back for a game, and github then back for about', () => {
    expect(actionsFor(SAMPLE[GAME])).toEqual(['play', 'back']);
    expect(actionsFor(SAMPLE[ABOUT])).toEqual(['github', 'back']);
    expect(actionsFor(SAMPLE[LOCKED])).toEqual([]);
  });

  it('launches on play, and escape aborts back to the cartridge', () => {
    const launching = run(open, { type: 'enter' });
    expect(launching.state.view).toBe('launching');
    expect(launching.cues).toEqual(['launch']);
    expect(run(launching.state, { type: 'enter' }).state.view).toBe('launching');
    expect(run(launching.state, { type: 'back' }).state.view).toBe('detail');
  });

  it('returns to the menu from the back button or escape, keeping the selection', () => {
    expect(run(open, { type: 'down' }, { type: 'enter' }).state).toEqual({ ...menu, action: 1 });
    expect(run(open, { type: 'back' })).toEqual({ state: menu, cues: ['back'] });
  });

  it('opens GitHub from about.txt without leaving the page', () => {
    const about = run(at(ABOUT), { type: 'enter' }).state;
    const result = step(about, { type: 'enter' }, SAMPLE);
    expect(result).toEqual({ state: about, cue: 'select', visit: GITHUB_URL });
  });
});

describe('keys', () => {
  it('lets any key skip the boot', () => {
    expect(commandForKey('x', 'boot')).toEqual({ type: 'skipBoot' });
  });

  it('maps arrows, vim keys, enter and escape on the menu', () => {
    expect(commandForKey('ArrowUp', 'menu')).toEqual({ type: 'up' });
    expect(commandForKey('j', 'menu')).toEqual({ type: 'down' });
    expect(commandForKey('ArrowRight', 'menu')).toEqual({ type: 'enter' });
    expect(commandForKey('3', 'menu')).toEqual({ type: 'pick', index: 2 });
    expect(commandForKey('Escape', 'menu')).toEqual({ type: 'back' });
  });

  it('moves between buttons with every arrow on a cartridge', () => {
    expect(commandForKey('ArrowLeft', 'detail')).toEqual({ type: 'up' });
    expect(commandForKey('ArrowRight', 'detail')).toEqual({ type: 'down' });
    expect(commandForKey('3', 'detail')).toBeNull();
  });

  it('only listens for escape while launching', () => {
    expect(commandForKey('Enter', 'launching')).toBeNull();
    expect(commandForKey('Backspace', 'launching')).toEqual({ type: 'back' });
  });

  it('leaves unrelated keys to the browser', () => {
    expect(commandForKey('Tab', 'menu')).toBeNull();
  });
});

describe('the status line', () => {
  it('names the mode and the cursor position', () => {
    expect(statusLine(menu, SAMPLE)).toEqual({ mode: 'MENU', detail: '1/3  idle-distribution', error: false });
    expect(statusLine(run(at(LOCKED), { type: 'enter' }).state, SAMPLE)).toEqual({ mode: 'DENIED', detail: 'cart-02', error: true });
    expect(statusLine({ ...menu, view: 'detail' }, SAMPLE).mode).toBe('CART 01');
    expect(statusLine({ ...at(ABOUT), view: 'detail' }, SAMPLE).mode).toBe('ABOUT');
  });
});
