"use client";

import { useEffect } from "react";

interface TagReferenceProps {
  open: boolean;
  onClose: () => void;
}

export const BLACKBAUD_DOCS = {
  whatAreStags:
    "https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/s_tags.html",
  quickReference:
    "https://webfiles-sc1.blackbaud.com/files/support/helpfiles/luminate-online/help/Subsystems/S-Tags/Content/S-Tags/S-Tags_Quick_Reference.html",
};

const S1_FIELDS: [string, string][] = [
  ["[[S1:first_name:Friend]]", "First name with fallback (no conditional needed)"],
  ["[[S1:last_name]]", "Last name"],
  ["[[S1:cons_title]]", "Title (Mr., Dr., etc.)"],
  ["[[S1:home_city]]", "City"],
  ["[[S1:home_stateprov]]", "State / Province"],
  ["[[S1:home_zip]]", "Postal / Zip code"],
  ["[[S1:home_country]]", "Country"],
  ["[[S1:home_primary_email]]", "Home email"],
  ["[[S1:largest_trans_amount]]", "Largest ever gift amount"],
];

function Code({ children }: { children: React.ReactNode }) {
  return (
    <code className="block whitespace-pre-wrap rounded-md bg-slate-900 px-3 py-2 font-mono text-[12px] leading-relaxed text-slate-200">
      {children}
    </code>
  );
}

export default function TagReference({ open, onClose }: TagReferenceProps) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden
        className={[
          "fixed inset-0 z-40 bg-slate-900/40 transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      {/* Panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="S-tag quick reference"
        aria-hidden={!open}
        className={[
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300",
          open ? "translate-x-0" : "translate-x-full",
        ].join(" ")}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-navy">Quick Reference</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close quick reference"
            className="rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
          >
            <span aria-hidden className="text-xl leading-none">
              ×
            </span>
          </button>
        </div>

        <div className="flex-1 space-y-8 overflow-y-auto px-6 py-6 text-sm text-slate-700">
          {/* 1. Personalization tags */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-dark">
              1. Personalization tags (S1)
            </h3>
            <dl className="space-y-2">
              {S1_FIELDS.map(([tag, desc]) => (
                <div key={tag}>
                  <dt className="font-mono text-[12px] text-navy">{tag}</dt>
                  <dd className="text-xs text-slate-500">{desc}</dd>
                </div>
              ))}
            </dl>
          </section>

          {/* 2. Conditional syntax cheat sheet */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-dark">
              2. Conditional syntax
            </h3>
            <p className="mb-2 text-xs text-slate-500">
              Four parts, double-colon separators:
            </p>
            <Code>{`[[?VALUE::COMPARISON::IF_TRUE::IF_FALSE]]`}</Code>
            <p className="mt-3 text-xs text-slate-500">
              <strong className="text-amber-700">Gotcha:</strong> comparison is{" "}
              <strong>CONTAINS</strong>, not equals. Wrap both sides in a
              delimiter (<code className="font-mono">x</code> or{" "}
              <code className="font-mono">z</code>) for exact matches:
            </p>
            <Code>{`[[?x[[S1:home_stateprov]]x::xONx::
  Ontario content.
::
  General content.
]]`}</Code>
            <p className="mt-2 text-xs text-slate-500">
              Group membership returns <code className="font-mono">TRUE</code> /{" "}
              <code className="font-mono">FALSE</code>:
            </p>
            <Code>{`[[S45:GROUP_ID]]`}</Code>
          </section>

          {/* 3. Common patterns */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-dark">
              3. Common patterns
            </h3>

            <p className="mb-1 text-xs font-semibold text-slate-600">
              Monthly vs one-time donors
            </p>
            <Code>{`[[?[[S45:MONTHLY_GROUP_ID]]::TRUE::
  Monthly donor content.
::
  One-time donor content.
]]`}</Code>

            <p className="mb-1 mt-4 text-xs font-semibold text-slate-600">
              OR logic — either group (the “T” technique)
            </p>
            <Code>{`[[?
  [[?[[S45:GROUP_A_ID]]::TRUE::T::]]
  [[?[[S45:GROUP_B_ID]]::TRUE::T::]]
::T::
  Content for either group.
::
  Everyone else.
]]`}</Code>

            <p className="mb-1 mt-4 text-xs font-semibold text-slate-600">
              Autoresponder: recurring vs one-time (S120:dc — autoresponders only)
            </p>
            <Code>{`[[?[[S120:dc:recurringFrequencyLabel]]::Monthly::
  Monthly gift of [[S120:dc:giftAmount]].
::
  Gift of [[S120:dc:giftAmount]].
]]`}</Code>
          </section>

          {/* 4. Workflow reminder */}
          <section className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <h3 className="mb-1 text-xs font-semibold uppercase tracking-wide">
              4. Workflow reminder
            </h3>
            <p className="text-xs leading-relaxed">
              ⚠️ Paste S-tag code into the <strong>HTML/source view only</strong>.
              Switching to the WYSIWYG visual editor after pasting will corrupt
              the syntax.
            </p>
          </section>

          {/* 5. Official Blackbaud documentation */}
          <section>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-teal-dark">
              5. Official Blackbaud documentation
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={BLACKBAUD_DOCS.whatAreStags}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-navy underline decoration-teal/50 underline-offset-2 hover:decoration-teal"
                >
                  What are S-tags? ↗
                </a>
                <p className="text-xs text-slate-500">Overview and concepts.</p>
              </li>
              <li>
                <a
                  href={BLACKBAUD_DOCS.quickReference}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-navy underline decoration-teal/50 underline-offset-2 hover:decoration-teal"
                >
                  S-Tag Quick Reference (full library) ↗
                </a>
                <p className="text-xs text-slate-500">
                  The complete, authoritative list of every S-tag.
                </p>
              </li>
            </ul>
          </section>
        </div>
      </aside>
    </>
  );
}
