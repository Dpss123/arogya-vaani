import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const symptoms = body.symptoms;
    const patientPhone = typeof body.patientPhone === "string" ? body.patientPhone.slice(0, 40) : undefined;

    // Input validation (type + bounds).
    if (typeof symptoms !== "string" || !symptoms.trim() || symptoms.length > 2000) {
      return NextResponse.json({ error: "Invalid symptoms" }, { status: 400 });
    }
    const answers = Array.isArray(body.answers)
      ? body.answers.filter((a: unknown) => typeof a === "string").slice(0, 10)
      : undefined;

    const { hasEmergencyKeywords } = await import("@/lib/utils");

    // ── Deterministic safety net ──
    // Obvious emergencies NEVER wait for the LLM or a follow-up round.
    const combined = `${symptoms} ${(answers || []).join(" ")}`;
    if (hasEmergencyKeywords(combined)) {
      const verdict = {
        need_more_info: false,
        verdict: "emergency",
        urgency_color: "red",
        hindi_advice: "Aapke symptoms serious lag rahe hain. TURANT 108 par call karein ya nazdeeki hospital jayein. Patient ko hilne na dein.",
        english_advice: "Your symptoms appear serious. Call 108 immediately or go to the nearest hospital.",
        warning_signs: ["Seene mein dard", "Saans lene mein takleef", "Behoshi"],
        call_108: true,
        see_doctor_within: "today",
      };
      if (patientPhone) {
        const { getOrCreatePatient, saveTriageResult } = await import("@/lib/supabase");
        await getOrCreatePatient(patientPhone);
        await saveTriageResult(patientPhone, symptoms, "emergency", verdict.hindi_advice, true);
      }
      return NextResponse.json(verdict);
    }

    const { askGemini } = await import("@/lib/gemini");
    const { TRIAGE_PROMPT } = await import("@/lib/prompts");
    const raw = await askGemini(TRIAGE_PROMPT(symptoms, answers));

    let triage;
    try {
      triage = JSON.parse(raw.replace(/```json|```/g, "").trim());
    } catch {
      return NextResponse.json({ error: "Parse failed", raw }, { status: 500 });
    }

    // Phase 1: AI wants clarification before deciding.
    if (triage.need_more_info) {
      return NextResponse.json({ needsFollowup: true, questions: triage.questions || [] });
    }

    // An emergency verdict always implies a callable 108 (don't trust the model
    // to set both fields together).
    if (triage.verdict === "emergency" || triage.urgency_color === "red") {
      triage.call_108 = true;
    }

    // Phase 2: persist a real verdict when we have a patient.
    if (patientPhone && triage.verdict) {
      const { getOrCreatePatient, saveTriageResult } = await import("@/lib/supabase");
      await getOrCreatePatient(patientPhone);
      await saveTriageResult(
        patientPhone,
        symptoms,
        triage.verdict,
        triage.hindi_advice || triage.advice || "",
        triage.call_108 === true
      );
    }

    return NextResponse.json(triage);
  } catch (err) {
    console.error("Triage error:", err);
    return NextResponse.json({ error: "Triage failed" }, { status: 500 });
  }
}

// Cross-patient feed for the doctor dashboard — gated behind a logged-in
// session (same cookie the middleware checks for protected pages).
export async function GET(req: NextRequest) {
  const token =
    req.cookies.get("next-auth.session-token")?.value ||
    req.cookies.get("__Secure-next-auth.session-token")?.value;
  if (!token) return NextResponse.json({ results: [] }, { status: 401 });

  try {
    const { supabaseAdmin } = await import("@/lib/supabase");

    const { data: triages } = await supabaseAdmin
      .from("triage_results")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    const rows = triages || [];
    const phones = [...new Set(rows.map((r) => r.patient_phone))];
    const names: Record<string, string> = {};
    if (phones.length) {
      const { data: patients } = await supabaseAdmin
        .from("patients")
        .select("phone, name")
        .in("phone", phones);
      for (const p of patients || []) names[p.phone] = p.name;
    }

    const results = rows.map((r) => ({
      id: r.id,
      phone: r.patient_phone,
      name: names[r.patient_phone] || r.patient_phone,
      symptoms: r.symptoms,
      verdict: r.verdict,
      time: r.created_at,
      risk: r.verdict === "emergency" ? "high" : r.verdict === "clinic" ? "medium" : "low",
    }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] });
  }
}
