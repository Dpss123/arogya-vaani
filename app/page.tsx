"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import FeatureCard from "@/components/ui/FeatureCard";
import GlassCard from "@/components/ui/GlassCard";
import Counter from "@/components/ui/Counter";
import Marquee from "@/components/ui/Marquee";
import Reveal from "@/components/ui/Reveal";
import Badge from "@/components/ui/Badge";
import Cursor from "@/components/ui/Cursor";
import Hero3D from "@/components/ui/Hero3D";
import Logo from "@/components/Logo";
import {
  Stethoscope, FileText, Scan, ScanFace, Eye, Pill, Brain, Baby,
  Activity, Utensils, Landmark, HeartHandshake,
  Dna, Microscope, Smile, MapPin, Siren, Globe, Sparkles,
} from "lucide-react";

// WhatsApp number for the "Chat on WhatsApp" CTA. Meta TEST number for now —
// replace with your real business number on public launch (digits only, with country code).
const WA_NUMBER = "15556533744";

const SERVICES = [
  { icon: <Stethoscope size={28} strokeWidth={1.7} color="#00E676" />, title: "Symptom Triage", body: "Hindi/voice symptoms se multi-turn AI, 3-level verdict: ghar pe aaram / clinic / 108. Emergency keywords short-circuit instantly.", tags: ["Multi-turn", "Voice", "Safe"], accent: "#00E676" },
  { icon: <FileText size={28} strokeWidth={1.7} color="#00B4D8" />, title: "Report Reader", body: "Blood test, X-ray, MRI photo upload. AI har value simple bhasha mein explain karta hai, urgent values flag karta hai.", tags: ["Vision AI", "12 Langs"], accent: "#00B4D8" },
  { icon: <Scan size={28} strokeWidth={1.7} color="#3b82f6" />, title: "Chest X-Ray AI", body: "Trained CheXNet model (DenseNet), 18 findings flag karta hai. Real ML, live on Hugging Face.", tags: ["Trained Model", "Live"], accent: "#3b82f6" },
  { icon: <ScanFace size={28} strokeWidth={1.7} color="#f43f5e" />, title: "Skin Diagnostics", body: "Trained HAM10000 ViT, 7 lesion types incl. melanoma. Cancer-class par dermatologist escalation.", tags: ["HAM10000", "Live"], accent: "#f43f5e" },
  { icon: <Eye size={28} strokeWidth={1.7} color="#818cf8" />, title: "Eye DR AI", body: "Trained fundus model, 5 diabetic-retinopathy grades. Fundus image se screening.", tags: ["Trained Model", "Fundus"], accent: "#818cf8" },
  { icon: <Pill size={28} strokeWidth={1.7} color="#a78bfa" />, title: "Medicine + Generic", body: "Medicine identify, interaction check, aur Jan Aushadhi sasta generic alternative dhundho.", tags: ["Interaction", "Jan Aushadhi"], accent: "#a78bfa" },
  { icon: <Brain size={28} strokeWidth={1.7} color="#f97316" />, title: "Mental Health", body: "PHQ-9, GAD-7, EPDS (maternal PPD), aur kisan-stress screeners. Crisis par turant helpline.", tags: ["4 Screeners", "Crisis-safe"], accent: "#f97316" },
  { icon: <Baby size={28} strokeWidth={1.7} color="#ec4899" />, title: "Pregnancy + Child", body: "Week-by-week guidance, danger signs, JSY scheme. Plus WHO child-growth (stunting/wasting) check.", tags: ["JSY", "WHO Growth"], accent: "#ec4899" },
  { icon: <Activity size={28} strokeWidth={1.7} color="#ef4444" />, title: "Outbreak Detection", body: "Ek PIN code mein same-symptom cluster, AI flag, District Health Officer alert + heatmap.", tags: ["PIN Cluster", "DHO Alert"], accent: "#ef4444" },
  { icon: <Utensils size={28} strokeWidth={1.7} color="#34d399" />, title: "Thali Nutrition", body: "Khaane ki photo se calories, protein, iron ka estimate aur sasta local substitute.", tags: ["Food Vision"], accent: "#34d399" },
  { icon: <Landmark size={28} strokeWidth={1.7} color="#22c55e" />, title: "Scheme Navigator", body: "AI har govt health scheme dhundh deta hai jo aap qualify karte ho: Ayushman, JSY, dialysis.", tags: ["Auto-Eligibility"], accent: "#22c55e" },
  { icon: <HeartHandshake size={28} strokeWidth={1.7} color="#00B4D8" />, title: "ASHA + Doctor Tools", body: "ASHA ke liye visit checklists + vaccination schedule. Doctor ke liye 60-sec AI patient brief.", tags: ["Checklists", "AI Brief"], accent: "#00B4D8" },
];

