// ============================================
// UTILITY FUNCTIONS — AROGYA VAANI
// Common helpers used across the platform
// ============================================

// Format phone number for WhatsApp
export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, "").replace(/^0/, "91");
}

// Get triage color
export function getTriageColor(verdict: string): string {
  if (verdict === "emergency") return "#FF4757";
  if (verdict === "clinic") return "#fbbf24";
  return "#00E676";
}

// Get triage emoji + label
export function getTriageLabel(verdict: string): string {
  if (verdict === "emergency") return "🔴 TURANT 108 CALL KAREIN";
  if (verdict === "clinic") return "🟡 Aaj Clinic Jayein";
  return "🟢 Ghar Pe Aaram Karein";
}

// Get risk level color
export function getRiskColor(risk: string): string {
  const map: Record<string, string> = {
    normal: "#00E676", borderline: "#fbbf24",
    urgent: "#FF4757", LOW: "#00E676",
    MEDIUM: "#fbbf24", HIGH: "#f97316", CRITICAL: "#FF4757",
  };
  return map[risk] || "#00E676";
}

// Format date in Hindi
export function formatDateHindi(date: string | Date): string {
  const d = new Date(date);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return "Abhi";
  if (diff < 3600) return `${Math.floor(diff / 60)} minute pehle`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} ghante pehle`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} din pehle`;
  return d.toLocaleDateString("hi-IN");
}

// Truncate text
export function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

// Check if emergency keywords present
export function hasEmergencyKeywords(text: string): boolean {
  const keywords = [
    "seene mein dard", "chest pain", "sans nahi", "saans nahi", "breathless",
    "saans lene", "dam ghut", "unconscious", "behosh", "behoshi",
    "heart attack", "stroke", "paralysis", "lakwa", "fit aa", "seizure",
    "bahut zyada khoon", "severe bleeding", "khoon band nahi",
    "pregnancy bleeding", "zeher", "poison", "suicide", "khudkushi",
  ];
  return keywords.some(kw => text.toLowerCase().includes(kw));
}

// Detect if text is Hindi
export function isHindi(text: string): boolean {
  return /[\u0900-\u097F]/.test(text);
}

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

// Generate unique session ID
export function generateSessionId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// PHQ-9 score interpretation
export function interpretPHQ9(score: number): { level: string; color: string; action: string } {
  if (score <= 4) return { level: "Minimal", color: "#00E676", action: "Koi immediate action nahi chahiye" };
  if (score <= 9) return { level: "Mild", color: "#00B4D8", action: "Apne doston se baat karein" };
  if (score <= 14) return { level: "Moderate", color: "#fbbf24", action: "Doctor ya counsellor se milein" };
  if (score <= 19) return { level: "Moderately Severe", color: "#f97316", action: "Aaj hi doctor se milein" };
  return { level: "Severe", color: "#FF4757", action: "Turant help lein — helpline call karein" };
}
