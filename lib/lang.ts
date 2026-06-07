// ============================================
// MULTI-LANGUAGE — patient picks their language; the AI replies in it.
// Static UI stays Hinglish; the conversational AI adapts. Stored per-browser.
// ============================================

export type Language = { code: string; label: string; instruct: string };

export const LANGUAGES: Language[] = [
  { code: "hinglish", label: "Hinglish", instruct: "Reply in simple romanized Hindi (Hinglish, Latin script)." },
  { code: "hindi", label: "हिंदी", instruct: "Reply ONLY in Hindi (Devanagari script)." },
  { code: "english", label: "English", instruct: "Reply ONLY in simple English." },
  { code: "tamil", label: "தமிழ்", instruct: "Reply ONLY in Tamil." },
  { code: "telugu", label: "తెలుగు", instruct: "Reply ONLY in Telugu." },
  { code: "bengali", label: "বাংলা", instruct: "Reply ONLY in Bengali." },
  { code: "marathi", label: "मराठी", instruct: "Reply ONLY in Marathi." },
  { code: "gujarati", label: "ગુજરાતી", instruct: "Reply ONLY in Gujarati." },
  { code: "kannada", label: "ಕನ್ನಡ", instruct: "Reply ONLY in Kannada." },
  { code: "punjabi", label: "ਪੰਜਾਬੀ", instruct: "Reply ONLY in Punjabi." },
  { code: "odia", label: "ଓଡ଼ିଆ", instruct: "Reply ONLY in Odia." },
  { code: "malayalam", label: "മലയാളം", instruct: "Reply ONLY in Malayalam." },
];

// Server-safe: appends a language instruction to a prompt.
export function langInstruction(code?: string): string {
  const l = LANGUAGES.find(x => x.code === code);
  return l ? `\n\nIMPORTANT: ${l.instruct} Keep it simple and warm.` : "";
}

// Client-only helpers.
export function getLang(): string {
  if (typeof window === "undefined") return "hinglish";
  return localStorage.getItem("av_lang") || "hinglish";
}
export function setLang(code: string) {
  if (typeof window !== "undefined") localStorage.setItem("av_lang", code);
}
