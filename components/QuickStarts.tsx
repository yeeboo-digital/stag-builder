"use client";

import { QUICK_STARTS } from "@/lib/quickstarts";

interface QuickStartsProps {
  onSelect: (prompt: string) => void;
  activePrompt?: string;
}

export default function QuickStarts({
  onSelect,
  activePrompt,
}: QuickStartsProps) {
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Quick starts
      </h2>
      <div className="flex flex-wrap gap-2">
        {QUICK_STARTS.map((qs) => {
          const active = activePrompt === qs.prompt;
          return (
            <button
              key={qs.label}
              type="button"
              onClick={() => onSelect(qs.prompt)}
              aria-pressed={active}
              className={[
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-teal bg-teal/10 text-navy"
                  : "border-slate-200 bg-white text-slate-700 hover:border-teal hover:text-navy",
              ].join(" ")}
            >
              {qs.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
