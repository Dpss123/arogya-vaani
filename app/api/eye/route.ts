import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// Eye screening. Trained DR model (EYE_SERVICE_URL, needs a fundus image) when
// set, else Gemini-Vision screening of an external-eye photo.
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
    if (!file.type?.startsWith("image/")) return NextResponse.json({ error: "Image file required" }, { status: 400 });
    if (file.size > 8 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 8MB)" }, { status: 400 });

    const serviceUrl = process.env.EYE_SERVICE_URL;
    if (serviceUrl) {
      try {
        const fwd = new FormData();
        fwd.append("file", file, file.name || "eye.jpg");
        const res = await fetch(`${serviceUrl.replace(/\/$/, "")}/predict`, { method: "POST", body: fwd, signal: AbortSignal.timeout(60000) });
        if (res.ok) {
          const data = await res.json();
          const findings: { hindi: string; probability: number; danger?: boolean }[] = Array.isArray(data.findings) ? data.findings : [];
          const top3 = findings.slice(0, 3).map(f =>
            `${f.probability >= 0.5 ? "🔴" : f.probability >= 0.3 ? "🟡" : "🟢"} ${f.hindi} — ${Math.round(f.probability * 100)}%`
          ).join("\n");
          const danger = findings[0]?.danger;
          const result = `👁️ EYE AI (trained DR model · fundus)\n\nSabse zyada match:\n${top3}\n\n${danger ? "⚠️ Top result serious ho sakta hai — jald aankh ke doctor ko dikhayein.\n\n" : ""}${data.disclaimer || ""}`;
          return NextResponse.json({ result, trained: true });
        }
      } catch (e) {
        console.error("Eye service error, falling back to Gemini:", e);
      }
    }

    const { askGeminiVision } = await import("@/lib/gemini");
    const { EYE_PROMPT } = await import("@/lib/prompts");
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const result = await askGeminiVision(base64, file.type || "image/jpeg", EYE_PROMPT);
    return NextResponse.json({ result, trained: false });
  } catch (e) {
    console.error("Eye API error:", e);
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
