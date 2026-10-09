import { ArrowLeft, ChevronDown, ChevronUp, Contrast, CornerDownLeft, Github, Volume2, VolumeX, type LucideIcon } from 'lucide-react';
import { GITHUB_URL } from '../../catalog/games';

function DockButton({ label, kbd, icon: Icon, active = false, pressed, onClick }: {
  label: string; kbd: string; icon: LucideIcon; active?: boolean; pressed?: boolean; onClick(): void;
}) {
  return <div className="tooltip-wrapper">
    <button type="button" className={`icon-action-btn${active ? ' active' : ''}`} aria-label={label} aria-pressed={pressed}
      onClick={event => { event.currentTarget.blur(); onClick(); }}>
      <Icon size={17} strokeWidth={2} aria-hidden="true" />
    </button>
    <div className="tooltip-bubble" aria-hidden="true"><span>{label}</span><span className="tooltip-kbd">{kbd}</span></div>
  </div>;
}

/**
 * The floating action dock. The first four buttons replay keyboard keys through the terminal,
 * so on a phone they are the D-pad.
 */
export function ControlDock({ pressKey, sound, toggleSound, phosphor, togglePhosphor }: {
  pressKey(key: string): void; sound: boolean; toggleSound(): void; phosphor: boolean; togglePhosphor(): void;
}) {
  return <nav className="icon-dock" aria-label="Terminal controls">
    <DockButton label="Previous" kbd="↑" icon={ChevronUp} onClick={() => pressKey('ArrowUp')} />
    <DockButton label="Next" kbd="↓" icon={ChevronDown} onClick={() => pressKey('ArrowDown')} />
    <DockButton label="Open" kbd="↵" icon={CornerDownLeft} active onClick={() => pressKey('Enter')} />
    <DockButton label="Back" kbd="Esc" icon={ArrowLeft} onClick={() => pressKey('Escape')} />
    <div className="icon-dock-divider" />
    <DockButton label="Phosphor Tint" kbd="C" icon={Contrast} active={phosphor} pressed={phosphor} onClick={togglePhosphor} />
    <DockButton label="Sound" kbd="M" icon={sound ? Volume2 : VolumeX} active={sound} pressed={sound} onClick={toggleSound} />
    <div className="icon-dock-divider" />
    <div className="tooltip-wrapper">
      <a className="icon-action-btn" href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="Repository">
        <Github size={17} strokeWidth={2} aria-hidden="true" />
      </a>
      <div className="tooltip-bubble" aria-hidden="true"><span>Repository</span><span className="tooltip-kbd">G</span></div>
    </div>
  </nav>;
}
