import { NextRequest, NextResponse } from "next/server";

// ASHA worker home-visit checklist generator.
export async function POST(req: NextRequest) {
  try {
    const { visitType } = await req.json();
    if (typeof visitType !== "string" || !visitType.trim() || visitType.length > 120) {
      return NextResponse.json({ error: "Invalid visit type" }, { status: 400 });
    }
    const { askGemini, GEMINI_ERROR_MESSAGE } = await import("@/lib/gemini");
    const { ASHA_CHECKLIST_PROMPT } = await import("@/lib/prompts");
    const checklist = await askGemini(ASHA_CHECKLIST_PROMPT(visitType.trim()));
    // askGemini returns a fallback string (not a throw) on a Gemini failure —
    // don't render it as a real checklist.
    if (!checklist || checklist === GEMINI_ERROR_MESSAGE) {
      return NextResponse.json({ error: "Failed" }, { status: 500 });
    }
    return NextResponse.json({ checklist });
  } catch (e) {
    console.error("ASHA API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
