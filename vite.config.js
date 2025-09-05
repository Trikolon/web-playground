import { defineConfig } from 'vite';
import { cloudflare } from '@cloudflare/vite-plugin';
import { publicIndexPlugin } from './lib/publicIndexPlugin';
import fs from 'fs';

/**
 * If cert and key are present use HTTPS, otherwise return undefined which makes
 * vite default to http.
 */
function getHttpsConfig() {
  try {
    return {
      key: fs.readFileSync(new URL('./certs/key.pem', import.meta.url)),
      cert: fs.readFileSync(new URL('./certs/cert.pem', import.meta.url)),
    };
  } catch (e) {
    console.info('Could not get cert and key, using http');
    return undefined;
  }
}

export default defineConfig(({ command }) => ({
  plugins: [
    cloudflare({
      experimental: { headersAndRedirectsDevModeSupport: true },
    }),
    publicIndexPlugin(),
  ],
  server: {
    allowedHosts: ['localhost', 'example.com', 'example.org', 'example.net'],
    // Only enable https if Vite is serving the files directly, e.g. when using
    // "vite dev".
    https: command == 'serve' ? getHttpsConfig() : undefined,
  },
}));
