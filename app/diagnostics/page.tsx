"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { useT } from "@/components/LanguageProvider";
import { Microscope, Eye, Smile, TestTube, Scan, Search, AlertTriangle } from "lucide-react";

const TYPES = [
  { key: "skin", Icon: Microscope, label: "Skin / Twacha", hint: "Rash, daag · trained model" },
  { key: "eye", Icon: Eye, label: "Eye / Aankh", hint: "Fundus image · DR model" },
  { key: "dental", Icon: Smile, label: "Dental / Daant", hint: "X-ray · experimental" },
  { key: "strip", Icon: TestTube, label: "Test Strip", hint: "Malaria, pregnancy, sugar" },
] as const;

export default function DiagnosticsPage() {
  const router = useRouter();
  const [type, setType] = useState<(typeof TYPES)[number]["key"]>("skin");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useT();

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
      fd.append("type", type);
      // Skin/eye/dental use their trained models (each with a Gemini fallback inside the route).
      const trained: Record<string, string> = { skin: "/api/skin", eye: "/api/eye", dental: "/api/dental" };
      const endpoint = trained[type] || "/api/diagnose";
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      setResult(data.result || t("Analysis nahi ho paaya. Dobara try karein."));
    } catch {
      setResult(t("Analysis nahi ho paaya. Dobara try karein."));
    } finally {
      setLoading(false);
    }
  };

  const active = TYPES.find(tp => tp.key === type)!;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("Photo se screening · diagnosis nahi")}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#F0F4FF", margin: "4px 0 0" }}>{t("AI Diagnostics")}</h1>
          </div>
        </div>
        {/* CHEST X-RAY · trained model, separate page */}
        <GlassCard accent="#00B4D8" onClick={() => router.push("/xray")} style={{ padding: "16px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <Scan size={28} color="#00B4D8" strokeWidth={1.8} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#00B4D8" }}>{t("Chest X-Ray AI")} <span style={{ fontSize: 9, padding: "1px 6px", borderRadius: 100, background: "rgba(0,180,216,0.15)", fontFamily: "var(--font-mono)" }}>{t("TRAINED MODEL")}</span></div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t("CheXNet-style pathology detection")}</div>
          </div>
          <span style={{ color: "rgba(0,180,216,0.5)", fontSize: 18 }}>→</span>
        </GlassCard>

        {/* TYPE PICKER */}
        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
          {TYPES.map(tp => (
            <button key={tp.key} onClick={() => { setType(tp.key); setFile(null); setPreview(null); setResult(null); }} style={{ background: type === tp.key ? "rgba(167,139,250,0.1)" : "rgba(255,255,255,0.025)", border: `1px solid ${type === tp.key ? "rgba(167,139,250,0.4)" : "var(--border)"}`, borderRadius: 14, padding: "14px", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
              <div style={{ marginBottom: 6 }}><tp.Icon size={24} color="#a78bfa" strokeWidth={1.8} /></div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F0F4FF" }}>{t(tp.label)}</div>
              <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t(tp.hint)}</div>
            </button>
          ))}
        </div>

        {!result && (
          <>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ display: "none" }} />
            {!file ? (
              <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed rgba(167,139,250,0.25)", borderRadius: 20, padding: "48px 40px", textAlign: "center", cursor: "pointer", background: "rgba(255,255,255,0.025)" }}>
                <div style={{ marginBottom: 14, display: "flex", justifyContent: "center" }}><active.Icon size={44} color="#a78bfa" strokeWidth={1.8} /></div>
                <div style={{ fontSize: 16, fontWeight: 600, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 6 }}>{t(active.label)} {t("ki photo lo")}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t("Saaf, close-up photo")} · {t(active.hint)}</div>
              </div>
            ) : (
              <div>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview && <img src={preview} alt="upload" style={{ width: "100%", borderRadius: 16, maxHeight: 300, objectFit: "contain", background: "#000", marginBottom: 12 }} />}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setFile(null); setPreview(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-body)" }}>{t("Dobara")}</button>
                  <button onClick={analyze} disabled={loading} style={{ flex: 2, background: loading ? "rgba(255,255,255,0.025)" : "linear-gradient(135deg,#a78bfa,#00B4D8)", border: "none", borderRadius: 100, padding: "12px", color: loading ? "var(--text-3)" : "#04060D", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{t("AI dekh raha hai...")}</> : <><Search size={16} color="#04060D" strokeWidth={2} />{t("Screen Karein")}</>}
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {result && (
          <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
            <GlassCard accent="#a78bfa" lift={false} style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#a78bfa", letterSpacing: "0.08em", marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}><active.Icon size={14} color="#a78bfa" strokeWidth={1.8} />{t("AI SCREENING")}</div>
              <div style={{ fontSize: 14, color: "#F0F4FF", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
            </GlassCard>
            <div style={{ background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.15)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "var(--text-2)", lineHeight: 1.7, display: "flex", gap: 8, alignItems: "flex-start" }}>
              <AlertTriangle size={15} color="#FF4757" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
              <span>{t("Yeh AI screening hai · diagnosis nahi. Kisi bhi finding ko doctor se confirm karein.")}</span>
            </div>
            <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "#F0F4FF", cursor: "pointer", fontFamily: "var(--font-body)" }}>{t("Nayi Photo")}</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
