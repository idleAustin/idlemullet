import type { GameStatus } from '../../catalog/games';

const PILLS: Record<GameStatus, { label: string; tone: string; dot?: boolean }> = {
  live: { label: 'Live', tone: 'status-pill-accent', dot: true },
  dev: { label: 'In dev', tone: 'status-pill-warning' },
  locked: { label: 'Locked', tone: 'status-pill-neutral' },
};

export function StatusPill({ status }: { status: GameStatus }) {
  const { label, tone, dot } = PILLS[status];
  return <span className={`status-pill ${tone}`}>{dot && <span className="dot" aria-hidden="true" />}{label}</span>;
}
