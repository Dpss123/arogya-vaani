// ============================================
// ALL TYPESCRIPT TYPES — AROGYA VAANI
// Add new fields here when extending the platform
// ============================================

export type Patient = {
  id: string;
  phone: string;
  name?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  village?: string;
  district?: string;
  state?: string;
  blood_group?: string;
  allergies?: string;
  abha_id?: string;
  created_at: string;
};

export type Message = {
  id: string;
  patient_phone: string;
  role: "patient" | "ai";
  content: string;
  language: "hindi" | "english";
  created_at: string;
};

export type TriageResult = {
  id: string;
  patient_phone: string;
  symptoms: string;
  verdict: "rest" | "clinic" | "emergency";
  urgency_color: "green" | "yellow" | "red";
  hindi_advice: string;
  english_advice: string;
  call_108: boolean;
  see_doctor_within: string;
  created_at: string;
};

export type Report = {
  id: string;
  patient_phone: string;
  file_url: string;
  file_type: "blood_test" | "xray" | "urine" | "prescription" | "other";
  ai_summary: string;
  risk_level: "normal" | "borderline" | "urgent";
  uploaded_at: string;
};

export type Doctor = {
  id: string;
  name: string;
  email: string;
  phone: string;
  speciality: string;
  clinic_address: string;
  district: string;
  is_verified: boolean;
  accepts_ayushman: boolean;
};

export type OutbreakAlert = {
  id: string;
  location: string;
  probable_disease: string;
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  case_count: number;
  alert_sent: boolean;
  created_at: string;
};

export type WhatsAppMessage = {
  from: string;
  type: "text" | "voice" | "image" | "document";
  text: string | null;
  mediaId: string | null;
};

export type TriageVerdict = "rest" | "clinic" | "emergency";
export type RiskLevel = "normal" | "borderline" | "urgent";
export type UrgencyColor = "green" | "yellow" | "red";
