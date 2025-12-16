# News App (MVP)

Local scaffold for the swipe-first News App MVP.

Prereqs: Node.js 18+ and npm/yarn.

Quick start:

```bash
# install deps
npm install

# create .env from .env.example and set VITE_NEWSAPI_KEY
cp .env.example .env
# run dev server
npm run dev
```

Notes:
- This scaffold uses `VITE_NEWSAPI_KEY` for local development. Do NOT commit secrets.
- For production, use a serverless proxy to protect the API key (see `agent-output/architecture/adr-0001-serverless-proxy.md` TODO).

Deployment (Vercel)
--------------------
1. Create a project on Vercel and set the following repository secrets in GitHub (`Settings → Secrets`):
	- `VERCEL_TOKEN` — your Vercel personal token
	- `VERCEL_ORG_ID` — your Vercel organization id
	- `VERCEL_PROJECT_ID` — your Vercel project id
2. In Vercel project settings, set an environment variable `NEWSAPI_KEY` to your NewsAPI key.
3. Push to `main` — the workflow `.github/workflows/deploy-vercel.yml` will run and deploy the preview/production site.

You can also deploy manually using the Vercel CLI:

```bash
npm i -g vercel
vercel login
vercel --prod
```

