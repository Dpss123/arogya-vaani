"use client";
import { LANGUAGES } from "@/lib/lang";
import { useT } from "./LanguageProvider";

// Language picker. Switching instantly re-renders the whole UI in the chosen
// language (static translations) and the AI replies in it too (shared av_lang).
export default function LangSelect({ onChange }: { onChange?: (code: string) => void }) {
  const { lang, changeLang } = useT();

  return (
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
  );
}
