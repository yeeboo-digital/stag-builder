import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import { SYSTEM_PROMPT } from "@/lib/system-prompt";
import { checkUsage } from "@/lib/usage-guard";
import type { Message } from "@/lib/types";

// Runs on the Node.js runtime so process.env.ANTHROPIC_API_KEY is available
// server-side and never reaches the client bundle.
export const runtime = "nodejs";

// Model is configurable so the hosted demo can pick its own cost/quality tier.
// Default: Haiku 4.5 — cheapest tier, well-suited to this well-scoped task.
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

// --- Simple in-memory rate limit: 10 requests / IP / minute ---------------
// NOTE: in-memory state does not survive serverless cold starts and is
// per-instance. For a public, multi-instance deploy, swap this for a shared
// store (Upstash Redis / Vercel KV). See ARCHITECTURE.md → Cost controls.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 10;
const hits = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_REQUESTS;
}

// Instantiated lazily so the route module can load even in island deploys
// where no key is configured.
let client: Anthropic | null = null;
function getClient(): Anthropic {
  if (!client) client = new Anthropic();
  return client;
}

export async function POST(req: NextRequest) {
  try {
    // AI must be explicitly enabled and a key present. Otherwise this is an
    // island deploy and the endpoint stays off.
    if (process.env.NEXT_PUBLIC_AI_MODE !== "on" || !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "AI assist is not enabled on this deployment." },
        { status: 503 }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a moment and try again." },
        { status: 429 }
      );
    }

    const { prompt, conversationHistory } = (await req.json()) as {
      prompt?: unknown;
      conversationHistory?: Message[];
    };

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt required" }, { status: 400 });
    }

    // Global usage backstop (beneath the Anthropic console spend cap). Only
    // counts requests we're actually about to send to the model.
    const usage = await checkUsage();
    if (!usage.allowed) {
      const msg =
        usage.scope === "monthly"
          ? "This free demo has hit its monthly usage limit. Try again next month — or run your own copy (it's open source) with your own key."
          : "This free demo has hit its daily usage limit. Please try again tomorrow — or run your own copy (it's open source) with your own key.";
      return NextResponse.json({ error: msg }, { status: 429 });
    }

    const messages = [
      ...(conversationHistory || []),
      { role: "user" as const, content: prompt },
    ];

    const response = await getClient().messages.create({
      model: MODEL,
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
