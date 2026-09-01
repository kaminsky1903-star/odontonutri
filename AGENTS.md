# AGENTS.md

This is the production site for **Odontología y Nutrición** (`www.odontonutri.com`).

## Stack

- Vite 8 + React 19 SPA in `src/`
- Cloudflare Worker in `worker/index.ts` (apex → www redirect, `/api/` JSON)
- Static files in `public/` (logo, Open Graph image, robots, sitemap)
- Search metadata and JSON-LD live in `index.html` so Google/Bing do not need JS

## Clinic facts

Do not invent hours, prices, ratings, or extra locations. Keep Spanish copy with accents (`Odontología y Nutrición`). Shared constants belong in `src/site.ts`.

- Address: Av. Senador Morón 858, Bella Vista, San Miguel
- Phone: +54 11 6137 0040
- Instagram: https://www.instagram.com/odontologia.nutricion/
- WhatsApp: https://wa.link/g6wqj3
- People named on the site: Dr. Kaminsky (odontología), Lic. González (nutrición)

Instagram belongs in the visit card, not the header or footer.

## Commands

- `npm run dev` — local Vite + Workers
- `npm test` — Vitest; run after UI, Worker, or SEO changes
- `npm run typecheck`
- `npm run deploy` — production build + Wrangler

`main` deploys via Cloudflare Workers Builds. Prefer `npm run build` as the dashboard build command. `scripts/ci-build-if-needed.mjs` still runs Vite when `WORKERS_CI=1` because the dashboard may be `npm ci`.

## Guardrails

- Public HTML routes must go through `env.ASSETS` so `/odontologia` and `/nutricion` work without a browser `Sec-Fetch-Mode: navigate` header (Instagram in-app). Force HTTPS and www in the Worker.
- Do not commit Wrangler tokens, `worker-content.bin`, or `.dev.vars`.
- `scripts/` are one-off Cloudflare/GitHub helpers, not runtime.
- After changing clinic info, update `src/site.ts`, `index.html` metadata, and tests together.
