import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyJWT } from "@/lib/auth/jwt";
import {
  formatProtocolText,
  PROTOCOL_FORMAT_MAX_CHARS,
} from "@/lib/ai/formatProtocolText";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
export const maxDuration = 60;

const BodySchema = z.object({
  text: z.string().trim().min(1),
});

/**
 * POST /api/protocols/format  (admin only)
 * Restructures raw protocol text. Never writes to the database.
 * Responses carry a machine-readable `code` that the client maps to a translated message.
 */
export async function POST(req: NextRequest) {
  const token = req.cookies.get("auth-token");
  const payload = token ? await verifyJWT(token.value) : null;
  if (!payload || payload.role !== "admin") {
    return NextResponse.json(
      { success: false, code: "unauthorized", error: "Unauthorized" },
      { status: 401 },
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, code: "invalid_input", error: "Invalid JSON" },
      { status: 400 },
    );
  }

  const parsed = BodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, code: "invalid_input", error: "Invalid input" },
      { status: 400 },
    );
  }
  if (parsed.data.text.length > PROTOCOL_FORMAT_MAX_CHARS) {
    return NextResponse.json(
      {
        success: false,
        code: "too_long",
        error: "Text too long",
        maxChars: PROTOCOL_FORMAT_MAX_CHARS,
      },
      { status: 413 },
    );
  }

  const result = await formatProtocolText(parsed.data.text);
  if (!result.ok) {
    return NextResponse.json(
      { success: false, code: result.code, error: "Formatting failed" },
      { status: result.code === "ai_unavailable" ? 503 : 502 },
    );
  }

  return NextResponse.json({ success: true, data: { text: result.text } });
}
