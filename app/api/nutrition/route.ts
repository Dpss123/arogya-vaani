import { NextRequest, NextResponse } from "next/server";

// Thali nutrition estimate via Gemini Vision (estimate, not exact).
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!file.type?.startsWith("image/")) return NextResponse.json({ error: "Image file required" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });

    const { askGeminiVision } = await import("@/lib/gemini");
    const { THALI_PROMPT } = await import("@/lib/prompts");

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const result = await askGeminiVision(base64, file.type || "image/jpeg", THALI_PROMPT);
    return NextResponse.json({ result });
  } catch (e) {
    console.error("Nutrition API error:", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
