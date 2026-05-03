# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## IMPORTANT: Always Consult `/docs` First

> **Before writing any code, Claude Code MUST first check the `/docs` directory for a relevant documentation file and follow its guidance.** This applies to every feature, component, API route, or configuration change — no exceptions. If a relevant doc exists, it is the authoritative source and takes precedence over training data or assumptions.

## Commands

```bash
npm run dev      # Start dev server (outputs to .next/dev, uses Turbopack by default)
npm run build    # Production build (uses Turbopack by default)
npm run start    # Start production server
npm run lint     # Run ESLint directly (next lint was removed in v16)
```

No test runner is configured yet.

## Architecture

Next.js 16.2 app using the App Router (`src/app/`). TypeScript, Tailwind CSS v4 (PostCSS plugin), React 19.2. Path alias `@/*` maps to `src/*`.

## Next.js 16 Breaking Changes

This is **Next.js 16**, not 15. Key differences from training data:

- **Async Request APIs** — `cookies()`, `headers()`, `draftMode()`, `params`, and `searchParams` are async-only. Always `await` them. Run `npx next typegen` to generate `PageProps`/`LayoutProps`/`RouteContext` helpers.
- **`middleware` renamed to `proxy`** — Use `proxy.ts` with `export function proxy(request: Request)`. Edge runtime is not supported in proxy; use `middleware` if you need edge.
- **`next lint` removed** — Use `eslint` CLI directly. `next build` no longer runs linting.
- **`serverRuntimeConfig`/`publicRuntimeConfig` removed** — Use `process.env` and `NEXT_PUBLIC_` prefix instead.
- **`revalidateTag` requires second argument** — `revalidateTag('key', 'max')`. Use `updateTag` for immediate cache expiry in Server Actions.
- **`cacheLife`/`cacheTag` stable** — No longer need `unstable_` prefix.
- **PPR via `cacheComponents`** — Replace `experimental.ppr` with `cacheComponents: true` in next.config.
- **`experimental.dynamicIO` removed** — Use `cacheComponents` instead.
- **Parallel routes require `default.js`** — All parallel route slots need an explicit `default.js` or build fails.
- **`next/legacy/image` deprecated** — Use `next/image` only.
- **`images.domains` deprecated** — Use `images.remotePatterns`.
- **AMP fully removed** — `next/amp` and `useAmp` no longer exist.
- **Turbopack is default** — No `--turbopack` flag needed. Use `--webpack` to opt out.
- **Dev outputs to `.next/dev`** — Separate from production build output.
- **ESLint flat config** — `eslint.config.mjs` format (already set up).
- **React Compiler stable** — Enable via `reactCompiler: true` in next.config (not enabled by default).
- **`turbopack` config top-level** — Move from `experimental.turbopack` to top-level `turbopack` in next.config.

Refer to `node_modules/next/dist/docs/` for up-to-date API documentation.
