import { NextRequest, NextResponse } from "next/server";

// Generic-medicine (Jan Aushadhi) advisor. Prices are AI estimates, not live.
export async function POST(req: NextRequest) {
  try {
    const { medicineName } = await req.json();
    if (typeof medicineName !== "string" || !medicineName.trim() || medicineName.length > 120) {
      return NextResponse.json({ error: "Invalid medicine name" }, { status: 400 });
    }

    const { askGemini } = await import("@/lib/gemini");
    const { GENERIC_MEDICINE_PROMPT } = await import("@/lib/prompts");
    const raw = await askGemini(GENERIC_MEDICINE_PROMPT(medicineName.trim()));

    try {
      const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      return NextResponse.json(parsed);
    } catch {
      return NextResponse.json({ error: "Parse failed" }, { status: 500 });
    }
  } catch (e) {
    console.error("Generic API error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
