/** Everything the homepage terminal lists. Add a game by adding a `GameEntry` here. */

export type GameStatus = 'live' | 'dev' | 'locked';

export interface GameEntry {
  kind: 'game';
  /** Shown as the terminal path, e.g. `open idle-distribution`. */
  slug: string;
  no: string;
  title: string;
  status: 'live';
  /** Latest GitHub release of the game's repo. */
  version: string;
  url: string;
  art: string;
  artAlt: string;
  blurb: string;
  specs: readonly (readonly [label: string, value: string])[];
}

/** A slot for a game that is not playable yet. Opening it is refused with `denial`. */
export interface LockedEntry {
  kind: 'locked';
  slug: string;
  no: string;
  /** Redaction bar standing in for the unannounced title. */
  mask: string;
  status: 'dev' | 'locked';
  denial: string;
}

export interface AboutEntry {
  kind: 'about';
  slug: 'about.txt';
  no: '--';
  title: string;
  group: 'System';
}

export type Entry = GameEntry | LockedEntry | AboutEntry;

export const GITHUB_URL = 'https://github.com/idleAustin';
export const CONTACT_EMAIL = 'iam@austinsmith.me';
export const TAGLINE = 'Mostly idle. There probably was an easier way to do this.';

export const ENTRIES: readonly Entry[] = [
  {
    kind: 'game',
    slug: 'idle-distribution',
    no: '01',
    title: 'idleDistribution',
    status: 'live',
    version: 'v0.2.0',
    url: 'https://idlemullet.com/idle-distribution',
    art: '/games/idle-distribution/cover.png',
    artAlt: 'idleDistribution cover art: a hauler driving a wrapped pallet of cartons',
    blurb: 'Build warehouse pallets against the clock. Stack cartons high and stable without crushing them.',
    specs: [
      ['Genre', 'Stacking / physics'],
      ['Modes', 'Floor Rush · Conveyor · Gallery'],
      ['Engine', 'Rust → Wasm + Three.js'],
      ['Plays on', 'Desktop · Mobile'],
    ],
  },
  { kind: 'about', slug: 'about.txt', no: '--', title: 'about.txt', group: 'System' },
];

export function countByStatus(entries: readonly Entry[]) {
  const live = entries.filter(entry => entry.kind === 'game').length;
  const inProgress = entries.filter(entry => entry.kind === 'locked').length;
  return { live, inProgress };
}

/** `1 live` or `2 live · 1 in progress`, for the boot log and about.txt. */
export function gamesSummary(entries: readonly Entry[]) {
  const { live, inProgress } = countByStatus(entries);
  return inProgress > 0 ? `${live} live · ${inProgress} in progress` : `${live} live`;
}
