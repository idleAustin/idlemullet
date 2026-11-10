// Resolves each catalog game's version from git (remote release tags first, local sibling repo fallback).
// Usage: node scripts/game-versions.mjs   prints a JSON map of { [slug]: "vX.Y.Z" }.
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const GAME_REPOS = {
  'idle-distribution': {
    localDir: new URL('../../idle-distribution', import.meta.url),
    remoteUrl: 'https://github.com/asmit825/idle-distribution.git',
  },
  'idle-smoke': {
    localDir: new URL('../../idle-smoke-break', import.meta.url),
    remoteUrl: 'https://github.com/idleAustin/idle-smoke.git',
  },
};

const SEMVER_RE = /^v?(\d+)\.(\d+)\.(\d+)$/;

export function parseSemver(version) {
  if (typeof version !== 'string') return null;
  const match = version.trim().match(SEMVER_RE);
  if (!match) return null;
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

export function compareSemver(a, b) {
  const pa = parseSemver(a);
  const pb = parseSemver(b);
  if (!pa && !pb) return 0;
  if (!pa) return -1;
  if (!pb) return 1;
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i];
  }
  return 0;
}

export function formatVersion(version, fallback = 'v0.1.0') {
  const parsed = parseSemver(version);
  return parsed ? `v${parsed.join('.')}` : fallback;
}

export function highestSemverTag(lsRemoteOutput) {
  const tags = lsRemoteOutput
    .split('\n')
    .map(line => line.trim().split(/\s+/)[1] ?? '')
    .filter(ref => ref.startsWith('refs/tags/'))
    .map(ref => ref.replace(/^refs\/tags\//, ''))
    .filter(tag => parseSemver(tag) !== null);
  if (tags.length === 0) return null;
  tags.sort(compareSemver);
  return formatVersion(tags.at(-1));
}

function remoteGitTagVersion(remoteUrl) {
  if (!remoteUrl || process.env.VITEST) return null;
  try {
    const out = execFileSync(
      'git',
      ['ls-remote', '--tags', '--refs', remoteUrl, 'v[0-9]*.[0-9]*.[0-9]*'],
      { stdio: ['ignore', 'pipe', 'ignore'], timeout: 3500 }
    ).toString();
    return highestSemverTag(out);
  } catch {
    return null;
  }
}

function localSiblingVersion(localDirUrl) {
  if (!localDirUrl) return null;
  const dir = fileURLToPath(localDirUrl);
  if (!existsSync(dir)) return null;
  try {
    const out = execFileSync(
      'git',
      ['tag', '--list', 'v[0-9]*.[0-9]*.[0-9]*'],
      { cwd: dir, stdio: ['ignore', 'pipe', 'ignore'], timeout: 1500 }
    ).toString();
    const highestTag = highestSemverTag(
      out
        .split('\n')
        .map(tag => tag.trim())
        .filter(Boolean)
        .map(tag => `0000000\trefs/tags/${tag}`)
        .join('\n')
    );
    if (highestTag) return highestTag;
  } catch {
    // Fall through to scripts/version.mjs
  }
  const scriptPath = fileURLToPath(new URL('./scripts/version.mjs', `${localDirUrl.href}/`));
  if (!existsSync(scriptPath)) return null;
  try {
    const raw = execFileSync('node', [scriptPath], {
      cwd: dir,
      stdio: ['ignore', 'pipe', 'ignore'],
      timeout: 2000,
    })
      .toString()
      .trim();
    return parseSemver(raw) ? formatVersion(raw) : null;
  } catch {
    return null;
  }
}

export function resolveGameVersion(source, fallback = 'v0.1.0') {
  const remote = remoteGitTagVersion(source?.remoteUrl);
  const local = localSiblingVersion(source?.localDir);
  if (remote && local) {
    return compareSemver(remote, local) >= 0 ? remote : local;
  }
  return remote ?? local ?? fallback;
}

export function resolveAllGameVersions(repos = GAME_REPOS) {
  const result = {};
  for (const [slug, source] of Object.entries(repos)) {
    result[slug] = resolveGameVersion(source);
  }
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  console.log(JSON.stringify(resolveAllGameVersions(), null, 2));
}

