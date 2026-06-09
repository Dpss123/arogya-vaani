"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Building2, HeartPulse, Stethoscope, Pill, Activity, Baby, Syringe, Landmark, Search, Check, Square, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useT } from "@/components/LanguageProvider";

const SCHEMES = [
  { id: "1", name: "Ayushman Bharat PM-JAY", category: "Insurance", benefit: "₹5 lakh/year hospital cover", eligibility: "BPL families · SECC list mein hona chahiye", how: "Nearest empanelled hospital mein Aadhar le jao", Icon: Building2, color: "#00E676", free: true },
  { id: "2", name: "Janani Suraksha Yojana", category: "Maternity", benefit: "₹1400 rural / ₹1000 urban · delivery pe cash", eligibility: "Pregnant women · BPL ya SC/ST", how: "ASHA worker se register karein · govt hospital delivery", Icon: HeartPulse, color: "#818cf8", free: true },
  { id: "3", name: "Pradhan Mantri Dialysis Programme", category: "Kidney", benefit: "Free dialysis at govt hospitals", eligibility: "Chronic kidney disease patients", how: "Nearest dialysis centre · Aadhar aur doctor certificate", Icon: Stethoscope, color: "#00B4D8", free: true },
  { id: "4", name: "Rashtriya Arogya Nidhi", category: "Critical Illness", benefit: "Financial help for BPL patients · critical illness", eligibility: "BPL patients needing expensive surgery", how: "Hospital social worker se apply karein", Icon: Pill, color: "#fbbf24", free: true },
  { id: "5", name: "National Cancer Grid", category: "Cancer", benefit: "Subsidised cancer treatment", eligibility: "All cancer patients", how: "Nearest cancer hospital mein register", Icon: Activity, color: "#f97316", free: false },
  { id: "6", name: "PMMVY (Matru Vandana)", category: "Maternity", benefit: "₹5000 · pehle bacche ke liye", eligibility: "Pregnant/lactating women · pehla baby", how: "Anganwadi centre mein form bharo · Aadhar chahiye", Icon: Baby, color: "#818cf8", free: true },
  { id: "7", name: "Mukhyamantri Vatsalya Yojana", category: "Child Health", benefit: "Free healthcare for children 0-18 years", eligibility: "All children of Uttarakhand", how: "Nearest govt hospital mein birth certificate", Icon: Baby, color: "#00E676", free: true },
  { id: "8", name: "Sanjeevani Pariyojana", category: "General", benefit: "Free OPD medicines at PHC/CHC", eligibility: "All Uttarakhand residents", how: "Nearest PHC/CHC mein doctor se milein", Icon: Syringe, color: "#00B4D8", free: true },
];

const CATEGORIES = ["All", "Insurance", "Maternity", "Kidney", "Cancer", "Child Health", "General", "Critical Illness"];

