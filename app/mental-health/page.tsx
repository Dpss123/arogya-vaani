"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Frown, Activity, HeartPulse, Wheat, Brain, Check, Siren, Bot, Phone, type LucideIcon } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";

type Opt = { label: string; value: number };
type Q = { text: string; options: Opt[] };
type Band = { max: number; level: string; advice: string; helpline: boolean };
type Helpline = { name: string; num: string; sub: string };
type Screener = {
  key: string;
  label: string;
  kind: string;
  Icon: LucideIcon;
  intro: string;
  maxScore: number;
  questions: Q[];
  bands: Band[];
  crisisIndex?: number; // answering > 0 here forces a helpline
  helplines: Helpline[];
};

// Standard 4-point frequency options (PHQ-9 / GAD-7 / farmer screen).
const FREQ: Opt[] = [
  { label: "Bilkul nahi", value: 0 },
  { label: "Kuch din", value: 1 },
  { label: "Aadhe se zyada din", value: 2 },
  { label: "Lagbhag har roz", value: 3 },
];
const q = (text: string): Q => ({ text, options: FREQ });
const o = (pairs: [string, number][]): Opt[] => pairs.map(([label, value]) => ({ label, value }));

const MENTAL_HELP: Helpline[] = [
  { name: "iCall (TISS)", num: "9152987821", sub: "Hindi mein" },
  { name: "Vandrevala Foundation", num: "1860-2662-345", sub: "24/7 free" },
  { name: "KIRAN (Govt)", num: "1800-599-0019", sub: "24/7 free" },
];
const FARMER_HELP: Helpline[] = [
  { name: "Kisan Call Center", num: "1800-180-1551", sub: "Kheti + support" },
  { name: "KIRAN Mental Health", num: "1800-599-0019", sub: "24/7 free" },
  { name: "Vandrevala", num: "1860-2662-345", sub: "24/7" },
];

