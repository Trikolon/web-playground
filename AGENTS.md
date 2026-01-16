# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Cloudflare Workers & Pages project that serves as a web playground for testing various web APIs and browser features. It combines static HTML pages (in `public/`) with dynamic route handlers (in `src/routes/`) using Cloudflare Workers.

## Development Commands

```bash
# Install dependencies
npm i

# Start development server with hot reload
npm run dev

# Build the project (outputs to dist/)
npm run build

# Preview the production build locally
npm run preview

# Deploy to Cloudflare
npm run deploy

# Generate TypeScript types from wrangler.jsonc
npm run cf-typegen

# Generate local SSL certificates for HTTPS development
npm run gen-certs

# Format code with Prettier
npm run prettier
```

## Architecture

### Request Routing Logic (src/index.ts)

The worker handles requests with this precedence:

1. **Static files**: If a matching path exists in `public/` (after build, served from `dist/`), serve it. Index files are automatically served (e.g., `/foo/` serves `public/foo/index.html`).

2. **Dynamic routes**: If no static file matches, check for a route handler in `src/routes/`:
   - `/hello/` → `src/routes/hello/index.ts`
   - `/hello/bar` → `src/routes/hello/bar.ts`

3. **Trailing slash redirect**: If no match found but adding a trailing slash would match an `index.ts`, redirect to add the slash.

4. **404**: If none of the above match, return 404.

### Route Modules (src/routes/**/index.ts)

Route modules must export a default function matching Cloudflare's `ExportedHandler['fetch']` signature:

```typescript
const route: ExportedHandler<Env>['fetch'] = async (request, env, ctx) => {
  return new Response('Hello');
};
export default route;
```

Routes are loaded dynamically via Vite's `import.meta.glob()` pattern.

**Title convention**: Add `// title: Your Title` as the first line to have it appear in the generated index page.

### Build Process & Index Generation

The custom Vite plugin `lib/publicIndexPlugin.ts` automatically generates `public/index.html` during builds and hot reload. It:

1. Scans `public/*/index.html` and `src/routes/*/index.ts`
2. Extracts titles from `<title>` tags (HTML) or `// title:` comments (TypeScript)
3. Creates a sorted list of all available endpoints/pages
4. Adds repository URL footer from package.json

### Static Assets & Configuration

- **public/_headers**: Cloudflare Pages headers configuration (e.g., CORS, Clear-Site-Data)
- **public/_redirects**: Cloudflare Pages redirects (supported but not currently used)
- **certs/**: Local SSL certificates for HTTPS development (generate with `npm run gen-certs`)

### HTTPS Development

The vite.config.js is configured to serve with HTTPS when running `npm run dev` if certificate files exist in `certs/`. The server allows multiple hosts: localhost, example.com, example.org, example.net.

### Deployment Configuration (wrangler.jsonc)

- **Worker name**: `playground`
- **Routes**: Deployed to `playground.emz.run/*` and `pläygröünd.emz.run/*` (non-ASCII test route)
- **Assets**: Serves from `./dist` directory after build
- **Observability**: Enabled for monitoring

## Adding New Content

### Static HTML page
1. Create `public/your-page/index.html`
2. Include `<title>Your Page Title</title>` for index generation
3. Will be automatically available at `/your-page/`

### Dynamic route
1. Create `src/routes/your-route/index.ts`
2. Add `// title: Your Route Title` as first line
3. Export default function with signature: `ExportedHandler<Env>['fetch']`
4. Will be automatically available at `/your-route/`

## TypeScript Configuration

- **Target**: ES2021
- **Module system**: ES2022 with Bundler resolution
- **Strict mode**: Enabled
- **No emit**: TypeScript is used for type checking only; Vite handles compilation
- **Worker types**: Imported from `worker-configuration.d.ts` (generated via `npm run cf-typegen`)
