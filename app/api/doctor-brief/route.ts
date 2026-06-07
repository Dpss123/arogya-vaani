import { NextRequest, NextResponse } from "next/server";

// 60-second pre-consultation brief for a doctor, generated from the patient's
// profile + recent triage + uploaded reports.
export async function POST(req: NextRequest) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    const { getPatientBriefData } = await import("@/lib/supabase");
    const { askGemini } = await import("@/lib/gemini");
    const { DOCTOR_BRIEF_PROMPT } = await import("@/lib/prompts");

    const data = await getPatientBriefData(phone);
    const brief = await askGemini(DOCTOR_BRIEF_PROMPT({
      phone,
      profile: data.patient,
      recent_triage: (data.recentTriage || []).map((t: { symptoms: string; verdict: string; created_at: string }) =>
        ({ symptoms: t.symptoms, verdict: t.verdict, when: t.created_at })),
      reports: (data.reports || []).map((r: { file_type: string; ai_summary: string; risk_level: string }) =>
        ({ type: r.file_type, summary: r.ai_summary, risk: r.risk_level })),
    }));

    return NextResponse.json({ brief });
  } catch (err) {
    console.error("Doctor brief error:", err);
    return NextResponse.json({ error: "Brief failed" }, { status: 500 });
  }
}
