"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPatientKey } from "@/lib/patientId";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { FileText, Image as ImageIcon, Search, X, AlertTriangle, Droplet, Scan, Dna, Heart, Pill } from "lucide-react";

export default function ReportPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => {
    setFile(f);
    setResult(null);
    if (f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = e => setPreview(e.target?.result as string);
      reader.readAsDataURL(f);
    } else {
      setPreview(null);
    }
  };

  const analyzeReport = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("phone", getPatientKey());
    try {
      const res = await fetch("/api/report", { method: "POST", body: formData });
      const data = await res.json();
      setResult(data.summary);
    } catch {
      setResult("Report analyse nahi ho paya. Dobara try karein.");
    } finally {
      setLoading(false);
    }
  };

  const riskColor = result?.includes("🔴") ? "#FF4757" : result?.includes("⚠️") ? "#fbbf24" : "#00E676";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} style={{ marginTop: 6 }} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Blood test, X-ray, MRI, ECG · Hindi mein explain</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "6px 0 0" }}>Report Analyser</h1>
          </div>
        </div>

        {/* UPLOAD ZONE */}
        {!result && (
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => fileRef.current?.click()}
            style={{ border: `2px dashed ${dragOver ? "#00E676" : "var(--border)"}`, borderRadius: 24, padding: "60px 40px", textAlign: "center", cursor: "pointer", transition: "all 0.2s", background: dragOver ? "rgba(0,230,118,0.04)" : "rgba(255,255,255,0.025)", marginBottom: 24 }}
          >
            <input ref={fileRef} type="file" accept="image/*,.pdf" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ display: "none" }} />
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><FileText size={44} color="#00E676" strokeWidth={1.8} /></div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 8 }}>Report Upload Karein</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>
              Blood test, X-ray, MRI, ECG, Urine report<br />
              Drag & drop ya click karke select karein<br />
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>JPG, PNG, PDF · max 10MB</span>
            </div>
          </div>
        )}

        {/* FILE PREVIEW */}
        {file && !result && (
          <GlassCard accent="#00B4D8" lift={false} style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: preview ? 16 : 0 }}>
              <div style={{ display: "flex" }}>{file.type.includes("pdf") ? <FileText size={28} color="#00B4D8" strokeWidth={1.8} /> : <ImageIcon size={28} color="#00B4D8" strokeWidth={1.8} />}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#F0F4FF" }}>{file.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{(file.size / 1024).toFixed(0)} KB · {file.type}</div>
              </div>
              <button onClick={() => { setFile(null); setPreview(null); }} style={{ marginLeft: "auto", background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", padding: 0 }}><X size={18} strokeWidth={1.8} /></button>
            </div>
            {preview && <img src={preview} alt="Report preview" style={{ width: "100%", borderRadius: 12, maxHeight: 300, objectFit: "contain", background: "#000" }} />}
          </GlassCard>
        )}

        {/* ANALYZE BUTTON */}
        {file && !result && (
          <button onClick={analyzeReport} disabled={loading} style={{ width: "100%", background: loading ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "16px 24px", fontSize: 16, fontWeight: 700, color: loading ? "var(--text-3)" : "#04060D", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s" }}>
            {loading ? (
              <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.2)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />AI Report Padh raha hai...</>
            ) : <><Search size={18} color="#04060D" strokeWidth={2} />AI Se Analyse Karwayein</>}
          </button>
        )}

        {/* RESULT */}
        {result && (
          <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
            <GlassCard accent={riskColor} lift={false} style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: riskColor, boxShadow: `0 0 10px ${riskColor}` }} />
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: riskColor, letterSpacing: "0.08em", textTransform: "uppercase" }}>AI ANALYSIS COMPLETE</span>
              </div>
              <div style={{ fontSize: 14, color: "#F0F4FF", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
            </GlassCard>

            <div style={{ background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.15)", borderRadius: 14, padding: "14px 18px", marginBottom: 16, fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
              <AlertTriangle size={14} color="#FF4757" strokeWidth={1.8} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} /><strong style={{ color: "#F0F4FF" }}>Disclaimer:</strong> Yeh AI analysis hai. Final diagnosis ke liye doctor se milein. Koi bhi urgent value ko ignore mat karein.
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button onClick={() => { setFile(null); setPreview(null); setResult(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px 20px", color: "#F0F4FF", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>Nayi Report</button>
              <button onClick={() => router.push("/chat")} style={{ flex: 1, background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px 20px", color: "#04060D", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 700 }}>Doctor Se Poochhein →</button>
            </div>
          </div>
        )}

        {/* SUPPORTED TYPES */}
        {!file && (
          <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginTop: 8 }}>
            {([[Droplet, "Blood Test", "CBC, LFT, KFT, Lipid", "#FF4757"], [Scan, "X-Ray", "Chest, Bone, Dental", "#00B4D8"], [Dna, "MRI/CT Scan", "Brain, Spine, Abdomen", "#a78bfa"], [Heart, "ECG", "Heart rhythm analysis", "#FF4757"], [Heart, "Urine Test", "Routine, Culture", "#fbbf24"], [Pill, "Prescription", "Medicine explanation", "#00E676"]] as const).map(([Icon, title, sub, accent]) => (
              <GlassCard key={title} accent={accent} lift={false} style={{ padding: 16, textAlign: "center" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Icon size={24} color={accent} strokeWidth={1.8} /></div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F4FF", marginBottom: 4 }}>{title}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{sub}</div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
