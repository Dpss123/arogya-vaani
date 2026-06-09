"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { getPatientKey } from "@/lib/patientId";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Camera, Pencil, AlertTriangle, Pill, Search, Droplet, Syringe, Cross, IndianRupee } from "lucide-react";
import { useT } from "@/components/LanguageProvider";

export default function MedicinePage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [medicineName, setMedicineName] = useState("");
  const [currentMeds, setCurrentMeds] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [mode, setMode] = useState<"photo" | "text">("photo");
  const fileRef = useRef<HTMLInputElement>(null);
  const { t } = useT();

  const handleFile = (f: File) => {
    setFile(f); setResult(null);
    const reader = new FileReader();
    reader.onload = e => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const analyze = async () => {
    setLoading(true);
    try {
      let res;
      if (mode === "photo" && file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", "medicine");
        formData.append("currentMeds", currentMeds);
        formData.append("phone", getPatientKey());
        res = await fetch("/api/medicine", { method: "POST", body: formData });
      } else {
        res = await fetch("/api/medicine", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicineName, currentMeds, phone: getPatientKey() }),
        });
      }
      const data = await res?.json();
      setResult(data.result);
    } catch { setResult(t("Medicine identify nahi ho paayi. Dobara try karein.")); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>

        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} style={{ marginTop: 6 }} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("Photo lo ya naam likho · AI sab batayega")}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "6px 0 0" }}>{t("Medicine Scanner")}</h1>
          </div>
        </div>

        {/* MODE TOGGLE */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 14, padding: 6 }}>
          {(["photo", "text"] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setResult(null); setFile(null); setPreview(null); setMedicineName(""); }} style={{ flex: 1, padding: "10px", borderRadius: 100, border: "none", background: mode === m ? "linear-gradient(135deg,#00E676,#00C4FF)" : "transparent", color: mode === m ? "#04060D" : "var(--text-3)", fontSize: 14, fontWeight: mode === m ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              {m === "photo" ? <><Camera size={15} strokeWidth={1.8} /> {t("Photo Se")}</> : <><Pencil size={15} strokeWidth={1.8} /> {t("Naam Se")}</>}
            </button>
          ))}
        </div>

        {!result && (
          <GlassCard accent="#FF4757" lift={false} style={{ padding: "16px 18px", marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#FF4757", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} color="#FF4757" strokeWidth={1.8} /> {t("Aap pehle se koi medicine le rahe hain?")}</div>
            <input value={currentMeds} onChange={e => setCurrentMeds(e.target.value)} placeholder={t("e.g. Metformin, BP ki dawai, Aspirin... (interaction check ke liye)")} style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "#F0F4FF", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }} />
            <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6, lineHeight: 1.5 }}>{t("Likhne se AI nayi medicine ke saath dangerous interaction check karega.")}</div>
          </GlassCard>
        )}

        {!result && mode === "photo" && (
          <div>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} style={{ display: "none" }} />
            {!file ? (
              <div onClick={() => fileRef.current?.click()} style={{ border: "2px dashed var(--border)", borderRadius: 20, padding: "60px 40px", textAlign: "center", cursor: "pointer", marginBottom: 20, background: "rgba(255,255,255,0.025)" }}>
                <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}><Pill size={48} color="#00E676" strokeWidth={1.5} /></div>
                <div style={{ fontSize: 17, fontWeight: 600, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 8 }}>{t("Medicine Ki Photo Lo")}</div>
                <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7 }}>{t("Strip, tablet, ya packaging ki clear photo")}<br /><span style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>{t("Camera se seedha ya gallery se choose karein")}</span></div>
              </div>
            ) : (
              <div style={{ marginBottom: 20 }}>
                {preview && <img src={preview} alt={t("Medicine")} style={{ width: "100%", borderRadius: 16, maxHeight: 280, objectFit: "contain", background: "#000", marginBottom: 12 }} />}
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => { setFile(null); setPreview(null); }} style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-body)" }}>{t("Dobara Lo")}</button>
                  <button onClick={analyze} disabled={loading} style={{ flex: 2, background: loading ? "rgba(255,255,255,0.025)" : "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px", color: loading ? "var(--text-3)" : "#04060D", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    {loading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{t("Scan kar raha hai...")}</> : <><Search size={16} strokeWidth={1.8} /> {t("Scan Karein")}</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {!result && mode === "text" && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 18px", marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
              <span style={{ display: "flex" }}><Pill size={24} color="#00E676" strokeWidth={1.8} /></span>
              <input value={medicineName} onChange={e => setMedicineName(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && medicineName.trim()) analyze(); }} placeholder={t("Medicine ka naam likhein... (e.g. Paracetamol, Crocin, Metformin)")} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 15, fontFamily: "var(--font-body)" }} autoFocus />
            </div>
            <button onClick={analyze} disabled={!medicineName.trim() || loading} style={{ width: "100%", background: medicineName.trim() && !loading ? "linear-gradient(135deg,#00E676,#00C4FF)" : "rgba(255,255,255,0.025)", border: "none", borderRadius: 100, padding: "15px", fontSize: 15, fontWeight: 600, color: medicineName.trim() && !loading ? "#04060D" : "var(--text-3)", cursor: medicineName.trim() && !loading ? "pointer" : "not-allowed", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading ? <><div style={{ width: 16, height: 16, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />{t("Dhundh raha hai...")}</> : <><Search size={16} strokeWidth={1.8} /> {t("Medicine Dhundho")}</>}
            </button>
          </div>
        )}

        {result && (
          <div style={{ animation: "fadeUp 0.5s ease forwards" }}>
            <GlassCard accent="#00E676" lift={false} style={{ padding: 24, marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 8px #00E676" }} />
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", letterSpacing: "0.08em" }}>{t("MEDICINE ANALYSIS COMPLETE")}</span>
              </div>
              <div style={{ fontSize: 14, color: "#F0F4FF", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{result}</div>
            </GlassCard>
            <div style={{ background: "rgba(255,71,87,0.05)", border: "1px solid rgba(255,71,87,0.15)", borderRadius: 14, padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "var(--text-3)", lineHeight: 1.7, fontFamily: "var(--font-mono)", display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={14} color="#FF4757" strokeWidth={1.8} style={{ flexShrink: 0 }} /> {t("DOCTOR KI PRESCRIPTION KE BINA KOIN BHI MEDICINE MAT LO")}
            </div>
            <button onClick={() => router.push("/generic")} style={{ width: "100%", background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.25)", borderRadius: 100, padding: "12px", color: "#00E676", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><IndianRupee size={16} strokeWidth={1.8} /> {t("Sasta Generic Alternative Dhundho")}</button>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setResult(null); setFile(null); setPreview(null); setMedicineName(""); }} style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-body)" }}>{t("Nayi Medicine")}</button>
              <button onClick={() => router.push("/chat")} style={{ flex: 1, background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px", color: "#04060D", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>{t("Doctor Se Poochhein")}</button>
            </div>
          </div>
        )}

        {/* INFO CARDS */}
        {!file && !result && mode === "photo" && (
          <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 8 }}>
            {[[Pill, "Tablet/Capsule", "Strip ya bottle"], [Droplet, "Syrup", "Bottle label"], [Syringe, "Injection", "Vial label"], [Cross, "Ointment", "Tube packaging"]].map(([Icon, title, sub]) => (
              <div key={title as string} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 14, padding: 14, textAlign: "center" }}>
                <div style={{ marginBottom: 6, display: "flex", justifyContent: "center" }}>{(() => { const C = Icon as typeof Pill; return <C size={24} color="#00E676" strokeWidth={1.8} />; })()}</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#F0F4FF", marginBottom: 3 }}>{t(title as string)}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t(sub as string)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
