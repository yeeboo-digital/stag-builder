# Yeeboo S-Tag Builder — Claude Code Spec
## Project: Luminate Online S-Tag & Conditional Code Generator
## Owner: Yeeboo Digital | yeeboodigital.com
## Status: Ready to build

---

## WHAT WE'RE BUILDING

A publicly accessible web tool that helps Blackbaud Luminate Online users generate
S-tag and conditional logic code for email personalization — without needing to
understand the underlying syntax.

Users describe what they want their email to do in plain English. The tool returns
production-ready S-tag code they can paste directly into the Luminate email editor's
source/HTML view.

**Why this exists:** The Luminate email editor's built-in conditional UI corrupts
S-tag code when users switch between WYSIWYG and source/code view. This external
tool is the safe workflow.

**Who uses it:** Luminate Online email administrators — from beginners who've never
seen an S-tag to experienced practitioners who want complex conditionals fast.

---

## TECH STACK

```
Next.js 14 (App Router)
TypeScript
Tailwind CSS
Anthropic SDK (@anthropic-ai/sdk) — server-side only
Vercel deployment
```

**Why Next.js:** API routes keep the Anthropic API key server-side. The tool is
a single-page experience but needs a thin backend to proxy Claude calls securely.

**Do not** call the Anthropic API from the browser/client. Always route through
a Next.js API route (`/api/generate`).

---

## FILE STRUCTURE

```
stag-builder/
├── app/
│   ├── page.tsx              # Main UI — the builder
│   ├── layout.tsx            # Root layout, fonts, metadata
│   ├── globals.css           # Tailwind base + custom styles
│   └── api/
│       └── generate/
│           └── route.ts      # Claude API proxy — POST handler
├── components/
│   ├── BuilderForm.tsx       # Main input area + quick-start buttons
│   ├── CodeOutput.tsx        # Generated code display + copy button
│   ├── QuickStarts.tsx       # Pre-built prompt chips
│   ├── WorkflowWarning.tsx   # The WYSIWYG corruption warning
│   └── TagReference.tsx      # Collapsible quick reference panel
├── lib/
│   ├── system-prompt.ts      # The Claude system prompt (exported as const)
│   └── types.ts              # TypeScript interfaces
├── public/
│   └── yeeboo-logo.svg       # Yeeboo wordmark (create simple SVG text version)
├── .env.local                # ANTHROPIC_API_KEY (never committed)
├── .env.example              # Template with placeholder key
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## ENVIRONMENT VARIABLES

```bash
# .env.local (never commit this file)
ANTHROPIC_API_KEY=sk-ant-...

# Optional: rate limiting / analytics
NEXT_PUBLIC_SITE_URL=https://s-tags.yeeboodigital.com
```

`.env.example`:
```bash
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

---

## API ROUTE — `/api/generate/route.ts`

```typescript
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { prompt, conversationHistory } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // Build messages array — support multi-turn conversation
    const messages = [
      ...(conversationHistory || []),
      { role: "user" as const, content: prompt },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages,
    });

    const assistantMessage = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({
      result: assistantMessage,
      // Return the updated history so client can maintain conversation
      updatedHistory: [
        ...(conversationHistory || []),
        { role: "user", content: prompt },
        { role: "assistant", content: assistantMessage },
      ],
    });
  } catch (error) {
    console.error("Generate error:", error);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
```

---

## SYSTEM PROMPT — `/lib/system-prompt.ts`

**CRITICAL:** Copy the full content from `SYSTEM_PROMPT.md` (included in this package)
into this file exactly as written. Do not summarise or truncate it.

```typescript
export const SYSTEM_PROMPT = `
[PASTE FULL CONTENT OF SYSTEM_PROMPT.md HERE]
`;
```

---

## UI SPECIFICATION

### Layout

Single-page layout. No navigation. No auth. No login.

