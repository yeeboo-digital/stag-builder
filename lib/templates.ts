// Deterministic S-tag template engine — the heart of the island edition.
//
// Every documented pattern is a pure function: typed params in, working
// S-tag code + a plain-English explanation out. No LLM, no network, no key.
// Because the syntax is assembled (not predicted) it is always well-formed.
//
// Syntax verified against Blackbaud's official S-tag docs:
//   [[?VALUE::COMPARISON::IF_TRUE::IF_FALSE]] — four parts, "::" separators,
//   CONTAINS (not equals) comparison → delimiter trick for exact matches.

export type FieldType = "text" | "textarea";

export interface TemplateField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  default: string;
  help?: string;
}

export interface GeneratedCode {
  code: string;
  explanation: string;
}

export interface StagTemplate {
  id: string;
  label: string;
  blurb: string;
  /** "broadcast" patterns work in normal email; "autoresponder" only in donation autoresponders. */
  context: "broadcast" | "autoresponder";
  fields: TemplateField[];
  generate: (v: Record<string, string>) => GeneratedCode;
}

const PASTE_REMINDER =
  "⚠️ Paste into your Luminate email's HTML/source view only — never the WYSIWYG visual editor.";

const AUTORESPONDER_CAVEAT =
  "Caveat: S120:dc tags ONLY work inside donation autoresponders triggered by a gift. They render nothing in broadcast/scheduled email.";

// Indent every line of a (possibly multi-line) content block by `pad` spaces.
function indent(text: string, pad = 2): string {
  const p = " ".repeat(pad);
  return text
    .split("\n")
    .map((line) => (line.length ? p + line : line))
    .join("\n");
}

function withReminder(explanation: string): string {
  return `${explanation}\n\n${PASTE_REMINDER}`;
}

