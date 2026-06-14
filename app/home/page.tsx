"use client";
import { useRouter } from "next/navigation";
import {
  MessageCircle, Microscope, FileText, Pill, Brain, HeartPulse, Baby, Utensils,
  TrendingUp, Activity, Landmark, Stethoscope, Cross, IndianRupee, ClipboardList,
  Siren, ArrowRight, type LucideIcon,
} from "lucide-react";
import FeatureCard from "@/components/ui/FeatureCard";
import GlassCard from "@/components/ui/GlassCard";
import Reveal from "@/components/ui/Reveal";
import LangSelect from "@/components/LangSelect";
import { useT } from "@/components/LanguageProvider";

const TIPS = [
  "Roz 8 glass paani piyen, kidney stones se bachao",
  "Roz 30 minute walk karein, heart strong rahega",
  "Hara saag khao, iron ki kami door hogi",
  "7-8 ghante sona zaroori hai, immunity ke liye",
  "Deep breathing karo, BP control mein rehta hai",
  "Subah ki dhoop lo, Vitamin D milegi",
  "Mutthi bhar meva roz khao, brain aur heart ke liye",
];

const ACTIONS: [LucideIcon, string, string, string, string][] = [
  [MessageCircle, "AI Chat", "Apne symptoms batao", "/chat", "#00E676"],
  [Microscope, "AI Diagnostics", "Skin, eye, X-ray, dental", "/diagnostics", "#a78bfa"],
  [FileText, "Report Reader", "Blood test, X-ray explain", "/report", "#00B4D8"],
  [Pill, "Medicine Scan", "Info + generic alternative", "/medicine", "#818cf8"],
  [Brain, "Mental Health", "PHQ-9 / GAD-7 / PPD", "/mental-health", "#f97316"],
  [HeartPulse, "Pregnancy", "Week tracker + schemes", "/pregnancy", "#ec4899"],
  [Baby, "Child Growth", "WHO growth check", "/growth", "#22d3ee"],
  [Utensils, "Thali Nutrition", "Khaane ki photo se", "/nutrition", "#34d399"],
  [TrendingUp, "Health Trends", "AI predictive score", "/predictive", "#34d399"],
  [Activity, "Outbreaks", "Disease surveillance", "/outbreak", "#FF4757"],
  [Landmark, "Govt Schemes", "Free health benefits", "/schemes", "#22c55e"],
  [Stethoscope, "Find Doctor", "Nearest clinic dhundho", "/doctors", "#fbbf24"],
  [Cross, "First Aid", "Emergency steps", "/first-aid", "#FF9500"],
  [IndianRupee, "Generic Dawai", "Sasta Jan Aushadhi", "/generic", "#22c55e"],
  [ClipboardList, "ASHA Tools", "Visit + vaccination", "/asha", "#06b6d4"],
];

export default function Home() {
  const router = useRouter();
  const { t } = useT();
  const tip = TIPS[new Date().getDay() % TIPS.length];

  return (
    <>
      <div aria-hidden style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="aurora-blob b1" /><div className="aurora-blob b2" /><div className="aurora-blob b3" />
      </div>
      <div style={{ position: "relative", zIndex: 1, padding: "36px clamp(20px,4vw,44px) 100px", maxWidth: 1120, margin: "0 auto" }}>
      <div className="m-stack-flex" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em" }}>{t("NAMASKAR")}</div>
          <h1 className="shimmer-text" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,4vw,42px)", fontWeight: 800, letterSpacing: "-0.025em", margin: "6px 0 0" }}>{t("Health Dashboard")}</h1>
        </div>
        <span className="lang-desktop"><LangSelect /></span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 14, marginBottom: 14 }} className="dash-row">
        <GlassCard accent="#00E676" glow onClick={() => router.push("/chat")} style={{ padding: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, background: "linear-gradient(135deg,#00E676,#00B4D8)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Stethoscope size={22} color="#04060D" strokeWidth={2} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)" }}>{t("AI Health Assistant")}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 5px #00E676" }} />
                <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t("Online · 12 languages · Gemini + Groq")}</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "12px 16px", fontSize: 14, color: "var(--text-2)", fontFamily: "var(--font-serif)", fontStyle: "italic" }}>
            <span>&quot;{t("Apni sehat ki koi bhi baat poochhein...")}&quot;</span>
            <ArrowRight size={16} color="#00E676" />
          </div>
        </GlassCard>

        <GlassCard accent="#00B4D8" lift={false} style={{ padding: 22 }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "#00B4D8", letterSpacing: "0.08em", marginBottom: 10 }}>{t("AAJ KI TIP")}</div>
          <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{t(tip)}</div>
        </GlassCard>
      </div>

      <GlassCard accent="#FF4757" onClick={() => router.push("/emergency")} style={{ padding: "16px 20px", marginBottom: 26 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <Siren size={26} color="#FF4757" strokeWidth={2} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: "#FF4757" }}>{t("Emergency? 108 Call Karein")}</div>
            <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t("Free ambulance · GPS auto-send · family alert · first-aid")}</div>
          </div>
          <ArrowRight size={18} color="rgba(255,71,87,0.5)" />
        </div>
      </GlassCard>

      <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.1em", marginBottom: 16, textTransform: "uppercase" }}>{t("All Services")}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px,1fr))", gap: 14 }}>
        {ACTIONS.map(([Icon, label, desc, href, color], i) => (
          <Reveal key={href} delay={(i % 4) * 0.05}>
            <FeatureCard icon={<Icon size={28} color={color} strokeWidth={1.7} />} title={t(label)} body={t(desc)} accent={color} float floatDelay={(i % 6) * 0.45} onClick={() => router.push(href)} />
          </Reveal>
        ))}
      </div>

      <style>{`@media (max-width: 760px){ .dash-row { grid-template-columns: 1fr !important; } }`}</style>
      </div>
    </>
  );
}