```
┌─────────────────────────────────────────────────────┐
│  YEEBOO  S-Tag Builder        [Quick Reference ↗]   │
│  ─────────────────────────────────────────────────  │
│  ⚠️  Workflow reminder bar (always visible)          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  QUICK-STARTS (chips/pills row)                     │
│  [Name + fallback] [Monthly vs one-time]            │
│  [Group conditional] [OR logic] [Three-way split]   │
│  [Autoresponder thank-you] [City targeting]         │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  PROMPT INPUT                                       │
│  ┌─────────────────────────────────────────────┐   │
│  │ Describe what you want your email to do...  │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│                                    [Generate →]     │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  OUTPUT                                             │
│  ┌─────────────────────────────────────────────┐   │
│  │  S-TAG CODE                    [Copy code]  │   │
│  │  ─────────────────────────────────────────  │   │
│  │  [[?[[S45:1234]]::TRUE::                    │   │
│  │    Monthly donor content.                   │   │
│  │  ::                                         │   │
│  │    One-time donor content.                  │   │
│  │  ]]                                         │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  EXPLANATION                                        │
│  ─────────────────────────────────────────────────  │
│  Plain English explanation of what the code does   │
│                                                     │
│  [Ask a follow-up or refine...]  [Clear]            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Workflow Warning Bar

Always visible. Never dismissable. Appears directly below the header.

```
⚠️  Built for source/HTML view only. After generating code, open your Luminate
    email in the HTML/source editor — not the WYSIWYG visual editor — and paste
    there. Switching to the visual editor after pasting will corrupt your code.
```

Style: amber/yellow background (`#FEF3C7`), amber border, dark text. Full width.

### Quick-Start Chips

Clicking a chip pre-fills the prompt input with a starter prompt. The user
can edit it before generating. Chips:

| Label | Pre-fills prompt with |
|---|---|
| Name + fallback | "Add a personalized first name greeting. If the name is missing, show 'Friend' instead." |
| Monthly vs one-time | "Show different content to my monthly donors vs one-time donors. My monthly donor group ID is [GROUP_ID] — I'll fill that in." |
| Group conditional | "Show content only to members of a specific group. Group ID: [GROUP_ID]" |
| OR logic — either group | "Show content to donors who are in either Group A (ID: [GROUP_A]) OR Group B (ID: [GROUP_B])." |
| Three-way split | "Show three different messages: one for major donors (Group ID: [MAJOR]), one for mid-level donors (Group ID: [MID]), and one for everyone else." |
| Autoresponder thank-you | "Create a donation thank-you email that shows different content to recurring (monthly) donors vs one-time donors." |
| City targeting | "Show a personalised message that includes the donor's city name, but only if we have their city on file." |

### Code Output Block

- Monospace font (Fira Code, Courier New, or system monospace)
- Dark background (e.g. `#0F172A`)
- Teal syntax highlighting for S-tag brackets `[[` `]]`
- Line numbers optional but nice
- Copy button top-right — copies raw code to clipboard
- On copy: button shows "Copied ✓" for 2 seconds then resets
- Code block is scrollable if content overflows

### Explanation Section

Below the code block. Rendered as regular prose (not code). Explains:
- What each tag does
- Any group IDs or values the user needs to replace
- Any caveats (e.g. "S120:dc tags only work in donation autoresponders")

### Conversation / Follow-Up

After initial generation, show a smaller follow-up input:
"Ask a follow-up or refine..."

This maintains conversation history so the user can say things like:
- "Can you add a name personalisation to the opening?"
- "Change the false branch to also include an upgrade ask"
- "Make the monthly donor message shorter"

Show a "Clear conversation" button to start fresh.

---

## BRAND / VISUAL DESIGN

### Colours

```
Primary Navy:    #1B3358
Teal Accent:     #00B4C5
Teal Dark:       #0099AA
Dark BG:         #0F172A (code blocks)
Off-white BG:    #F4F7FA (page background)
Charcoal text:   #1E293B
Muted text:      #64748B
Border:          #E2E8F0
Amber warning:   #FEF3C7 bg / #D97706 border / #92400E text
Green success:   #D1FAE5 bg / #065F46 text
```

### Typography

```
Headings:  Inter or system-ui, bold
Body:      Inter or system-ui, regular
Code:      'Fira Code', 'Courier New', monospace
```

Use Next.js font optimisation (`next/font`) for Inter if available.

### Tailwind Config

