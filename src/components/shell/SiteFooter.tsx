import { TAGLINE } from '../../catalog/games';
import { VERSION_LABEL } from '../../version';

export function SiteFooter() {
  return <footer className="site-footer">
    <div>{VERSION_LABEL}</div>
    <div>{TAGLINE}</div>
  </footer>;
}
