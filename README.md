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
