"use client";

import { useState } from "react";
import { Loader2, Sparkles, Undo2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

/** Below this many characters there is nothing worth formatting. */
const MIN_CHARS = 20;

const ERROR_CODES = [
  "too_long",
  "ai_unavailable",
  "ai_failed",
  "ai_empty",
  "ai_truncated",
  "ai_altered",
  "unauthorized",
  "invalid_input",
] as const;

interface AiFormatButtonProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * "Format with AI" + one-step undo for a protocol text field.
 * Sends the current text to POST /api/protocols/format. The field is only
 * changed when the call succeeds; on any failure the text stays untouched.
 */
export function AiFormatButton({ value, onChange }: AiFormatButtonProps) {
  const t = useTranslations("admin.records.protocols.aiFormat");
  const [loading, setLoading] = useState(false);
  const [previous, setPrevious] = useState<string | null>(null);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const canFormat = value.trim().length >= MIN_CHARS && !loading;

  async function handleFormat() {
    const original = value;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/protocols/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ text: original }),
      });
      const json = (await res.json().catch(() => null)) as {
        success?: boolean;
        code?: string;
        maxChars?: number;
        data?: { text?: string };
      } | null;

      if (res.ok && json?.success && json.data?.text) {
        setPrevious(original);
        onChange(json.data.text);
        setMessage({ kind: "success", text: t("done") });
        return;
      }

      const code = ERROR_CODES.find((c) => c === json?.code);
      const text =
        code === "too_long"
          ? t("errors.too_long", {
              max: (json?.maxChars ?? 30000).toLocaleString(),
            })
          : code
            ? t(`errors.${code}`)
            : t("errors.network");
      setMessage({ kind: "error", text });
    } catch {
      setMessage({ kind: "error", text: t("errors.network") });
    } finally {
      setLoading(false);
    }
  }

  function handleUndo() {
    if (previous === null) return;
    onChange(previous);
    setPrevious(null);
    setMessage(null);
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleFormat}
          disabled={!canFormat}
          aria-busy={loading}
          className="min-h-[44px] gap-2"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {loading ? t("working") : t("button")}
        </Button>
        {previous !== null && !loading && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleUndo}
            className="min-h-[44px] gap-2"
          >
            <Undo2 className="h-4 w-4" aria-hidden="true" />
            {t("undo")}
          </Button>
        )}
      </div>
      {message && (
        <p
          role={message.kind === "error" ? "alert" : "status"}
          className={`max-w-[18rem] text-xs ${message.kind === "error" ? "text-red-600" : "text-green-700"}`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
