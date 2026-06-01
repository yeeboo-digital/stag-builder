# Architecture — Yeeboo S-Tag Builder

One codebase, three editions, selected by a single environment flag. The
deterministic template engine is shared by all of them; AI is an optional layer
on top.

```
                     ┌─────────────────────────────────────┐
   Shared core ────▶ │  lib/templates.ts  (template engine) │  deterministic,
                     │  components/Wizard.tsx (guided UI)    │  always-correct,
                     └──────────────────┬───────────────────┘  no key, $0
                                        │
              NEXT_PUBLIC_AI_MODE=on ───┤
                                        ▼
                     ┌─────────────────────────────────────┐
                     │  components/AiAssist.tsx             │  free-form English
                     │  app/api/generate/route.ts (proxy)   │  → Claude (Haiku)
                     └─────────────────────────────────────┘  needs a key
```

## The three editions

| Edition | Who runs it | `NEXT_PUBLIC_AI_MODE` | Key | Build | Cost |
|---|---|---|---|---|---|
| **Hosted demo** | Yeeboo | `on` | Yeeboo's | `npm run build` (Vercel) | Capped — demo only |
| **Island** | Anyone | `off` | none | `npm run build:island` (static) | $0 |
| **Self-hosted AI** | Power users | `on` | *their own* | `npm run build` (Vercel) | $0 to Yeeboo |

All three are the same source tree. The only differences are the flag, whether a
key is present, and which build command is used.

## How the flag works

- `lib/config.ts` exposes `AI_ENABLED = process.env.NEXT_PUBLIC_AI_MODE === "on"`.
- When **off**: `app/page.tsx` renders only the guided `Wizard`; no tabs, no
  network calls. The `/api/generate` route also self-disables (returns 503) as a
  belt-and-suspenders guard.
- When **on**: a second tab — "Describe it with AI" — mounts `AiAssist`, which
  calls `/api/generate`.

## Build targets

- **Server build** (`npm run build`): a normal Next.js app. Keeps the
  `/api/generate` route. Deploy to Vercel/Netlify/Node. Used by the hosted demo
  and by self-hosters.
- **Static island** (`npm run build:island`): produces a fully static export in
  `out/` for GitHub Pages or any static host. Because Next.js static export
  can't ship a POST route handler, `scripts/build-island.mjs` temporarily moves
  `app/api` aside during the build (and always restores it). Sets
  `BUILD_TARGET=static` (→ `output: 'export'` in `next.config.js`) and forces
  `NEXT_PUBLIC_AI_MODE=off`.
  - **Build isolation:** the island build uses `distDir: .next-island` so it
    never collides with a running `next dev` (which owns `.next`). The script
    then publishes the static site from `.next-island` to `out/`. This means you
    can safely run `npm run build:island` while the dev server is live. The
    regular `npm run build` still uses `.next` (Vercel needs it there), so avoid
    running *that* one while `next dev` is up.

> Simplest island deploy: you don't *need* the static export. Deploying the
> normal build with `NEXT_PUBLIC_AI_MODE=off` to any host also gives a zero-cost
> island — the static export only matters for serverless-free hosts like GitHub
> Pages.

## The template engine

`lib/templates.ts` holds one `StagTemplate` per documented pattern. Each is a
pure function: typed params in → `{ code, explanation }` out. Because the syntax
is *assembled* rather than *predicted*, output is always well-formed — no
hallucinated tags. Patterns covered: name+fallback, field-presence, group
two-way, OR (T-technique), AND, three-way split, exact field match, and two
autoresponder variants. Syntax verified against Blackbaud's official S-tag docs.

## Cost controls (AI mode)

The AI surface is intentionally small — most users never leave the free template
path. For the bits that do hit the API:

1. **Hard spend cap — $20/month** — set this monthly budget limit in the
   Anthropic console (Settings → Limits / Billing). This is the real circuit
   breaker; nothing can exceed it. At ~$0.006/generation on Haiku, $20 covers
   roughly 3,000+ AI generations a month before the cap trips.
2. **Model** — defaults to Haiku 4.5 (`ANTHROPIC_MODEL` to override). ~3× cheaper
   than Sonnet for this well-scoped task.
3. **Per-IP rate limiting** — `app/api/generate/route.ts` ships a simple
   in-memory limiter (10/IP/min). Per-instance; does not survive cold starts.
4. **Global usage backstop** — `lib/usage-guard.ts` caps *total* generations
   per day and per month across all users (defaults 200/day, 2,500/month ≈ $20
   on Haiku), returning a friendly 429 when hit. This sits *beneath* the console
   spend cap so a burst can't drain the month's budget overnight before the
   console cap reacts. Configure via `MAX_GEN_PER_DAY` / `MAX_GEN_PER_MONTH`.
   - **Accuracy across instances:** set `KV_REST_API_URL` + `KV_REST_API_TOKEN`
     (Vercel KV) or `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN`
     (Upstash). The guard then counts in a shared store. Without them it falls
     back to best-effort in-memory (per-instance, resets on cold start). On any
     KV error it fails open — the console cap is the true hard ceiling.
5. **Optional**: a "bring your own key" mode for power users reduces Yeeboo's
   exposure to ~zero.

Rough cost per generation: ~$0.006 on Haiku (~$0.017 on Sonnet). At a few
hundred generations/day that's tens of dollars/month; the spend cap bounds the
worst case.
