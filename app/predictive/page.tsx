"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPatientKey } from "@/lib/patientId";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { useT } from "@/components/LanguageProvider";
import { TrendingUp, TrendingDown, ArrowRight, AlertTriangle, Search, Check } from "lucide-react";

type Risk = { name: string; level: "low" | "medium" | "high"; why: string };
type Predictive = {
  health_score: number | null;
  score_label?: string;
  trend?: "improving" | "stable" | "declining" | "unknown";
  summary?: string;
  insights?: string[];
  risks?: Risk[];
  recommendations?: string[];
  error?: string;
};

export default function PredictivePage() {
  const router = useRouter();
  const { t } = useT();
  const [data, setData] = useState<Predictive | null>(null);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    fetch("/api/predictive", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: getPatientKey() }),
    })
      .then(async r => ({ ok: r.ok, d: await r.json() }))
      .then(({ ok, d }) => { if (!ok || d?.error) setErrored(true); else setData(d); })
      .catch(() => setErrored(true))
      .finally(() => setLoading(false));
  }, []);

  const scoreColor = (s: number | null | undefined) =>
    s == null ? "#64748b" : s >= 75 ? "#00E676" : s >= 50 ? "#00B4D8" : s >= 30 ? "#fbbf24" : "#FF4757";
  const riskColor = (l: string) => (l === "high" ? "#FF4757" : l === "medium" ? "#fbbf24" : "#00E676");
  const trendBadge = (t?: string) =>
    t === "improving" ? { t: "Behtar ho raha", c: "#00E676", Icon: TrendingUp }
    : t === "declining" ? { t: "Dhyan dein", c: "#FF4757", Icon: TrendingDown }
    : t === "stable" ? { t: "Stable", c: "#00B4D8", Icon: ArrowRight }
    : { t: "·", c: "#64748b", Icon: null };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("AI Predictive · Aapki Reports Se")}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>{t("Health Trends")}</h1>
          </div>
        </div>

        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 0" }}>
            <div style={{ width: 44, height: 44, border: "3px solid rgba(0,230,118,0.2)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
            <p style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>{t("AI aapki health analyse kar raha hai...")}</p>
          </div>
        ) : errored ? (
          <GlassCard accent="#FF4757" lift={false} style={{ padding: 24, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><AlertTriangle size={44} color="#FF4757" strokeWidth={1.8} /></div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 10 }}>{t("Kuch problem aayi")}</div>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 22 }}>{t("Health analysis abhi load nahi ho paaya. Thodi der baad dobara try karein.")}</p>
            <button onClick={() => location.reload()} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "13px 28px", color: "#F0F4FF", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>{t("Dobara Try Karein")}</button>
          </GlassCard>
        ) : data?.health_score == null ? (
          <GlassCard accent="#00E676" lift={false} style={{ padding: 24, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 14 }}><TrendingUp size={44} color="#00E676" strokeWidth={1.8} /></div>
            <div style={{ fontSize: 17, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 10 }}>{t("Abhi kaafi data nahi")}</div>
            <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 22 }}>{data?.summary || t("Reports upload karein taaki AI aapke health trends aur score dikha sake.")}</p>
            <button onClick={() => router.push("/report")} style={{ background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "13px 28px", color: "#04060D", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>{t("Report Upload Karein")}</button>
          </GlassCard>
        ) : (
          <>
            {/* SCORE */}
            <GlassCard accent={scoreColor(data.health_score)} lift={false} style={{ padding: 24, marginBottom: 14, textAlign: "center" }}>
              <div style={{ width: 150, height: 150, margin: "0 auto 14px", borderRadius: "50%", border: `6px solid ${scoreColor(data.health_score)}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", boxShadow: `0 0 32px ${scoreColor(data.health_score)}30` }}>
                <div style={{ fontSize: 44, fontWeight: 900, color: scoreColor(data.health_score), fontFamily: "var(--font-display)", lineHeight: 1 }}>{data.health_score}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>/ 100</div>
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: scoreColor(data.health_score) }}>{data.score_label}</div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, fontSize: 12, padding: "3px 12px", borderRadius: 100, background: `${trendBadge(data.trend).c}15`, color: trendBadge(data.trend).c, fontFamily: "var(--font-mono)" }}>{(() => { const Tb = trendBadge(data.trend).Icon; return Tb ? <Tb size={13} color={trendBadge(data.trend).c} strokeWidth={1.8} /> : null; })()}{t(trendBadge(data.trend).t)}</div>
              {data.summary && <p style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, marginTop: 14 }}>{data.summary}</p>}
            </GlassCard>

            {/* INSIGHTS */}
            {(data.insights?.length ?? 0) > 0 && (
              <GlassCard accent="#00B4D8" lift={false} style={{ padding: 20, marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "#00B4D8", letterSpacing: "0.06em", marginBottom: 10 }}><Search size={14} color="#00B4D8" strokeWidth={1.8} />{t("AI INSIGHTS")}</div>
                {data.insights!.map((ins, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                    <span style={{ color: "#00B4D8", flexShrink: 0 }}>•</span>{t(ins)}
                  </div>
                ))}
              </GlassCard>
            )}

            {/* RISKS */}
            {(data.risks?.length ?? 0) > 0 && (
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.06em", marginBottom: 10 }}><AlertTriangle size={14} color="var(--text-3)" strokeWidth={1.8} />{t("RISK FLAGS")}</div>
                {data.risks!.map((r, i) => (
                  <GlassCard key={i} accent={riskColor(r.level)} lift={false} style={{ padding: "12px 14px", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "#F0F4FF" }}>{t(r.name)}</span>
                      <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: `${riskColor(r.level)}15`, color: riskColor(r.level), fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{t(r.level)}</span>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6 }}>{t(r.why)}</div>
                  </GlassCard>
                ))}
              </div>
            )}

            {/* RECOMMENDATIONS */}
            {(data.recommendations?.length ?? 0) > 0 && (
              <GlassCard accent="#00E676" lift={false} style={{ padding: 20, marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", letterSpacing: "0.06em", marginBottom: 10 }}><Check size={14} color="#00E676" strokeWidth={1.8} />{t("KYA KAREIN")}</div>
                {data.recommendations!.map((rec, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
                    <span style={{ color: "#00E676", flexShrink: 0 }}>→</span>{t(rec)}
                  </div>
                ))}
              </GlassCard>
            )}

            <div style={{ padding: "12px 16px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--text-3)", textAlign: "center", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
              ⚠️ {t("YEH AI TREND ANALYSIS HAI · DIAGNOSIS NAHI · DOCTOR SE MILEIN")}
            </div>
          </>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
