"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { Calendar, Landmark, AlertTriangle, Baby, HeartPulse, Lightbulb, Siren, Phone, Sparkles, IndianRupee, FileText } from "lucide-react";

const WEEK_DATA: Record<number, { baby: string; mother: string; tip: string; warning: string }> = {
  4: { baby: "Chota sa embryo bana hai · poppy seed jitna bada", mother: "Period miss hua, thoda nausea ho sakta hai", tip: "Folic acid shuru karein · neural tube ke liye zaroori", warning: "Zyada bleeding ho toh turant doctor ke paas jao" },
  8: { baby: "Dil dhad raha hai, haath pair ban rahe hain", mother: "Morning sickness peak pe hai, thakan zyada", tip: "Chhote chhote meals lein din mein 5-6 baar", warning: "Severe vomiting mein dehydration ka risk · ORS lein" },
  12: { baby: "Pehla trimester khatam! Miscarriage ka risk kum", mother: "Nausea kam hoti hai, thoda better feel hoga", tip: "Pehla ultrasound karwaein · sab theek check hoga", warning: "Ab bhi bleeding = turant doctor" },
  16: { baby: "Baby move karna shuru kar sakta hai", mother: "Baby bump dikhne laga, energy wapas aa rahi hai", tip: "Iron-rich khana khao · palak, chana, anar", warning: "Swelling ya severe headache = BP check karein" },
  20: { baby: "Aadha safar pura! Baby ki sex pata chal sakti hai", mother: "Kicks feel hone lagte hain", tip: "Calcium ke liye doodh, dahi, ragi khao", warning: "Movements kum hone par turant doctor ke paas jao" },
  24: { baby: "Lungs develop ho rahe hain", mother: "Back pain shuru ho sakta hai", tip: "Left side so kar jao · baby ko blood flow better hota hai", warning: "Preterm labor signs: regular contractions, leakage" },
  28: { baby: "Teesra trimester! Eyes khulne lagte hain", mother: "Breathlessness normal hai · uterus bada ho raha hai", tip: "Hospital bag ready karna shuru karein", warning: "Severe swelling face mein = preeclampsia risk" },
  32: { baby: "Tezi se weight gain ho raha hai", mother: "Frequent urination, Braxton Hicks contractions", tip: "Birth plan doctor se discuss karein · normal ya C-section", warning: "Leakage/spotting = labor ka sign ho sakta hai" },
  36: { baby: "Head down position mein aa gaya hai (usually)", mother: "Pelvic pressure zyada hoga", tip: "Hospital ka route check karein, documents ready rakhein", warning: "Contractions 5 min apart = hospital jao turant" },
  40: { baby: "Poora ready hai · due date!", mother: "Har waqt labor shuru ho sakti hai", tip: "Roz walk karein · labor induce hone mein madad karta hai", warning: "Baby movements kum = NST test turant" },
};

const SCHEMES = [
  { name: "Janani Suraksha Yojana (JSY)", benefit: "₹1400 rural, ₹1000 urban · govt hospital delivery pe", how: "Govt hospital mein register karein · ASHA worker se poochhein" },
  { name: "Pradhan Mantri Matru Vandana (PMMVY)", benefit: "₹5000 teen installments mein · pehle bacche ke liye", how: "Anganwadi centre mein form bharo · Aadhar chahiye" },
  { name: "Janani Shishu Suraksha Karyakram", benefit: "Free delivery, free transport, free medicines", how: "Kisi bhi govt hospital mein · BPL card ya aadhar kaafi hai" },
  { name: "Mukhyamantri Mahila Uthan (Uttarakhand)", benefit: "₹6000 additional support Uttarakhand mein", how: "Zila mahila hospital ya ASHA worker se contact karein" },
];

