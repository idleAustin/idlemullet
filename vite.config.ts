import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { resolveAllGameVersions } from './scripts/game-versions.mjs';

/** Release version from git tags and commit messages; see scripts/version.mjs. */
let version = '0.1.0';
try {
  version = execFileSync('node', [fileURLToPath(new URL('./scripts/version.mjs', import.meta.url))]).toString().trim();
} catch {
  // fallback if version script fails before first commit
}

/** Short commit of the build: CI's checkout, else the local repo, else dev. */
function buildCommit() {
  if (process.env.GITHUB_SHA) return process.env.GITHUB_SHA.slice(0, 7);
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch {
    return 'dev';
  }
}

const commit = buildCommit();
const gameVersions = resolveAllGameVersions();

/** Emits dist/version.json at build time and serves /<slug>/version.json in local dev. */
function versionManifestPlugin(): Plugin {
  const appManifest = JSON.stringify({ version: `v${version.replace(/^v/, '')}`, commit });
  return {
    name: 'version-manifest',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0];
        if (url === '/version.json') {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(appManifest);
          return;
        }
        const match = url?.match(/^\/([^/]+)\/version\.json$/);
        if (match && gameVersions[match[1]]) {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          res.end(JSON.stringify({ version: gameVersions[match[1]] }));
          return;
        }
        next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'version.json', source: appManifest });
    },
  };
}

export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  plugins: [react(), versionManifestPlugin()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_COMMIT__: JSON.stringify(commit),
    __GAME_VERSIONS__: JSON.stringify(gameVersions),
  },
  server: {
    port: 8080,
  },
});
