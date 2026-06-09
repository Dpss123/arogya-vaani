"use client";
import { LANGUAGES } from "@/lib/lang";
import { useT } from "./LanguageProvider";

// Language picker. Switching re-translates the whole UI live (and the AI replies
// in it too, via the shared av_lang store).
export default function LangSelect({ onChange }: { onChange?: (code: string) => void }) {
  const { lang, changeLang, translating } = useT();

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      {translating && (
        <span aria-label="Translating" style={{ width: 12, height: 12, border: "2px solid rgba(0,230,118,0.25)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
      )}
      <select
        value={lang}
        onChange={(e) => { changeLang(e.target.value); onChange?.(e.target.value); }}
        aria-label="Language"
        style={{ background: "rgba(249,246,240,0.06)", border: "1px solid rgba(249,246,240,0.12)", borderRadius: 100, color: "#F9F6F0", fontSize: 12, padding: "6px 10px", fontFamily: "DM Sans,sans-serif", outline: "none", cursor: "pointer" }}
      >
        {LANGUAGES.map((l) => (
          <option key={l.code} value={l.code} style={{ background: "#0d1535", color: "#F9F6F0" }}>🌐 {l.label}</option>
        ))}
      </select>
    </span>
  );
}
