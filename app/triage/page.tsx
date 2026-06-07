"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import GlassCard from "@/components/ui/GlassCard";
import { Smile, Stethoscope, Siren, AlertTriangle, Clock } from "lucide-react";
import BackButton from "@/components/ui/BackButton";

type TriageData = {
  verdict: "rest" | "clinic" | "emergency";
  urgency_color: "green" | "yellow" | "red";
  hindi_advice: string;
  english_advice: string;
  warning_signs: string[];
  call_108: boolean;
  see_doctor_within: string;
};

function TriageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const symptoms = searchParams.get("symptoms") || "";
  const [triage, setTriage] = useState<TriageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<string[] | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!symptoms) { router.push("/chat"); return; }
    fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.needsFollowup && data.questions?.length) {
          setQuestions(data.questions);
          setAnswers(new Array(data.questions.length).fill(""));
        } else if (data.verdict) {
          setTriage(data);
        } else {
          setTriage(null); // error / bad payload → show the error fallback
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symptoms, router]);

  const submitAnswers = () => {
    if (!questions) return;
    setSubmitting(true);
    fetch("/api/triage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symptoms, answers: questions.map((q, i) => `${q}: ${answers[i] || "(jawab nahi diya)"}`) }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.needsFollowup && data.questions?.length) {
          // Model still wants clarification · show the new questions.
          setQuestions(data.questions);
          setAnswers(new Array(data.questions.length).fill(""));
        } else if (data.verdict) {
          setTriage(data); setQuestions(null);
        } else {
          setQuestions(null); setTriage(null); // error → fallback
        }
      })
      .catch(() => { setQuestions(null); setTriage(null); })
      .finally(() => setSubmitting(false));
  };

  const colors = { green: "#00E676", yellow: "#fbbf24", red: "#FF4757" };
  const labels = { rest: "Ghar Pe Aaram Karein", clinic: "Aaj Clinic Jayein", emergency: "TURANT 108 CALL KAREIN" };

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#06090f", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
      <div style={{ width: 48, height: 48, border: "3px solid rgba(0,230,118,0.2)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
      <p style={{ color: "var(--text-3)", fontFamily: "var(--font-mono)", fontSize: 13 }}>AI triage kar raha hai...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (questions) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Triage</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "4px 0 0" }}>Kuch Aur Batayein</h1>
          </div>
        </div>
        <GlassCard accent="#00E676" lift={false} style={{ padding: 24 }}>
          <div style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.7, marginBottom: 20 }}>Sahi salah ke liye AI ko 1-2 baatein aur jaanni hain:</div>
          {questions.map((q, i) => (
            <div key={i} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 14, color: "#F0F4FF", marginBottom: 8 }}>{q}</div>
              <input value={answers[i] || ""} onChange={e => { const a = [...answers]; a[i] = e.target.value; setAnswers(a); }} placeholder="Aapka jawab..." style={{ width: "100%", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)", outline: "none" }} />
            </div>
          ))}
          <button onClick={submitAnswers} disabled={submitting} style={{ width: "100%", marginTop: 8, background: submitting ? "rgba(255,255,255,0.025)" : "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "15px", color: submitting ? "var(--text-3)" : "#04060D", fontSize: 15, fontWeight: 600, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "var(--font-body)" }}>
            {submitting ? "AI soch raha hai..." : "Aage Badho → Triage Dekho"}
          </button>
        </GlassCard>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!triage) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ color: "var(--text-3)", marginBottom: 16 }}>Kuch problem aayi.</p>
        <button onClick={() => router.push("/chat")} style={{ background: "linear-gradient(135deg,#00E676,#00C4FF)", color: "#04060D", border: "none", padding: "12px 24px", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: 600 }}>Wapis Jao</button>
      </div>
    </div>
  );

  const c = triage.urgency_color;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>

        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>AI Triage</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "4px 0 0" }}>Triage Result</h1>
          </div>
        </div>

        {/* MAIN VERDICT */}
        <GlassCard accent={colors[c]} lift={false} style={{ padding: 32, textAlign: "center", marginBottom: 16, animation: "fadeUp 0.5s ease forwards" }}>
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            {c === "green"
              ? <Smile size={56} color={colors[c]} strokeWidth={1.8} />
              : c === "yellow"
                ? <Stethoscope size={56} color={colors[c]} strokeWidth={1.8} />
                : <Siren size={56} color={colors[c]} strokeWidth={1.8} />}
          </div>
          <div style={{ fontSize: 22, fontWeight: 800, color: colors[c], fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 12 }}>
            {labels[triage.verdict]}
          </div>
          <div style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75 }}>
            {triage.hindi_advice}
          </div>
        </GlassCard>

        {/* SYMPTOMS */}
        <GlassCard accent="#00C4FF" lift={false} style={{ padding: 20, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.08em", marginBottom: 8 }}>AAPKE SYMPTOMS</div>
          <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.6, fontStyle: "italic" }}>&quot;{symptoms}&quot;</div>
        </GlassCard>

        {/* WARNING SIGNS */}
        {triage.warning_signs?.length > 0 && (
          <GlassCard accent="#fbbf24" lift={false} style={{ padding: 20, marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#fbbf24", letterSpacing: "0.08em", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><AlertTriangle size={14} color="#fbbf24" strokeWidth={1.8} />IN SIGNS PE DHYAN DEIN</div>
            {triage.warning_signs.map((sign, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--text-2)" }}>
                <span style={{ color: "#fbbf24", flexShrink: 0 }}>•</span>{sign}
              </div>
            ))}
          </GlassCard>
        )}

        {/* DOCTOR TIMING */}
        <GlassCard accent={colors[c]} lift={false} style={{ padding: 18, marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", flexShrink: 0 }}><Clock size={28} color={colors[c]} strokeWidth={1.8} /></div>
          <div>
            <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 4 }}>DOCTOR SE MILEIN</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: colors[c] }}>
              {triage.see_doctor_within === "today" ? "Aaj hi" : triage.see_doctor_within === "24hours" ? "24 ghante mein" : triage.see_doctor_within === "week" ? "Is hafte mein" : "Zaroorat nahi · ghar pe aaram"}
            </div>
          </div>
        </GlassCard>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {(triage.call_108 || triage.verdict === "emergency" || triage.urgency_color === "red") && (
            <a href="tel:108" style={{ display: "block", background: "rgba(255,71,87,0.9)", border: "none", borderRadius: 100, padding: "16px", textAlign: "center", textDecoration: "none", color: "#fff", fontSize: 18, fontWeight: 800, fontFamily: "var(--font-body)", boxShadow: "0 0 32px rgba(255,71,87,0.4)" }}>
              🚨 108 ABHI CALL KAREIN
            </a>
          )}
          <button onClick={() => router.push("/doctors")} style={{ background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "14px", color: "#04060D", fontSize: 15, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            📍 Nearest Doctor Dhundho
          </button>
          <button onClick={() => router.push("/chat")} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "14px", color: "var(--text-2)", fontSize: 14, cursor: "pointer", fontFamily: "var(--font-body)" }}>
            💬 Aur Sawaal Poochhein
          </button>
        </div>

        <div style={{ marginTop: 20, padding: "14px 18px", background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--text-3)", textAlign: "center", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>
          ⚠️ YEH AI TRIAGE HAI · FINAL DIAGNOSIS KE LIYE DOCTOR SE MILEIN
        </div>
      </div>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

export default function TriagePage() {
  return <Suspense fallback={<div style={{minHeight:"100vh",background:"#06090f"}} />}><TriageContent /></Suspense>;
}
