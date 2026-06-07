import { NextRequest, NextResponse } from "next/server";

// Photo-based screening via Gemini Vision (screening aid, NOT a trained model).
// type = skin | eye | dental | strip
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = (formData.get("type") as string) || "skin";
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!file.type?.startsWith("image/")) return NextResponse.json({ error: "Image file required" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });

    const { askGeminiVision } = await import("@/lib/gemini");
    const p = await import("@/lib/prompts");
    const map: Record<string, string> = {
      skin: p.SKIN_PROMPT,
      eye: p.EYE_PROMPT,
      dental: p.DENTAL_PROMPT,
      strip: p.STRIP_PROMPT,
    };
    const prompt = map[type] || p.SKIN_PROMPT;

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const result = await askGeminiVision(base64, file.type || "image/jpeg", prompt);
    return NextResponse.json({ result });
  } catch (e) {
    console.error("Diagnose error:", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
