// Single switch that selects which edition is running.
//
//   NEXT_PUBLIC_AI_MODE=on   → AI-assist (free-form box) is available; needs a key
//   NEXT_PUBLIC_AI_MODE=off  → island only (guided wizard + templates, no key)
//
// Default is OFF so a fresh clone runs the zero-cost island with no key.
// The hosted demo sets it to "on" in its environment.
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_MODE === "on";
