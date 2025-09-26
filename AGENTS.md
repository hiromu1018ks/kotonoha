# Repository Guidelines

## Project Structure & Module Organization
The repository currently ships planning material under `docs/`. Next.js application code should live in `app/` with route groups mapping to user flows (e.g., `app/(editor)/page.tsx`). Shared UI belongs in `app/components/`; state stores and utilities in `lib/`, grouped by domain (`lib/gemini`, `lib/format`). API handlers sit in `app/api/proofread/route.ts` and must import shared zod schemas from `lib/validation`. Keep mock data, MSW handlers, and fixtures inside `tests/mocks/` so runtime bundles stay lean.

## Build, Test, and Development Commands
`pnpm install` restores dependencies; prefer pnpm to keep lockfile stable. `pnpm dev` launches the Next.js dev server with hot reload and API routes at http://localhost:3000. `pnpm lint` runs ESLint + TypeScript checks using the Next.js core-web-vitals config. `pnpm test` executes unit and integration suites (Vitest + MSW). `pnpm playwright test` drives end-to-end flows for editor → proofread → apply. `pnpm build` creates the production bundle and validates server rendering.

## Coding Style & Naming Conventions
Use TypeScript strict mode, 2-space indentation, and Prettier defaults. Components and hooks follow PascalCase (`EditorPanel.tsx`, `useProofread.ts`). Utility modules and test helpers use camelCase file names. Export single component per file. Keep CSS in Tailwind classes; co-locate long form styles inside `app/styles/*.css` when utility classes are insufficient. Run `pnpm lint --fix` before pushing.

## Testing Guidelines
Author unit specs alongside source in `__tests__` folders, suffixing files with `.test.ts` or `.test.tsx`. Mock Gemini responses with MSW handlers in `tests/mocks/handlers.ts`. End-to-end scripts belong in `tests/e2e/` and should capture screenshots on failure. Target ≥90% critical path coverage; Playwright runs must cover timeout, rate-limit, and XSS scenarios described in `docs/design.md`. Gate pull requests on a green `pnpm test` + `pnpm playwright test`.

## Commit & Pull Request Guidelines
Use Conventional Commit headers (`feat:`, `fix:`, `chore:`) with scope when meaningful (`feat(editor): add reason modal`). Commits should be focused and include updated tests or notes when not applicable. Pull requests need: concise summary, validation checklist (`pnpm lint`, tests run), linked issue or doc section, and UI screenshots/GIFs when front-end changes are visible. Draft PRs are encouraged for early feedback; convert to ready once CI passes.

## Security & Configuration Tips
Load secrets via `.env.local`; never commit keys. Server-only modules must stay in `app/api` or `lib/server`. Sanitize any Gemini-derived markup with DOMPurify prior to rendering. Keep Vercel environment variables in sync across preview and production projects, and rotate `GEMINI_API_KEY` immediately if exposure is suspected.
