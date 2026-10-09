import { useEffect, useRef, useState } from 'react';
import type { GameEntry } from '../../catalog/games';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { Prompt } from './Prompt';

const BAR_CELLS = 20;
const TICK_MS = 70;
const HANDOFF_MS = 500;

/** The fake-but-honest loading bar between pressing Play and leaving for the game. */
export function LaunchProgress({ entry, onDone }: { entry: GameEntry; onDone(): void }) {
  const reduced = useReducedMotion();
  const [percent, setPercent] = useState(reduced ? 100 : 0);
  const startedAt = useRef(performance.now());
  const [elapsed, setElapsed] = useState<string | null>(null);

  useEffect(() => {
    if (percent >= 100) {
      setElapsed(((performance.now() - startedAt.current) / 1000).toFixed(1));
      const handoff = setTimeout(onDone, HANDOFF_MS);
      return () => clearTimeout(handoff);
    }
    const tick = setTimeout(() => setPercent(current => Math.min(100, current + 4 + Math.random() * 7)), TICK_MS);
    return () => clearTimeout(tick);
  }, [percent, onDone]);

  const filled = Math.round((percent / 100) * BAR_CELLS);
  return <div className="launch" role="status">
    <Prompt command={`./${entry.slug}`} />
    <div>
      <span className="launch-bar">{'█'.repeat(filled)}</span><span className="muted">{'░'.repeat(BAR_CELLS - filled)}</span>
      {' '}{String(Math.floor(percent)).padStart(3)}%   <span className="muted">esc to abort</span>
    </div>
    {elapsed && <div className="ok">Loaded in {elapsed}s. It actually worked.</div>}
  </div>;
}
