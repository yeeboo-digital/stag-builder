# IMPLEMENTATION NOTES FOR CLAUDE CODE

Read CLAUDE_CODE_SPEC.md first for the full spec.
This file has additional implementation guidance and starter code patterns.

---

## BUILD ORDER

Build in this exact order — each file depends on the previous:

1. `lib/system-prompt.ts` — paste SYSTEM_PROMPT.md content in here
2. `lib/types.ts` — TypeScript interfaces
3. `app/api/generate/route.ts` — the API proxy (spec has full code)
4. `components/WorkflowWarning.tsx` — always-visible amber warning bar
5. `components/QuickStarts.tsx` — chip row that pre-fills prompts
6. `components/CodeOutput.tsx` — dark code block with copy button
7. `components/BuilderForm.tsx` — textarea + generate button
8. `app/page.tsx` — main page, wire everything together
9. `components/TagReference.tsx` — collapsible reference panel (last)
10. `app/layout.tsx` — metadata, fonts, global styles

---

## `lib/types.ts`

```typescript
export interface Message {
  role: "user" | "assistant";
  content: string;
}

export interface GenerateRequest {
  prompt: string;
  conversationHistory: Message[];
}

export interface GenerateResponse {
  result: string;
  updatedHistory: Message[];
  error?: string;
}

export interface QuickStart {
  label: string;
  prompt: string;
}
```

---

## `lib/quickstarts.ts`

```typescript
import { QuickStart } from "./types";

export const QUICK_STARTS: QuickStart[] = [
  {
    label: "Name + fallback",
    prompt:
      "Add a personalized first name greeting to my email. If the name is missing, show 'Friend' instead.",
  },
  {
    label: "Monthly vs one-time",
    prompt:
      "Show different content to my monthly donors vs one-time donors. My monthly donor group ID is MONTHLY_GROUP_ID — I'll fill that in.",
  },
  {
    label: "Group conditional",
    prompt:
      "Show content only to members of a specific group. My group ID is GROUP_ID.",
  },
  {
    label: "OR logic — either group",
    prompt:
      "Show content to donors who are in either Group A (ID: GROUP_A_ID) OR Group B (ID: GROUP_B_ID).",
  },
  {
    label: "Three-way split",
    prompt:
      "Show three different messages based on donor level: one for major donors (Group ID: MAJOR_ID), one for mid-level donors (Group ID: MID_ID), and one for everyone else.",
  },
  {
    label: "Autoresponder thank-you",
    prompt:
      "Create a donation thank-you autoresponder that shows different content to monthly (recurring) donors vs one-time donors. Include the gift amount.",
  },
  {
    label: "City targeting",
    prompt:
      "Show a personalized message that includes the donor's city, but only if we have their city on file.",
  },
];
```

---

## Key Component Patterns

### Copy to Clipboard

```typescript
const [copied, setCopied] = useState(false);

const handleCopy = async () => {
  await navigator.clipboard.writeText(code);
  setCopied(true);
  setTimeout(() => setCopied(false), 2000);
};
```

### Conversation State Management

Manage in `page.tsx` and pass down:

```typescript
const [history, setHistory] = useState<Message[]>([]);
const [result, setResult] = useState<string>("");
const [loading, setLoading] = useState(false);

const handleGenerate = async (prompt: string) => {
  setLoading(true);
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, conversationHistory: history }),
  });
  const data = await response.json();
  setResult(data.result);
  setHistory(data.updatedHistory);
  setLoading(false);
};

const handleClear = () => {
  setHistory([]);
  setResult("");
};
```

### Parsing Code from AI Response

The AI response will contain both code blocks and explanation text.
Parse it by splitting on markdown code fences:

```typescript
function parseResponse(text: string): { code: string; explanation: string } {
  // Find the first code block (``` ... ```)
  const codeMatch = text.match(/```(?:\w+)?\n([\s\S]*?)```/);
  
  if (codeMatch) {
    const code = codeMatch[1].trim();
    // Everything outside the code block is the explanation
    const explanation = text
      .replace(/```(?:\w+)?\n[\s\S]*?```/g, "")
      .trim();
    return { code, explanation };
  }
  
  // If no code block found, treat entire response as explanation
  return { code: "", explanation: text };
}
```

### Code Syntax Highlighting

For the code output, use simple regex-based highlighting rather than
a full library (keeps bundle small):

```typescript
function highlightStagCode(code: string): string {
  return code
    .replace(/(\[\[)/g, '<span class="text-teal-400">[[</span>')
    .replace(/(\]\])/g, '<span class="text-teal-400">]]</span>')
    .replace(/(S\d+:[^\s\]]+)/g, '<span class="text-cyan-300">$1</span>')
    .replace(/(::)/g, '<span class="text-amber-400">::</span>');
}
```

Or use `dangerouslySetInnerHTML` with escaped content if you go this route.
Alternatively, just use a monospace font on a dark background — no highlighting
required for MVP. The code is readable without it.

---

## Tailwind Classes to Use

```
Page background:     bg-slate-50
Header bg:           bg-navy (custom)
Code block bg:       bg-slate-900
Code text:           text-cyan-300 (tags), text-slate-200 (content)
Warning bar bg:      bg-amber-50
Warning bar border:  border-amber-300
Warning text:        text-amber-900
Chip bg:             bg-white border border-slate-200 hover:border-teal-500
Chip active:         bg-teal-50 border-teal-500
Generate button:     bg-navy text-white hover:bg-teal-700
Copy button:         bg-slate-700 text-slate-200 hover:bg-slate-600
Copied state:        bg-green-700 text-white
```

---

## Mobile Considerations

- Single column layout on mobile
- Quick-start chips wrap to multiple rows (flex-wrap)
- Code block is horizontally scrollable (`overflow-x-auto`)
- Generate button is full width on mobile
- Font size for code: 12px on mobile, 13px on desktop

---

## Things to Double-Check Before Done

1. Verify `ANTHROPIC_API_KEY` is read server-side only in the API route
2. The system prompt in `lib/system-prompt.ts` is the FULL content of SYSTEM_PROMPT.md
3. Multi-turn conversation works (history passed on each request)
4. Copy button uses the Clipboard API with a fallback
5. The workflow warning is always visible (not collapsible)
6. Error states are handled gracefully
7. Loading state prevents double-submits