export default function SchemesPage() {
  const router = useRouter();
  const [category, setCategory] = useState("All");
  const [freeOnly, setFreeOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [situation, setSituation] = useState("");
  const [aiResult, setAiResult] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const { t } = useT();

  const checkEligibility = async () => {
    if (!situation.trim()) return;
    setAiLoading(true); setAiResult(null);
    try {
      const res = await fetch("/api/schemes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile: { situation, state: "Uttarakhand" } }),
      });
      const data = await res.json();
      setAiResult(data.schemes || t("Koi jaankari nahi mili."));
    } catch {
      setAiResult(t("AI check nahi ho paaya. Dobara try karein."));
    } finally {
      setAiLoading(false);
    }
  };

  const filtered = SCHEMES.filter(s => {
    const matchCat = category === "All" || s.category === category;
    const matchFree = !freeOnly || s.free;
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.benefit.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchFree && matchSearch;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("Aapke liye available")} {SCHEMES.filter(s => s.free).length} {t("free schemes")}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>{t("Govt Scheme Navigator")}</h1>
          </div>
        </div>

        {/* HIGHLIGHT BOX */}
        <GlassCard accent="#00E676" lift={false} style={{ padding: "16px 20px", marginBottom: 20, display: "flex", gap: 12, alignItems: "flex-start" }}>
          <Landmark size={26} color="#00E676" strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#00E676", marginBottom: 4 }}>{t("Millions claim nahi karte!")}</div>
            <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6 }}>{t("Bahut se eligible Indians ko pata hi nahi hota ki unhe kaunsi schemes milti hain. Yahan check karein aur apna haq maangein.")}</div>
          </div>
        </GlassCard>

        {/* SEARCH */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px", marginBottom: 12, display: "flex", gap: 10, alignItems: "center" }}>
          <Search size={16} color="var(--text-3)" strokeWidth={1.8} style={{ flexShrink: 0 }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Scheme dhundho...")} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)" }} />
        </div>

        {/* FILTERS */}
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 12 }}>
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)} style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${category === cat ? "rgba(0,230,118,0.4)" : "var(--border)"}`, background: category === cat ? "rgba(0,230,118,0.1)" : "transparent", color: category === cat ? "#00E676" : "var(--text-2)", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-body)", transition: "all 0.2s" }}>{t(cat)}</button>
          ))}
        </div>
        <button onClick={() => setFreeOnly(!freeOnly)} style={{ marginBottom: 20, padding: "6px 14px", borderRadius: 100, border: `1px solid ${freeOnly ? "rgba(0,230,118,0.4)" : "var(--border)"}`, background: freeOnly ? "rgba(0,230,118,0.1)" : "transparent", color: freeOnly ? "#00E676" : "var(--text-2)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: 7 }}>
          {freeOnly ? <Check size={14} color="#00E676" strokeWidth={2} /> : <Square size={14} color="var(--text-2)" strokeWidth={1.8} />} {t("Sirf Free Schemes")}
        </button>

        {/* SCHEME CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map(scheme => (
            <GlassCard key={scheme.id} accent={scheme.color} lift={false} style={{ padding: 0, borderColor: expanded === scheme.id ? scheme.color + "40" : "var(--border)" }}>
              <div onClick={() => setExpanded(expanded === scheme.id ? null : scheme.id)} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: `${scheme.color}15`, border: `1px solid ${scheme.color}30`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><scheme.Icon size={22} color={scheme.color} strokeWidth={1.8} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#F0F4FF" }}>{t(scheme.name)}</span>
                    {scheme.free && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "rgba(0,230,118,0.1)", color: "#00E676", fontFamily: "var(--font-mono)" }}>{t("FREE")}</span>}
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "rgba(255,255,255,0.025)", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t(scheme.category)}</span>
                  </div>
                  <div style={{ fontSize: 13, color: scheme.color, fontWeight: 500 }}>{t(scheme.benefit)}</div>
                </div>
                <span style={{ color: "var(--text-3)", display: "flex", flexShrink: 0 }}>{expanded === scheme.id ? <ChevronUp size={18} strokeWidth={1.8} /> : <ChevronDown size={18} strokeWidth={1.8} />}</span>
              </div>
              {expanded === scheme.id && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", background: `${scheme.color}05` }}>
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.06em" }}>{t("ELIGIBILITY")}</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{t(scheme.eligibility)}</div>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 6, letterSpacing: "0.06em" }}>{t("APPLY KAISE KAREIN")}</div>
                    <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{t(scheme.how)}</div>
                  </div>
                  <button onClick={() => router.push(`/chat?scheme=${encodeURIComponent(scheme.name)}`)} style={{ width: "100%", background: `linear-gradient(135deg, ${scheme.color}, #00C4FF)`, border: "none", borderRadius: 100, padding: "12px", color: "#04060D", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <Sparkles size={15} color="#04060D" strokeWidth={1.8} /> {t("Is Scheme Ke Baare Mein Aur Jaankari Lo")}
                  </button>
                </div>
              )}
            </GlassCard>
          ))}
        </div>

        <GlassCard accent="#00E676" lift={false} style={{ marginTop: 24, padding: 22 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 6, display: "flex", alignItems: "center", gap: 8 }}><Sparkles size={16} color="#00E676" strokeWidth={1.8} /> {t("AI Se Apni Eligibility Check Karein")}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.6, marginBottom: 12 }}>{t("Apni situation batao · umar, income, pregnancy, bimari · AI aapke liye sahi schemes dhundhega.")}</div>
          <textarea value={situation} onChange={e => setSituation(e.target.value)} placeholder={t("e.g. Main 28 saal ki pregnant mahila hoon, BPL card hai, Uttarakhand mein rehti hoon...")} rows={3} style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)", outline: "none", resize: "vertical", marginBottom: 12 }} />
          <button onClick={checkEligibility} disabled={!situation.trim() || aiLoading} style={{ width: "100%", background: situation.trim() && !aiLoading ? "linear-gradient(135deg,#00E676,#00C4FF)" : "rgba(255,255,255,0.025)", border: "none", borderRadius: 100, padding: "14px", color: situation.trim() && !aiLoading ? "#04060D" : "var(--text-3)", fontWeight: 700, cursor: situation.trim() && !aiLoading ? "pointer" : "not-allowed", fontFamily: "var(--font-body)", fontSize: 14, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {aiLoading ? t("AI dhundh raha hai...") : <><Search size={15} strokeWidth={1.8} /> {t("Meri Eligibility Check Karein")}</>}
          </button>
          {aiResult && (
            <div style={{ marginTop: 14, background: "rgba(255,255,255,0.025)", border: "1px solid rgba(0,230,118,0.2)", borderRadius: 14, padding: 16, fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiResult}</div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
