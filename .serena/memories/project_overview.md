# Kotonoha Overview
- Purpose: Next.js web app (App Router) for Gemini-powered editing/proofreading workflows; design docs live in `docs/`.
- Tech stack: Next.js 15 (App Router) with React 19, TypeScript 5 strict mode, TailwindCSS 4.
- Structure: runtime code under `src/app` (layouts, pages, global styles); shared UI planned for `app/components/`, utilities under `lib/`, API routes under `app/api/`; docs and planning in `docs/`.
- Hosting/deploy: designed for Vercel; uses Turbopack for dev/build.
- Env: secrets via `.env.local`; Gemini API integration must sanitize output (per design docs).
