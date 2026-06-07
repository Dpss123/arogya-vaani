"use client";
import { useState } from "react";
import { FIRST_AID, type FirstAid } from "@/lib/firstaid";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import {
  Heart,
  Wind,
  Droplet,
  Flame,
  AlertTriangle,
  Bed,
  Activity,
  Thermometer,
  Siren,
  Check,
  X,
  Search,
  type LucideIcon,
} from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  "❤️": Heart,
  "😮": Wind,
  "🩸": Droplet,
  "🔥": Flame,
  "🐍": AlertTriangle,
  "😵": Bed,
  "⚡": Activity,
  "🥵": Thermometer,
  "☠️": AlertTriangle,
};

function FirstAidIcon({ icon, size, color }: { icon: string; size: number; color: string }) {
  const Icon = ICON_MAP[icon] ?? Activity;
  return <Icon size={size} color={color} strokeWidth={1.8} />;
}

export default function FirstAidPage() {
  const [open, setOpen] = useState<FirstAid | null>(null);
  const [search, setSearch] = useState("");

  const filtered = FIRST_AID.filter(f =>
    f.title.toLowerCase().includes(search.toLowerCase()) || f.when.toLowerCase().includes(search.toLowerCase())
  );

  if (open) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton onClick={() => setOpen(null)} size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: 6 }}><FirstAidIcon icon={open.icon} size={13} color={open.call108 ? "#FF4757" : "#00E676"} /> First Aid Guide</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>{open.title}</h1>
          </div>
        </div>

        {open.call108 && (
          <a href="tel:108" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "rgba(255,71,87,0.9)", borderRadius: 100, padding: "14px", textAlign: "center", textDecoration: "none", color: "#fff", fontSize: 16, fontWeight: 800, fontFamily: "var(--font-body)", marginBottom: 16, boxShadow: "0 0 24px rgba(255,71,87,0.3)" }}><Siren size={18} color="#fff" strokeWidth={1.8} /> 108 ABHI CALL KAREIN</a>
        )}

        <GlassCard accent="#00B4D8" lift={false} style={{ padding: 18, marginBottom: 14 }}>
          <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.06em", marginBottom: 8 }}>KAB · PEHCHAAN</div>
          <div style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>{open.when}</div>
        </GlassCard>

        <GlassCard accent="#00E676" lift={false} style={{ padding: 20, marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#00E676", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}><Check size={15} color="#00E676" strokeWidth={1.8} /> YEH KAREIN</div>
          {open.steps.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 10, marginBottom: 10, fontSize: 14, color: "var(--text-2)", lineHeight: 1.6 }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(0,230,118,0.15)", color: "#00E676", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0, fontFamily: "var(--font-mono)" }}>{i + 1}</span>
              {s}
            </div>
          ))}
        </GlassCard>

        <GlassCard accent="#FF4757" lift={false} style={{ padding: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#FF4757", marginBottom: 12, display: "inline-flex", alignItems: "center", gap: 6 }}><X size={15} color="#FF4757" strokeWidth={1.8} /> YEH NA KAREIN</div>
          {open.donts.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--text-2)", lineHeight: 1.6 }}>
              <span style={{ color: "#FF4757", flexShrink: 0, display: "inline-flex", alignItems: "center", marginTop: 2 }}><X size={14} color="#FF4757" strokeWidth={1.8} /></span>{d}
            </div>
          ))}
        </GlassCard>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Emergency mein kya karein · bina net ke bhi</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>First Aid Guide</h1>
          </div>
        </div>

        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px 18px", marginBottom: 18, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ display: "inline-flex", alignItems: "center" }}><Search size={16} color="var(--text-3)" strokeWidth={1.8} /></span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Emergency dhundho... (jalna, saanp, dam ghutna)" style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)" }} />
        </div>

        <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {filtered.map(f => (
            <GlassCard key={f.id} accent={f.call108 ? "#FF4757" : "#00E676"} onClick={() => setOpen(f)} style={{ padding: 16 }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{f.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#F0F4FF", marginBottom: 3, lineHeight: 1.3 }}>{f.title}</div>
              {f.call108 && <div style={{ fontSize: 9, color: "#FF4757", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>🚨 108 EMERGENCY</div>}
            </GlassCard>
          ))}
        </div>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>Koi guide nahi mili.</div>
        )}
      </div>
    </div>
  );
}
