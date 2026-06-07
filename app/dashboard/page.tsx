"use client";
import { useState, useEffect } from "react";
import { Siren, Building2, Smile, MessageCircle, Sparkles, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import Counter from "@/components/ui/Counter";

type Patient = {
  id: string; phone: string; name?: string;
  symptoms: string; verdict: string; time: string; risk: string;
};

const MOCK_PATIENTS: Patient[] = [
  { id: "1", phone: "+91 98765 43210", name: "Ramesh Kumar", symptoms: "Seene mein dard, sans lene mein takleef", verdict: "emergency", time: "10 min ago", risk: "high" },
  { id: "2", phone: "+91 87654 32109", name: "Sunita Devi", symptoms: "Bukhar 102F, sar dard, body pain", verdict: "clinic", time: "25 min ago", risk: "medium" },
  { id: "3", phone: "+91 76543 21098", name: "Mohan Lal", symptoms: "Hafta bhar se khansi, sardi", verdict: "rest", time: "1 hr ago", risk: "low" },
  { id: "4", phone: "+91 65432 10987", name: "Geeta Sharma", symptoms: "Pet dard, ulti 3 baar", verdict: "clinic", time: "2 hr ago", risk: "medium" },
  { id: "5", phone: "+91 54321 09876", name: "Suresh Yadav", symptoms: "Neend nahi, anxiety feel ho rahi hai", verdict: "rest", time: "3 hr ago", risk: "low" },
];

export default function DashboardPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [filter, setFilter] = useState<"all" | "emergency" | "clinic" | "rest">("all");
  const [stats, setStats] = useState({ total: 0, emergency: 0, clinic: 0, rest: 0 });
  const [aiBrief, setAiBrief] = useState<string | null>(null);
  const [briefLoading, setBriefLoading] = useState(false);

  const getBrief = async (phone: string) => {
    setBriefLoading(true); setAiBrief(null);
    try {
      const res = await fetch("/api/doctor-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      setAiBrief(data.brief || "Brief nahi bana.");
    } catch {
      setAiBrief("Brief nahi bana. Dobara try karein.");
    } finally {
      setBriefLoading(false);
    }
  };

  useEffect(() => {
    fetch("/api/triage")
      .then((r) => r.json())
      .then((data) => {
        const list: Patient[] = (data.results && data.results.length) ? data.results : MOCK_PATIENTS;
        setPatients(list);
        setStats({
          total: list.length,
          emergency: list.filter((p) => p.verdict === "emergency").length,
          clinic: list.filter((p) => p.verdict === "clinic").length,
          rest: list.filter((p) => p.verdict === "rest").length,
        });
      })
      .catch(() => {
        setPatients(MOCK_PATIENTS);
        setStats({ total: 5, emergency: 1, clinic: 2, rest: 2 });
      })
      .finally(() => setLoading(false));
  }, []);

  const vc = (v: string) => (v === "emergency" ? "#FF4757" : v === "clinic" ? "#fbbf24" : "#00E676");
  const vl = (v: string) => (v === "emergency" ? "Emergency" : v === "clinic" ? "Clinic" : "Ghar Pe");
  const fmtTime = (t: string) => {
    if (!t || t.includes("ago")) return t || "";
    const d = new Date(t);
    return isNaN(d.getTime()) ? t : d.toLocaleString("hi-IN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" });
  };
  const filtered = patients.filter((p) => filter === "all" || p.verdict === filter);

  return (
    <div style={{ minHeight: "100vh", padding: "32px clamp(20px,4vw,40px) 100px", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" }}>HARIDWAR DISTRICT</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,3.5vw,38px)", fontWeight: 800, letterSpacing: "-0.025em", margin: "5px 0 0" }}>Doctor Dashboard</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 7, padding: "7px 14px", borderRadius: 100, border: "1px solid rgba(0,230,118,0.25)", background: "rgba(0,230,118,0.06)" }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 8px #00E676", animation: "heartbeat 1.8s infinite" }} />
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", letterSpacing: "0.06em" }}>LIVE</span>
        </div>
      </div>

      <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 22 }}>
        {([["Total", stats.total, "#F0F4FF"], ["Emergency", stats.emergency, "#FF4757"], ["Clinic", stats.clinic, "#fbbf24"], ["Aaram", stats.rest, "#00E676"]] as const).map(([l, v, c]) => (
          <GlassCard key={l} accent={c} lift={false} style={{ padding: "16px 18px" }}>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: c, letterSpacing: "-0.03em" }}><Counter to={v} /></div>
            <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 3, letterSpacing: "0.04em" }}>{l}</div>
          </GlassCard>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
        {(["all", "emergency", "clinic", "rest"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 16px", borderRadius: 100, border: `1px solid ${filter === f ? (f === "all" ? "#00E676" : vc(f)) : "var(--border)"}`, background: filter === f ? `${f === "all" ? "#00E676" : vc(f)}15` : "transparent", color: filter === f ? (f === "all" ? "#00E676" : vc(f)) : "var(--text-2)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", textTransform: "capitalize" }}>
            {f === "all" ? "Sab" : f === "emergency" ? "Emergency" : f === "clinic" ? "Clinic" : "Ghar Pe"}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 14 }} className="dash-split">
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: 50 }}>
              <div style={{ width: 32, height: 32, border: "3px solid rgba(0,230,118,0.2)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            </div>
          ) : filtered.map((p) => (
            <GlassCard key={p.id} accent={vc(p.verdict)} onClick={() => { setSelected(selected?.id === p.id ? null : p); setAiBrief(null); }}
              style={{ padding: "14px 18px", borderColor: selected?.id === p.id ? vc(p.verdict) + "40" : "var(--border)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: 11, background: `${vc(p.verdict)}15`, border: `1px solid ${vc(p.verdict)}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {p.verdict === "emergency"
                    ? <Siren size={20} color={vc(p.verdict)} strokeWidth={1.8} />
                    : p.verdict === "clinic"
                    ? <Building2 size={20} color={vc(p.verdict)} strokeWidth={1.8} />
                    : <Smile size={20} color={vc(p.verdict)} strokeWidth={1.8} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#F0F4FF" }}>{p.name || p.phone}</span>
                    <span style={{ fontSize: 9, padding: "1px 7px", borderRadius: 100, background: `${vc(p.verdict)}15`, color: vc(p.verdict), fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{vl(p.verdict)}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.symptoms}</div>
                </div>
                <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", flexShrink: 0 }}>{fmtTime(p.time)}</div>
              </div>
            </GlassCard>
          ))}
        </div>

        {selected && (
          <GlassCard lift={false} style={{ padding: 22, height: "fit-content", position: "sticky", top: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)" }}>Patient Brief</div>
              <button onClick={() => setSelected(null)} style={{ background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", display: "flex", alignItems: "center", padding: 0 }}><X size={16} strokeWidth={1.8} /></button>
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 3 }}>{selected.name || "Patient"}</div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{selected.phone}</div>
            </div>
            <div style={{ background: `${vc(selected.verdict)}08`, border: `1px solid ${vc(selected.verdict)}25`, borderRadius: 12, padding: 14, marginBottom: 14 }}>
              <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: vc(selected.verdict), letterSpacing: "0.08em", marginBottom: 6 }}>AI TRIAGE</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: vc(selected.verdict), marginBottom: 6 }}>{vl(selected.verdict)}</div>
              <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{selected.symptoms}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <button onClick={() => window.open(`https://wa.me/${selected.phone.replace(/\D/g, "")}`, "_blank")} style={{ width: "100%", background: "#25D366", border: "none", borderRadius: 12, padding: "12px", color: "#fff", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><MessageCircle size={15} color="#fff" strokeWidth={1.8} />WhatsApp Bhejo</button>
              {selected.verdict === "emergency" && (
                <button style={{ width: "100%", background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: 12, padding: "12px", color: "#FF4757", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}><Siren size={15} color="#FF4757" strokeWidth={1.8} />108 Alert Bhejo</button>
              )}
              <button onClick={() => getBrief(selected.phone)} disabled={briefLoading} style={{ width: "100%", background: briefLoading ? "rgba(255,255,255,0.04)" : "rgba(0,180,216,0.12)", border: "1px solid rgba(0,180,216,0.3)", borderRadius: 12, padding: "12px", color: briefLoading ? "var(--text-3)" : "#00B4D8", fontWeight: 600, cursor: briefLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Sparkles size={15} color={briefLoading ? "var(--text-3)" : "#00B4D8"} strokeWidth={1.8} />
                {briefLoading ? "AI brief bana raha hai..." : "AI Patient Brief"}
              </button>
            </div>
            {aiBrief && (
              <div style={{ marginTop: 14, background: "rgba(0,180,216,0.05)", border: "1px solid rgba(0,180,216,0.2)", borderRadius: 12, padding: 14 }}>
                <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#00B4D8", letterSpacing: "0.06em", marginBottom: 8, display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={13} color="#00B4D8" strokeWidth={1.8} />60-SECOND AI BRIEF</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiBrief}</div>
              </div>
            )}
          </GlassCard>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @media (max-width:760px){ .dash-split { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
