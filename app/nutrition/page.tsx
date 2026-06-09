"use client";
import { useState, useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Utensils, Search, AlertTriangle } from "lucide-react";
import { useT } from "@/components/LanguageProvider";

export default function NutritionPage() {
  const { t } = useT();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f); setResult(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/nutrition", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) {
        setResult(data.error === "Image file required" ? t("Sirf photo (image) upload karein.")
          : data.error === "File too large (max 8MB)" ? t("Photo 8MB se chhoti honi chahiye.")
          : t("Analysis nahi ho paaya. Dobara try karein."));
      } else {
        setResult(data.result || t("Analysis nahi ho paaya. Dobara try karein."));
      }
    } catch {
      setResult(t("Analysis nahi ho paaya. Dobara try karein."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#06090f" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("Khaane Ki Photo Se Nutrition Estimate")}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>{t("Thali Nutrition")}</h1>
          </div>
        </div>

        {!result && (
          <>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ display: "none" }} />
            {!file ? (
              <GlassCard accent="#00E676" style={{ padding: 0 }}>
                <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed var(--border)", borderRadius: 24, padding: "52px 40px", textAlign: "center", cursor: "pointer" }}>
                  <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}><Utensils size={46} color="#00E676" strokeWidth={1.8} /></div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 8 }}>{t("Apni Thali Ki Photo Lo")}</div>
                  <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>{t("Poori plate upar se · saaf roshni mein")}</div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard accent="#00E676" lift={false} style={{ padding: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview && <img src={preview} alt="thali" style={{ width: "100%", borderRadius: 16, maxHeight: 300, objectFit: "contain", background: "#000", marginBottom: 14 }} />}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setFile(null); setPreview(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-body)" }}>{t("Dobara")}</button>
                  <button onClick={analyze} disabled={loading} style={{ flex: 2, background: loading ? "rgba(255,255,255,0.025)" : "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px", color: loading ? "var(--text-3)" : "#04060D", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#34d399", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{t("AI dekh raha hai...")}</> : <><Search size={16} color="#04060D" strokeWidth={1.8} />{t("Nutrition Dekho")}</>}
                  </button>
                </div>
              </GlassCard>
            )}
          </>
        )}

        {result && (
          <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
            <GlassCard accent="#00E676" lift={false} style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", letterSpacing: "0.08em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><Utensils size={14} color="#00E676" strokeWidth={1.8} />{t("NUTRITION ESTIMATE")}</div>
              <div style={{ fontSize: 14, color: "#F0F4FF", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
            </GlassCard>
            <div style={{ background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.15)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "var(--text-3)", lineHeight: 1.7, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <AlertTriangle size={14} color="#FF4757" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{t("Yeh AI estimate hai (exact nahi). Exact nutrition ke liye dietitian se milein.")}</span>
            </div>
            <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "#F0F4FF", cursor: "pointer", fontFamily: "var(--font-body)" }}>{t("Nayi Thali")}</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
