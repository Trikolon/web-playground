import { defineConfig } from "vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { publicIndexPlugin } from "./lib/publicIndexPlugin";
import fs from "fs";

export default defineConfig({
  plugins: [
    cloudflare({
      experimental: { headersAndRedirectsDevModeSupport: true },
    }),
    publicIndexPlugin(),
  ],
  server: {
    allowedHosts: ["localhost", "example.com", "example.org", "example.net"],
    https: {
      key: fs.readFileSync(new URL('./certs/key.pem', import.meta.url)),
      cert: fs.readFileSync(new URL('./certs/cert.pem', import.meta.url)),
    }
  },
});
