"use client";
import { useState, useEffect } from "react";
import { LANGUAGES, getLang, setLang } from "@/lib/lang";

// Compact language picker. Stores choice per-browser; the AI replies in it.
export default function LangSelect({ onChange }: { onChange?: (code: string) => void }) {
  const [code, setCode] = useState("hinglish");

  useEffect(() => {
    // Hydrate from localStorage after mount (avoids SSR mismatch).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCode(getLang());
  }, []);

  return (
    <select
      value={code}
      onChange={e => { setCode(e.target.value); setLang(e.target.value); onChange?.(e.target.value); }}
      aria-label="Language"
      style={{ background: "rgba(249,246,240,0.06)", border: "1px solid rgba(249,246,240,0.12)", borderRadius: 100, color: "#F9F6F0", fontSize: 12, padding: "6px 10px", fontFamily: "DM Sans,sans-serif", outline: "none", cursor: "pointer" }}
    >
      {LANGUAGES.map(l => (
        <option key={l.code} value={l.code} style={{ background: "#0d1535", color: "#F9F6F0" }}>🌐 {l.label}</option>
      ))}
    </select>
  );
}
