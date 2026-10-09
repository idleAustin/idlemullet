import { useEffect, useState } from 'react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const CHARS_PER_TICK = 2;
const TICK_MS = 14;

/** Types `text` out with a trailing cursor. Screen readers get the full text immediately. */
export function TypedText({ text, className }: { text: string; className?: string }) {
  const reduced = useReducedMotion();
  const [length, setLength] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) { setLength(text.length); return; }
    setLength(0);
    const timer = setInterval(() => setLength(current => {
      const next = Math.min(text.length, current + CHARS_PER_TICK);
      if (next === text.length) clearInterval(timer);
      return next;
    }), TICK_MS);
    return () => clearInterval(timer);
  }, [text, reduced]);

  const typing = length < text.length;
  return <p className={className} aria-label={text}>
    <span aria-hidden="true">{text.slice(0, length)}</span>
    {typing && <span className="cursor" aria-hidden="true" />}
  </p>;
}
