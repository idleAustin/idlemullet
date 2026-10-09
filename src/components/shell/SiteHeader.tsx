import { ExternalLink, Gamepad2 } from 'lucide-react';
import { GITHUB_URL } from '../../catalog/games';

export function SiteHeader() {
  return <header className="site-header">
    <a className="site-brand" href="/" aria-label="idleMullet home">
      <span className="site-brand-tile"><Gamepad2 size={18} strokeWidth={2.2} aria-hidden="true" /></span>
      <span>
        <span className="site-brand-name"><strong>idleMullet</strong><span className="status-pill status-pill-accent">Arcade</span></span>
        <span className="site-brand-sub">idlemullet.com · idleAustin ecosystem</span>
      </span>
    </a>
    <div className="site-header-right">
      <span className="status-badge"><span className="status-dot" aria-hidden="true" /><span>idleAustin (idle, but operational)</span></span>
      <a className="btn btn-secondary btn-compact" href={GITHUB_URL} target="_blank" rel="noreferrer">
        <ExternalLink size={13} strokeWidth={2} aria-hidden="true" /><span>GitHub</span>
      </a>
    </div>
  </header>;
}
