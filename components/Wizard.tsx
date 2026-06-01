"use client";

import { useMemo, useState } from "react";
import {
  TEMPLATES,
  getTemplate,
  defaultsFor,
  type StagTemplate,
} from "@/lib/templates";
import CodeOutput from "@/components/CodeOutput";

function ContextBadge({ context }: { context: StagTemplate["context"] }) {
  if (context === "autoresponder") {
    return (
      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-800">
        Autoresponder only
      </span>
    );
  }
  return (
    <span className="rounded-full bg-teal/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-teal-dark">
      Broadcast email
    </span>
  );
}

export default function Wizard() {
  const [activeId, setActiveId] = useState<string>(TEMPLATES[0].id);
  const [valuesById, setValuesById] = useState<
    Record<string, Record<string, string>>
  >(() =>
    Object.fromEntries(TEMPLATES.map((t) => [t.id, defaultsFor(t)]))
  );

  const template = getTemplate(activeId)!;
  const values = valuesById[activeId];

  const { code, explanation } = useMemo(
    () => template.generate(values),
    [template, values]
  );

  function setField(name: string, value: string) {
    setValuesById((prev) => ({
      ...prev,
      [activeId]: { ...prev[activeId], [name]: value },
    }));
  }

  function resetActive() {
    setValuesById((prev) => ({ ...prev, [activeId]: defaultsFor(template) }));
  }

  return (
    <div className="space-y-6">
      {/* Pattern picker */}
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          1 · Pick a pattern
        </h2>
        <div className="flex flex-wrap gap-2">
          {TEMPLATES.map((t) => {
            const active = t.id === activeId;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveId(t.id)}
                aria-pressed={active}
                title={t.blurb}
                className={[
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-teal bg-teal/10 text-navy"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal hover:text-navy",
                ].join(" ")}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Fields */}
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                2 · Fill in the details
              </h2>
              <ContextBadge context={template.context} />
            </div>
            <p className="text-sm text-slate-500">{template.blurb}</p>
          </div>
          <button
            type="button"
            onClick={resetActive}
            className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:text-slate-700"
          >
            Reset
          </button>
        </div>

        <div className="grid gap-4">
          {template.fields.map((f) => (
            <div key={f.name}>
              <label
                htmlFor={`f-${f.name}`}
                className="mb-1 block text-sm font-medium text-slate-700"
              >
                {f.label}
              </label>
              {f.type === "textarea" ? (
                <textarea
                  id={`f-${f.name}`}
                  value={values[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  rows={3}
                  placeholder={f.placeholder}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/30"
                />
              ) : (
                <input
                  id={`f-${f.name}`}
                  type="text"
                  value={values[f.name]}
                  onChange={(e) => setField(f.name, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-teal focus:ring-2 focus:ring-teal/30"
                />
              )}
              {f.help && (
                <p className="mt-1 text-xs text-slate-400">{f.help}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Live output */}
      <div>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
          3 · Copy your code
        </h2>
        <CodeOutput code={code} explanation={explanation} loading={false} error={null} />
      </div>
    </div>
  );
}