const SCREENERS: Screener[] = [
  {
    key: "phq9", label: "Depression (PHQ-9)", kind: "Depression", Icon: Frown, maxScore: 27, crisisIndex: 8, helplines: MENTAL_HELP,
    intro: "PHQ-9 · clinically validated depression screening. 9 sawal, 2 minute. Bilkul private.",
    questions: [
      "Kaam mein aur kisi cheez mein bilkul mann nahi laga?",
      "Udaas, nirash, ya bekar feel kiya?",
      "Neend bahut kam ya bahut zyada aayi?",
      "Thakaan feel ki ya energy nahi rahi?",
      "Khaana bahut kam ya zyada khaya?",
      "Khud ke baare mein bura feel kiya · main failure hoon?",
      "Concentration mein mushkil · padhne/TV dekhne mein?",
      "Itna slow ya fast move kiya ki doosron ne notice kiya?",
      "Aisa socha ki kaash main mar jaata, ya khud ko hurt karoon?",
    ].map(q),
    bands: [
      { max: 4, level: "Minimal", helpline: false, advice: "Aap theek hain. Apna khayal rakhein, sote rehein, exercise karein aur doston se baat karte rehein." },
      { max: 9, level: "Mild", helpline: false, advice: "Thodi depression ke signs hain. Trusted insaan se baat karein, routine aur exercise madadgar hogi. 2 hafte mein improvement na ho toh doctor se milein." },
      { max: 14, level: "Moderate", helpline: true, advice: "Depression ke clear signs hain. Doctor ya counsellor se milna zaroori hai. Aap akele nahi hain · help lena strength hai." },
      { max: 19, level: "Moderately Severe", helpline: true, advice: "Significant depression hai. Aaj hi doctor se milein. Helpline pe call karein · free aur Hindi mein." },
      { max: 27, level: "Severe", helpline: true, advice: "Severe depression ke signs hain. Aaj hi help lein · doctor ya helpline. Aap valuable hain." },
    ],
  },
  {
    key: "gad7", label: "Anxiety (GAD-7)", kind: "Anxiety", Icon: Activity, maxScore: 21, helplines: MENTAL_HELP,
    intro: "GAD-7 · clinically validated anxiety screening. 7 sawal, 2 minute. Bilkul private.",
    questions: [
      "Nervous, anxious ya on-edge feel kiya?",
      "Apni chinta ko control karna mushkil laga?",
      "Alag alag cheezon ki bahut zyada chinta ki?",
      "Relax karna mushkil laga?",
      "Itna bechain ki ek jagah baithna mushkil ho gaya?",
      "Aasani se chid-chid ya irritate ho gaye?",
      "Aisa dar laga jaise kuch bura hone wala hai?",
    ].map(q),
    bands: [
      { max: 4, level: "Minimal", helpline: false, advice: "Aapki anxiety minimal hai. Deep breathing aur achhi neend se aur behtar feel karenge." },
      { max: 9, level: "Mild", helpline: false, advice: "Halki anxiety hai. Roz 10 min breathing karein, caffeine kum karein, trusted insaan se baat karein." },
      { max: 14, level: "Moderate", helpline: true, advice: "Moderate anxiety hai. Counsellor ya doctor se milna madadgar hoga. Aap akele nahi hain." },
      { max: 21, level: "Severe", helpline: true, advice: "Severe anxiety ke signs hain. Aaj hi professional help lein ya helpline call karein. Yeh treatable hai." },
    ],
  },
  {
    key: "epds", label: "Maternal (PPD)", kind: "Postpartum", Icon: HeartPulse, maxScore: 30, crisisIndex: 9, helplines: MENTAL_HELP,
    intro: "EPDS · naye maa banne ke baad ki depression (postpartum) ki validated screening. 10 sawal.",
    questions: [
      { text: "Main hass paayi aur cheezon ka majedaar pehlu dekh paayi", options: o([["Jitna hamesha", 0], ["Utna nahi ab", 1], ["Bilkul kam", 2], ["Bilkul nahi", 3]]) },
      { text: "Main cheezon ka intezaar khushi se karti rahi", options: o([["Jitna pehle", 0], ["Thoda kam", 1], ["Kaafi kam", 2], ["Bilkul nahi", 3]]) },
      { text: "Kuch galat hua toh maine bina wajah khud ko dosh diya", options: o([["Haan zyadatar", 3], ["Haan kabhi-kabhi", 2], ["Zyada nahi", 1], ["Nahi kabhi nahi", 0]]) },
      { text: "Main bina wajah pareshan ya chintit rahi", options: o([["Bilkul nahi", 0], ["Shayad kabhi", 1], ["Haan kabhi-kabhi", 2], ["Haan bahut", 3]]) },
      { text: "Main bina wajah darri ya ghabraai", options: o([["Haan kaafi", 3], ["Haan kabhi-kabhi", 2], ["Zyada nahi", 1], ["Bilkul nahi", 0]]) },
      { text: "Cheezein mujh par haavi ho rahi thi", options: o([["Haan, sambhal nahi paayi", 3], ["Haan kabhi sambhal nahi paayi", 2], ["Nahi, zyadatar sambhal liya", 1], ["Nahi, hamesha ki tarah", 0]]) },
      { text: "Main itni dukhi thi ki neend mein takleef hui", options: o([["Haan zyadatar", 3], ["Haan kabhi", 2], ["Zyada nahi", 1], ["Bilkul nahi", 0]]) },
      { text: "Main udaas ya bekar mehsoos karti rahi", options: o([["Haan zyadatar", 3], ["Haan kaafi baar", 2], ["Zyada nahi", 1], ["Bilkul nahi", 0]]) },
      { text: "Main itni dukhi thi ki roti rahi", options: o([["Haan zyadatar", 3], ["Haan kaafi baar", 2], ["Sirf kabhi-kabhi", 1], ["Nahi kabhi nahi", 0]]) },
      { text: "Khud ko nuksan pahunchane ka khayal aaya", options: o([["Haan kaafi baar", 3], ["Kabhi-kabhi", 2], ["Shayad kabhi", 1], ["Kabhi nahi", 0]]) },
    ],
    bands: [
      { max: 9, level: "Kam Risk", helpline: false, advice: "Abhi PPD ka khaas risk nahi. Apna aur baby ka khayal rakhein, neend aur support zaroori hai. Koi bhi badlav mehsoos ho toh ASHA worker se baat karein." },
      { max: 12, level: "Possible PPD", helpline: true, advice: "Postpartum depression ke kuch signs hain. ASHA worker aur family se baat karein, doctor/counsellor se milein. Yeh aam hai aur theek ho jaata hai." },
      { max: 30, level: "Likely PPD", helpline: true, advice: "PPD ke clear signs hain. Please jald hi doctor se milein aur helpline pe call karein. Aap acchi maa hain · yeh ek bimari hai, aapki galti nahi." },
    ],
  },
  {
    key: "farmer", label: "Kisan Stress", kind: "Stress", Icon: Wheat, maxScore: 18, crisisIndex: 5, helplines: FARMER_HELP,
    intro: "Kisan/financial stress support check. Yeh validated test nahi · sirf aapki pareshani samajhne aur sahi madad jodne ke liye.",
    questions: [
      "Paise ya karz ki chinta se neend nahi aati",
      "Kheti ya income ko lekar tension rehti hai",
      "Aisa lagta hai ki ab koi raasta nahi bacha",
      "Chhoti baat pe gussa ya chid-chid hoti hai",
      "Apni pareshani kisi se share nahi kar paata",
      "Sab khatam karne ka khayal aata hai",
    ].map(q),
    bands: [
      { max: 4, level: "Kam", helpline: false, advice: "Stress kam lag raha hai. Apna khayal rakhein, parivaar se baat karte rehein. Karz ke liye Kisan Call Center (1800-180-1551) se schemes pata karein." },
      { max: 9, level: "Moderate", helpline: true, advice: "Financial stress mehsoos ho raha hai. Akele mat jhelein · Kisan Call Center se debt/scheme madad lein aur kisi trusted insaan ya counsellor se baat karein." },
      { max: 18, level: "High", helpline: true, advice: "Bahut zyada stress ke signs hain. Aaj hi helpline pe baat karein. Karz ka hal hai, par aapki jaan se zyada kuch nahi. Aap akele nahi hain." },
    ],
  },
];

