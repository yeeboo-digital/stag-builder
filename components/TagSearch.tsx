"use client";

import { useMemo, useState } from "react";
import {
  searchTags,
  STAG_CATEGORIES,
  BLACKBAUD_QUICK_REF,
  type StagEntry,
} from "@/lib/stag-index";

function ContextBadge({ context }: { context: StagEntry["context"] }) {
  if (context === "autoresponder") {
    return (
      <span className="shrink-0 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
        Autoresponder only
      </span>
    );
  }
  if (context === "broadcast") {
    return (
      <span className="shrink-0 rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-dark">
        Broadcast
      </span>
    );
  }
  return null;
}

function CopySnippet({ snippet }: { snippet: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(snippet);
      } else {
        const ta = document.createElement("textarea");
        ta.value = snippet;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* user can select manually */
    }
  };
  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy snippet"
      className={[
        "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors",
        copied
          ? "bg-green-700 text-white"
          : "bg-slate-700 text-slate-200 hover:bg-slate-600",
      ].join(" ")}
    >
      {copied ? "Copied ✓" : "Copy"}
    </button>
  );
}

function ResultCard({ entry }: { entry: StagEntry }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-navy">
          {entry.name}{" "}
          <span className="font-mono text-xs font-normal text-slate-400">
            {entry.tag}
          </span>
        </h3>
        <ContextBadge context={entry.context} />
      </div>
      <p className="mb-3 text-sm leading-relaxed text-slate-600">
        {entry.description}
      </p>

      {entry.note && (
        <p className="mb-3 rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          ⚠️ {entry.note}
        </p>
      )}

      {entry.snippet ? (
        <div className="flex items-stretch gap-2">
          <pre className="flex-1 overflow-x-auto rounded-md bg-slate-900 px-3 py-2 font-mono text-[12px] leading-relaxed text-slate-200">
            {entry.snippet}
          </pre>
          <div className="flex items-start">
            <CopySnippet snippet={entry.snippet} />
          </div>
        </div>
      ) : (
        <a
          href={BLACKBAUD_QUICK_REF}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center text-xs font-medium text-teal-dark underline decoration-teal/50 underline-offset-2 hover:decoration-teal"
        >
          Look up the syntax in Blackbaud&rsquo;s S-Tag reference ↗
        </a>
      )}
    </div>
  );
}

export default function TagSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => searchTags(query), [query]);
  const isBrowsing = query.trim().length === 0;

  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="tag-search" className="sr-only">
          Search S-tags by need
        </label>
        <input
          id="tag-search"
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you want to do? e.g. “donor city”, “unsubscribe link”, “monthly gift”, “countdown”"
          className="w-full rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/30"
        />
        <p className="mt-2 text-xs text-slate-400">
          Describe a need in plain English — the matching S-tag and copy-paste
          code appear below. Runs entirely in your browser.
        </p>
      </div>

      {results.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No tags match “{query}”. Try a simpler word like “name”, “city”,
          “group”, “date”, or “gift”.
        </div>
      ) : isBrowsing ? (
        // Empty query → browse the whole index grouped by category.
        <div className="space-y-8">
          {STAG_CATEGORIES.map((cat) => {
            const inCat = results.filter((e) => e.category === cat);
            if (inCat.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {cat}
                </h2>
                <div className="grid gap-3">
                  {inCat.map((e) => (
                    <ResultCard key={e.tag} entry={e} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        // Active query → ranked flat list.
        <div className="space-y-3">
          <p className="text-xs text-slate-400">
            {results.length} match{results.length === 1 ? "" : "es"}
          </p>
          {results.map((e) => (
            <ResultCard key={e.tag} entry={e} />
          ))}
        </div>
      )}
    </div>
  );
}
