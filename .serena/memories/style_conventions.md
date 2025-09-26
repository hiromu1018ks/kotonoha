# Style & Conventions
- TypeScript strict mode, 2-space indentation, Prettier defaults.
- Components/hooks in PascalCase (e.g., `EditorPanel.tsx`, `useProofread.ts`); utilities/tests camelCase file names.
- One component per file; TailwindCSS utility classes preferred, long-form styles in `app/styles/`.
- Shared UI in `app/components/`, state/utility modules in `lib/<domain>`.
- API handlers in `app/api/...` must reuse zod schemas from `lib/validation`.
- Keep test fixtures & MSW handlers in `tests/mocks/`.
- Sanitize Gemini-derived markup with DOMPurify before rendering.