export const TEMPLATES: StagTemplate[] = [
  // 1 — First name with fallback -----------------------------------------
  {
    id: "name-fallback",
    label: "Name + fallback",
    blurb: "Personalized greeting that falls back to a default if the name is missing.",
    context: "broadcast",
    fields: [
      { name: "greeting", label: "Greeting word", type: "text", default: "Hello" },
      { name: "fallback", label: "Fallback if no first name", type: "text", default: "Friend" },
    ],
    generate: (v) => ({
      code: `${v.greeting}, [[S1:first_name:${v.fallback}]]!`,
      explanation: withReminder(
        `[[S1:first_name:${v.fallback}]] inserts the recipient's first name. If it's empty, it renders "${v.fallback}" instead — no conditional needed. Nothing to replace; this works as-is.`
      ),
    }),
  },

  // 2 — Show a block only if a field is on file (Pattern 2) --------------
  {
    id: "field-presence",
    label: "Show only if field present",
    blurb: "Display a message only when a field (like city) is on file; show nothing otherwise.",
    context: "broadcast",
    fields: [
      { name: "field", label: "S1 field name", type: "text", default: "home_city", help: "e.g. home_city, home_stateprov, mobile_phone" },
      { name: "message", label: "Message to show when present", type: "textarea", default: "Your community in [[S1:home_city]] is counting on you." },
    ],
    generate: (v) => ({
      code: `[[?zz::z[[S1:${v.field}]]z::::${v.message}]]`,
      explanation: withReminder(
        `Shows nothing if [[S1:${v.field}]] is empty, and shows your message if it has a value. The "z" delimiters force an exact empty/non-empty test (Luminate compares by CONTAINS, so bare values would over-match). Replace "${v.field}" if you need a different field.`
      ),
    }),
  },

  // 3 — Group: two-way (members vs non-members / monthly vs one-time) -----
  {
    id: "group-two-way",
    label: "Group: two audiences",
    blurb: "Different content for group members vs everyone else (e.g. monthly vs one-time donors). Leave the second box empty for members-only.",
    context: "broadcast",
    fields: [
      { name: "groupId", label: "Group ID", type: "text", default: "GROUP_ID", help: "Numeric ID from Luminate Admin > Contacts > Groups" },
      { name: "trueContent", label: "Content for group members", type: "textarea", default: "<p>As a monthly donor, your steady support makes everything possible. Thank you.</p>" },
      { name: "falseContent", label: "Content for everyone else (optional)", type: "textarea", default: "<p>Thank you for your generous gift. Did you know monthly donors help us plan ahead?</p>" },
    ],
    generate: (v) => {
      const hasFalse = v.falseContent.trim().length > 0;
      const code = hasFalse
        ? `[[?[[S45:${v.groupId}]]::TRUE::\n${indent(v.trueContent)}\n::\n${indent(v.falseContent)}\n]]`
        : `[[?[[S45:${v.groupId}]]::TRUE::\n${indent(v.trueContent)}\n::]]`;
      return {
        code,
        explanation: withReminder(
          `[[S45:${v.groupId}]] returns TRUE for members of that group. Members see the first block; ${hasFalse ? "everyone else sees the second block" : "non-members see nothing (members-only)"}. Replace "${v.groupId}" with your numeric group ID (Contacts > Groups).`
        ),
      };
    },
  },

  // 4 — OR logic: either of N groups (the T technique, Pattern 4) ---------
  {
    id: "or-logic",
    label: "OR — in any of these groups",
    blurb: "Show content to anyone in at least one of several groups.",
    context: "broadcast",
    fields: [
      { name: "groupIds", label: "Group IDs (comma-separated)", type: "text", default: "GROUP_A_ID, GROUP_B_ID" },
      { name: "trueContent", label: "Content for members of any group", type: "textarea", default: "<p>Content for members of either group.</p>" },
      { name: "falseContent", label: "Content for everyone else", type: "textarea", default: "<p>Content for everyone else.</p>" },
    ],
    generate: (v) => {
      const ids = v.groupIds
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const probes = ids
        .map((id) => `  [[?[[S45:${id}]]::TRUE::T::]]`)
        .join("\n");
      const code = `[[?\n${probes}\n::T::\n${indent(v.trueContent)}\n::\n${indent(v.falseContent)}\n]]`;
      return {
        code,
        explanation: withReminder(
          `The "T technique": each inner conditional outputs "T" if the recipient is in that group. The outer conditional then checks whether the combined output CONTAINS "T" — true if they're in any of ${ids.length} group(s) (${ids.join(", ")}). Replace the group IDs with your numeric IDs.`
        ),
      };
    },
  },

  // 5 — AND logic: must be in both groups (Pattern 9) --------------------
  {
    id: "and-logic",
    label: "AND — in both groups",
    blurb: "Nested check: in both groups, in group A only, or in neither.",
    context: "broadcast",
    fields: [
      { name: "groupAId", label: "Group A ID", type: "text", default: "GROUP_A_ID" },
      { name: "groupBId", label: "Group B ID", type: "text", default: "GROUP_B_ID" },
      { name: "bothContent", label: "Content if in BOTH groups", type: "textarea", default: "<p>In both groups — show this.</p>" },
      { name: "aOnlyContent", label: "Content if in Group A only", type: "textarea", default: "<p>In Group A only.</p>" },
      { name: "neitherContent", label: "Content if not in Group A", type: "textarea", default: "<p>Not in Group A at all.</p>" },
    ],
    generate: (v) => {
      const inner = `[[?[[S45:${v.groupBId}]]::TRUE::\n${indent(v.bothContent, 2)}\n::\n${indent(v.aOnlyContent, 2)}\n]]`;
      const code = `[[?[[S45:${v.groupAId}]]::TRUE::\n${indent(inner)}\n::\n${indent(v.neitherContent)}\n]]`;
      return {
        code,
        explanation: withReminder(
          `Outer conditional tests Group A (${v.groupAId}); only if true does it test Group B (${v.groupBId}). Result: in both → first block; in A only → second; not in A → third. Replace both group IDs with your numeric IDs.`
        ),
      };
    },
  },

  // 6 — Three-way split (Pattern 5) --------------------------------------
  {
    id: "three-way",
    label: "Three-way split",
    blurb: "Major / mid-level / general — three messages by donor tier.",
    context: "broadcast",
    fields: [
      { name: "majorId", label: "Major donor group ID", type: "text", default: "MAJOR_ID" },
      { name: "majorContent", label: "Content for major donors", type: "textarea", default: "<p>Your leadership gift puts you among our most dedicated supporters.</p>" },
      { name: "midId", label: "Mid-level group ID", type: "text", default: "MID_ID" },
      { name: "midContent", label: "Content for mid-level donors", type: "textarea", default: "<p>Donors at your level make a profound difference.</p>" },
      { name: "generalContent", label: "Content for everyone else", type: "textarea", default: "<p>Thank you for your support. Every gift helps us.</p>" },
    ],
    generate: (v) => {
      const inner = `[[?[[S45:${v.midId}]]::TRUE::\n${indent(v.midContent, 2)}\n::\n${indent(v.generalContent, 2)}\n]]`;
      const code = `[[?[[S45:${v.majorId}]]::TRUE::\n${indent(v.majorContent)}\n::\n${indent(inner)}\n]]`;
      return {
        code,
        explanation: withReminder(
          `Checks the major-donor group (${v.majorId}) first; if not a match, checks the mid-level group (${v.midId}); otherwise falls through to general content. Replace both group IDs with your numeric IDs.`
        ),
      };
    },
  },

  // 7 — Geographic / field exact match (Patterns 7 & 8) ------------------
  {
    id: "geo-exact",
    label: "Exact match on a field",
    blurb: "Target by an exact field value (state, city, etc.) using delimiters so partial values don't over-match.",
    context: "broadcast",
    fields: [
      { name: "field", label: "S1 field name", type: "text", default: "home_stateprov", help: "e.g. home_stateprov, home_city" },
      { name: "value", label: "Exact value to match", type: "text", default: "ON" },
      { name: "delimiter", label: "Delimiter character", type: "text", default: "x", help: "Usually x or z — wraps both sides for an exact match" },
      { name: "matchContent", label: "Content when it matches", type: "textarea", default: "Ontario-specific content." },
      { name: "elseContent", label: "Content otherwise", type: "textarea", default: "General content." },
    ],
    generate: (v) => {
      const d = v.delimiter || "x";
      const code = `[[?${d}[[S1:${v.field}]]${d}::${d}${v.value}${d}::\n${indent(v.matchContent)}\n::\n${indent(v.elseContent)}\n]]`;
      return {
        code,
        explanation: withReminder(
          `Wrapping both [[S1:${v.field}]] and "${v.value}" in "${d}" delimiters forces an exact match — without them, "${v.value}" would also match longer values (Luminate compares by CONTAINS). Matches see the first block; everyone else sees the second.`
        ),
      };
    },
  },

  // 8 — Autoresponder: recurring vs one-time (Pattern 6) -----------------
  {
    id: "autoresponder-recurring",
    label: "Autoresponder: recurring vs one-time",
    blurb: "Donation autoresponder that differs for monthly (recurring) vs one-time donors.",
    context: "autoresponder",
    fields: [
      { name: "monthlyContent", label: "Content for monthly donors", type: "textarea", default: "<p>Thank you for setting up your monthly gift of <strong>[[S120:dc:giftAmount]]</strong>.</p>" },
      { name: "oneTimeContent", label: "Content for one-time donors", type: "textarea", default: "<p>Thank you for your generous gift of <strong>[[S120:dc:giftAmount]]</strong> to [[S120:dc:campaignName]].</p>" },
    ],
    generate: (v) => ({
      code: `[[?[[S120:dc:recurringFrequencyLabel]]::Monthly::\n${indent(v.monthlyContent)}\n::\n${indent(v.oneTimeContent)}\n]]`,
      explanation: withReminder(
        `Tests whether this gift's recurring frequency is "Monthly". Recurring donors see the first block; one-time donors see the second. [[S120:dc:giftAmount]] / [[S120:dc:campaignName]] pull from this transaction.\n\n${AUTORESPONDER_CAVEAT}`
      ),
    }),
  },

  // 9 — Autoresponder: gift amount threshold (Pattern 10) ----------------
  {
    id: "autoresponder-amount",
    label: "Autoresponder: gift amount tier",
    blurb: "Donation autoresponder that shows premium content above a gift threshold.",
    context: "autoresponder",
    fields: [
      { name: "threshold", label: "Threshold amount", type: "text", default: "$499", help: "Shows the high-tier message for gifts greater than this" },
      { name: "highContent", label: "Content above the threshold", type: "textarea", default: "<p>Your exceptional gift of [[S120:dc:giftAmount]] places you in our Leadership Circle.</p>" },
      { name: "standardContent", label: "Content otherwise", type: "textarea", default: "<p>Thank you for your gift of [[S120:dc:giftAmount]].</p>" },
    ],
    generate: (v) => ({
      code: `[[?[[S120:dc:isGiftAmountGreaterThan:${v.threshold}]]::true::\n${indent(v.highContent)}\n::\n${indent(v.standardContent)}\n]]`,
      explanation: withReminder(
        `[[S120:dc:isGiftAmountGreaterThan:${v.threshold}]] returns true when this gift exceeds ${v.threshold}. Larger gifts see the first block; everyone else the second.\n\n${AUTORESPONDER_CAVEAT}`
      ),
    }),
  },
];

export function getTemplate(id: string): StagTemplate | undefined {
  return TEMPLATES.find((t) => t.id === id);
}

export function defaultsFor(t: StagTemplate): Record<string, string> {
  return Object.fromEntries(t.fields.map((f) => [f.name, f.default]));
}
