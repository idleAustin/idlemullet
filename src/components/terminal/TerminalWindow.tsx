import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Terminal } from 'lucide-react';
import type { Entry } from '../../catalog/games';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { actionsFor, statusLine, type Command, type SelectorState } from '../../terminal/selector';
import { AboutView } from './AboutView';
import { ActionButtons } from './ActionButtons';
import { BootLog } from './BootLog';
import { CartridgeView } from './CartridgeView';
import { GameList } from './GameList';
import { LaunchProgress } from './LaunchProgress';
import { Prompt } from './Prompt';

function useClock() {
  const format = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const [time, setTime] = useState(format);
  useEffect(() => {
    const timer = setInterval(() => setTime(format()), 10_000);
    return () => clearInterval(timer);
  }, []);
  return time;
}

/** On phones the hero pushes an opened cartridge's Play button off-screen, so bring the terminal up under the header. */
function useScrollIntoViewOnOpen(ref: RefObject<HTMLElement>, view: SelectorState['view']) {
  const reduced = useReducedMotion();
  useEffect(() => {
    if (view !== 'detail' || !window.matchMedia('(max-width: 760px)').matches) return;
    ref.current?.scrollIntoView({ block: 'start', behavior: reduced ? 'auto' : 'smooth' });
  }, [ref, view, reduced]);
}

function MenuView({ entries, state, send }: { entries: readonly Entry[]; state: SelectorState; send(command: Command): void }) {
  return <section aria-label="Game menu">
    <div className="motd">
      <div className="motd-name">idleMullet</div>
      <div className="muted">Mostly idle. There probably was an easier way to do this.</div>
    </div>
    <Prompt path="~" command="ls ~/games" />
    <GameList entries={entries} selected={state.selected} send={send} />
    {state.denial
      ? <div className="terminal-error" role="alert">error: {state.denial}</div>
      : <Prompt path="~" cursor />}
  </section>;
}

/** The centered terminal: title bar, whichever view the selector is in, and a vim-style status line. */
export function TerminalWindow({ entries, state, send, phosphor, onLaunched }: {
  entries: readonly Entry[]; state: SelectorState; send(command: Command): void; phosphor: boolean; onLaunched(): void;
}) {
  const time = useClock();
  const status = statusLine(state, entries);
  const entry = entries[state.selected];
  const skipBoot = useCallback(() => send({ type: 'skipBoot' }), [send]);
  const windowRef = useRef<HTMLDivElement>(null);
  useScrollIntoViewOnOpen(windowRef, state.view);

  const actions = state.view === 'launching' && entry.kind === 'game'
    ? <LaunchProgress entry={entry} onDone={onLaunched} />
    : <ActionButtons actions={actionsFor(entry)} selected={state.action} send={send} />;

  return <div ref={windowRef} className="terminal" role="application" aria-label="idleMullet game selector"
    onPointerDown={() => { if (state.view === 'boot') skipBoot(); }}>
    <div className="terminal-bar">
      <div className="terminal-lights" aria-hidden="true"><i /><i /><i /></div>
      <div className="terminal-title"><Terminal size={13} strokeWidth={2.2} aria-hidden="true" /><span>guest@idlemullet: ~/games</span></div>
      <div className="terminal-meta">zsh · {time}</div>
    </div>

    <div className="terminal-body">
      {state.view === 'boot' && <BootLog entries={entries} onDone={skipBoot} />}
      {state.view === 'menu' && <MenuView entries={entries} state={state} send={send} />}
      {state.view !== 'boot' && state.view !== 'menu' && (entry.kind === 'game'
        ? <CartridgeView entry={entry} phosphor={phosphor} actions={actions} />
        : <AboutView entries={entries} actions={actions} />)}
    </div>

    <div className="terminal-status">
      <div className="terminal-status-left">
        <span className={`terminal-mode${status.error ? ' error' : ''}`}>{status.mode}</span>
        <span>{status.detail}</span>
      </div>
      <span className="terminal-hint">↑↓ select · ↵ open · esc back</span>
    </div>
  </div>;
}
