import { useCallback, useEffect, useState } from 'react';
import { ENTRIES, GITHUB_URL } from './catalog/games';
import { ControlDock } from './components/shell/ControlDock';
import { SiteFooter } from './components/shell/SiteFooter';
import { SiteHeader } from './components/shell/SiteHeader';
import { TerminalWindow } from './components/terminal/TerminalWindow';
import { useTerminal } from './hooks/useTerminal';
import { sfx } from './utils/audio';
import { readFlag, writeFlag } from './utils/prefs';
import './styles/shell.css';
import './styles/terminal.css';

const PHOSPHOR_KEY = 'idlemullet:phosphor';
/** Keys whose browser default (scrolling, activating a focused control) the terminal replaces. */
const CAPTURED = new Set(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Backspace']);

/** The idlemullet.com homepage: a terminal that lists every game and launches the one you pick. */
export function App() {
  const { state, send, handleKey, finishLaunch } = useTerminal(ENTRIES);
  const [sound, setSound] = useState(sfx.enabled);
  const [phosphor, setPhosphor] = useState(() => readFlag(PHOSPHOR_KEY, true));

  const toggleSound = useCallback(() => {
    const enabled = !sfx.enabled;
    sfx.setEnabled(enabled);
    setSound(enabled);
    sfx.play('toggle');
  }, []);

  const togglePhosphor = useCallback(() => {
    setPhosphor(current => !current);
    sfx.play('toggle');
  }, []);
  useEffect(() => writeFlag(PHOSPHOR_KEY, phosphor), [phosphor]);

  /** One entry point for real keys and dock buttons. Returns whether the key was used. */
  const pressKey = useCallback((key: string) => {
    const lower = key.toLowerCase();
    if (lower === 'm') { toggleSound(); return true; }
    if (lower === 'c') { togglePhosphor(); return true; }
    if (lower === 'g') { window.open(GITHUB_URL, '_blank', 'noopener'); return true; }
    return handleKey(key);
  }, [handleKey, toggleSound, togglePhosphor]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      // A focused link or button (tabbed to) keeps its own Enter and Space.
      if ((event.key === 'Enter' || event.key === ' ') && (event.target as Element | null)?.closest?.('a, button')) return;
      if (pressKey(event.key) && CAPTURED.has(event.key)) event.preventDefault();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [pressKey]);

  return <div className="page">
    <SiteHeader />
    <main className="page-main">
      <div className="hero">
        <h1>Business in the front. <em>Idle</em> in the back.</h1>
        <p>Small browser games, built slowly. <span className="hint-keys">Arrow keys to browse, enter to open.</span><span className="hint-touch">Tap a game to open.</span></p>
      </div>
      <TerminalWindow entries={ENTRIES} state={state} send={send} phosphor={phosphor} onLaunched={finishLaunch} />
    </main>
    <SiteFooter />
    <ControlDock pressKey={pressKey} sound={sound} toggleSound={toggleSound} phosphor={phosphor} togglePhosphor={togglePhosphor} />
  </div>;
}
