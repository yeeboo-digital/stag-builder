// Splits a Claude response into the first fenced code block (the S-tag code)
// and the surrounding prose (the explanation). If there is no fenced block,
// the whole response is treated as explanation.

export interface ParsedResponse {
  code: string;
  explanation: string;
}

export function parseResponse(text: string): ParsedResponse {
  const fence = /```(?:[\w-]+)?\n([\s\S]*?)```/;
  const codeMatch = text.match(fence);

  if (codeMatch) {
    const code = codeMatch[1].trim();
    const explanation = text
      .replace(/```(?:[\w-]+)?\n[\s\S]*?```/g, "")
      // collapse the blank lines left behind by removing the code block
      .replace(/\n{3,}/g, "\n\n")
      .trim();
    return { code, explanation };
  }

  return { code: "", explanation: text.trim() };
}
