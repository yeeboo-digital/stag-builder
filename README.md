# Yeeboo S-Tag Builder

A free, publicly accessible tool that helps Blackbaud Luminate Online users generate
S-tag and conditional logic code for email personalization — in plain English.

Built by [Yeeboo Digital](https://yeeboo.com) for BB Dev Days 2026 and published as a free community resource.

---

## Why this exists

The Luminate Online email editor's built-in conditional UI corrupts S-tag code when
users switch between the WYSIWYG editor and the source/code view. This external tool
is the correct workflow: build your code here, paste into the HTML/source view, done.

---

## Three editions, one codebase

A single `NEXT_PUBLIC_AI_MODE` flag selects the edition. See
[ARCHITECTURE.md](ARCHITECTURE.md) for the full picture.

| Edition | AI mode | Key | Cost | Build |
|---|---|---|---|---|
| **Island** (default) | `off` | none | $0 | `npm run build:island` (static) |
| **Self-hosted AI** | `on` | your own | your usage | `npm run build` (server) |
| **Hosted demo** | `on` | Yeeboo's | capped | runs at the demo URL |

The **guided wizard** (template engine) works in every edition with no key. The
**AI-assist** free-form box only appears when AI mode is on.

---

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). With the default
`NEXT_PUBLIC_AI_MODE=off` you get the zero-cost island — no key needed.

To enable the AI-assist tab, set in `.env.local`:

```bash
NEXT_PUBLIC_AI_MODE=on
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_AI_MODE` | No | `on` enables AI-assist; `off` (default) is the island |
| `ANTHROPIC_API_KEY` | AI mode only | Anthropic key — server-side only, never in the browser |
| `ANTHROPIC_MODEL` | No | Override the model (default: `claude-haiku-4-5-20251001`) |
| `NEXT_PUBLIC_SITE_URL` | No | Deployed site URL, used for SEO/OpenGraph metadata |

---

## Deployment

### Island (static — GitHub Pages, Netlify, any static host)

```bash
npm run build:island   # outputs to ./out — no server, no key
```

### Server build with AI (Vercel)

```bash
vercel --prod
```

Set `NEXT_PUBLIC_AI_MODE=on` and `ANTHROPIC_API_KEY` in your Vercel project's
environment variables. Mark the key as "Server" scope only, and set a **$20/month
spend cap** in the Anthropic console (see ARCHITECTURE.md → Cost controls).

---

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Anthropic SDK** (server-side API proxy)
- **Vercel** deployment

---

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for the three-edition design. File map:

```
app/
  page.tsx                # Tabs: guided Wizard (always) + AI-assist (if enabled)
  layout.tsx              # Root layout, Inter + Fira Code fonts, metadata
  globals.css             # Tailwind base + custom styles
  api/generate/route.ts   # Claude proxy (POST) — key server-side; off in island
components/
  Wizard.tsx              # Guided template builder with live editing (no key)
  AiAssist.tsx            # Free-form "describe it" box (AI mode only)
  WorkflowWarning.tsx     # Always-visible amber warning bar
  QuickStarts.tsx         # Pre-built prompt chips (AI mode)
  BuilderForm.tsx         # Prompt textarea + generate button (also follow-up)
  CodeOutput.tsx          # Dark code block, copy button, loading/error/empty
  TagReference.tsx        # Collapsible quick-reference slide-in panel
lib/
  templates.ts            # Deterministic S-tag template engine (island core)
  config.ts               # AI_ENABLED flag
  system-prompt.ts        # Full S-tag system prompt (mirror of SYSTEM_PROMPT.md)
  quickstarts.ts          # Quick-start chip definitions
  types.ts                # Shared TypeScript interfaces
  parse.ts                # Splits Claude output into code + explanation
scripts/
  build-island.mjs        # Static-export build (no server, no API route)
```

In AI mode the Anthropic API key never leaves the server. The client only sends
prompt text and receives generated code.

> **Note on model:** the AI route defaults to Haiku 4.5
> (`claude-haiku-4-5-20251001`), overridable via `ANTHROPIC_MODEL`.

---

## Updating the Knowledge Base

The S-tag system prompt lives in `lib/system-prompt.ts`. The human-readable source is
`SYSTEM_PROMPT.md`. To update the AI's knowledge:

1. Edit `SYSTEM_PROMPT.md`
2. Mirror the change into `lib/system-prompt.ts` (backticks escaped as `\``)
3. Redeploy

The guided wizard's patterns live separately in `lib/templates.ts` — add or edit
a `StagTemplate` there to change the no-key island builder.

---

## License

MIT — free to use, fork, and adapt.

---

*Questions: erik@yeeboo.com | [yeeboo.com](https://yeeboo.com)*
