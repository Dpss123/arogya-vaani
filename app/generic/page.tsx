"use client";
import { useState } from "react";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Pill, Search, IndianRupee, Building2, AlertTriangle } from "lucide-react";

type Generic = {
  brand?: string; molecule?: string; use?: string;
  brand_price_approx?: string; generic_price_approx?: string; savings_note?: string;
  error?: string;
};

export default function GenericPage() {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Generic | null>(null);

  const search = async () => {
    if (!name.trim() || loading) return;
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/generic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicineName: name.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.error) setResult({ error: "Jaankari nahi mil paayi. Dobara try karein." });
      else setResult(data);
    } catch {
      setResult({ error: "Jaankari nahi mil paayi. Dobara try karein." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Branded ka sasta Jan Aushadhi alternative</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>Sasti Generic Dawai</h1>
          </div>
        </div>

        <GlassCard accent="#00E676" lift={false} style={{ padding: "14px 18px", marginBottom: 12, display: "flex", gap: 12, alignItems: "center" }}>
          <Pill size={24} color="#00E676" strokeWidth={1.8} />
          <input value={name} onChange={e => setName(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && name.trim()) search(); }} placeholder="Branded medicine ka naam (e.g. Crocin, Dolo)" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 15, fontFamily: "var(--font-body)" }} autoFocus />
        </GlassCard>
        <button onClick={search} disabled={!name.trim() || loading} style={{ width: "100%", background: name.trim() && !loading ? "linear-gradient(135deg,#00E676,#00C4FF)" : "rgba(255,255,255,0.025)", border: name.trim() && !loading ? "none" : "1px solid var(--border)", borderRadius: 100, padding: "15px", fontSize: 15, fontWeight: 600, color: name.trim() && !loading ? "#04060D" : "var(--text-3)", cursor: name.trim() && !loading ? "pointer" : "not-allowed", fontFamily: "var(--font-body)", marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {loading ? "Dhundh raha hai..." : (<><Search size={15} color={name.trim() ? "#04060D" : "var(--text-3)"} strokeWidth={2} /> Sasta Alternative Dhundho</>)}
        </button>

        {result?.error && (
          <GlassCard accent="#fbbf24" lift={false} style={{ padding: "14px 18px" }}>
            <div style={{ fontSize: 14, color: "var(--text-2)" }}>{result.error}</div>
          </GlassCard>
        )}

        {result && !result.error && (
          <div style={{ animation: "fadeUp 0.4s ease forwards" }}>
            <GlassCard accent="#00E676" lift={false} style={{ padding: 22, marginBottom: 14 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)" }}>{result.brand || name}</div>
              <div style={{ fontSize: 13, color: "#00E676", marginTop: 2, marginBottom: 10 }}>Molecule: {result.molecule || "·"}</div>
              {result.use && <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{result.use}</div>}
            </GlassCard>

            <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <GlassCard accent="#FF4757" lift={false} style={{ padding: 16 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6 }}>BRANDED (approx)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#FF4757", fontFamily: "var(--font-display)" }}>₹{result.brand_price_approx || "·"}</div>
              </GlassCard>
              <GlassCard accent="#00E676" lift={false} style={{ padding: 16 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6 }}>JAN AUSHADHI (approx)</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#00E676", fontFamily: "var(--font-display)" }}>₹{result.generic_price_approx || "·"}</div>
              </GlassCard>
            </div>

            {result.savings_note && (
              <GlassCard accent="#00E676" lift={false} style={{ padding: "14px 18px", marginBottom: 14 }}>
                <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, display: "flex", gap: 8, alignItems: "flex-start" }}><IndianRupee size={15} color="#00E676" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 3 }} /><span>{result.savings_note}</span></div>
              </GlassCard>
            )}
            <GlassCard accent="#00B4D8" lift={false} style={{ padding: "12px 16px", marginBottom: 14 }}>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <Building2 size={15} color="#00B4D8" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 3 }} />
                <span>Nearest <strong style={{ color: "#00B4D8" }}>Jan Aushadhi Kendra</strong> se generic sasti milti hai. Chemist se generic version maangein.</span>
              </div>
            </GlassCard>
            <GlassCard accent="#FF4757" lift={false} style={{ padding: "12px 16px" }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.7, display: "flex", gap: 8, alignItems: "flex-start" }}>
                <AlertTriangle size={14} color="#FF4757" strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} />
                <span>Keemat AI estimate hai (live nahi). Medicine badalne se pehle doctor/chemist se confirm karein.</span>
              </div>
            </GlassCard>
          </div>
        )}
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
