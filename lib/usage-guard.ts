// Global usage safeguard for AI mode — a code-level backstop *beneath* the
// Anthropic console's hard $20/month spend cap. It bounds total generations per
// day and per month across ALL users, so a burst (or a bad actor) can't burn
// the month's budget in one night before the console cap reacts.
//
// Storage:
//   • If a shared KV store is configured (Vercel KV or Upstash Redis REST), the
//     cap is accurate across serverless instances.
//   • Otherwise it falls back to a best-effort in-memory counter — fine for
//     local/single-instance, but per-instance and resets on cold start.
//
// The Anthropic console spend cap remains the real hard ceiling; this layer
// just slows things down well before that. On any KV error it FAILS OPEN
// (allows the request) on purpose — the console cap is the true backstop and we
// don't want a KV hiccup to take the demo offline.

// Defaults sized to the $20/month cap at ~$0.008/generation on Haiku (~2,500/mo).
const MAX_PER_DAY = Number(process.env.MAX_GEN_PER_DAY ?? 200);
const MAX_PER_MONTH = Number(process.env.MAX_GEN_PER_MONTH ?? 2500);

// Accept either Vercel KV or raw Upstash env var names (same REST protocol).
const KV_URL =
  process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL || "";
const KV_TOKEN =
  process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || "";
const KV_ENABLED = Boolean(KV_URL && KV_TOKEN);

const DAY_TTL = 60 * 60 * 25; // ~25h, covers a UTC day with slack
const MONTH_TTL = 60 * 60 * 24 * 32; // ~32d

function periodKeys() {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD (UTC)
  const month = day.slice(0, 7); // YYYY-MM
  return {
    dayKey: `stag:gen:day:${day}`,
    monthKey: `stag:gen:month:${month}`,
  };
}

// INCR a key over the KV REST API, setting a TTL on first write. Returns the
// new count, or null if the store is unreachable.
async function kvIncr(key: string, ttlSeconds: number): Promise<number | null> {
  try {
    const res = await fetch(`${KV_URL}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${KV_TOKEN}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: number };
    const count = Number(data.result);
    if (!Number.isFinite(count)) return null;
    if (count === 1) {
      // Set expiry only on the first increment of a fresh window.
      await fetch(
        `${KV_URL}/expire/${encodeURIComponent(key)}/${ttlSeconds}`,
        { headers: { Authorization: `Bearer ${KV_TOKEN}` }, cache: "no-store" }
      ).catch(() => {});
    }
    return count;
  } catch {
    return null;
  }
}

// --- In-memory fallback (best-effort, per-instance) -----------------------
const mem = { day: "", dayCount: 0, month: "", monthCount: 0 };
function memIncr() {
  const { dayKey, monthKey } = periodKeys();
  if (mem.day !== dayKey) {
    mem.day = dayKey;
    mem.dayCount = 0;
  }
  if (mem.month !== monthKey) {
    mem.month = monthKey;
    mem.monthCount = 0;
  }
  mem.dayCount += 1;
  mem.monthCount += 1;
  return { day: mem.dayCount, month: mem.monthCount };
}

export interface UsageResult {
  allowed: boolean;
  scope?: "daily" | "monthly";
}

// Record one generation and report whether it's within the global caps.
// Call this only for requests you actually intend to send to the model.
export async function checkUsage(): Promise<UsageResult> {
  let day: number | null;
  let month: number | null;

  if (KV_ENABLED) {
    const { dayKey, monthKey } = periodKeys();
    [day, month] = await Promise.all([
      kvIncr(dayKey, DAY_TTL),
      kvIncr(monthKey, MONTH_TTL),
    ]);
    // Fail open if the shared store is unreachable.
    if (day === null || month === null) return { allowed: true };
  } else {
    const counts = memIncr();
    day = counts.day;
    month = counts.month;
  }

  if (month > MAX_PER_MONTH) return { allowed: false, scope: "monthly" };
  if (day > MAX_PER_DAY) return { allowed: false, scope: "daily" };
  return { allowed: true };
}
