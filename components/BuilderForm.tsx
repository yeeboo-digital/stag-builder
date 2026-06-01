"use client";

import { KeyboardEvent, useEffect, useState } from "react";

interface BuilderFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
  placeholder?: string;
  buttonLabel?: string;
  /** Smaller styling for the follow-up input under the output. */
  compact?: boolean;
  onClear?: () => void;
}

export default function BuilderForm({
  value,
  onChange,
  onSubmit,
  loading,
  placeholder = "Describe what you want your email to do…",
  buttonLabel = "Generate",
  compact = false,
  onClear,
}: BuilderFormProps) {
  const canSubmit = value.trim().length > 0 && !loading;

  // Resolve the modifier-key label only after mount, so server and first
  // client render agree (avoids a hydration mismatch on Mac/Windows).
  const [modKey, setModKey] = useState("Ctrl");
  useEffect(() => {
    if (navigator.platform.toUpperCase().includes("MAC")) setModKey("⌘");
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + Enter submits
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && canSubmit) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div>
      <label htmlFor={compact ? "followup-input" : "prompt-input"} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={compact ? "followup-input" : "prompt-input"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={compact ? 2 : 4}
        className="w-full resize-y rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-800 shadow-sm outline-none transition-colors placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/30"
      />
      <div className="mt-3 flex flex-wrap items-center justify-end gap-3">
        <span className="mr-auto hidden text-xs text-slate-400 sm:inline">
          Press {modKey}+Enter to {buttonLabel.toLowerCase()}
        </span>
        {onClear && (
          <button
            type="button"
            onClick={onClear}
            disabled={loading}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700 disabled:opacity-50"
          >
            Clear
          </button>
        )}
        <button
          type="button"
          onClick={onSubmit}
          disabled={!canSubmit}
          className="w-full rounded-lg bg-navy px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
        >
          {loading ? "Generating…" : `${buttonLabel} →`}
        </button>
      </div>
    </div>
  );
}
