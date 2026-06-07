"use client";
import { useState } from "react";
import { assessGrowth, type GrowthResult } from "@/lib/growth";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Baby, TrendingUp, Siren, AlertTriangle, Utensils } from "lucide-react";

export default function GrowthPage() {
  const [sex, setSex] = useState<"male" | "female">("male");
  const [ageY, setAgeY] = useState("");
  const [ageM, setAgeM] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [result, setResult] = useState<GrowthResult | null>(null);
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const ageMonths = (parseInt(ageY || "0", 10) * 12) + parseInt(ageM || "0", 10);
  const w = parseFloat(weight), h = parseFloat(height);
  // At least one age field must be entered · otherwise a blank form silently
  // becomes "0 months" and a toddler gets assessed against newborn medians.
  const ageEntered = ageY.trim() !== "" || ageM.trim() !== "";
  const valid = ageEntered && Number.isFinite(w) && w > 0 && w <= 40 && Number.isFinite(h) && h > 0 && h <= 130 && ageMonths >= 0 && ageMonths <= 60;

  const compute = async () => {
    if (!valid) return;
    const res = assessGrowth(sex, ageMonths, w, h);
    setResult(res);
    setAdvice(null);
    setLoading(true);
    try {
      const r = await fetch("/api/growth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sex, ageMonths, weightKg: w, heightCm: h }),
      });
      const d = await r.json();
      if (d.advice) setAdvice(d.advice);
    } catch { /* classification already shown */ }
    finally { setLoading(false); }
  };

  const sevColor = (s: string) => (s === "severe" ? "#FF4757" : s === "moderate" ? "#fbbf24" : s === "mild" ? "#00B4D8" : "#00E676");
  const sevLabel = (s: string) => (s === "severe" ? "Severe" : s === "moderate" ? "Moderate" : s === "mild" ? "Mild" : "Normal");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>0–5 saal · WHO standards · screening</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>Child Growth Monitor</h1>
          </div>
        </div>

        <GlassCard accent="#00E676" lift={false} style={{ padding: 22, marginBottom: 20 }}>
          {/* SEX */}
          <div style={{ display: "flex", gap: 8, marginBottom: 14, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, padding: 5 }}>
            {(["male", "female"] as const).map(s => (
              <button key={s} onClick={() => setSex(s)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, flex: 1, padding: "10px", borderRadius: 9, border: "none", background: sex === s ? "#00E676" : "transparent", color: sex === s ? "#04060D" : "var(--text-3)", fontWeight: sex === s ? 600 : 400, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>
                <Baby size={16} color={sex === s ? "#04060D" : "var(--text-3)"} strokeWidth={1.8} />
                {s === "male" ? "Ladka" : "Ladki"}
              </button>
            ))}
          </div>

          {/* AGE */}
          <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <Field label="Umar (saal)" value={ageY} onChange={setAgeY} placeholder="0-5" />
            <Field label="+ Mahine" value={ageM} onChange={setAgeM} placeholder="0-11" />
          </div>
          <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
            <Field label="Wazan (kg)" value={weight} onChange={setWeight} placeholder="e.g. 12.5" />
            <Field label="Lambai (cm)" value={height} onChange={setHeight} placeholder="e.g. 87" />
          </div>

          <button onClick={compute} disabled={!valid} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, width: "100%", background: valid ? "linear-gradient(135deg,#00E676,#00C4FF)" : "rgba(255,255,255,0.025)", border: valid ? "none" : "1px solid var(--border)", borderRadius: 100, padding: "15px", fontSize: 15, fontWeight: 600, color: valid ? "#04060D" : "var(--text-3)", cursor: valid ? "pointer" : "not-allowed", fontFamily: "var(--font-body)" }}>
            <TrendingUp size={18} color={valid ? "#04060D" : "var(--text-3)"} strokeWidth={1.8} />
            Growth Check Karein
          </button>
        </GlassCard>

        {result && (
          <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
            <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {([["Wazan (underweight)", result.underweight, `${result.weightPctMedian}% of WHO median`],
                 ["Lambai (stunting)", result.stunting, `${result.heightPctMedian}% of WHO median`]] as const).map(([label, sev, sub]) => (
                <GlassCard key={label} accent={sevColor(sev)} lift={false} style={{ padding: 16 }}>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.04em", marginBottom: 8 }}>{label}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: sevColor(sev), fontFamily: "var(--font-display)" }}>{sevLabel(sev)}</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>{sub}</div>
                </GlassCard>
              ))}
            </div>

            {/* Deterministic escalation · independent of colour and of the LLM advice. */}
            {(result.underweight === "severe" || result.stunting === "severe") ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, background: "#FF4757", color: "#fff", borderRadius: 14, padding: "13px 16px", fontWeight: 700, marginBottom: 14, fontSize: 14, lineHeight: 1.6 }}>
                <Siren size={18} color="#fff" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
                Bachche ko TURANT Anganwadi/health centre le jayein · yeh serious malnutrition ho sakta hai.
              </div>
            ) : (result.underweight === "moderate" || result.stunting === "moderate") ? (
              <div style={{ display: "flex", alignItems: "flex-start", gap: 9, background: "rgba(251,191,36,0.12)", color: "#fbbf24", border: "1px solid rgba(251,191,36,0.3)", borderRadius: 14, padding: "12px 16px", fontWeight: 600, marginBottom: 14, fontSize: 13, lineHeight: 1.6 }}>
                <AlertTriangle size={16} color="#fbbf24" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
                Jald Anganwadi/health centre le jayein aur nutrition par dhyan dein.
              </div>
            ) : null}

            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 16px", marginBottom: 14, fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)", lineHeight: 1.7 }}>
              WHO median: {result.medianWeight}kg · {result.medianHeight}cm (umar {result.ageMonths} mahine)
            </div>

            {loading && <div style={{ textAlign: "center", padding: 16, color: "var(--text-3)", fontSize: 13, fontFamily: "var(--font-mono)" }}>AI advice aa rahi hai...</div>}
            {advice && (
              <GlassCard accent="#00E676" lift={false} style={{ padding: 18, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", letterSpacing: "0.06em", marginBottom: 10 }}><Utensils size={14} color="#00E676" strokeWidth={1.8} />KYA KAREIN</div>
                <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{advice}</div>
              </GlassCard>
            )}
            <div style={{ display: "flex", alignItems: "flex-start", gap: 9, background: "rgba(255,71,87,0.06)", border: "1px solid rgba(255,71,87,0.15)", borderRadius: 14, padding: "12px 16px", fontSize: 12, color: "var(--text-2)", lineHeight: 1.7 }}>
              <AlertTriangle size={15} color="#FF4757" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 1 }} />
              Yeh WHO median-based screening hai. Pakka assessment ke liye Anganwadi/ICDS centre par le jayein.
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 14px" }}>
      <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.04em", marginBottom: 4 }}>{label.toUpperCase()}</div>
      <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} inputMode="decimal" style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 16, fontFamily: "var(--font-body)" }} />
    </div>
  );
}
