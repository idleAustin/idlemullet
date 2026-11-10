export interface GameRepoSource {
  localDir?: URL;
  remoteUrl?: string;
}

export const GAME_REPOS: Record<string, GameRepoSource>;

export function parseSemver(version: unknown): [number, number, number] | null;
export function compareSemver(a: unknown, b: unknown): number;
export function formatVersion(version: unknown, fallback?: string): string;
export function highestSemverTag(lsRemoteOutput: string): string | null;
export function resolveGameVersion(source?: GameRepoSource, fallback?: string): string;
export function resolveAllGameVersions(repos?: Record<string, GameRepoSource>): Record<string, string>;
