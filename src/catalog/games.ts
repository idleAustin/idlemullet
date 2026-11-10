/** Everything the homepage terminal lists. Add a game by adding a `GameEntry` here. */

declare const __GAME_VERSIONS__: Record<string, string> | undefined;

const BUILD_GAME_VERSIONS: Readonly<Record<string, string>> =
  typeof __GAME_VERSIONS__ !== 'undefined' && __GAME_VERSIONS__ ? __GAME_VERSIONS__ : {};

const SEMVER_RE = /^v?(\d+)\.(\d+)\.(\d+)$/;

/** Normalizes `0.4.1` or `v0.4.1` into `v0.4.1`, or returns `null` if invalid. */
export function normalizeVersion(raw: unknown): string | null {
  if (typeof raw !== 'string') return null;
  const match = raw.trim().match(SEMVER_RE);
  return match ? `v${Number(match[1])}.${Number(match[2])}.${Number(match[3])}` : null;
}

/** Extracts a valid `vX.Y.Z` string from a `/<slug>/version.json` payload, or `null`. */
export function parseVersionManifest(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  return normalizeVersion((payload as { version?: unknown }).version);
}

/** Resolves the build-time git version for `slug` stamped by `vite.config.ts`. */
export function gameVersion(slug: string, fallback = 'v0.1.0'): string {
  return normalizeVersion(BUILD_GAME_VERSIONS[slug]) ?? fallback;
}

/** Returns `entries` with any updated game versions applied; preserves array identity when unchanged. */
export function applyGameVersions(entries: readonly Entry[], versions: Readonly<Record<string, string>>): readonly Entry[] {
  let changed = false;
  const next = entries.map(entry => {
    if (entry.kind !== 'game') return entry;
    const candidate = normalizeVersion(versions[entry.slug]);
    if (!candidate || candidate === entry.version) return entry;
    changed = true;
    return { ...entry, version: candidate };
  });
  return changed ? next : entries;
}

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
    version: gameVersion('idle-distribution'),
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
  {
    kind: 'game',
    slug: 'idle-smoke',
    no: '02',
    title: 'idleSmoke',
    status: 'live',
    version: gameVersion('idle-smoke'),
    url: 'https://idlemullet.com/idle-smoke',
    art: '/games/idle-smoke/cover.png',
    artAlt: 'idleSmoke cover art: a lit cigarette resting over a brushed steel ashtray with ash and stubbed butts',
    blurb: 'Clock 15-second workplace smoke breaks. Mash drags to burn through butts, clear sector quotas, and climb the corporate ladder.',
    specs: [
      ['Genre', 'Workplace break / arcade'],
      ['Modes', 'Campaign · Smoke Session · Sandbox'],
      ['Engine', 'TypeScript + Three.js'],
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
