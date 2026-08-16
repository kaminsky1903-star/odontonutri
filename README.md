# odontonutri

Production site for [odontonutri.com](https://www.odontonutri.com) on Cloudflare Workers (static assets + `/api`).

## Develop

```bash
npm install
npm run dev
```

## Deploy

Pushes to `main` deploy via GitHub Actions (`.github/workflows/deploy.yml`).

Manual:

```bash
npm run deploy
```

## Secrets (GitHub Actions)

Repo secrets required:

- `CLOUDFLARE_API_TOKEN` — Workers Edit token
- `CLOUDFLARE_ACCOUNT_ID` — `455ddfcb7b812fc7bf48ba620b65f1d9`
