import { Fragment } from 'react';
import { Lock } from 'lucide-react';
import type { Entry } from '../../catalog/games';
import type { Command } from '../../terminal/selector';
import { StatusPill } from './StatusPill';

const rowId = (index: number) => `entry-${index}`;

function RowTitle({ entry }: { entry: Entry }) {
  if (entry.kind === 'locked') return <><Lock size={12} strokeWidth={2} aria-hidden="true" /><span aria-label="Unannounced game">{entry.mask}</span></>;
  return <span>{entry.title}</span>;
}

/** `ls ~/games` output: one selectable row per entry, with a group heading before system files. */
export function GameList({ entries, selected, send }: { entries: readonly Entry[]; selected: number; send(command: Command): void }) {
  return <div className="game-list" role="listbox" aria-label="Games" aria-activedescendant={rowId(selected)}>
    <div className="game-list-head" aria-hidden="true">
      <span /><span>#</span><span>Name</span><span className="col-version">Version</span><span className="col-status">Status</span>
    </div>
    {entries.map((entry, index) => {
      const group = entry.kind === 'about' ? entry.group : undefined;
      const startsGroup = group && (index === 0 || entries[index - 1].kind !== entry.kind);
      return <Fragment key={entry.slug}>
        {startsGroup && <div className="game-list-group" aria-hidden="true">{group}</div>}
        <div id={rowId(index)} role="option" aria-selected={index === selected}
          className={`game-row${index === selected ? ' selected' : ''}${entry.kind === 'locked' ? ' locked' : ''}`}
          onMouseEnter={() => send({ type: 'pick', index })}
          onClick={() => { send({ type: 'pick', index }); send({ type: 'enter' }); }}>
          <span className="caret" aria-hidden="true">&gt;</span>
          <span className="col-no">{entry.no}</span>
          <span className="col-title"><RowTitle entry={entry} /></span>
          <span className="col-version">{entry.kind === 'game' ? entry.version : ''}</span>
          <span className="col-status">{entry.kind !== 'about' && <StatusPill status={entry.status} />}</span>
        </div>
      </Fragment>;
    })}
  </div>;
}
