"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Siren, Cross } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";
import { useT } from "@/components/LanguageProvider";

export default function EmergencyPage() {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [firstAid, setFirstAid] = useState<string[]>([]);
  const { t } = useT();

  const handleEmergency = async () => {
    setSending(true);

    // Best-effort GPS · don't block the alert if the user denies / it times out.
    let location = "";
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
      );
      location = `${pos.coords.latitude},${pos.coords.longitude}`;
    } catch { /* no location available */ }

    // Pull the patient's number + family contact from their saved profile.
    let phone = "demo", emergencyContact = "";
    try {
      const p = JSON.parse(localStorage.getItem("av_profile") || "{}");
      phone = p.phone || "demo";
      emergencyContact = p.emergency_contact || "";
    } catch { /* use demo */ }

    try {
      const res = await fetch("/api/emergency", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, symptoms: "Emergency button pressed", location, emergencyContact }),
      });
      const data = await res.json();
      if (data.firstAid) setFirstAid(data.firstAid);
    } catch { /* still show the 108 number below */ }

    setSent(true);
    setSending(false);
  };

  if (sent) return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px clamp(20px,4vw,40px) 100px", textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ marginBottom: 18, display: "flex", justifyContent: "center" }}><Siren size={56} color="#FF4757" strokeWidth={1.8} /></div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("108 EMERGENCY · ALERT SENT")}</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#FF4757", margin: "8px 0 14px" }}>{t("Emergency Alert Bheja Gaya!")}</h1>
        <div style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 22 }}>{t("108 ambulance ko aapki location aur symptoms bhej diye gaye hain. Family ko bhi alert kiya gaya hai.")}</div>

        {firstAid.length > 0 && (
          <GlassCard accent="#00E676" lift={false} style={{ padding: 22, marginBottom: 18, textAlign: "left" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#00E676", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Cross size={14} color="#00E676" strokeWidth={1.8} />{t("Jab Tak Ambulance Aaye · Yeh Karein")}</div>
            {firstAid.map((step, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8, fontSize: 13, color: "var(--text-2)", lineHeight: 1.5 }}>
                <span style={{ color: "#00E676", flexShrink: 0, fontWeight: 700 }}>{i + 1}.</span>{t(step)}
              </div>
            ))}
          </GlassCard>
        )}

        <GlassCard accent="#FF4757" lift={false} style={{ padding: "22px 32px", marginBottom: 22 }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: "#FF4757", fontFamily: "var(--font-display)" }}>108</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t("AMBULANCE CALL KAREIN")}</div>
        </GlassCard>

        <button onClick={() => router.push("/chat")} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", color: "#F0F4FF", padding: "12px 28px", borderRadius: 100, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>{t("Chat Pe Wapis Jayein")}</button>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px clamp(20px,4vw,40px) 100px", textAlign: "center" }}>
      <div style={{ width: "100%", maxWidth: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ marginBottom: 18, animation: "pulse-red 1s infinite", display: "flex", justifyContent: "center" }}><Siren size={56} color="#FF4757" strokeWidth={1.8} /></div>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{t("108 EMERGENCY · GPS AUTO-SEND")}</div>
        <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#FF4757", margin: "8px 0 14px" }}>{t("Emergency?")}</h1>
        <div style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.8, marginBottom: 36 }}>{t("Is button ko dabane se 108 ambulance ko GPS location aur symptoms turant bhej diye jayenge.")}</div>

        <button onClick={handleEmergency} disabled={sending} style={{ width: "clamp(150px,46vw,190px)", height: "clamp(150px,46vw,190px)", borderRadius: "50%", background: sending ? "rgba(255,71,87,0.2)" : "rgba(255,71,87,0.9)", border: "4px solid #FF4757", boxShadow: "0 0 40px rgba(255,71,87,0.4)", color: "#fff", fontSize: "clamp(17px,5vw,20px)", fontWeight: 800, cursor: "pointer", fontFamily: "var(--font-body)", marginBottom: 32, transition: "all 0.2s", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, whiteSpace: "pre-line" }}>
          {sending ? t("Bhej raha hoon...") : <><Siren size={28} color="#fff" strokeWidth={1.8} />{t("EMERGENCY\nALERT")}</>}
        </button>

        <GlassCard accent="#FF4757" lift={false} style={{ padding: "18px 32px", marginBottom: 24 }}>
          <div style={{ fontSize: 32, fontWeight: 900, color: "#FF4757", fontFamily: "var(--font-display)" }}>108</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t("FREE AMBULANCE · 24/7")}</div>
        </GlassCard>

        <button onClick={() => router.push("/first-aid")} style={{ background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.25)", borderRadius: 100, padding: "12px 24px", color: "#00E676", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, fontWeight: 600, display: "inline-flex", alignItems: "center", gap: 8 }}><Cross size={15} color="#00E676" strokeWidth={1.8} />{t("First Aid Guide · Kya Karein")}</button>
        <button onClick={() => router.push("/chat")} style={{ marginTop: 16, background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, textDecoration: "underline" }}>{t("Cancel · Wapis Jao")}</button>
      </div>
      <style>{`@keyframes pulse-red{0%,100%{filter:drop-shadow(0 0 10px rgba(255,71,87,0.5))}50%{filter:drop-shadow(0 0 30px rgba(255,71,87,0.9))}}`}</style>
    </div>
  );
}
