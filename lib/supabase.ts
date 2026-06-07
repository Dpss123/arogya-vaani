// ============================================
// SUPABASE DATABASE CLIENT
// All database operations go through this file.
// Server routes use supabaseAdmin (service role — bypasses RLS).
// The anon `supabase` client is exported for completeness but the
// browser never reads tables directly (RLS blocks the anon role).
// ============================================

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// ── PATIENT HELPERS ───────────────────────
export async function getOrCreatePatient(phone: string) {
  const { data: existing } = await supabaseAdmin
    .from("patients").select("*").eq("phone", phone).single();
  if (existing) return existing;
  const { data } = await supabaseAdmin
    .from("patients").insert({ phone }).select().single();
  return data;
}

export async function updatePatient(phone: string, updates: Record<string, unknown>) {
  const { data } = await supabaseAdmin
    .from("patients")
    .upsert({ phone, ...updates, updated_at: new Date().toISOString() }, { onConflict: "phone" })
    .select().single();
  return data;
}

export async function getPatientByPhone(phone: string) {
  const { data } = await supabaseAdmin
    .from("patients").select("*").eq("phone", phone).single();
  return data;
}

// ── MESSAGE HELPERS ───────────────────────
export async function saveMessage(
  patientPhone: string, role: "patient" | "ai",
  content: string, language: string = "hindi"
) {
  const { data, error } = await supabaseAdmin
    .from("messages")
    .insert({ patient_phone: patientPhone, role, content, language });
  if (error) console.error("Save message error:", error);
  return data;
}

export async function getConversationHistory(patientPhone: string, limit: number = 10) {
  const { data } = await supabaseAdmin
    .from("messages").select("*")
    .eq("patient_phone", patientPhone)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data || []).reverse();
}

export async function getAllMessages(patientPhone: string, limit: number = 50) {
  const { data } = await supabaseAdmin
    .from("messages").select("*")
    .eq("patient_phone", patientPhone)
    .order("created_at", { ascending: true })
    .limit(limit);
  return data || [];
}

// ── TRIAGE HELPERS ────────────────────────
// Columns match triage_results exactly: advice + call_108.
export async function saveTriageResult(
  patientPhone: string, symptoms: string,
  verdict: string, advice: string, call108: boolean = false
) {
  const { data, error } = await supabaseAdmin.from("triage_results").insert({
    patient_phone: patientPhone, symptoms, verdict, advice, call_108: call108,
  });
  if (error) console.error("Save triage error:", error);
  return data;
}

export async function getTriageHistory(patientPhone: string, limit: number = 10) {
  const { data } = await supabaseAdmin
    .from("triage_results").select("*")
    .eq("patient_phone", patientPhone)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

// ── REPORT HELPERS ────────────────────────
export async function saveReport(
  patientPhone: string, fileUrl: string, fileType: string,
  aiSummary: string, riskLevel: string
) {
  const { data } = await supabaseAdmin.from("reports").insert({
    patient_phone: patientPhone, file_url: fileUrl,
    file_type: fileType, ai_summary: aiSummary, risk_level: riskLevel,
  });
  return data;
}

export async function getPatientReports(patientPhone: string) {
  const { data } = await supabaseAdmin
    .from("reports").select("*")
    .eq("patient_phone", patientPhone)
    .order("uploaded_at", { ascending: false });
  return data || [];
}

// ── MEDICINE HELPERS ──────────────────────
export async function saveMedicineScan(
  patientPhone: string, medicineName: string, analysis: string
) {
  const { data, error } = await supabaseAdmin.from("medicine_scans").insert({
    patient_phone: patientPhone, medicine_name: medicineName, analysis,
  });
  if (error) console.error("Save medicine scan error:", error);
  return data;
}

// ── DOCTOR HELPERS ────────────────────────
export async function getDoctorsByDistrict(district: string, speciality?: string) {
  let query = supabaseAdmin
    .from("doctors").select("*")
    .eq("district", district)
    .eq("is_verified", true);
  if (speciality && speciality !== "all") query = query.eq("speciality", speciality);
  const { data } = await query;
  return data || [];
}

export async function registerDoctor(doctorData: Record<string, unknown>) {
  const { data } = await supabaseAdmin
    .from("doctors").insert(doctorData).select().single();
  return data;
}

// ── OUTBREAK HELPERS ──────────────────────
export async function saveOutbreakAlert(
  location: string, disease: string,
  riskLevel: string, caseCount: number, pincode?: string
) {
  const { data } = await supabaseAdmin.from("outbreak_alerts").insert({
    location, probable_disease: disease,
    risk_level: riskLevel, case_count: caseCount,
    pincode: pincode || null, alert_sent: riskLevel === "CRITICAL",
  });
  return data;
}

export async function getActiveOutbreaks() {
  const { data } = await supabaseAdmin
    .from("outbreak_alerts").select("*")
    .order("created_at", { ascending: false })
    .limit(20);
  return data || [];
}

// ── OUTBREAK CLUSTERING ───────────────────
// Pull every triage in the last N hours and attach the patient's location,
// so the outbreak endpoint can group by district/PIN and flag real clusters.
export async function getRecentTriageWithLocation(hours: number = 72) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  const { data: triages } = await supabaseAdmin
    .from("triage_results")
    .select("patient_phone, symptoms, verdict, created_at")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false });
  const rows = triages || [];
  const phones = [...new Set(rows.map(r => r.patient_phone))];
  const loc: Record<string, { district?: string; village?: string; pincode?: string }> = {};
  if (phones.length) {
    // Prefer pincode; fall back gracefully if that column isn't present yet.
    type Loc = { phone: string; district?: string; village?: string; pincode?: string };
    let pts = (await supabaseAdmin.from("patients").select("phone, district, village, pincode").in("phone", phones)).data as Loc[] | null;
    if (!pts) pts = (await supabaseAdmin.from("patients").select("phone, district, village").in("phone", phones)).data as Loc[] | null;
    for (const p of pts || []) loc[p.phone] = { district: p.district, village: p.village, pincode: p.pincode };
  }
  return rows.map(r => ({
    ...r,
    district: loc[r.patient_phone]?.district || "Unknown",
    village: loc[r.patient_phone]?.village || "",
    pincode: loc[r.patient_phone]?.pincode || "",
  }));
}

// ── DOCTOR BRIEF ──────────────────────────
// Everything the doctor pre-consultation brief needs, in one call.
export async function getPatientBriefData(phone: string) {
  const [patient, recentTriage, reports] = await Promise.all([
    getPatientByPhone(phone),
    getTriageHistory(phone, 5),
    getPatientReports(phone),
  ]);
  return { patient, recentTriage, reports };
}

// ── STATS HELPERS ─────────────────────────
export async function getPlatformStats() {
  const [patients, messages, triages, reports] = await Promise.all([
    supabaseAdmin.from("patients").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("messages").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("triage_results").select("id", { count: "exact", head: true }),
    supabaseAdmin.from("reports").select("id", { count: "exact", head: true }),
  ]);
  return {
    totalPatients: patients.count || 0,
    totalMessages: messages.count || 0,
    totalTriages: triages.count || 0,
    totalReports: reports.count || 0,
  };
}
