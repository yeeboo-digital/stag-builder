"use client";

import { useState } from "react";

interface CodeOutputProps {
  code: string;
  explanation: string;
  loading: boolean;
  error: string | null;
}

// Escape HTML before injecting highlight spans, then colour the S-tag tokens.
// Order matters: escape entities first, then wrap delimiters.
function highlightStagCode(code: string): string {
  const escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return escaped
    .replace(/(S\d+(?::[^\s\]:]+)*)/g, '<span class="text-cyan-300">$1</span>')
    .replace(/(\[\[|\]\])/g, '<span class="text-teal font-semibold">$1</span>')
    .replace(/(::)/g, '<span class="text-amber-400">$1</span>');
}

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Fallback for older / non-secure-context browsers
        const ta = document.createElement("textarea");
        ta.value = code;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Silently ignore — user can still select the text manually.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy generated S-tag code"
      className={[
        "rounded-md px-3 py-1.5 text-xs font-semibold transition-colors",
        copied
          ? "bg-green-700 text-white"
          : "bg-slate-700 text-slate-200 hover:bg-slate-600",
      ].join(" ")}
    >
      {copied ? "Copied ✓" : "Copy code"}
    </button>
  );
}

export default function CodeOutput({
  code,
  explanation,
  loading,
  error,
}: CodeOutputProps) {
  // --- Loading ----------------------------------------------------------
  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-48 rounded bg-slate-200" />
          <div className="h-24 rounded bg-slate-900/90" />
          <div className="h-3 w-3/4 rounded bg-slate-200" />
          <div className="h-3 w-2/3 rounded bg-slate-200" />
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500">
          Building your S-tag code…
        </p>
      </div>
    );
  }

  // --- Error ------------------------------------------------------------
  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-800"
      >
        {error}
      </div>
    );
  }

  // --- Empty state ------------------------------------------------------
  if (!code && !explanation) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
        Your generated S-tag code will appear here. Ready to paste into
        Luminate&rsquo;s HTML/source view.
      </div>
    );
  }

  // --- Result -----------------------------------------------------------
  return (
    <div className="space-y-6">
      {code && (
        <section
          role="region"
          aria-label="Generated code"
          className="overflow-hidden rounded-xl border border-slate-200 shadow-sm"
        >
          <div className="flex items-center justify-between bg-slate-800 px-4 py-2.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-300">
              S-Tag Code
            </span>
            <CopyButton code={code} />
          </div>
          <pre className="max-h-[28rem] overflow-auto bg-slate-900 p-4 text-[12px] leading-relaxed text-slate-200 sm:text-[13px]">
            <code
              className="font-mono"
              dangerouslySetInnerHTML={{ __html: highlightStagCode(code) }}
            />
          </pre>
        </section>
      )}

      {explanation && (
        <section aria-label="Explanation">
          <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Explanation
          </h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {explanation}
          </div>
        </section>
      )}
    </div>
  );
}
