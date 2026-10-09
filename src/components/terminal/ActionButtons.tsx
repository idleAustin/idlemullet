import { ArrowLeft, Github, Play, type LucideIcon } from 'lucide-react';
import type { Action, Command } from '../../terminal/selector';

const BUTTONS: Record<Action, { label: string; kbd: string; icon: LucideIcon; tone: 'primary' | 'secondary' }> = {
  play: { label: 'Play It', kbd: '↵', icon: Play, tone: 'primary' },
  github: { label: 'Open GitHub', kbd: '↵', icon: Github, tone: 'primary' },
  back: { label: 'Back', kbd: 'Esc', icon: ArrowLeft, tone: 'secondary' },
};

/** A cartridge's buttons. Arrow keys move the selection ring; hover and click do the same with a mouse. */
export function ActionButtons({ actions, selected, send }: { actions: readonly Action[]; selected: number; send(command: Command): void }) {
  return <div className="cart-actions">
    {actions.map((action, index) => {
      const { label, kbd, icon: Icon, tone } = BUTTONS[action];
      return <button key={action} type="button" className={`btn btn-${tone}${index === selected ? ' is-selected' : ''}`}
        onMouseEnter={() => send({ type: 'focusAction', index })}
        onClick={() => { send({ type: 'focusAction', index }); send({ type: 'enter' }); }}>
        <Icon size={13} strokeWidth={2} aria-hidden="true" /><span>{label}</span><kbd className="kbd-inline">{kbd}</kbd>
      </button>;
    })}
  </div>;
}