const TECH = [
  ["Gemini 2.5 Flash", "AI brain"],
  ["Groq LLaMA", "Free fallback"],
  ["Whisper v3", "Hindi voice"],
  ["Meta WhatsApp", "The last mile"],
  ["Hugging Face", "4 trained models"],
  ["Supabase", "Health data"],
  ["Next.js + Vercel", "Edge frontend"],
];

const ROADMAP = [
  { tag: "LIVE NOW", color: "#00E676", title: "Full platform + 4 trained ML models", body: "Triage, report reader, X-ray/skin/eye/dental AI, mental health, child growth, outbreak · all working, free." },
  { tag: "NEXT", color: "#00C4FF", title: "WhatsApp bot at scale + pilots", body: "Voice triage live for villages in Haridwar. Doctor dashboard pilots. Real-user data." },
  { tag: "FUTURE", color: "#818cf8", title: "More trained diagnostics + ABDM", body: "TB-specific X-ray model, ECG (with hardware), ABHA integration once govt access is granted." },
  { tag: "VISION", color: "#FF9500", title: "National rural health infrastructure", body: "Federated learning across villages, insurance partners, IoT kiosks · the funded roadmap." },
];

export default function Landing() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ background: "var(--bg)", color: "var(--cream)", minHeight: "100vh", overflowX: "hidden" }}>
      <Cursor />

      {/* NAV */}
      <nav className="glass" style={{
        position: "fixed", top: 20, left: "50%", transform: "translateX(-50%)", zIndex: 200,
        width: "min(940px, 92vw)", borderRadius: 100, padding: "10px 12px 10px 22px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderColor: scrolled ? "rgba(0,230,118,0.25)" : "var(--border)",
        boxShadow: scrolled ? "0 8px 40px rgba(0,230,118,0.08)" : "none",
      }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Logo size={27} withText textSize={17} />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 26 }}>
          {[["Services", "#services"], ["Platform", "#platform"], ["Impact", "#impact"], ["Tech", "#tech"]].map(([l, h]) => (
            <a key={l} href={h} style={{ fontSize: 13, color: "var(--text-2)", textDecoration: "none", display: "none" }} className="nav-link">{l}</a>
          ))}
          <button onClick={() => router.push("/login")} style={{ background: "transparent", border: "none", color: "var(--text-2)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}>Login</button>
          <button onClick={() => router.push("/home")} style={{ background: "linear-gradient(135deg,#00E676,#00C4FF)", color: "#04060D", border: "none", borderRadius: 100, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>Start Free →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", padding: "96px 6vw 44px" }}>
        <div className="grid-bg" style={{ position: "absolute", inset: 0, opacity: 0.6, maskImage: "radial-gradient(ellipse at center, black, transparent 75%)" }} />
        <div style={{ position: "absolute", top: "10%", right: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,196,255,0.07), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "5%", left: "-5%", width: 500, height: 500, background: "radial-gradient(circle, rgba(0,230,118,0.06), transparent 70%)", pointerEvents: "none" }} />
        <div className="aurora-wrap"><div className="aurora-blob b1" /><div className="aurora-blob b2" /></div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: 40, width: "100%", maxWidth: 1320, margin: "0 auto", alignItems: "center" }} className="hero-grid">
          <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ marginBottom: 20 }}>
              <Badge>● LIVE · 4 TRAINED ML MODELS · FREE FOREVER</Badge>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.8, delay: 0.1 }}
              style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "clamp(42px, 6vw, 90px)", lineHeight: 0.99, letterSpacing: "-0.04em", margin: 0 }}
            >
              The Doctor<br />For Every<br /><span className="shimmer-text">Indian.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}
              style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "clamp(17px,1.8vw,21px)", color: "var(--text-2)", lineHeight: 1.5, maxWidth: 460, margin: "20px 0 30px" }}>
              One WhatsApp message. Any Indian language. Every healthcare service. Free, forever.
            </motion.p>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.45 }} style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Button onClick={() => router.push("/home")}>Get Started Free →</Button>
              <Button onClick={() => window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent("menu")}`, "_blank")} style={{ background: "#25D366", color: "#04060D" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" style={{ flexShrink: 0 }}><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2Zm0 18.15h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.11.82.83-3.04-.2-.31a8.18 8.18 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.24c0 4.54-3.7 8.24-8.25 8.24Zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.16-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.4-.42-.56-.43-.14 0-.31-.01-.48-.01-.17 0-.43.06-.66.31-.23.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.25 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29Z"/></svg>
                Chat on WhatsApp
              </Button>
            </motion.div>
          </div>

          {/* 3D / glow */}
          <div style={{ position: "relative", height: 520, display: "flex", alignItems: "center", justifyContent: "center" }} className="hero-3d">
            <div style={{ position: "absolute", width: 360, height: 360, background: "radial-gradient(circle, rgba(0,230,118,0.18), transparent 65%)", filter: "blur(20px)" }} />
            <div style={{ position: "absolute", inset: 0 }}><Hero3D /></div>
            {/* CSS fallback ring (visible on mobile where 3D is skipped) */}
            <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", border: "1px solid rgba(0,230,118,0.25)", animation: "glowpulse 3s infinite" }} />
          </div>
        </div>
      </section>

      {/* STATS — below the fold, animate on scroll */}
      <section style={{ borderTop: "1px solid var(--border)", padding: "32px 6vw" }}>
        <div className="m-gap-sm" style={{ maxWidth: 1320, margin: "0 auto", display: "flex", gap: 52, flexWrap: "wrap" }}>
          {[["700", "M+", "Rural Indians unreached"], ["12", "", "Indian languages"], ["4", "", "Trained ML models"], ["0", "", "Cost to patient (₹)"]].map(([n, s, l]) => (
            <div key={l}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 34, fontWeight: 800, color: "#00E676", letterSpacing: "-0.03em" }}>
                <Counter to={Number(n)} suffix={s} />
              </div>
              <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4, letterSpacing: "0.04em" }}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TICKER */}
      <Marquee items={[
        "SYMPTOM TRIAGE", "REPORT READER", "CHEST X-RAY AI", "SKIN DIAGNOSTICS", "EYE DR AI",
        "DENTAL AI", "MENTAL HEALTH", "PREGNANCY + GROWTH", "OUTBREAK DETECTION", "GOVT SCHEMES",
        "MEDICINE + GENERIC", "CHILD GROWTH (WHO)", "12 INDIAN LANGUAGES",
      ]} />

      {/* PLATFORM / BENTO */}
      <section id="platform" style={{ padding: "110px 6vw", maxWidth: 1320, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#00E676", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18 }}>The Platform</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px,4.2vw,58px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
            Every healthcare service.<br /><span style={{ color: "var(--text-3)" }}>One conversation.</span>
          </h2>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: 16, marginTop: 48 }} className="bento">
          {/* AI Diagnostics · 4 trained models */}
          <GlassCard accent="#00E676" glow style={{ gridColumn: "span 7", padding: 28, minHeight: 260 }}>
            <Badge><Dna size={14} strokeWidth={1.8} /> AI DIAGNOSTICS ENGINE</Badge>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, margin: "16px 0 6px" }}>4 real trained models. Live.</div>
            <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 20, lineHeight: 1.6 }}>Not just an LLM · actual CNNs/ViTs deployed on Hugging Face, with Gemini→Groq fallback.</div>
            {([[Scan, "Chest X-Ray", "DenseNet · 18 findings", "#3b82f6"], [Microscope, "Skin", "HAM10000 ViT · 7 classes", "#f43f5e"], [Eye, "Eye DR", "Fundus ViT · 5 grades", "#818cf8"], [Smile, "Dental", "ViT · 7 conditions", "#ec4899"]] as const).map(([Ic, n, d, c], i) => (
              <div key={n} style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 11 }}>
                <span style={{ fontSize: 13, width: 130, color: "#F0F4FF", display: "flex", alignItems: "center", gap: 7 }}><Ic size={15} strokeWidth={1.8} color={c} />{n}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                  <motion.div initial={{ width: 0 }} whileInView={{ width: ["72%", "88%", "80%", "76%"][i] }} viewport={{ once: true }} transition={{ duration: 1, delay: i * 0.12 }} style={{ height: "100%", background: c as string, borderRadius: 6 }} />
                </div>
                <span style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", width: 130, textAlign: "right" }}>{d}</span>
              </div>
            ))}
          </GlassCard>

          {/* Coverage */}
          <GlassCard accent="#00C4FF" style={{ gridColumn: "span 5", padding: 28, minHeight: 260, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <Badge accent="#00C4FF"><MapPin size={14} strokeWidth={1.8} /> LIVE COVERAGE</Badge>
            <div style={{ textAlign: "center", padding: "10px 0" }}>
              <div style={{ fontSize: 56 }}>🇮🇳</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, marginTop: 6 }}>Haridwar → Bharat</div>
            </div>
            <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>Built in Uttarakhand for 700M rural Indians · WhatsApp-native, works on 2G, no app install.</div>
          </GlassCard>

          {/* Emergency */}
          <GlassCard accent="#FF4757" style={{ gridColumn: "span 4", padding: 26 }}>
            <Badge accent="#FF4757"><Siren size={14} strokeWidth={1.8} /> EMERGENCY</Badge>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, margin: "14px 0 6px" }}>108 in seconds</div>
            <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6, fontFamily: "var(--font-mono)" }}>AUTO-DETECT → 108 + FAMILY → GPS → FIRST-AID STEPS</div>
          </GlassCard>

          {/* Languages */}
          <GlassCard accent="#00E676" style={{ gridColumn: "span 4", padding: 26 }}>
            <Badge><Globe size={14} strokeWidth={1.8} /> 12 LANGUAGES</Badge>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
              {["हिंदी", "தமிழ்", "বাংলা", "తెలుగు", "मराठी", "ગુજરાતી", "ಕನ್ನಡ", "+5"].map((s, i) => (
                <motion.span key={s} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }} style={{ fontSize: 15, color: "#F0F4FF" }}>{s}</motion.span>
              ))}
            </div>
          </GlassCard>

          {/* Honest trust */}
          <GlassCard accent="#C9A84C" style={{ gridColumn: "span 4", padding: 26 }}>
            <Badge accent="#C9A84C"><Sparkles size={14} strokeWidth={1.8} /> WHY IT&apos;S DIFFERENT</Badge>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 16 }}>
              {["FREE FOREVER", "WHATSAPP-NATIVE", "4 TRAINED MODELS", "MULTI-PROVIDER AI", "REVIEWED + TESTED"].map(t => (
                <span key={t} style={{ fontSize: 10, padding: "4px 9px", borderRadius: 100, background: "rgba(201,168,76,0.1)", color: "#C9A84C", border: "1px solid rgba(201,168,76,0.25)", fontFamily: "var(--font-mono)" }}>{t}</span>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      {/* SERVICES */}
      <section id="services" style={{ padding: "40px 6vw 110px", maxWidth: 1320, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#00E676", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 18 }}>Complete Service Stack</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px,4vw,52px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>
            12 services. <span className="shimmer-text">All on WhatsApp.</span>
          </h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 16, marginTop: 48 }}>
          {SERVICES.map((s, i) => (
            <Reveal key={s.title} delay={(i % 3) * 0.06}>
              <FeatureCard icon={s.icon} title={s.title} body={s.body} tags={s.tags} accent={s.accent} float floatDelay={(i % 6) * 0.4} onClick={() => router.push("/home")} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* IMPACT (cream) */}
      <section id="impact" style={{ background: "#F5F0E8", color: "#080E1F", padding: "110px 6vw" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto" }}>
          <Reveal>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(34px,5vw,76px)", fontWeight: 400, letterSpacing: "-0.02em", lineHeight: 1.05, margin: 0, maxWidth: 700 }}>
              The numbers that demand a new kind of solution.
            </h2>
          </Reveal>
          <div className="m-gap-sm" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: 32, marginTop: 64 }}>
            {[["700", "M+", "Rural Indians without a doctor"], ["600", "M", "Uninsured Indians"], ["50", "B", "India healthtech 2030 ($)"], ["900", "K", "ASHA workers to supercharge"]].map(([n, s, l]) => (
              <Reveal key={l}>
                <div style={{ borderTop: "1px solid rgba(8,14,31,0.12)", paddingTop: 20 }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em", color: "#080E1F" }}>
                    <Counter to={Number(n)} suffix={s} />
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(8,14,31,0.55)", marginTop: 8, lineHeight: 1.5 }}>{l}</div>
                </div>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: 28, fontSize: 12, color: "rgba(8,14,31,0.4)", fontFamily: "var(--font-mono)" }}>Public figures (MoHFW / NITI Aayog / industry reports). Patient counts are illustrative for a pre-launch pilot.</div>
        </div>
      </section>

      {/* STORIES */}
      <section style={{ padding: "110px 6vw", maxWidth: 1320, margin: "0 auto" }}>
        <Reveal>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#00E676", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 8 }}>Representative scenarios · illustrative</div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px,3.5vw,46px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}>What it looks like in a village.</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 16, marginTop: 44 }}>
          {[
            { q: "Pehli baar kisi ne mujhe Hindi mein samjhaya ki meri report mein kya likha hai.", who: "RD", name: "Ramkali Devi, 58", loc: "Jwalapur" },
            { q: "Ab mere paas har patient aane se pehle unka AI brief ready hota hai.", who: "RK", name: "Dr. Rajesh Kumar", loc: "PHC Jwalapur" },
            { q: "Subah 4 baje WhatsApp kiya · jawab aaya, 108 nahi jaana pada.", who: "S", name: "Suresh, farmer", loc: "Manglaur" },
          ].map((t) => (
            <Reveal key={t.name}>
              <GlassCard style={{ padding: 28, height: "100%" }} lift={false}>
                <div style={{ fontFamily: "var(--font-serif)", fontSize: 64, color: "rgba(0,230,118,0.1)", lineHeight: 0.6, height: 30 }}>“</div>
                <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 19, color: "#F0F4FF", lineHeight: 1.55, marginBottom: 24 }}>{t.q}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: "50%", background: "linear-gradient(135deg,#00E676,#00B4D8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#04060D" }}>{t.who}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F4FF" }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t.loc}</div>
                  </div>
                </div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TECH */}
      <section id="tech" style={{ padding: "0 6vw 110px", maxWidth: 1320, margin: "0 auto" }}>
        <Reveal>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,3vw,40px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 36 }}>Built on the frontier of AI.</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px,1fr))", gap: 12 }}>
          {TECH.map((t, i) => (
            <Reveal key={t[0]} delay={(i % 4) * 0.05}>
              <GlassCard style={{ padding: "18px 20px" }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#F0F4FF" }}>{t[0]}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 3 }}>{t[1]}</div>
              </GlassCard>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ROADMAP */}
      <section style={{ padding: "0 6vw 110px", maxWidth: 1320, margin: "0 auto" }}>
        <Reveal><h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px,3vw,40px)", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 44 }}>From project to national platform.</h2></Reveal>
        <div style={{ display: "flex", flexDirection: "column", gap: 14, borderLeft: "1px solid var(--border)", paddingLeft: 28 }}>
          {ROADMAP.map((r) => (
            <Reveal key={r.title}>
              <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", left: -35, top: 4, width: 11, height: 11, borderRadius: "50%", background: r.color, boxShadow: `0 0 12px ${r.color}` }} />
                <Badge accent={r.color}>{r.tag}</Badge>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, margin: "10px 0 5px" }}>{r.title}</div>
                <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.6, maxWidth: 560 }}>{r.body}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: "1px solid transparent", borderImage: "linear-gradient(90deg, transparent, rgba(0,230,118,0.4), transparent) 1", padding: "60px 6vw 40px" }}>
        <div style={{ maxWidth: 1320, margin: "0 auto", display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 40 }} className="footer-grid">
          <div>
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 22, marginBottom: 10 }}>Arogya Vaani</div>
            <div style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 15, color: "var(--text-2)", marginBottom: 16, maxWidth: 320, lineHeight: 1.6 }}>Apni Vaani se, apni sehat. India&apos;s WhatsApp-native health OS.</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["FREE FOREVER", "12 LANGUAGES", "4 ML MODELS", "OPEN"].map(b => (
                <span key={b} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 100, border: "1px solid var(--border)", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{b}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 14, letterSpacing: "0.08em" }}>PLATFORM</div>
            {[["Symptom Triage", "/chat"], ["AI Diagnostics", "/diagnostics"], ["Report Reader", "/report"], ["Doctor Dashboard", "/dashboard"]].map(([l, h]) => (
              <div key={l} onClick={() => router.push(h)} style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 9, cursor: "pointer" }}>{l}</div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--text-3)", marginBottom: 14, letterSpacing: "0.08em" }}>COMPANY</div>
            {["Trixo Technologies", "Haridwar, Uttarakhand", "hello@trixo.in"].map((l) => (
              <div key={l} style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 9 }}>{l}</div>
            ))}
          </div>
        </div>
        <div style={{ maxWidth: 1320, margin: "40px auto 0", paddingTop: 20, borderTop: "1px solid var(--border)", fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
          © 2025 Trixo Technologies · Arogya Vaani · Built with care in Haridwar
        </div>
      </footer>

      <style>{`
        @media (min-width: 880px) { .nav-link { display: inline-flex !important; } }
        @media (max-width: 880px) {
          .hero-grid { grid-template-columns: 1fr !important; }
          .hero-3d { height: 320px !important; order: -1; }
          .bento > div { grid-column: span 12 !important; }
          .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
