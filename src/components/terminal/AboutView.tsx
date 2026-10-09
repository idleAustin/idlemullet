import type { ReactNode } from 'react';
import { CONTACT_EMAIL, gamesSummary, type Entry } from '../../catalog/games';
import { Prompt } from './Prompt';
import { TypedText } from './TypedText';

/** `cat about.txt`: who builds these and where to find the code. */
export function AboutView({ entries, actions }: { entries: readonly Entry[]; actions: ReactNode }) {
  return <section className="cartridge" aria-label="About idleAustin">
    <Prompt command="cat about.txt" />
    <div className="cart-info about">
      <h2>idleAustin</h2>
      <div className="cart-pills">
        <span className="status-pill status-pill-accent">Solo dev</span>
        <span className="status-pill status-pill-neutral">Browser games</span>
      </div>
      <TypedText className="cart-blurb" text="Small games, built slowly. Mostly idle. There probably was an easier way to do this." />
      <dl className="cart-specs">
        <div><dt>Games</dt><dd>{gamesSummary(entries)}</dd></div>
        <div><dt>Motto</dt><dd>Business in the front, idle party in the back</dd></div>
        <div><dt>Contact</dt><dd><a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a></dd></div>
      </dl>
      {actions}
    </div>
  </section>;
}
