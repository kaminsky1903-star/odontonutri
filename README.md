# odontonutri

Production site for [odontonutri.com](https://www.odontonutri.com) — Vite 8 + React SPA + Cloudflare Workers.

The public brand is **Odontología y Nutrición** (Bella Vista, San Miguel). `main` deploys to `www.odontonutri.com`.

## Develop

```bash
npm install
npm run dev
```

`npm run dev` starts Vite with the Cloudflare plugin (Workers runtime + HMR).

## Test

```bash
npm test
npm run typecheck
```

`npm test` runs Vitest (page content, theme, Worker redirects/API, and search metadata). `npm run test:watch` reruns on change.

## Build & deploy

```bash
npm run build
npm run deploy
```

Cloudflare Workers Builds:

- **Branch:** `main` → production (`www.odontonutri.com`)
- **Build command:** `npm run build` (preferred; CI also builds via `postinstall` when `WORKERS_CI=1`)
- **Deploy command:** `npx wrangler deploy`

The Worker redirects `odontonutri.com` → `www.odontonutri.com` and serves `/api/` as JSON. Static assets, including `public/logo.png`, `public/og-image.png`, `robots.txt`, and `sitemap.xml`, are served as the SPA.
