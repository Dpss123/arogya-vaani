"use client";
import { useState, useRef } from "react";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Scan, Search, AlertTriangle } from "lucide-react";

type Finding = { name: string; hindi: string; probability: number };

export default function XrayPage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [slow, setSlow] = useState(false);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f); setFindings(null); setNotice(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    if (!file) return;
    setLoading(true); setNotice(null); setSlow(false);
    const slowTimer = setTimeout(() => setSlow(true), 8000); // free HF Space cold-start
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/xray", { method: "POST", body: fd });
      const data = await res.json();
      if (res.status === 503 || data.configured === false) {
        setNotice("X-ray AI service abhi connect nahi hai. (Admin: ml-models service deploy karke XRAY_SERVICE_URL set karein.)");
      } else if (data.findings) {
        setFindings(data.findings.slice(0, 8));
      } else {
        setNotice(data.error || "Analysis nahi ho paaya. Dobara try karein.");
      }
    } catch {
      setNotice("X-ray service tak nahi pahunch paaya. Dobara try karein.");
    } finally {
      clearTimeout(slowTimer);
      setLoading(false); setSlow(false);
    }
  };

  const color = (p: number) => (p >= 0.5 ? "#FF4757" : p >= 0.3 ? "#fbbf24" : "#00E676");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} style={{ marginTop: 6 }} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Screening aid · diagnosis nahi</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>Chest X-Ray AI</h1>
          </div>
        </div>

        {!findings && (
          <>
            <input ref={fileRef} type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ display: "none" }} />
            {!file ? (
              <GlassCard accent="#00E676" style={{ marginBottom: 20 }}>
                <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed var(--border)", borderRadius: 20, padding: "60px 40px", textAlign: "center", cursor: "pointer", margin: 6 }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><Scan size={48} color="#00E676" strokeWidth={1.8} /></div>
                  <div style={{ fontSize: 17, fontWeight: 600, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 8 }}>Chest X-Ray Upload Karein</div>
                  <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>Saaf, seedhi (frontal) chest X-ray ki photo<br /><span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>JPG / PNG</span></div>
                </div>
              </GlassCard>
            ) : (
              <GlassCard accent="#00E676" lift={false} style={{ padding: 20, marginBottom: 20 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {preview && <img src={preview} alt="X-ray" style={{ width: "100%", borderRadius: 16, maxHeight: 320, objectFit: "contain", background: "#000", marginBottom: 12 }} />}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setFile(null); setPreview(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-body)" }}>Dobara</button>
                  <button onClick={analyze} disabled={loading} style={{ flex: 2, background: loading ? "rgba(255,255,255,0.025)" : "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px", color: loading ? "var(--text-3)" : "#04060D", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />AI padh raha hai...</> : <><Search size={16} color="#04060D" strokeWidth={1.8} />Analyse Karein</>}
                  </button>
                </div>
                {loading && slow && (
                  <div style={{ marginTop: 10, fontSize: 12, color: "rgba(251,191,36,0.9)", textAlign: "center", lineHeight: 1.6, fontFamily: "var(--font-body)" }}>Model jaag raha hai (pehli baar 30-60 sec lag sakte hain)... thoda ruk jayein.</div>
                )}
              </GlassCard>
            )}
            {notice && (
              <GlassCard accent="#fbbf24" lift={false} style={{ padding: "14px 18px", fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{notice}</GlassCard>
            )}
          </>
        )}

        {findings && (
          <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
            <GlassCard accent="#00B4D8" lift={false} style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "#00B4D8", letterSpacing: "0.08em", marginBottom: 16 }}><Scan size={14} color="#00B4D8" strokeWidth={1.8} />AI FINDINGS (probability)</div>
              {findings.map(f => (
                <div key={f.name} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#F0F4FF" }}>{f.name} <span style={{ color: "var(--text-3)", fontSize: 11 }}>· {f.hindi}</span></span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: color(f.probability), fontFamily: "var(--font-mono)" }}>{Math.round(f.probability * 100)}%</span>
                  </div>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.025)", borderRadius: 6, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.round(f.probability * 100)}%`, background: color(f.probability), borderRadius: 6 }} />
                  </div>
                </div>
              ))}
            </GlassCard>
            <GlassCard accent="#FF4757" lift={false} style={{ padding: "14px 18px", marginBottom: 16, fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
              <span style={{ display: "flex", alignItems: "flex-start", gap: 8 }}><AlertTriangle size={15} color="#FF4757" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 3 }} /><span><strong style={{ color: "#F0F4FF" }}>Yeh diagnosis nahi hai.</strong> Yeh AI screening hai. Kisi bhi finding ko radiologist/doctor se confirm karein.</span></span>
            </GlassCard>
            <button onClick={() => { setFile(null); setPreview(null); setFindings(null); }} style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "#F0F4FF", cursor: "pointer", fontFamily: "var(--font-body)" }}>Nayi X-Ray</button>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
