// ============================================
// APP CONSTANTS — AROGYA VAANI
// Change these to configure the app
// ============================================

export const APP_NAME = "Arogya Vaani";
export const APP_TAGLINE = "Apni vaani se apni sehat";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

// WhatsApp
export const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "+918000000000";
export const META_VERIFY_TOKEN = "arogya_vaani_verify_2025";

// Triage
export const TRIAGE_VERDICTS = {
  rest: { label: "🟢 Ghar Pe Aaram Karein", color: "#00E676", bg: "rgba(0,230,118,0.08)" },
  clinic: { label: "🟡 Aaj Clinic Jayein", color: "#fbbf24", bg: "rgba(251,191,36,0.08)" },
  emergency: { label: "🔴 TURANT 108 CALL KAREIN", color: "#FF4757", bg: "rgba(255,71,87,0.08)" },
};

// Emergency numbers India
export const EMERGENCY_NUMBERS = {
  ambulance: "108",
  maternity: "102",
  police: "100",
  fire: "101",
  mental_health: "1860-2662-345",
  icall: "9152987821",
  childline: "1098",
};

// Supported languages
export const SUPPORTED_LANGUAGES = [
  { code: "hi", name: "हिंदी", english: "Hindi" },
  { code: "bho", name: "भोजपुरी", english: "Bhojpuri" },
  { code: "mr", name: "मराठी", english: "Marathi" },
  { code: "bn", name: "বাংলা", english: "Bengali" },
  { code: "ta", name: "தமிழ்", english: "Tamil" },
  { code: "te", name: "తెలుగు", english: "Telugu" },
  { code: "kn", name: "ಕನ್ನಡ", english: "Kannada" },
  { code: "gu", name: "ગુજરાતી", english: "Gujarati" },
  { code: "pa", name: "ਪੰਜਾਬੀ", english: "Punjabi" },
  { code: "or", name: "ଓଡ଼ିଆ", english: "Odia" },
  { code: "ur", name: "اردو", english: "Urdu" },
  { code: "en", name: "English", english: "English" },
];

// Govt schemes
export const GOVT_SCHEME_LINKS = {
  ayushman: "https://pmjay.gov.in",
  jsy: "https://nhm.gov.in/index1.php?lang=1&level=3&sublinkid=841&lid=309",
  pmmvy: "https://wcd.nic.in/schemes/pradhan-mantri-matru-vandana-yojana",
};

// AI Model config
export const AI_CONFIG = {
  model: "gemini-1.5-flash",
  maxTokens: 1000,
  temperature: 0.7,
  triageTemperature: 0.2, // More deterministic for triage
};

// File upload limits
export const UPLOAD_LIMITS = {
  maxSizeMB: 10,
  allowedTypes: ["image/jpeg", "image/png", "image/webp", "application/pdf"],
  allowedExtensions: [".jpg", ".jpeg", ".png", ".webp", ".pdf"],
};

// Outbreak detection threshold
export const OUTBREAK_THRESHOLD = {
  cases: 50,        // Cases in same PIN code
  hours: 72,        // Within this many hours
  alertDHO: true,   // Auto-alert District Health Officer
};
