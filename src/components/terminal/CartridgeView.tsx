import { useState, type ReactNode } from 'react';
import type { GameEntry } from '../../catalog/games';
import { StatusPill } from './StatusPill';
import { TypedText } from './TypedText';
import { Prompt } from './Prompt';

/** Drawn in the preview when the cover art fails to load. */
const PALLET_ASCII = String.raw`    ____________
   /__/__/__/__/|
  /__/__/__/__/||
 |  |  |  |  | ||
 |__|__|__|__|/||
 |  |  |  |  | |/
 |==|==|==|==|/`;

function Preview({ entry, phosphor }: { entry: GameEntry; phosphor: boolean }) {
  const [broken, setBroken] = useState(false);
  return <div className={`cart-preview${phosphor ? ' phosphor' : ''}`}>
    <span className="cart-corner top">Cart {entry.no} · Preview</span>
    {broken
      ? <pre className="cart-ascii" aria-label={entry.artAlt}>{PALLET_ASCII}</pre>
      : <img src={entry.art} alt={entry.artAlt} onError={() => setBroken(true)} />}
    <span className="cart-corner bottom">{phosphor ? 'Phosphor' : 'Color'}</span>
  </div>;
}

/** An opened game: cover art on the left; title, specs and the Play/Back buttons (or launch progress) on the right. */
export function CartridgeView({ entry, phosphor, actions }: { entry: GameEntry; phosphor: boolean; actions: ReactNode }) {
  return <section className="cartridge" aria-label={entry.title}>
    <Prompt command={`open ${entry.slug}`} />
    <div className="cart-grid">
      <Preview entry={entry} phosphor={phosphor} />
      <div className="cart-info">
        <h2>{entry.title}</h2>
        <div className="cart-pills">
          <StatusPill status={entry.status} />
          <span className="status-pill status-pill-neutral">{entry.version}</span>
          <span className="status-pill status-pill-neutral">Free · In browser</span>
        </div>
        <TypedText className="cart-blurb" text={entry.blurb} />
        <dl className="cart-specs">
          {entry.specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}
        </dl>
        {actions}
      </div>
    </div>
  </section>;
}
