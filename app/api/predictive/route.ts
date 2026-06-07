import { NextRequest, NextResponse } from "next/server";

// Predictive health: read the patient's stored reports + triage history and
// let Gemini surface trends + a health score. Reads only — invents nothing.
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (typeof phone !== "string" || !phone.trim() || phone.length > 40) {
      return NextResponse.json({ error: "Invalid phone" }, { status: 400 });
    }

    const { getPatientBriefData } = await import("@/lib/supabase");
    const { askGemini } = await import("@/lib/gemini");
    const { PREDICTIVE_HEALTH_PROMPT } = await import("@/lib/prompts");

    const data = await getPatientBriefData(phone);

    // Shape the data down to what matters (and keep the prompt small).
    const slim = {
      profile: data.patient
        ? { age: data.patient.age, gender: data.patient.gender, blood_group: data.patient.blood_group, allergies: data.patient.allergies }
        : null,
      reports: (data.reports || []).map((r: { file_type: string; ai_summary: string; risk_level: string; uploaded_at: string }) =>
        ({ type: r.file_type, risk: r.risk_level, summary: (r.ai_summary || "").slice(0, 600), date: r.uploaded_at })),
      triage: (data.recentTriage || []).map((t: { symptoms: string; verdict: string; created_at: string }) =>
        ({ symptoms: t.symptoms, verdict: t.verdict, date: t.created_at })),
    };

    const raw = await askGemini(PREDICTIVE_HEALTH_PROMPT(slim));
    let parsed;
    try {
      parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "Parse failed", raw }, { status: 500 });
    }

    // Clamp/validate so an injected or bad value can't reach the UI unchecked.
    parsed.health_score = typeof parsed.health_score === "number"
      ? Math.max(0, Math.min(100, Math.round(parsed.health_score)))
      : null;
    if (!["improving", "stable", "declining", "unknown"].includes(parsed.trend)) parsed.trend = "unknown";
    if (!Array.isArray(parsed.insights)) parsed.insights = [];
    if (!Array.isArray(parsed.risks)) parsed.risks = [];
    if (!Array.isArray(parsed.recommendations)) parsed.recommendations = [];

    return NextResponse.json(parsed);
  } catch (e) {
    console.error("Predictive error:", e);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
