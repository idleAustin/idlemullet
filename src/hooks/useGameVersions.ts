import { useEffect, useState } from 'react';
import { applyGameVersions, parseVersionManifest, type Entry } from '../catalog/games';

/**
 * Starts with build-time git versions stamped into `initialEntries`, then refreshes each live game's
 * version from same-origin `/<slug>/version.json` so newly deployed game releases appear immediately.
 */
export function useGameVersions(initialEntries: readonly Entry[]): readonly Entry[] {
  const [entries, setEntries] = useState<readonly Entry[]>(initialEntries);

  useEffect(() => {
    const games = initialEntries.filter(entry => entry.kind === 'game');
    if (games.length === 0 || typeof fetch !== 'function') return;

    const controller = new AbortController();

    void Promise.all(
      games.map(async game => {
        try {
          const response = await fetch(`/${game.slug}/version.json`, {
            cache: 'no-store',
            signal: controller.signal,
          });
          if (!response.ok) return null;
          const contentType = response.headers.get('content-type') ?? '';
          if (!contentType.includes('application/json')) return null;
          const version = parseVersionManifest(await response.json());
          return version ? ([game.slug, version] as const) : null;
        } catch {
          return null;
        }
      })
    ).then(results => {
      if (controller.signal.aborted) return;
      const updates: Record<string, string> = {};
      for (const item of results) {
        if (item) updates[item[0]] = item[1];
      }
      if (Object.keys(updates).length > 0) {
        setEntries(current => applyGameVersions(current, updates));
      }
    });

    return () => controller.abort();
  }, [initialEntries]);

  return entries;
}

