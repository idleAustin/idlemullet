// Stamped at build time by vite.config.ts from package.json and git.
declare const __APP_VERSION__: string;
declare const __APP_COMMIT__: string;

export const APP_VERSION = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.1.0';
export const APP_COMMIT = typeof __APP_COMMIT__ !== 'undefined' ? __APP_COMMIT__ : 'dev';
/** Shown in the landing footer, e.g. `v0.1.0 · 86d266b`. */
export const VERSION_LABEL = `v${APP_VERSION} · ${APP_COMMIT}`;
