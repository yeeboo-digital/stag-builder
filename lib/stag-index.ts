// Searchable S-tag index for the lookup tool. Entirely client-side — the
// search runs in the browser with no external calls, so it works in island
// mode. Keywords are need-oriented ("greeting", "city", "unsubscribe", "how
// much they gave") so a plain-English need surfaces the right tag.

export type TagContext = "broadcast" | "autoresponder" | "any";

export interface StagEntry {
  tag: string; // the tag identifier, e.g. "S1:first_name"
  name: string; // human-friendly title
  snippet: string; // copy-paste-ready code
  description: string; // what it does / when to use it
  context: TagContext;
  category: string;
  keywords: string[]; // need-oriented search terms
}

export const STAG_INDEX: StagEntry[] = [
  // --- Personalization (S1, broadcast) ---------------------------------
  {
    tag: "S1:first_name",
    name: "First name (with fallback)",
    snippet: "[[S1:first_name:Friend]]",
    description:
      'Inserts the recipient\'s first name. If it\'s empty, renders the fallback ("Friend") instead — no conditional needed.',
    context: "broadcast",
    category: "Personalization",
    keywords: ["name", "first name", "greeting", "hello", "hi", "dear", "salutation", "personalize", "personalise", "fallback", "default name"],
  },
  {
    tag: "S1:last_name",
    name: "Last name",
    snippet: "[[S1:last_name]]",
    description: "Inserts the recipient's last name / surname.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["last name", "surname", "family name"],
  },
  {
    tag: "S1:cons_title",
    name: "Title / honorific",
    snippet: "[[S1:cons_title]]",
    description: "Inserts the contact's title (Mr., Mrs., Dr., etc.).",
    context: "broadcast",
    category: "Personalization",
    keywords: ["title", "honorific", "prefix", "mr", "mrs", "ms", "dr", "salutation"],
  },
  {
    tag: "S1:cons_suffix",
    name: "Suffix",
    snippet: "[[S1:cons_suffix]]",
    description: "Inserts the contact's suffix (Jr., Sr., etc.).",
    context: "broadcast",
    category: "Personalization",
    keywords: ["suffix", "jr", "sr", "the third"],
  },
  {
    tag: "S1:home_city",
    name: "City",
    snippet: "[[S1:home_city]]",
    description: "Inserts the contact's city. Often paired with a presence check so it only shows when on file.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["city", "town", "location", "where they live", "local", "community"],
  },
  {
    tag: "S1:home_stateprov",
    name: "State / Province",
    snippet: "[[S1:home_stateprov]]",
    description: "Inserts the contact's state or province.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["state", "province", "region", "geography", "location"],
  },
  {
    tag: "S1:home_zip",
    name: "Zip / Postal code",
    snippet: "[[S1:home_zip]]",
    description: "Inserts the contact's postal or zip code.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["zip", "postal code", "postcode", "zip code"],
  },
  {
    tag: "S1:home_country",
    name: "Country",
    snippet: "[[S1:home_country]]",
    description: "Inserts the contact's country.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["country", "nation", "geography"],
  },
  {
    tag: "S1:home_street1",
    name: "Street address",
    snippet: "[[S1:home_street1]]",
    description: "Inserts the contact's street address (line 1).",
    context: "broadcast",
    category: "Personalization",
    keywords: ["street", "address", "mailing address"],
  },
  {
    tag: "S1:home_primary_email",
    name: "Email address",
    snippet: "[[S1:home_primary_email]]",
    description: "Inserts the contact's primary email address.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["email", "email address", "contact email"],
  },
  {
    tag: "S1:largest_trans_amount",
    name: "Largest gift amount",
    snippet: "[[S1:largest_trans_amount]]",
    description:
      "Inserts the contact's largest-ever gift amount. (For this transaction's amount in an autoresponder, use S120:dc:giftAmount instead.)",
    context: "broadcast",
    category: "Personalization",
    keywords: ["largest gift", "biggest donation", "largest amount", "highest gift", "giving history"],
  },

  // --- Conditional logic (S45) -----------------------------------------
  {
    tag: "S45",
    name: "Group membership conditional",
    snippet: "[[?[[S45:GROUP_ID]]::TRUE::\n  Content for members.\n::\n  Content for everyone else.\n]]",
    description:
      "Shows different content to members of a group vs everyone else. The core building block for segmenting an email (monthly vs one-time donors, members vs non-members, etc.). Replace GROUP_ID with your numeric group ID.",
    context: "broadcast",
    category: "Conditional logic",
    keywords: ["group", "members", "membership", "conditional", "if", "show to", "hide", "segment", "audience", "target", "only show", "different content", "monthly", "donors", "show different"],
  },
  {
    tag: "S45 (OR)",
    name: "In any of several groups (OR)",
    snippet: "[[?\n  [[?[[S45:GROUP_A_ID]]::TRUE::T::]]\n  [[?[[S45:GROUP_B_ID]]::TRUE::T::]]\n::T::\n  Content for members of either group.\n::\n  Everyone else.\n]]",
    description:
      'The "T technique": show content to anyone in at least one of several groups. Each inner check outputs "T"; the outer check matches if any "T" is present.',
    context: "broadcast",
    category: "Conditional logic",
    keywords: ["or", "either", "any group", "multiple groups", "one of", "combine groups"],
  },

  // --- System / required ------------------------------------------------
  {
    tag: "S38",
    name: "Unsubscribe URL",
    snippet: '<a href="[[S38]]">Unsubscribe</a>',
    description: "The unsubscribe link, required in every broadcast email.",
    context: "broadcast",
    category: "System",
    keywords: ["unsubscribe", "opt out", "opt-out", "remove me", "email footer", "can-spam", "required"],
  },

  // --- Dates (S9, S98) --------------------------------------------------
  {
    tag: "S9:cons",
    name: "Current date (long)",
    snippet: "[[S9:cons]]",
    description: "Renders the current date in long format (e.g. September 26, 2026).",
    context: "any",
    category: "Dates",
    keywords: ["date", "today", "current date", "todays date", "display date"],
  },
  {
    tag: "S9:pattern",
    name: "Custom date format",
    snippet: "[[S9:pattern:MMMM yyyy]]",
    description: "Renders the current date in a custom format (e.g. MMMM yyyy → June 2026).",
    context: "any",
    category: "Dates",
    keywords: ["date format", "custom date", "month year", "format date", "year"],
  },
  {
    tag: "S98",
    name: "Date math (countdown)",
    snippet: "[[S98:days:until:2026-12-31:YYYY-MM-dd]]",
    description: "Calculates time until/after a date — e.g. days until a deadline for a countdown.",
    context: "any",
    category: "Dates",
    keywords: ["countdown", "days until", "date math", "deadline", "time until", "time since", "anniversary"],
  },

  // --- Donation autoresponders (S120:dc) -------------------------------
  {
    tag: "S120:dc:donorFirstName",
    name: "Donor first name (autoresponder)",
    snippet: "[[S120:dc:donorFirstName]]",
    description: "The donor's first name inside a donation autoresponder.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["donor name", "first name", "thank you name", "autoresponder greeting"],
  },
  {
    tag: "S120:dc:giftAmount",
    name: "Gift amount (autoresponder)",
    snippet: "[[S120:dc:giftAmount]]",
    description: "The amount of this transaction's gift. Use this (not S1) for transaction amounts in autoresponders.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["gift amount", "donation amount", "how much", "amount given", "gift size", "receipt amount"],
  },
  {
    tag: "S120:dc:campaignName",
    name: "Campaign name (autoresponder)",
    snippet: "[[S120:dc:campaignName]]",
    description: "The campaign the gift was made to.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["campaign", "appeal", "campaign name", "fund"],
  },
  {
    tag: "S120:dc:donationFormName",
    name: "Donation form name (autoresponder)",
    snippet: "[[S120:dc:donationFormName]]",
    description: "The name of the donation form used.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["form name", "donation form", "form"],
  },
  {
    tag: "S120:dc:transactionID",
    name: "Transaction ID (autoresponder)",
    snippet: "[[S120:dc:transactionID]]",
    description: "The transaction / receipt ID for this gift.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["transaction id", "receipt number", "confirmation number", "reference number", "receipt"],
  },
  {
    tag: "S120:dc:recurringFrequencyLabel",
    name: "Recurring frequency (autoresponder)",
    snippet: "[[S120:dc:recurringFrequencyLabel]]",
    description: 'Returns the gift\'s recurring frequency, e.g. "Monthly". Use it to show recurring donors different content than one-time donors.',
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["monthly", "recurring", "sustaining", "frequency", "how often", "repeat gift", "recurring vs one-time"],
  },
  {
    tag: "S120:dc:recurringServiceCenterLinkForAR",
    name: "Manage-gift link (autoresponder)",
    snippet: '<a href="[[S120:dc:recurringServiceCenterLinkForAR]]">Manage your gift</a>',
    description: "A direct link to the donor's service center to manage their recurring gift.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["manage gift", "donor portal", "service center", "manage donation", "update payment", "manage subscription"],
  },
  {
    tag: "S120:dc:recurringNextPaymentDate",
    name: "Next payment date (autoresponder)",
    snippet: "[[S120:dc:recurringNextPaymentDate]]",
    description: "The next scheduled payment date for a recurring gift.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["next payment", "next charge", "next gift date", "upcoming payment"],
  },
  {
    tag: "S120:dc:isGiftAmountGreaterThan",
    name: "Gift amount threshold (autoresponder)",
    snippet: "[[?[[S120:dc:isGiftAmountGreaterThan:$499]]::true::\n  Premium / leadership content.\n::\n  Standard thank-you.\n]]",
    description: "Returns true when the gift exceeds a threshold — use it to show premium content for larger gifts.",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["gift threshold", "amount greater than", "leadership circle", "major gift", "large gift", "tier", "high value"],
  },
  {
    tag: "S120:sustaining",
    name: "Sustaining gift CANCELLED autoresponder",
    snippet: "[[S120:sustaining:firstName]] · [[S120:sustaining:giftAmount]] · [[S120:sustaining:campaignName]]",
    description: "Special tags for the sustaining-gift cancellation autoresponder (different from S120:dc).",
    context: "autoresponder",
    category: "Autoresponder",
    keywords: ["cancelled", "canceled", "sustaining cancelled", "lapsed", "stopped giving", "cancellation"],
  },
];

// Distinct categories in index order (for grouping the empty-state browse view).
export const STAG_CATEGORIES: string[] = STAG_INDEX.reduce<string[]>((acc, e) => {
  if (!acc.includes(e.category)) acc.push(e.category);
  return acc;
}, []);

// Need-oriented search. Splits the query into terms and scores each entry by
// how well the terms hit its name, tag, description, and (weighted) keywords.
export function searchTags(query: string): StagEntry[] {
  const q = query.trim().toLowerCase();
  if (!q) return STAG_INDEX;

  const terms = q.split(/\s+/).filter(Boolean);

  const scored = STAG_INDEX.map((e) => {
    const hay = `${e.name} ${e.tag} ${e.description} ${e.keywords.join(" ")}`.toLowerCase();
    let score = 0;
    for (const t of terms) {
      if (hay.includes(t)) score += 1;
      if (e.tag.toLowerCase().includes(t)) score += 2;
      if (e.keywords.some((k) => k === t)) score += 3;
      if (e.keywords.some((k) => k.includes(t))) score += 1;
    }
    return { e, score };
  });

  return scored
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.e);
}
