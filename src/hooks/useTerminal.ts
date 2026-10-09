import { useCallback, useEffect, useRef, useState } from 'react';
import type { Entry } from '../catalog/games';
import { commandForKey, initialState, step, type Command, type SelectorState } from '../terminal/selector';
import { sfx } from '../utils/audio';
import { readFlag, writeFlag } from '../utils/prefs';
import { prefersReducedMotion } from './useReducedMotion';

const BOOTED_KEY = 'idlemullet:booted';
const DENIAL_MS = 2600;

/** Runs the selector state machine and performs its side effects: sounds, new tabs, and leaving for a game. */
export function useTerminal(entries: readonly Entry[]) {
  const [state, setState] = useState<SelectorState>(
    () => initialState(readFlag(BOOTED_KEY, false, 'session') || prefersReducedMotion()));
  // Commands can arrive twice in one tick (a click is focus + enter), so step from the latest state, not the last render.
  const latest = useRef(state);

  const send = useCallback((command: Command) => {
    const result = step(latest.current, command, entries);
    latest.current = result.state;
    setState(result.state);
    if (result.cue) sfx.play(result.cue);
    if (result.visit) window.open(result.visit, '_blank', 'noopener');
  }, [entries]);

  /** Returns whether the key was handled, so the caller can stop the browser scrolling on arrows and space. */
  const handleKey = useCallback((key: string) => {
    const command = commandForKey(key, latest.current.view);
    if (command) send(command);
    return command !== null;
  }, [send]);

  const finishLaunch = useCallback(() => {
    const entry = entries[latest.current.selected];
    if (latest.current.view === 'launching' && entry.kind === 'game') window.location.assign(entry.url);
  }, [entries]);

  useEffect(() => {
    if (state.view !== 'boot') writeFlag(BOOTED_KEY, true, 'session');
  }, [state.view]);

  useEffect(() => {
    if (!state.denial) return;
    const timer = setTimeout(() => send({ type: 'clearDenial' }), DENIAL_MS);
    return () => clearTimeout(timer);
  }, [state.denial, send]);

  return { state, send, handleKey, finishLaunch };
}
