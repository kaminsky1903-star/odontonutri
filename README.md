# odontonutri

Production site for [odontonutri.com](https://www.odontonutri.com) on Cloudflare Workers (static assets + `/api`).

## Develop

```bash
npm install
npm run dev
```

## Deploy

Cloudflare Workers Builds is connected to this repo.

- **Branch:** `main` → production (`www.odontonutri.com`)
- **Build command:** `npm ci`
- **Deploy command:** `npx wrangler deploy`

Push to `main` to deploy. Manual:

```bash
npm run deploy
```
