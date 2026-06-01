"use client";

import { useState } from "react";
import WorkflowWarning from "@/components/WorkflowWarning";
import Wizard from "@/components/Wizard";
import AiAssist from "@/components/AiAssist";
import TagReference from "@/components/TagReference";
import { AI_ENABLED } from "@/lib/config";

type Tab = "guided" | "ai";

export default function Home() {
  const [tab, setTab] = useState<Tab>("guided");
  const [referenceOpen, setReferenceOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F7FA]">
      {/* Header */}
      <header className="bg-navy">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-baseline gap-3">
            <span className="text-lg font-extrabold tracking-wide text-white">
              YEEBOO
            </span>
            <span className="text-lg font-semibold text-teal">
              S-Tag Builder
            </span>
          </div>
          <button
            type="button"
            onClick={() => setReferenceOpen(true)}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/10 hover:text-white"
          >
            Quick Reference ↗
          </button>
        </div>
      </header>

      {/* Always-visible workflow warning */}
      <WorkflowWarning />

      {/* Main */}
      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        <section>
          <h1 className="mb-1 text-2xl font-bold text-navy">
            Build Luminate S-tag code — no syntax required
          </h1>
          <p className="text-sm text-slate-500">
            Pick a pattern, fill in the blanks, and copy production-ready S-tag
            code for Luminate&rsquo;s HTML/source view.
          </p>
        </section>

        {/* Tabs — the AI tab only appears when AI mode is enabled */}
        {AI_ENABLED && (
          <div
            role="tablist"
            aria-label="Builder mode"
            className="inline-flex rounded-lg border border-slate-200 bg-white p-1"
          >
            <button
              role="tab"
              aria-selected={tab === "guided"}
              onClick={() => setTab("guided")}
              className={[
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                tab === "guided"
                  ? "bg-navy text-white"
                  : "text-slate-600 hover:text-navy",
              ].join(" ")}
            >
              Guided builder
            </button>
            <button
              role="tab"
              aria-selected={tab === "ai"}
              onClick={() => setTab("ai")}
              className={[
                "rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
                tab === "ai"
                  ? "bg-navy text-white"
                  : "text-slate-600 hover:text-navy",
              ].join(" ")}
            >
              Describe it with AI
            </button>
          </div>
        )}

        {/* Panels */}
        {AI_ENABLED && tab === "ai" ? <AiAssist /> : <Wizard />}
      </main>

      <footer className="mx-auto max-w-5xl space-y-2 px-4 pb-10 pt-4 text-center text-xs text-slate-400">
        <p>
          Built by Yeeboo Digital · A free community tool for Blackbaud Luminate
          Online ·{" "}
          <a
            href="https://yeeboodigital.com"
            className="underline hover:text-teal-dark"
          >
            yeeboodigital.com
          </a>
        </p>
        <p>
          Official Blackbaud docs:{" "}
          <a
            href="https://webfiles-sc1.blackbaud.com/files/support/helpfiles/lo/content/s_tags.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-teal-dark"
          >
            What are S-tags? ↗
          </a>{" "}
          ·{" "}
          <a
            href="https://webfiles-sc1.blackbaud.com/files/support/helpfiles/luminate-online/help/Subsystems/S-Tags/Content/S-Tags/S-Tags_Quick_Reference.html"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-teal-dark"
          >
            S-Tag Quick Reference ↗
          </a>
        </p>
      </footer>

      {/* Quick reference slide-in */}
      <TagReference
        open={referenceOpen}
        onClose={() => setReferenceOpen(false)}
      />
    </div>
  );
}
