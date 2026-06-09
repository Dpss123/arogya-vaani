"use client";
import { useState } from "react";
import { useT } from "@/components/LanguageProvider";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { VISIT_TYPES, IMMUNIZATION } from "@/lib/asha";
import { FileText, Syringe, HeartPulse, Baby, Users, AlertTriangle } from "lucide-react";

const VISIT_ICONS: Record<string, typeof FileText> = {
  "Pregnancy (ANC) home visit": HeartPulse,
  "Newborn / postnatal (HBNC) visit": Baby,
  "Child under-5 growth & nutrition visit": Baby,
  "General family health visit": Users,
};

export default function AshaPage() {
  const [tab, setTab] = useState<"checklist" | "vaccine">("checklist");
  const [visit, setVisit] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useT();

  const getChecklist = async (visitType: string) => {
    setVisit(visitType); setChecklist(null); setLoading(true);
    try {
      const res = await fetch("/api/asha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitType }),
      });
      const data = await res.json();
      if (!res.ok || data.error) setChecklist(t("Checklist nahi mil paayi. Dobara try karein."));
      else setChecklist(data.checklist || t("Checklist nahi mil paayi."));
    } catch {
      setChecklist(t("Checklist nahi mil paayi. Dobara try karein."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} style={{ marginTop: 6 }} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("Home Visit + Vaccination Madad")}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,4vw,38px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#F0F4FF", margin: "6px 0 0" }}>{t("ASHA Assistant")}</h1>
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {([["checklist", FileText, "Visit Checklist"], ["vaccine", Syringe, "Vaccination"]] as const).map(([k, Icon, l]) => (
            <button key={k} onClick={() => setTab(k)} style={{ flex: 1, padding: "9px 4px", borderRadius: 100, border: `1px solid ${tab === k ? "rgba(0,230,118,0.35)" : "var(--border)"}`, background: tab === k ? "rgba(0,230,118,0.1)" : "transparent", color: tab === k ? "#00E676" : "var(--text-2)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: tab === k ? 600 : 400, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon size={14} color={tab === k ? "#00E676" : "var(--text-2)"} strokeWidth={1.8} />{t(l)}</button>
          ))}
        </div>

        {tab === "checklist" && (
          <div>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14, lineHeight: 1.6 }}>{t("Visit ka type chunein · AI uski checklist banayega:")}</div>
            <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
              {VISIT_TYPES.map(v => {
                const VIcon = VISIT_ICONS[v.key] ?? Users;
                return (
                <button key={v.key} onClick={() => getChecklist(v.key)} disabled={loading} style={{ background: visit === v.key ? "rgba(0,230,118,0.1)" : "rgba(255,255,255,0.025)", border: `1px solid ${visit === v.key ? "rgba(0,230,118,0.4)" : "var(--border)"}`, borderRadius: 14, padding: "16px 12px", cursor: loading ? "wait" : "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
                  <div style={{ marginBottom: 8 }}><VIcon size={26} color="#00E676" strokeWidth={1.8} /></div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F0F4FF" }}>{t(v.label)}</div>
                </button>
                );
              })}
            </div>

            {loading && <div style={{ textAlign: "center", padding: 24, color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{t("AI checklist bana raha hai...")}</div>}
            {checklist && !loading && (
              <GlassCard accent="#00E676" lift={false} style={{ padding: 22 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", letterSpacing: "0.06em", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}><FileText size={13} color="#00E676" strokeWidth={1.8} />{t("CHECKLIST")}</div>
                <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>{checklist}</div>
              </GlassCard>
            )}
          </div>
        )}

        {tab === "vaccine" && (
          <div>
            <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 14, lineHeight: 1.6 }}>{t("India National Immunization Schedule (0–16 saal):")}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {IMMUNIZATION.map((row, i) => (
                <GlassCard key={i} accent="#00B4D8" lift={false} style={{ padding: "14px 16px", borderRadius: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#00B4D8", marginBottom: 5 }}>{t(row.age)}</div>
                  <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{row.vaccines}</div>
                </GlassCard>
              ))}
            </div>
            <GlassCard accent="#FF4757" lift={false} style={{ marginTop: 14, padding: "12px 16px", borderRadius: 12 }}>
              <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.7, display: "flex", alignItems: "center", gap: 8 }}>
                <AlertTriangle size={14} color="#FF4757" strokeWidth={1.8} style={{ flexShrink: 0 }} />
                {t("Reference schedule. Apne PHC/ANM se local schedule confirm karein.")}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
