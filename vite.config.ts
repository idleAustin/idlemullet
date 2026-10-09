import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync, execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

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

export default defineConfig({
  base: process.env.BASE_URL ?? '/',
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_COMMIT__: JSON.stringify(buildCommit()),
  },
  server: {
    port: 8080,
  },
});