export default function PregnancyPage() {
  const router = useRouter();
  const [week, setWeek] = useState(12);
  const [tab, setTab] = useState<"tracker" | "schemes" | "danger">("tracker");
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  const getAiAdvice = async () => {
    setAiLoading(true); setAiAdvice(null);
    try {
      const res = await fetch("/api/pregnancy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week }),
      });
      const data = await res.json();
      setAiAdvice(data.advice || "AI jaankari nahi mil paayi.");
    } catch {
      setAiAdvice("AI jaankari nahi mil paayi. Dobara try karein.");
    } finally {
      setAiLoading(false);
    }
  };
  const weekKeys = Object.keys(WEEK_DATA).map(Number).sort((a, b) => a - b);
  const nearestWeek = weekKeys.reduce((prev, curr) => Math.abs(curr - week) < Math.abs(prev - week) ? curr : prev);
  const data = WEEK_DATA[nearestWeek];
  const trimester = week <= 12 ? "Pehla" : week <= 28 ? "Doosra" : "Teesra";
  const trimesterColor = week <= 12 ? "#00E676" : week <= 28 ? "#00B4D8" : "#818cf8";

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Week tracker · Schemes · Danger signs</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "4px 0 0" }}>Pregnancy Companion</h1>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          {([["tracker", "Week Tracker", Calendar], ["schemes", "Govt Schemes", Landmark], ["danger", "Danger Signs", AlertTriangle]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, minWidth: 110, padding: "9px 8px", borderRadius: 100, border: `1px solid ${tab === key ? trimesterColor : "var(--border)"}`, background: tab === key ? `${trimesterColor}15` : "transparent", color: tab === key ? trimesterColor : "var(--text-2)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: tab === key ? 600 : 400, transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}><Icon size={14} strokeWidth={1.8} />{label}</button>
          ))}
        </div>

        {tab === "tracker" && (
          <div>
            {/* WEEK SELECTOR */}
            <GlassCard accent={trimesterColor} lift={false} style={{ padding: 24, marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 4 }}>AAPKA WEEK</div>
                  <div style={{ fontSize: 36, fontWeight: 900, color: trimesterColor, fontFamily: "var(--font-display)", letterSpacing: "-0.03em" }}>Week {week}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 4 }}>TRIMESTER</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: trimesterColor }}>{trimester}</div>
                </div>
              </div>
              <input type="range" min={4} max={42} value={week} onChange={e => setWeek(Number(e.target.value))} style={{ width: "100%", accentColor: trimesterColor }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
                <span>Week 4</span><span>Week 42</span>
              </div>
            </GlassCard>

            {/* PROGRESS BAR */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ height: 8, background: "rgba(255,255,255,0.06)", borderRadius: 8, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(week / 42) * 100}%`, background: `linear-gradient(90deg, #00E676, ${trimesterColor})`, borderRadius: 8, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-around", marginTop: 8 }}>
                {[["Week 1-12", "Pehla"], ["Week 13-28", "Doosra"], ["Week 29-42", "Teesra"]].map(([wk, name]) => (
                  <div key={name} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)" }}>{name}</div>
                    <div style={{ fontSize: 9, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{wk}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* INFO CARDS */}
            <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <GlassCard accent="#00E676" lift={false} style={{ padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", marginBottom: 8, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}><Baby size={13} strokeWidth={1.8} />BABY</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{data.baby}</div>
              </GlassCard>
              <GlassCard accent="#00B4D8" lift={false} style={{ padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00B4D8", marginBottom: 8, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}><HeartPulse size={13} strokeWidth={1.8} />AAPKA SHAREER</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{data.mother}</div>
              </GlassCard>
            </div>

            <GlassCard accent="#00E676" lift={false} style={{ padding: 18, marginBottom: 12 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 8, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}><Lightbulb size={13} strokeWidth={1.8} />IS WEEK KI TIP</div>
              <div style={{ fontSize: 14, color: "#F0F4FF", lineHeight: 1.6 }}>{data.tip}</div>
            </GlassCard>

            <GlassCard accent="#FF4757" lift={false} style={{ padding: 18 }}>
              <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#FF4757", marginBottom: 8, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}><Siren size={13} strokeWidth={1.8} />DANGER SIGN</div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>{data.warning}</div>
              <a href="tel:102" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, marginTop: 12, background: "rgba(255,71,87,0.15)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: 100, padding: "10px", textAlign: "center", color: "#FF4757", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14 }}><Phone size={15} strokeWidth={1.8} />102 · Free Maternity Ambulance</a>
            </GlassCard>

            <button onClick={getAiAdvice} disabled={aiLoading} style={{ width: "100%", marginTop: 12, background: aiLoading ? "rgba(255,255,255,0.025)" : "linear-gradient(135deg,#00E676,#00C4FF)", border: aiLoading ? "1px solid var(--border)" : "none", borderRadius: 100, padding: "14px", color: aiLoading ? "var(--text-3)" : "#04060D", fontWeight: 600, cursor: aiLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              {aiLoading ? "AI soch raha hai..." : <><Sparkles size={16} strokeWidth={1.8} />{`Week ${week} ki AI detail jaankari lo`}</>}
            </button>
            {aiAdvice && (
              <GlassCard accent="#00E676" lift={false} style={{ marginTop: 12, padding: 18 }}>
                <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", marginBottom: 8, letterSpacing: "0.06em", display: "flex", alignItems: "center", gap: 5 }}><Sparkles size={13} strokeWidth={1.8} />AI SALAH</div>
                <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7, whiteSpace: "pre-wrap" }}>{aiAdvice}</div>
              </GlassCard>
            )}
          </div>
        )}

        {tab === "schemes" && (
          <div>
            <div style={{ marginBottom: 20, fontSize: 14, color: "var(--text-3)", lineHeight: 1.7 }}>
              Yeh sarkari schemes aapke liye hain · <strong style={{ color: "#00E676" }}>bilkul free</strong>. ASHA worker ya Anganwadi se apply karein.
            </div>
            {SCHEMES.map((scheme, i) => (
              <GlassCard key={i} accent="#00E676" lift={false} style={{ padding: 22, marginBottom: 12 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 8 }}>{scheme.name}</div>
                <div style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.15)", borderRadius: 10, padding: "10px 14px", marginBottom: 10 }}>
                  <span style={{ fontSize: 12, color: "#00E676", fontFamily: "var(--font-mono)", display: "inline-flex", alignItems: "center", gap: 4, verticalAlign: "middle" }}><IndianRupee size={13} strokeWidth={1.8} />BENEFIT: </span>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>{scheme.benefit}</span>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-3)", lineHeight: 1.6, display: "flex", alignItems: "flex-start", gap: 6 }}><FileText size={13} strokeWidth={1.8} style={{ flexShrink: 0, marginTop: 2 }} /><span>Kaise apply karein: {scheme.how}</span></div>
              </GlassCard>
            ))}
            <button onClick={() => router.push("/chat")} style={{ width: "100%", background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "14px", color: "#04060D", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
              <Sparkles size={16} strokeWidth={1.8} />AI Se Scheme Ke Baare Mein Poochhein
            </button>
          </div>
        )}

        {tab === "danger" && (
          <div>
            <GlassCard accent="#FF4757" lift={false} style={{ padding: 22, marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#FF4757", marginBottom: 16, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: 8 }}><Siren size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />IN Signs Pe TURANT 102 Call Karein</div>
              {["Bahut zyada bleeding · paani ki tarah beh raha ho", "Severe pet mein dard · ruk ruk ke ya lagaataar", "Baby ki movements bilkul band ho gayi hain", "Aankhon ke aage andhera ya double vision", "Face, haath, pair mein severe swelling", "Tej bukhaar 103°F se zyada", "Water break · liquid beh raha ho", "Severe sar dard jo band hi nahi ho raha"].map((sign, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                  <span style={{ color: "#FF4757", flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>{sign}
                </div>
              ))}
              <a href="tel:102" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 16, background: "rgba(255,71,87,0.9)", border: "none", borderRadius: 100, padding: "14px", textAlign: "center", color: "#fff", fontWeight: 800, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 16, boxShadow: "0 0 24px rgba(255,71,87,0.3)" }}><Phone size={18} strokeWidth={1.8} />102 ABHI CALL KAREIN · FREE</a>
            </GlassCard>
            <GlassCard accent="#fbbf24" lift={false} style={{ padding: 22 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#fbbf24", marginBottom: 12, fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: 8 }}><AlertTriangle size={18} strokeWidth={1.8} style={{ flexShrink: 0 }} />Yeh Signs Pe Aaj Doctor Se Milein</div>
              {["Halki bleeding ya brownish discharge", "Bahut zyada ulti · kuch bhi haazam nahi ho raha", "UTI ke signs · peeshab mein jalan ya baar baar aana", "Back pain jo zyada badh rahi ho", "Baby bump growth ruk gayi lagti ho"].map((sign, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: 8, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                  <span style={{ color: "#fbbf24", flexShrink: 0 }}>•</span>{sign}
                </div>
              ))}
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  );
}
