"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Brain, Map, Activity, AlertTriangle, TrendingUp, MapPin, Check, X, Siren, Sparkles } from "lucide-react";

type Cluster = { id: string; location: string; disease: string; cases: number; risk: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"; pincode: string; last_reported: string | null; alert_sent: boolean; };

const MOCK_CLUSTERS: Cluster[] = [
  { id: "1", location: "Jwalapur, Haridwar", disease: "Dengue Fever", cases: 23, risk: "HIGH", pincode: "249407", last_reported: "2 hours ago", alert_sent: true },
  { id: "2", location: "Roorkee, Haridwar", disease: "Viral Fever", cases: 47, risk: "CRITICAL", pincode: "247667", last_reported: "30 min ago", alert_sent: true },
  { id: "3", location: "Rishikesh, Dehradun", disease: "Gastroenteritis", cases: 12, risk: "MEDIUM", pincode: "249201", last_reported: "4 hours ago", alert_sent: false },
  { id: "4", location: "Laksar, Haridwar", disease: "Malaria", cases: 8, risk: "MEDIUM", pincode: "247663", last_reported: "6 hours ago", alert_sent: false },
  { id: "5", location: "Manglaur, Haridwar", disease: "Typhoid", cases: 5, risk: "LOW", pincode: "247661", last_reported: "1 day ago", alert_sent: false },
];

const RISK_COLORS = { LOW: "#00E676", MEDIUM: "#fbbf24", HIGH: "#f97316", CRITICAL: "#FF4757" };
const RISK_BG = { LOW: "rgba(0,230,118,0.06)", MEDIUM: "rgba(251,191,36,0.06)", HIGH: "rgba(249,115,22,0.06)", CRITICAL: "rgba(255,71,87,0.08)" };
const RISK_RGB: Record<string, string> = { LOW: "0,230,118", MEDIUM: "251,191,36", HIGH: "249,115,22", CRITICAL: "255,71,87" };

export default function OutbreakPage() {
  const [selected, setSelected] = useState<Cluster | null>(null);
  const [filter, setFilter] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
  const [clusters, setClusters] = useState<Cluster[]>(MOCK_CLUSTERS);
  const totalCases = clusters.reduce((sum, c) => sum + c.cases, 0);
  const [alertedIds, setAlertedIds] = useState<Set<string>>(new Set());

  // Load real clusters detected from the last 72h of triage data.
  useEffect(() => {
    fetch("/api/outbreak")
      .then(r => r.json())
      .then(d => { if (d.clusters && d.clusters.length) setClusters(d.clusters); })
      .catch(() => { /* keep mock fallback */ });
  }, []);
  const [aiResult, setAiResult] = useState<{ probable_disease?: string; risk_level?: string; recommended_action?: string } | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const analyzeCluster = async (cluster: Cluster) => {
    setAiLoading(true); setAiResult(null);
    try {
      const res = await fetch("/api/outbreak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms: [cluster.disease], location: cluster.location, pincode: cluster.pincode }),
      });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error("failed");
      setAiResult(data);
    } catch {
      setAiResult({ recommended_action: "AI analysis nahi ho paaya. Dobara try karein." });
    } finally {
      setAiLoading(false);
    }
  };

  const sendDhoAlert = async (c: Cluster) => {
    setAlertedIds(prev => new Set(prev).add(c.id)); // optimistic
    try {
      const res = await fetch("/api/outbreak-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ location: c.location, disease: c.disease, risk: c.risk, cases: c.cases, pincode: c.pincode }),
      });
      if (!res.ok) throw new Error("failed");
    } catch {
      // Roll back the optimistic "Sent!" so we never falsely confirm.
      setAlertedIds(prev => { const n = new Set(prev); n.delete(c.id); return n; });
      toast.error("DHO alert nahi gaya. Login karein ya dobara try karein.");
    }
  };

  const filtered = filter === "ALL" ? clusters : clusters.filter(c => c.risk === filter);
  const maxCases = Math.max(...clusters.map(c => c.cases), 1);
  const fmtReport = (t: string | null) => {
    if (!t) return "·";
    const d = new Date(t);
    return isNaN(d.getTime()) ? t : d.toLocaleString("hi-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", padding: "32px clamp(20px,4vw,40px) 100px", maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Real-time disease surveillance · Uttarakhand</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>Outbreak Detection</h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 100, border: "1px solid rgba(255,71,87,0.25)", background: "rgba(255,71,87,0.06)" }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#FF4757", boxShadow: "0 0 8px #FF4757", animation: "pulse 1.5s infinite" }} />
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#FF4757", letterSpacing: "0.06em" }}>LIVE</span>
        </div>
      </div>

      <div>

        {/* STATS */}
        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Active Clusters", value: clusters.length, color: "#F0F4FF" },
            { label: "Total Cases", value: totalCases, color: "#fbbf24" },
            { label: "Critical Alerts", value: clusters.filter(c => c.risk === "CRITICAL").length, color: "#FF4757" },
            { label: "DHO Alerts Sent", value: clusters.filter(c => c.alert_sent).length, color: "#00E676" },
          ].map(stat => (
            <GlassCard key={stat.label} accent={stat.color} lift={false} style={{ padding: "18px 20px" }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: stat.color, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>{stat.value}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4, letterSpacing: "0.04em" }}>{stat.label}</div>
            </GlassCard>
          ))}
        </div>

        {/* HOW IT WORKS */}
        <GlassCard accent="#00E676" lift={false} style={{ padding: 18, marginBottom: 20 }}>
          <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>
            <Brain size={15} color="#00E676" strokeWidth={1.8} style={{ display: "inline", verticalAlign: "-2px", marginRight: 6 }} /><strong style={{ color: "#00E676" }}>AI Logic:</strong> Jab ek PIN code se 50+ patients same symptoms 72 ghante mein report karein, AI automatically cluster flag karta hai aur District Health Officer ko alert bhejta hai. COVID-19 jaisi outbreaks pehle detect ho sakti hain.
          </div>
        </GlassCard>

        {/* HEATMAP */}
        {filtered.length > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 10, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}><Map size={13} color="var(--text-3)" strokeWidth={1.8} /> Location Heatmap</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: 8 }}>
              {filtered.map(c => {
                const intensity = 0.18 + (c.cases / maxCases) * 0.6;
                return (
                  <div key={c.id} onClick={() => { setSelected(selected?.id === c.id ? null : c); setAiResult(null); }} style={{ background: `rgba(${RISK_RGB[c.risk]},${intensity})`, border: `1px solid rgba(${RISK_RGB[c.risk]},0.5)`, borderRadius: 12, padding: "12px 10px", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", fontFamily: "var(--font-display)", lineHeight: 1 }}>{c.cases}</div>
                    <div style={{ fontSize: 9, color: "rgba(255,255,255,0.85)", fontFamily: "var(--font-mono)", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.location}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* FILTERS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {(["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${filter === f ? (RISK_COLORS[f as keyof typeof RISK_COLORS] || "#00E676") : "var(--border)"}`, background: filter === f ? `${RISK_COLORS[f as keyof typeof RISK_COLORS] || "#00E676"}15` : "transparent", color: filter === f ? (RISK_COLORS[f as keyof typeof RISK_COLORS] || "#00E676") : "var(--text-2)", fontSize: 11, cursor: "pointer", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", transition: "all 0.2s" }}>
              {f}
            </button>
          ))}
        </div>

        <div className="m-stack" style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 16 }}>
          {/* CLUSTER LIST */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {filtered.map(cluster => (
              <GlassCard key={cluster.id} accent={RISK_COLORS[cluster.risk]} onClick={() => { setSelected(selected?.id === cluster.id ? null : cluster); setAiResult(null); }} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, borderColor: selected?.id === cluster.id ? RISK_COLORS[cluster.risk] + "40" : "var(--border)", background: selected?.id === cluster.id ? RISK_BG[cluster.risk] : "rgba(255,255,255,0.025)" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: RISK_BG[cluster.risk], border: `1px solid ${RISK_COLORS[cluster.risk]}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {cluster.risk === "CRITICAL"
                    ? <Activity size={24} color={RISK_COLORS[cluster.risk]} strokeWidth={1.8} />
                    : cluster.risk === "HIGH"
                    ? <AlertTriangle size={24} color={RISK_COLORS[cluster.risk]} strokeWidth={1.8} />
                    : <TrendingUp size={24} color={RISK_COLORS[cluster.risk]} strokeWidth={1.8} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#F0F4FF" }}>{cluster.disease}</span>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: `${RISK_COLORS[cluster.risk]}15`, color: RISK_COLORS[cluster.risk], fontFamily: "var(--font-mono)", letterSpacing: "0.06em", fontWeight: 600 }}>{cluster.risk}</span>
                    {cluster.alert_sent && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "rgba(0,230,118,0.1)", color: "#00E676", fontFamily: "var(--font-mono)" }}>DHO ALERTED</span>}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} color="var(--text-3)" strokeWidth={1.8} /> {cluster.location} · PIN {cluster.pincode}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 22, fontWeight: 800, color: RISK_COLORS[cluster.risk], fontFamily: "var(--font-display)" }}>{cluster.cases}</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>cases</div>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* DETAIL PANEL */}
          {selected && (
            <GlassCard accent={RISK_COLORS[selected.risk]} lift={false} style={{ padding: 24, height: "fit-content", position: "sticky", top: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                <div style={{ fontSize: 16, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)" }}>Cluster Detail</div>
                <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", fontSize: 18 }}>✕</button>
              </div>
              <div style={{ background: RISK_BG[selected.risk], border: `1px solid ${RISK_COLORS[selected.risk]}30`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: 20, fontWeight: 700, color: RISK_COLORS[selected.risk], fontFamily: "var(--font-display)", marginBottom: 4 }}>{selected.disease}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)" }}>{selected.location}</div>
              </div>
              {([
                ["Total Cases", selected.cases.toString()],
                ["Risk Level", selected.risk],
                ["PIN Code", selected.pincode],
                ["Last Report", fmtReport(selected.last_reported)],
                ["DHO Alert", selected.alert_sent
                  ? <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><Check size={14} color="#00E676" strokeWidth={1.8} /> Sent</span>
                  : <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><X size={14} color="#FF4757" strokeWidth={1.8} /> Pending</span>],
              ] as [string, React.ReactNode][]).map(([label, value]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 11 }}>{label}</span>
                  <span style={{ color: "#F0F4FF", fontWeight: 500 }}>{value}</span>
                </div>
              ))}
              {!selected.alert_sent && (
                <button onClick={() => sendDhoAlert(selected)} style={{ width: "100%", marginTop: 16, background: "linear-gradient(135deg,#FF4757,#ff6b35)", border: "none", borderRadius: 100, padding: "13px", color: "#fff", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                  {alertedIds.has(selected.id)
                    ? <><Check size={16} color="#fff" strokeWidth={1.8} /> DHO Alert Sent!</>
                    : <><Siren size={16} color="#fff" strokeWidth={1.8} /> Send DHO Alert</>}
                </button>
              )}
              <button onClick={() => analyzeCluster(selected)} disabled={aiLoading} style={{ width: "100%", marginTop: 10, background: aiLoading ? "rgba(255,255,255,0.04)" : "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "13px", color: aiLoading ? "var(--text-3)" : "#04060D", fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
                {aiLoading ? "AI analyse kar raha hai..." : <><Sparkles size={16} color="#04060D" strokeWidth={1.8} /> AI Cluster Analysis</>}
              </button>
              {aiResult && (
                <div style={{ marginTop: 12, background: "rgba(0,230,118,0.04)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#00E676", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={13} color="#00E676" strokeWidth={1.8} /> AI VERDICT</div>
                  {aiResult.probable_disease && <div style={{ fontSize: 13, color: "#F0F4FF", marginBottom: 4 }}><strong>Probable:</strong> {aiResult.probable_disease}</div>}
                  {aiResult.risk_level && <div style={{ fontSize: 13, color: "#fbbf24", marginBottom: 4 }}><strong>Risk:</strong> {aiResult.risk_level}</div>}
                  {aiResult.recommended_action && <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{aiResult.recommended_action}</div>}
                </div>
              )}
            </GlassCard>
          )}
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}
