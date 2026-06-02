// Searchable S-tag index for the lookup tool. Entirely client-side — the
// search runs in the browser with no external calls, so it works in island
// mode. Keywords are need-oriented ("greeting", "city", "unsubscribe", "how
// much they gave") so a plain-English need surfaces the right tag.
//
// Coverage: the full S-tag catalogue from Blackbaud's official S-Tag Quick
// Reference (S0–S1300). Email-relevant tags carry a verified, copy-paste
// `snippet`; every other tag is a reference entry (no snippet) that links to
// the official docs — we never ship guessed syntax.

export type TagContext = "broadcast" | "autoresponder" | "any";

export const BLACKBAUD_QUICK_REF =
  "https://webfiles-sc1.blackbaud.com/files/support/helpfiles/luminate-online/help/Subsystems/S-Tags/Content/S-Tags/S-Tags_Quick_Reference.html";

export interface StagEntry {
  tag: string; // the tag identifier, e.g. "S1:first_name"
  name: string; // human-friendly title
  description: string; // what it does / when to use it
  context: TagContext;
  category: string;
  keywords: string[]; // need-oriented search terms
  snippet?: string; // verified copy-paste code (email-relevant tags only)
  note?: string; // caveat, e.g. "not recommended for customer use"
}

// Helper to keep reference-only entries terse.
function ref(
  tag: string,
  name: string,
  category: string,
  description: string,
  keywords: string[],
  context: TagContext = "any",
  note?: string
): StagEntry {
  return { tag, name, category, description, keywords, context, note };
}