export default function MentalHealthPage() {
  const router = useRouter();
  const [key, setKey] = useState("phq9");
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [result, setResult] = useState<{ score: number; level: string; advice: string; helpline: boolean; crisis: boolean } | null>(null);
  const [aiAdvice, setAiAdvice] = useState<string | null>(null);

  const screener = SCREENERS.find(s => s.key === key)!;
  const questions = screener.questions;

  useEffect(() => {
    if (!result) return;
    fetch("/api/mental-health", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ score: result.score, answers, type: key }),
    })
      .then(r => r.json())
      .then(d => setAiAdvice(d.advice || null))
      .catch(() => {});
  }, [result, answers, key]);

  const handleAnswer = (val: number) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    if (current + 1 >= questions.length) {
      const score = newAnswers.reduce((a, b) => a + b, 0);
      const band = screener.bands.find(b => score <= b.max) || screener.bands[screener.bands.length - 1];
      const crisis = screener.crisisIndex !== undefined && (newAnswers[screener.crisisIndex] || 0) > 0;
      // An endorsed self-harm item must escalate the headline/advice, not just
      // append a helpline · never show a reassuring "you're fine" badge.
      setResult({
        score,
        level: crisis ? "High Risk" : band.level,
        advice: crisis
          ? "Aapne khud ko nuksan ka khayal bataya · yeh serious hai. Please ABHI neeche di gayi helpline pe baat karein. Aap akele nahi hain aur yeh theek ho sakta hai."
          : band.advice,
        helpline: band.helpline || crisis,
        crisis,
      });
    } else {
      setCurrent(prev => prev + 1);
    }
  };

  const reset = () => { setStarted(false); setCurrent(0); setAnswers([]); setResult(null); setAiAdvice(null); };

  const levelColors: Record<string, string> = {
    Minimal: "#00E676", "Kam Risk": "#00E676", Kam: "#00E676", Mild: "#00B4D8",
    Moderate: "#fbbf24", "Possible PPD": "#fbbf24", "Moderately Severe": "#f97316",
    High: "#FF4757", "High Risk": "#FF4757", Severe: "#FF4757", "Likely PPD": "#FF4757",
  };
  const lc = levelColors[result?.level || ""] || "#00B4D8";

  // ── START ──
  if (!started) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}><Brain size={14} color="var(--text-3)" strokeWidth={1.8} />Mental Health Check</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>Apna Mann Check Karein</h1>
          </div>
        </div>
        <p style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 22 }}>Free, private screening. Apna test chunein:</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
          {SCREENERS.map(s => (
            <button key={s.key} onClick={() => setKey(s.key)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", borderRadius: 16, border: `1px solid ${key === s.key ? "rgba(0,230,118,0.4)" : "var(--border)"}`, background: key === s.key ? "rgba(0,230,118,0.08)" : "rgba(255,255,255,0.025)", cursor: "pointer", textAlign: "left", fontFamily: "var(--font-body)" }}>
              <s.Icon size={26} color="#00E676" strokeWidth={1.8} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>{s.label}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.5, marginTop: 2 }}>{s.intro}</div>
              </div>
              {key === s.key && <Check size={18} color="#00E676" strokeWidth={2.2} />}
            </button>
          ))}
        </div>
        <button onClick={() => { setStarted(true); setCurrent(0); setAnswers([]); setResult(null); setAiAdvice(null); }} style={{ width: "100%", background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "16px", fontSize: 16, fontWeight: 600, color: "#04060D", cursor: "pointer", fontFamily: "var(--font-body)" }}>Shuru Karein →</button>
        <p style={{ marginTop: 16, fontSize: 12, color: "var(--text-3)", lineHeight: 1.6, textAlign: "center" }}>Crisis mein hain? Turant: <strong style={{ color: "#FF4757" }}>KIRAN 1800-599-0019</strong> (24/7 free)</p>
      </div>
    </div>
  );

  // ── RESULT ──
  if (result) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}><screener.Icon size={14} color="var(--text-3)" strokeWidth={1.8} />{screener.label}</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>Aapka Result</h1>
        </div>
        <GlassCard accent={lc} lift={false} style={{ padding: 32, textAlign: "center", marginBottom: 20 }}>
          <div style={{ fontSize: 52, fontWeight: 900, color: lc, fontFamily: "var(--font-display)", letterSpacing: "-0.04em", marginBottom: 8 }}>{result.score}<span style={{ fontSize: 24 }}>/{screener.maxScore}</span></div>
          <div style={{ fontSize: 20, fontWeight: 700, color: lc, marginBottom: 16 }}>{result.level} {screener.kind}</div>
          <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75 }}>{result.advice}</div>
        </GlassCard>
        {result.crisis && (
          <GlassCard accent="#FF4757" lift={false} style={{ padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 700, color: "#FF4757", marginBottom: 6 }}><Siren size={15} color="#FF4757" strokeWidth={1.8} />Aap akele nahi hain</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7 }}>Aapne khud ko nuksan ka khayal bataya. Please ABHI kisi se baat karein · neeche helpline pe call karein, yeh free aur confidential hai.</div>
          </GlassCard>
        )}
        {aiAdvice && (
          <GlassCard accent="#00B4D8" lift={false} style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "#00B4D8", marginBottom: 10, fontFamily: "var(--font-mono)", letterSpacing: "0.06em" }}><Bot size={14} color="#00B4D8" strokeWidth={1.8} />AI KI PERSONALISED SALAH</div>
            <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{aiAdvice}</div>
          </GlassCard>
        )}
        {result.helpline && (
          <GlassCard accent="#FF4757" lift={false} style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, fontWeight: 600, color: "#FF4757", marginBottom: 12 }}><Phone size={15} color="#FF4757" strokeWidth={1.8} />Free Helplines · Abhi Call Karein</div>
            {screener.helplines.map(h => (
              <a key={h.num} href={`tel:${h.num.replace(/-/g, "")}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,71,87,0.1)", textDecoration: "none" }}>
                <div><div style={{ fontSize: 13, color: "#F0F4FF" }}>{h.name}</div><div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{h.sub}</div></div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#FF4757" }}>{h.num}</div>
              </a>
            ))}
          </GlassCard>
        )}
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={reset} style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "var(--text-2)", cursor: "pointer", fontFamily: "var(--font-body)" }}>Dobara Lein</button>
          <button onClick={() => router.push("/chat")} style={{ flex: 1, background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px", color: "#04060D", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>Chat Karein</button>
        </div>
      </div>
    </div>
  );

  // ── QUESTIONS ──
  const progress = (current / Math.max(1, questions.length - 1)) * 100;
  const opts = questions[current].options;
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}><screener.Icon size={14} color="var(--text-3)" strokeWidth={1.8} />Sawaal {current + 1} / {questions.length}</span>
          <span style={{ fontSize: 13, color: "#00E676", fontFamily: "var(--font-mono)" }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden", marginBottom: 40 }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#00E676,#00C4FF)", borderRadius: 4, transition: "width 0.4s ease" }} />
        </div>
        <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 20 }}>
          {key === "epds" ? "PICHLE 7 DIN MEIN..." : "PICHLE 2 HAFTE MEIN..."}
        </div>
        <h2 style={{ fontSize: "clamp(22px,3vw,28px)", fontWeight: 800, color: "#F0F4FF", fontFamily: "var(--font-display)", lineHeight: 1.45, marginBottom: 36, letterSpacing: "-0.025em" }}>{questions[current].text}</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {opts.map((opt, i) => (
            <button key={i} onClick={() => handleAnswer(opt.value)} style={{ padding: "16px 20px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 14, color: "#F0F4FF", fontSize: 15, cursor: "pointer", fontFamily: "var(--font-body)", textAlign: "left", transition: "all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(0,230,118,0.06)"; e.currentTarget.style.borderColor = "rgba(0,230,118,0.2)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "var(--border)"; }}
            >{opt.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