Extend the default config with Yeeboo brand colours:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        navy: "#1B3358",
        teal: {
          DEFAULT: "#00B4C5",
          dark: "#0099AA",
        },
      },
      fontFamily: {
        mono: ["Fira Code", "Courier New", "monospace"],
      },
    },
  },
};
```

### Header

Simple. Left: "YEEBOO S-Tag Builder" (navy, bold). Right: "Quick Reference" link
(opens a collapsible panel or new tab). No heavy navigation.

---

## QUICK REFERENCE PANEL

A collapsible panel (slide-in from right, or accordion below the header).
Triggered by "Quick Reference" link. Content: the confirmed tags table from
Section 13 of the knowledge base, rendered as a readable reference card.

Sections:
1. Personalization tags (S1 field list)
2. Conditional syntax cheat sheet
3. Common patterns (copy-paste blocks)
4. Workflow reminder

---

## LOADING / ERROR STATES

**Loading:** Show a pulsing/animated placeholder in the output area.
Text: "Building your S-tag code..." — do not show a spinner alone, show text.

**Error:** Show a friendly error message in the output area:
"Something went wrong generating your code. Please try again, or rephrase your request."

**Empty state:** Before any generation, show a subtle placeholder in the output area:
"Your generated S-tag code will appear here. Ready to paste into Luminate's HTML/source view."

---

## PERFORMANCE & DEPLOYMENT

### Vercel Deployment

```bash
# vercel.json (optional, for config)
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

Set `ANTHROPIC_API_KEY` as an environment variable in the Vercel dashboard.
Mark it as a server-side secret (not exposed to browser).

### Rate Limiting (Nice to Have)

If traffic becomes an issue, add basic rate limiting in the API route:
- Max 10 requests per IP per minute
- Return 429 with "Too many requests" message

Use `@upstash/ratelimit` with Vercel KV, or a simple in-memory map for MVP.

### SEO / Metadata

```typescript
// app/layout.tsx metadata
export const metadata = {
  title: "S-Tag Builder — Yeeboo Digital",
  description:
    "Free tool for Blackbaud Luminate Online users. Generate S-tag personalization and conditional logic code for email in plain English.",
  openGraph: {
    title: "S-Tag Builder — Yeeboo Digital",
    description: "Generate Luminate Online S-tag code in plain English.",
    url: "https://s-tags.yeeboodigital.com",
  },
};
```

---

## ACCESSIBILITY

- All interactive elements keyboard-navigable
- Copy button has `aria-label="Copy generated S-tag code"`
- Code block has `role="region" aria-label="Generated code"`
- Warning bar has `role="alert"`
- Colour contrast ratios meet WCAG AA

---

## WHAT NOT TO BUILD (SCOPE BOUNDARIES)

- No user accounts or auth
- No saved history (session memory only via conversation state)
- No database
- No file uploads
- No email sending
- No Luminate API integration (pure code generation only)
- No payment or billing

Keep it simple. It's a code generator with a great UX.

---

## QUICK START

```bash
npx create-next-app@latest stag-builder --typescript --tailwind --app
cd stag-builder
npm install @anthropic-ai/sdk
cp .env.example .env.local
# Add your ANTHROPIC_API_KEY to .env.local
npm run dev
```

Then build in this order:
1. `/lib/system-prompt.ts` — paste in the full system prompt
2. `/app/api/generate/route.ts` — the API proxy
3. `WorkflowWarning.tsx` — the always-visible warning
4. `QuickStarts.tsx` — the chip row
5. `BuilderForm.tsx` — the main input
6. `CodeOutput.tsx` — the output block with copy
7. `app/page.tsx` — wire everything together
8. `TagReference.tsx` — the collapsible reference panel (can do last)

---

## TESTING CHECKLIST

Before going live:

- [ ] API key is server-side only — verify it's never in client bundle
- [ ] Copy button works across Chrome, Firefox, Safari
- [ ] Mobile layout is usable (single column, scrollable)
- [ ] Workflow warning is visible on page load
- [ ] Quick-start chips pre-fill prompts correctly
- [ ] Conversation history maintains context across follow-up messages
- [ ] Error state displays on API failure
- [ ] Loading state shows during generation
- [ ] "Clear" resets both input and output
- [ ] Code block scrolls when content is tall
- [ ] Vercel deployment builds without errors
- [ ] ANTHROPIC_API_KEY env var set in Vercel dashboard

---

*Built by Yeeboo Digital for BB Dev Days 2026 and published as a free community tool.*
*Questions: erik@yeeboodigital.com*
