# odontonutri

Production site for [odontonutri.com](https://www.odontonutri.com) — Vite 8 + React SPA + Cloudflare Workers.

## Develop

```bash
npm install
npm run dev
```

`npm run dev` starts Vite with the Cloudflare plugin (Workers runtime + HMR).

## Build & deploy

```bash
npm run build
npm run deploy
```

Cloudflare Workers Builds:

- **Branch:** `main` → production (`www.odontonutri.com`)
- **Build command:** `npm run build` (preferred; CI also builds via `postinstall` when `WORKERS_CI=1`)
- **Deploy command:** `npx wrangler deploy`
