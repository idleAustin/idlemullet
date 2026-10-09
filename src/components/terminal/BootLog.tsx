import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { countByStatus, type Entry } from '../../catalog/games';
import { sfx } from '../../utils/audio';

const LINE_MS = 110;
const HOLD_MS = 650;

function bootLines(entries: readonly Entry[]): ReactNode[] {
  const { live, inProgress } = countByStatus(entries);
  return [
    <span className="muted">Last login: {new Date().toDateString()} on ttys001</span>,
    '',
    <>mount  /games ................................ <span className="ok">ok</span></>,
    <>scan   cartridges ............................ <span className="ok">{live} live</span>{inProgress > 0 && <span className="muted"> · {inProgress} in progress</span>}</>,
    <>load   idlemullet shell ...................... <span className="ok">ok</span></>,
    '',
    <span className="muted">Booted in 1.4ms. It actually worked.</span>,
  ];
}

/** The once-per-tab startup log. Prints a line at a time, then hands over to the menu. */
export function BootLog({ entries, onDone }: { entries: readonly Entry[]; onDone(): void }) {
  const lines = useMemo(() => bootLines(entries), [entries]);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (shown >= lines.length) {
      const hold = setTimeout(onDone, HOLD_MS);
      return () => clearTimeout(hold);
    }
    const next = setTimeout(() => {
      if (lines[shown] !== '') sfx.play('boot');
      setShown(count => count + 1);
    }, LINE_MS);
    return () => clearTimeout(next);
  }, [shown, lines, onDone]);

  return <section className="boot-log" aria-live="polite">
    {lines.slice(0, shown).map((line, index) => <div key={index} className="boot-line">{line}</div>)}
  </section>;
}