export const STAG_INDEX: StagEntry[] = [
  // ====================================================================
  // PERSONALIZATION — S1 constituent fields (verified, email-ready)
  // ====================================================================
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
    tag: "S1:middle_name",
    name: "Middle name",
    snippet: "[[S1:middle_name]]",
    description: "Inserts the contact's middle name.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["middle name", "middle initial"],
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
    tag: "S1:mobile_phone",
    name: "Mobile phone",
    snippet: "[[S1:mobile_phone]]",
    description: "Inserts the contact's mobile phone number.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["mobile", "cell phone", "phone", "sms"],
  },
  {
    tag: "S1:home_phone",
    name: "Home phone",
    snippet: "[[S1:home_phone]]",
    description: "Inserts the contact's home phone number.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["home phone", "telephone", "phone"],
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
  {
    tag: "S1:membership_expiration_date",
    name: "Membership expiry date",
    snippet: "[[S1:membership_expiration_date]]",
    description: "Inserts the contact's membership expiration date.",
    context: "broadcast",
    category: "Personalization",
    keywords: ["membership", "expiry", "expiration", "renewal date", "member until"],
  },
  ref("S19", "Constituent name", "Personalization", "Renders the logged-in constituent's name.", ["user name", "constituent name", "who", "logged in name"]),
  ref("S103", "Constituent attribute", "Personalization", "Inserts the value of a selected constituent attribute (custom field).", ["attribute", "custom field", "constituent attribute", "custom data"]),

  // ====================================================================
  // CONDITIONAL LOGIC (verified for S45; references for the rest)
  // ====================================================================
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
  ref("S46", "Check file exists", "Conditional logic", "Tests whether a file exists, for conditional rendering.", ["file exists", "check file", "conditional file"]),
  ref("S151", "Determine whether PageBuilder page exists", "Conditional logic", "Checks whether a PageBuilder page exists.", ["pagebuilder exists", "page exists", "check page"]),
  ref("S549", "True or false (champion status)", "Conditional logic", "Returns true/false for a champion-fund status check.", ["true false", "champion status", "boolean"]),

  // ====================================================================
  // DATES & TIME (verified S9/S98; references for the rest)
  // ====================================================================
  {
    tag: "S9:cons",
    name: "Current date (long)",
    snippet: "[[S9:cons]]",
    description: "Renders the current date in long format (e.g. September 26, 2026).",
    context: "any",
    category: "Dates & time",
    keywords: ["date", "today", "current date", "todays date", "display date"],
  },
  {
    tag: "S9:pattern",
    name: "Custom date format",
    snippet: "[[S9:pattern:MMMM yyyy]]",
    description: "Renders the current date in a custom format (e.g. MMMM yyyy → June 2026).",
    context: "any",
    category: "Dates & time",
    keywords: ["date format", "custom date", "month year", "format date", "year"],
  },
  {
    tag: "S98",
    name: "Date math (countdown)",
    snippet: "[[S98:days:until:2026-12-31:YYYY-MM-dd]]",
    description: "Calculates time until/after a date — e.g. days until a deadline for a countdown.",
    context: "any",
    category: "Dates & time",
    keywords: ["countdown", "days until", "date math", "deadline", "time until", "time since", "anniversary"],
  },
  ref("S20", "Current server time", "Dates & time", "Renders the current server time.", ["server time", "current time", "now"]),
  ref("S59", "Date string", "Dates & time", "Converts/renders a date string.", ["date string", "convert date", "parse date"]),
  ref("S101", "Days until password expiration", "Dates & time", "Renders a countdown to password expiration.", ["password expiration", "password expiry", "days until password"]),

  // ====================================================================
  // DONATION AUTORESPONDERS (S120) — verified
  // ====================================================================
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
  ref("S120", "Object property", "Autoresponder", "Renders a property of an object (the basis for the S120:dc autoresponder tags above).", ["object property", "autoresponder", "object", "property"], "autoresponder"),
  ref("S121", "Map property", "Autoresponder", "Renders a value from a map/object property.", ["map property", "map", "key value"], "autoresponder"),

  // ====================================================================
  // SYSTEM & EMAIL
  // ====================================================================
  {
    tag: "S38",
    name: "Unsubscribe URL",
    snippet: '<a href="[[S38]]">Unsubscribe</a>',
    description: "The unsubscribe link, required in every broadcast email.",
    context: "broadcast",
    category: "System & email",
    keywords: ["unsubscribe", "opt out", "opt-out", "remove me", "email footer", "can-spam", "required"],
  },
  ref("S6", "Base URL", "System & email", "Renders the site's base URL.", ["base url", "site url", "domain"]),
  ref("S8", "Current URL", "System & email", "Renders the current page URL.", ["current url", "page url", "this page"]),
  ref("S50", "HTTP request header", "System & email", "Renders data from an HTTP request header.", ["http header", "request header", "user agent"]),
  ref("S53", "Security category prefix", "System & email", "Renders the security category prefix.", ["security category", "prefix", "security"]),
  ref("S55", "Random number", "System & email", "Generates a random number.", ["random", "random number", "rng"]),
  ref("S58", "Email message", "System & email", "Renders email message data.", ["email message", "message", "email body"], "broadcast"),
  ref("S63", "Lorem ipsum sample text", "System & email", "Inserts placeholder sample text.", ["lorem ipsum", "placeholder", "sample text", "dummy text"]),
  ref("S80", "Session variable value", "System & email", "Renders the value of a session variable.", ["session variable", "session", "variable"]),
  ref("S86", "Authentication token", "System & email", "Renders a trusted-caller authentication token.", ["auth token", "authentication", "token", "trusted caller"]),
  ref("S87", "Display string literals", "System & email", "Displays literal string values.", ["string literal", "literal", "static text"]),
  ref("S99", "URL shortcut", "System & email", "Renders a URL shortcut.", ["url shortcut", "short link", "shortcut"]),
  ref("S100", "Site data parameter template", "System & email", "Uses a site data parameter as a template.", ["site data parameter", "parameter"]),
  ref("S334", "HTTP query data", "System & email", "Renders data from the HTTP query string.", ["query string", "query data", "url parameter", "get parameter"]),
  ref("S500", "Center-specific data parameter", "System & email", "Renders the value of a center-specific data parameter.", ["center data", "center parameter", "center specific"]),
  ref("S551", "Absolute URL", "System & email", "Renders an absolute URL.", ["absolute url", "full url", "link"]),
  ref("S565", "Include email in list", "System & email", "Lists email messages / includes an email in a list.", ["email list", "include email", "message list"], "broadcast"),

  // ====================================================================
  // CONTENT & PAGES
  // ====================================================================
  ref("S2", "Insert navigation bar", "Content & pages", "Inserts the site navigation bar.", ["navigation", "nav bar", "menu"]),
  ref("S7", "Related links", "Content & pages", "Renders related content links.", ["related links", "related content"]),
  ref("S24", "PageBuilder / StoryBuilder page title", "Content & pages", "Renders the page title.", ["page title", "title", "pagebuilder", "storybuilder"]),
  ref("S29", "Site information", "Content & pages", "Renders site information.", ["site info", "site information", "about site"]),
  ref("S32", "StoryBuilder articles", "Content & pages", "Renders news / StoryBuilder articles.", ["articles", "news", "storybuilder", "blog"]),
  ref("S51", "PageBuilder content", "Content & pages", "Renders reusable PageBuilder content.", ["pagebuilder", "reusable content", "page content", "content block"]),
  ref("S52", "News search component", "Content & pages", "Inserts a news search component.", ["news search", "search news"]),
  ref("S97", "RSS link component", "Content & pages", "Renders an RSS link.", ["rss", "feed", "rss link"]),
  ref("S102", "Visual alert / warning box", "Content & pages", "Renders a warning / alert box.", ["warning box", "alert box", "visual alert", "notice"]),
  ref("S311", "Renders navigation", "Content & pages", "Renders a navigation bar.", ["navigation", "nav", "menu bar"]),
  ref("S355", "Insert Google Map", "Media & social", "Embeds a Google Map.", ["google map", "map", "embed map"]),
  ref("S356", "Insert YouTube video", "Media & social", "Embeds a YouTube video.", ["youtube", "video", "embed video"]),
  ref("S364", "Insert YouTube video bar", "Media & social", "Embeds a YouTube video bar.", ["youtube bar", "video bar", "youtube"]),

  // ====================================================================
  // FORMS & REGISTRATION
  // ====================================================================
  ref("S3", "Login / logout component", "Forms & registration", "Renders a login/logout control.", ["login", "logout", "sign in", "sign out"]),
  ref("S26", "Quick registration component", "Forms & registration", "Inserts a quick registration form.", ["registration", "register", "sign up", "quick register"]),
  ref("S57", "Premium selection component", "Forms & registration", "Renders a premium (gift incentive) selector.", ["premium", "gift selection", "incentive", "thank you gift"]),
  ref("S81", "Sign-in component", "Forms & registration", "Renders a sign-in component.", ["sign in", "login", "signin"]),
  ref("S88", "Dynamic ask component", "Donations & fundraising", "Renders a dynamic ask-amount component.", ["dynamic ask", "ask amount", "ask string", "suggested amount"]),
  ref("S188", "Dynamic ask with value range", "Donations & fundraising", "Dynamic ask amount with a value range.", ["dynamic ask", "ask amount range", "suggested gift"]),
  ref("S202", "GIGYA / social login component", "Forms & registration", "Renders a social login component.", ["social login", "gigya", "facebook login", "oauth"]),
  ref("S550", "HTML option tags (year menu)", "Forms & registration", "Renders HTML <option> tags, e.g. a year selection menu.", ["year menu", "options", "dropdown", "select menu"]),
  ref("S1300", "BBQuickPay responsive donation form", "Donations & fundraising", "Embeds a responsive BBQuickPay donation form.", ["quickpay", "donation form", "responsive donation", "bbquickpay", "donate"]),

  // ====================================================================
  // DONATIONS & FUNDRAISING
  // ====================================================================
  ref("S15", "Fundraising campaign status", "Donations & fundraising", "Renders a fundraising campaign's status.", ["campaign status", "fundraising status", "goal progress"]),
  ref("S54", "Reward point information", "Donations & fundraising", "Renders a constituent's reward-point balance.", ["reward points", "points", "loyalty", "point balance"]),
  ref("S67", "Qualified contributions", "Donations & fundraising", "Renders qualified contribution data.", ["qualified contributions", "qualified gifts"]),
  ref("S68", "Specific contributions", "Donations & fundraising", "Renders specific contribution data.", ["specific contributions", "specific gifts"]),
  ref("S69", "Time-based contributions", "Donations & fundraising", "Renders contributions over a time period.", ["contributions over time", "time contributions", "giving period"]),
  ref("S79", "Specific solicited content", "Donations & fundraising", "Renders specific solicited contribution content.", ["solicited content", "solicitation"]),
  ref("S349", "Total dollars raised", "Donations & fundraising", "Renders total dollars raised.", ["total raised", "dollars raised", "amount raised", "total"]),
  ref("S404", "Donor wall", "Donations & fundraising", "Renders a donor wall component.", ["donor wall", "donor list", "honor roll", "recognition"]),
  ref("S407", "Show amount raised", "Donations & fundraising", "Renders the amount raised.", ["amount raised", "raised so far", "progress"]),
  ref("S530", "Champion fund list", "Donations & fundraising", "Renders a champion fund list.", ["champion fund", "fund list", "champions"]),
  ref("S548", "Fund-specific champion", "Donations & fundraising", "Renders fund-specific champion information.", ["champion", "fund champion"]),

  // ====================================================================
  // GROUPS & MEMBERSHIP / ACCOUNT
  // ====================================================================
  ref("S25", "User accessibility check", "Groups & membership", "Checks a user's accessibility status.", ["accessibility", "user check", "access"]),
  ref("S83", "Current center information", "Groups & membership", "Renders information about the current center.", ["center info", "current center", "chapter"]),
  ref("S450", "Group information", "Groups & membership", "Renders information about a group.", ["group info", "group information", "group details"]),

  // ====================================================================
  // ADVOCACY
  // ====================================================================
  ref("S27", "Action alert component", "Advocacy", "Renders an action alert.", ["action alert", "advocacy alert", "take action", "alert"]),
  ref("S56", "Find representatives component", "Advocacy", "Renders a find-your-representatives lookup.", ["representatives", "find rep", "elected officials", "lookup rep"]),
  ref("S75", "Vote information", "Advocacy", "Renders vote information.", ["vote", "voting", "vote info"]),
  ref("S90", "Advocacy alert information", "Advocacy", "Renders advocacy alert information.", ["alert info", "advocacy alert", "alert information"]),
  ref("S92", "Advocacy alert recipients", "Advocacy", "Renders advocacy alert recipient information.", ["alert recipients", "targets", "recipients"]),
  ref("S93", "User's representatives", "Advocacy", "Renders the user's representatives.", ["my representatives", "user reps", "elected officials"]),
  ref("S94", "Action alert list", "Advocacy", "Renders a list of action alerts.", ["alert list", "action alerts", "campaigns list"]),
  ref("S96", "Alerts-taken list component", "Advocacy", "Renders a list of alerts the user has taken.", ["alerts taken", "actions taken", "history"]),
  ref("S1151", "Letter-to-the-Editor alerts", "Advocacy", "Renders Letter-to-the-Editor (LTE) alerts.", ["letter to the editor", "lte", "lte alert"]),
  ref("S1152", "LTE alerts taken", "Advocacy", "Renders LTE alerts the user has taken.", ["lte taken", "letter to editor taken"]),
  ref("S1153", "LTE alert recipients", "Advocacy", "Renders LTE alert recipients.", ["lte recipients", "letter editor recipients"]),

  // ====================================================================
  // TEAMRAISER
  // ====================================================================
  ref("S35", "TeamRaiser thermometer", "TeamRaiser", "Renders a TeamRaiser fundraising thermometer.", ["thermometer", "teamraiser", "fundraising thermometer", "goal meter"]),
  ref("S36", "TeamRaiser participant list", "TeamRaiser", "Lists TeamRaiser participants.", ["participants", "participant list", "teamraiser"]),
  ref("S39", "TeamRaiser campaign list", "TeamRaiser", "Lists TeamRaiser campaigns.", ["campaign list", "teamraiser campaigns", "events"]),
  ref("S42", "TeamRaiser campaign information", "TeamRaiser", "Renders TeamRaiser campaign info.", ["campaign info", "teamraiser campaign", "event info"]),
  ref("S43", "TeamRaiser team information", "TeamRaiser", "Renders TeamRaiser team info.", ["team info", "team information", "teamraiser team"]),
  ref("S44", "TeamRaiser quick search", "TeamRaiser", "Renders a TeamRaiser quick search.", ["quick search", "search participant", "find team"]),
  ref("S47", "TeamRaiser custom component", "TeamRaiser", "Renders a TeamRaiser custom component.", ["custom component", "teamraiser custom"]),
  ref("S48", "TeamRaiser participant", "TeamRaiser", "Renders TeamRaiser participant information.", ["participant", "teamraiser participant"]),
  ref("S345", "TeamRaiser Top 10 list", "TeamRaiser", "Renders a Top 10 list for TeamRaiser.", ["top 10", "leaderboard", "top participants"]),
  ref("S346", "National company gift", "TeamRaiser", "Renders national company gift summary.", ["company gift", "national company", "corporate"]),
  ref("S347", "TeamRaiser national company", "TeamRaiser", "Renders national company information.", ["national company", "company info"]),
  ref("S348", "TeamRaiser dynamic progress", "TeamRaiser", "Renders dynamic progress for TeamRaiser.", ["dynamic progress", "progress", "teamraiser progress"]),
  ref("S350", "TeamRaiser event manager", "TeamRaiser", "Checks TeamRaiser event-manager permissions.", ["event manager", "permissions", "manager"]),
  ref("S400", "Display TeamRaiser data parameter", "TeamRaiser", "Renders a TeamRaiser data parameter value.", ["data parameter", "teamraiser parameter"]),
  ref("S402", "TeamRaiser horizontal navigation", "TeamRaiser", "Renders TeamRaiser horizontal navigation.", ["horizontal nav", "teamraiser navigation"]),
  ref("S409", "Embed Participant Center in custom page", "TeamRaiser", "Embeds Participant Center (PC2) in a custom page.", ["participant center", "pc2", "embed participant center"]),
  ref("S414", "Affiliated events list", "TeamRaiser", "Renders a list of affiliated events.", ["affiliated events", "event list", "affiliate"]),
  ref("S415", "Top teams across events", "TeamRaiser", "Renders top teams across events.", ["top teams", "leaderboard", "best teams"]),
  ref("S416", "Sponsorship logos", "TeamRaiser", "Renders sponsorship logos.", ["sponsors", "sponsorship", "logos"]),
  ref("S417", "Parent company link", "TeamRaiser", "Renders a parent company link.", ["parent company", "company link"]),
  ref("S421", "Personal events search", "TeamRaiser", "Renders a personal (get-together) events search.", ["events search", "get together", "personal events"]),
  ref("S422", "Personalized link", "TeamRaiser", "Renders a personalized link.", ["personalized link", "personal url", "tracking link"]),
  ref("S542", "Personal campaign information", "TeamRaiser", "Renders personal campaign component information.", ["personal campaign", "my campaign", "campaign component"]),
  ref("S682", "Activity thermometer", "TeamRaiser", "Renders an activity-tracking thermometer.", ["activity thermometer", "activity tracker", "goal meter"]),
  ref("S683", "Recent activity points", "TeamRaiser", "Renders recent activity points.", ["recent points", "activity points", "recent activity"]),
  ref("S684", "All participant/team list", "TeamRaiser", "Renders a full participant/team list.", ["all participants", "all teams", "full list"]),
  ref("S685", "Top participant/team ranking", "TeamRaiser", "Renders a top participant/team ranking.", ["top ranking", "leaderboard", "rankings"]),
  ref("S686", "Activity statistics summary", "TeamRaiser", "Renders an activity statistics summary.", ["statistics", "summary stats", "activity stats"]),
  ref("S687", "Participant ranking", "TeamRaiser", "Renders an individual participant ranking.", ["participant rank", "ranking", "position"]),
  ref("S688", "Activity feed", "TeamRaiser", "Renders an all-points activity feed.", ["activity feed", "feed", "recent activity"]),

  // ====================================================================
  // LOCALIZATION & SOCIAL
  // ====================================================================
  ref("S5", "Tell-a-friend link", "Media & social", "Renders a tell-a-friend / refer link.", ["tell a friend", "refer", "share with friend"]),
  ref("S203", "Social sharing component", "Media & social", "Renders social sharing buttons.", ["social sharing", "share", "social buttons", "facebook twitter"]),
  ref("S72", "Localization (L10N) information", "Localization", "Renders localization information.", ["localization", "l10n", "language", "locale"]),
  ref("S73", "Localization switch component", "Localization", "Renders a locale switcher.", ["language switch", "locale switch", "change language"]),

  // ====================================================================
  // SURVEYS & CALENDARS
  // ====================================================================
  ref("S22", "Calendar component", "Surveys & calendars", "Inserts a calendar component.", ["calendar", "events calendar", "dates"]),
  ref("S28", "Survey component", "Surveys & calendars", "Inserts a survey.", ["survey", "poll", "questionnaire", "feedback"]),
  ref("S65", "Directory quick search", "Surveys & calendars", "Inserts a directory quick search.", ["directory search", "find member", "directory"]),

  // ====================================================================
  // APPLICATION / UTILITY
  // ====================================================================
  ref("S4", "Current application ID", "Utility", "Renders the current application ID.", ["application id", "app id", "current app"]),
  ref("S11", "URL-specified application", "Utility", "Renders an application-specific URL.", ["application url", "app url", "specified application"]),
  ref("S37", "Track clickthroughs", "Utility", "Wraps a link to track clickthroughs.", ["track clicks", "clickthrough", "link tracking", "analytics"]),
  ref("S201", "Generate help topic link", "Utility", "Generates a link to a help topic.", ["help link", "help topic", "documentation link"]),
  ref("S335", "Campaign type", "Utility", "Identifies the campaign type.", ["campaign type", "type of campaign"]),
  ref("S336", "Banner field widget", "Content & pages", "Renders a banner field widget.", ["banner", "banner field", "banner widget"]),
  ref("S337", "Progress field widget", "Content & pages", "Renders a progress field widget.", ["progress", "progress bar", "progress field"]),
  ref("S344", "Company descendants amounts raised", "TeamRaiser", "Renders amounts raised across a company hierarchy.", ["company hierarchy", "descendants", "company raised"]),
  ref("S405", "Renders milestone value", "TeamRaiser", "Renders a milestone value.", ["milestone", "milestone value"]),
  ref("S0", "Site data (deprecated)", "Utility", "Legacy site-data tag. Deprecated — avoid in new work.", ["site data", "deprecated", "legacy"], "any", "Deprecated — avoid in new work."),
  ref("S130", "Reverse Polish Notation", "Utility", "Advanced RPN expression evaluation. Internal use — NOT recommended for customer use and can cause performance problems.", ["rpn", "reverse polish", "expression", "math", "advanced"], "any", "Internal use only — not recommended for customer use (performance risk)."),
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
