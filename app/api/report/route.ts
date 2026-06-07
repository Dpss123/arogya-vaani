import { NextRequest, NextResponse } from "next/server";
import { askGeminiVision } from "@/lib/gemini";
import { REPORT_READER_PROMPT } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });

  const phone = (formData.get("phone") as string) || "demo";
  const fileType = (formData.get("fileType") as string) || "other";

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const mimeType = file.type || "image/jpeg";

  const summary = await askGeminiVision(base64, mimeType, REPORT_READER_PROMPT);

  // Persist the analysis (best-effort — never block the response on the DB).
  try {
    const { getOrCreatePatient, saveReport } = await import("@/lib/supabase");
    await getOrCreatePatient(phone);
    const risk = summary.includes("🔴") ? "urgent" : summary.includes("⚠️") ? "borderline" : "normal";
    await saveReport(phone, "", fileType, summary, risk);
  } catch (e) {
    console.error("Report persist error:", e);
  }

  return NextResponse.json({ summary });
}
