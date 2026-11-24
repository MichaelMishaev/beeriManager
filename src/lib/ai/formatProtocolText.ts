import OpenAI from "openai";
import { AI_CONFIG } from "@/lib/ai/openai";

/** Max characters accepted for a single format request (~7-8k Hebrew words). */
export const PROTOCOL_FORMAT_MAX_CHARS = 30000;

/** Task mentions look like @Title[task:id]; they are swapped for opaque tokens before the model sees them. */
const MENTION_PATTERN = /@[^[\n]+\[task:[^\]\n]+\]/g;

const SYSTEM_PROMPT = `You tidy the layout of meeting-protocol text for a school parent committee. The output is shown as PLAIN TEXT (line breaks preserved), so it must contain no HTML and no Markdown syntax.

Rules:
1. Keep the text's own language (usually Hebrew). Never translate.
2. Do NOT add, invent, remove, merge or summarize content. Every fact, name, number, date and decision in the input must appear in the output, in the same order.
3. Only restructure: split run-on text into short paragraphs separated by one blank line; put a short heading on its own line only when the input already clearly has one; turn clearly enumerated items into lines starting with "- " (or "1. ", "2. " when the input numbers them); fix obvious spacing, stray line breaks inside sentences and repeated punctuation.
4. Do not use **bold**, # headings, tables or code fences.
5. Tokens that look like [[M1]], [[M2]] are placeholders. Copy each one exactly, unchanged, once.
6. Output ONLY the formatted text, with no preface or explanation.`;

export type FormatProtocolResult =
  | { ok: true; text: string }
  | {
      ok: false;
      code:
        | "ai_unavailable"
        | "ai_failed"
        | "ai_empty"
        | "ai_truncated"
        | "ai_altered";
    };

export async function formatProtocolText(
  input: string,
): Promise<FormatProtocolResult> {
  if (!process.env.OPENAI_API_KEY) return { ok: false, code: "ai_unavailable" };

  const mentions: string[] = [];
  const masked = input.replace(MENTION_PATTERN, (m) => {
    mentions.push(m);
    return `[[M${mentions.length}]]`;
  });

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    const completion = await openai.chat.completions.create({
      model: AI_CONFIG.model,
      reasoning_effort: AI_CONFIG.reasoning_effort,
      max_completion_tokens: 16000,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: masked },
      ],
    });

    const choice = completion.choices[0];
    if (choice?.finish_reason === "length")
      return { ok: false, code: "ai_truncated" };

    let text = choice?.message?.content?.trim() ?? "";
    if (!text) return { ok: false, code: "ai_empty" };

    // Every placeholder must come back exactly once, otherwise a task link would be lost or duplicated.
    for (let i = 0; i < mentions.length; i++) {
      const token = `[[M${i + 1}]]`;
      if (text.split(token).length !== 2)
        return { ok: false, code: "ai_altered" };
    }
    mentions.forEach((m, i) => {
      text = text.split(`[[M${i + 1}]]`).join(m);
    });

    // Guard against the model dropping most of the content.
    if (text.length < input.trim().length * 0.5)
      return { ok: false, code: "ai_altered" };

    return { ok: true, text };
  } catch (error) {
    console.error(
      "Protocol format AI error:",
      error instanceof Error ? error.message : "unknown",
    );
    return { ok: false, code: "ai_failed" };
  }
}
