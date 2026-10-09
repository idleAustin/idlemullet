/** Boolean preferences in web storage. Reads fall back and writes give up quietly when storage is blocked. */

type Store = 'local' | 'session';

function storage(store: Store): Storage | undefined {
  try { return store === 'local' ? window.localStorage : window.sessionStorage; } catch { return undefined; }
}

export function readFlag(key: string, fallback: boolean, store: Store = 'local'): boolean {
  try {
    const value = storage(store)?.getItem(key);
    return value === null || value === undefined ? fallback : value === 'true';
  } catch {
    return fallback;
  }
}

export function writeFlag(key: string, value: boolean, store: Store = 'local') {
  try { storage(store)?.setItem(key, String(value)); } catch { /* The preference just won't persist. */ }
}
