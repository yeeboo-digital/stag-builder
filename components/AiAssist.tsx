"use client";

import { useState } from "react";
import QuickStarts from "@/components/QuickStarts";
import BuilderForm from "@/components/BuilderForm";
import CodeOutput from "@/components/CodeOutput";
import { parseResponse } from "@/lib/parse";
import type { Message } from "@/lib/types";

// The optional, free-form "just describe it" experience. Only mounted when
// AI mode is enabled. Calls the server-side /api/generate proxy.
export default function AiAssist() {
  const [prompt, setPrompt] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const [code, setCode] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasResult = code !== "" || explanation !== "";

  async function generate(userPrompt: string) {
    const trimmed = userPrompt.trim();
    if (!trimmed || loading) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed, conversationHistory: history }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(
          data?.error ||
            "Something went wrong generating your code. Please try again, or rephrase your request."
        );
        return;
      }

      const parsed = parseResponse(data.result || "");
      setCode(parsed.code);
      setExplanation(parsed.explanation);
      setHistory(data.updatedHistory || []);
      setFollowUp("");
    } catch {
      setError(
        "Something went wrong generating your code. Please try again, or rephrase your request."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setPrompt("");
    setFollowUp("");
    setHistory([]);
    setCode("");
    setExplanation("");
    setError(null);
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-slate-500">
        Describe anything in plain English — including combinations the guided
        builder doesn&rsquo;t cover. Powered by Claude.
      </p>

      <QuickStarts onSelect={setPrompt} activePrompt={prompt} />

      <BuilderForm
        value={prompt}
        onChange={setPrompt}
        onSubmit={() => generate(prompt)}
        loading={loading}
        onClear={hasResult || prompt ? handleClear : undefined}
      />

      <CodeOutput
        code={code}
        explanation={explanation}
        loading={loading}
        error={error}
      />

      {hasResult && !loading && (
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Refine
          </h2>
          <BuilderForm
            value={followUp}
            onChange={setFollowUp}
            onSubmit={() => generate(followUp)}
            loading={loading}
            compact
            placeholder="Ask a follow-up or refine… (e.g. “make the monthly message shorter”)"
            buttonLabel="Send"
            onClear={handleClear}
          />
          <p className="text-xs text-slate-400">
            Clearing starts a fresh conversation.
          </p>
        </section>
      )}
    </div>
  );
}
