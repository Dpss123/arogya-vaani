"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { getPatientKey } from "@/lib/patientId";
import { supabaseBrowser } from "@/lib/supabaseBrowser";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import {
  User, Calendar, Users, Droplet, Building2, MapPin, AlertTriangle, Phone,
  Check, Pencil, MessageCircle, FileText, IdCard, Siren,
  Stethoscope, Pill, Syringe,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Profile = {
  name: string; age: string; gender: string; village: string;
  district: string; state: string; blood_group: string;
  allergies: string; emergency_contact: string; abha_id: string;
};

type Report = {
  id: string; file_type: string; ai_summary: string;
  risk_level: string; uploaded_at: string;
};

type Message = {
  id: string; role: string; content: string; created_at: string;
};

export default function AccountPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"profile" | "history" | "reports" | "passport">("profile");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [vaccines, setVaccines] = useState<{ name: string; date: string }[]>([]);
  const [newVaccine, setNewVaccine] = useState("");
  const [profile, setProfile] = useState<Profile>({
    name: "", age: "", gender: "", village: "",
    district: "Haridwar", state: "Uttarakhand",
    blood_group: "", allergies: "", emergency_contact: "", abha_id: "",
  });
  const [auth, setAuth] = useState<{ name: string; email: string; image: string }>({ name: "", email: "", image: "" });

  useEffect(() => {
    const saved = localStorage.getItem("av_profile");
    if (saved) {
      // Hydrate persisted profile after mount (lazy init would cause an SSR
      // hydration mismatch since localStorage is unavailable on the server).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      try { setProfile((p) => ({ ...p, ...JSON.parse(saved) })); } catch { /* ignore */ }
    }
    const vac = localStorage.getItem("av_vaccines");
    if (vac) {
      try { setVaccines(JSON.parse(vac)); } catch { /* ignore */ }
    }
    fetch(`/api/reports?phone=${getPatientKey()}`).then((r) => r.json()).then((d) => setReports(d.reports || [])).catch(() => {});
    fetch(`/api/messages?phone=${getPatientKey()}&limit=20`).then((r) => r.json()).then((d) => setMessages(d.messages || [])).catch(() => {});

    // Pull identity from whichever auth was used: Supabase (email/password) or
    // NextAuth (Google). Show the email + pre-fill the name on first login.
    (async () => {
      let aName = "", aEmail = "", aImg = "";
      try {
        const { data: { user } } = await supabaseBrowser.auth.getUser();
        if (user) {
          aEmail = user.email || "";
          const m = (user.user_metadata || {}) as { name?: string; full_name?: string };
          aName = m.name || m.full_name || "";
        } else {
          const s = await fetch("/api/auth/session").then((r) => r.json()).catch(() => null);
          if (s && s.user) { aName = s.user.name || ""; aEmail = s.user.email || ""; aImg = s.user.image || ""; }
        }
      } catch { /* not logged in */ }
      setAuth({ name: aName, email: aEmail, image: aImg });
      if (aName) setProfile((p) => (p.name ? p : { ...p, name: aName }));
    })();
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    try {
      localStorage.setItem("av_profile", JSON.stringify(profile));
      await fetch("/api/patient", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: getPatientKey(), ...profile, age: profile.age ? Number(profile.age) : null }),
      });
      toast.success("Profile save ho gaya!");
      setEditing(false);
    } catch {
      toast.error("Save nahi hua, dobara try karein");
    } finally {
      setSaving(false);
    }
  };

  const logout = async () => {
    try {
      await supabaseBrowser.auth.signOut();
      const { signOut } = await import("next-auth/react");
      await signOut({ redirect: false });
    } catch { /* ignore */ }
    localStorage.removeItem("av_profile");
    router.push("/login");
  };

  const addVaccine = () => {
    if (!newVaccine.trim()) return;
    const entry = { name: newVaccine.trim(), date: new Date().toLocaleDateString("hi-IN") };
    const updated = [entry, ...vaccines];
    setVaccines(updated);
    localStorage.setItem("av_vaccines", JSON.stringify(updated));
    setNewVaccine("");
  };

  const fields: { key: keyof Profile; label: string; placeholder: string; icon: LucideIcon }[] = [
    { key: "name", label: "Poora Naam", placeholder: "Aapka naam", icon: User },
    { key: "age", label: "Umar", placeholder: "Years mein", icon: Calendar },
    { key: "gender", label: "Ling", placeholder: "Male/Female/Other", icon: Users },
    { key: "blood_group", label: "Blood Group", placeholder: "A+, B+, O+...", icon: Droplet },
    { key: "village", label: "Gaon", placeholder: "Aapka gaon", icon: Building2 },
    { key: "district", label: "Zila", placeholder: "Zila", icon: MapPin },
    { key: "allergies", label: "Allergies", placeholder: "Kisi cheez se allergy?", icon: AlertTriangle },
    { key: "emergency_contact", label: "Emergency Contact", placeholder: "+91 XXXXX XXXXX", icon: Phone },
    { key: "abha_id", label: "ABHA ID", placeholder: "Govt health ID (optional)", icon: IdCard },
  ];

  const riskColor = (r: string) => (r === "urgent" ? "#FF4757" : r === "borderline" ? "#fbbf24" : "#00E676");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <BackButton size={20} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Mera Account</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>{profile.name || auth.name || "Aapka Naam"}</h1>
          </div>
          {tab === "profile" && (
            <button onClick={editing ? saveProfile : () => setEditing(true)} disabled={saving} style={{ background: editing ? "rgba(0,230,118,0.1)" : "transparent", border: `1px solid ${editing ? "rgba(0,230,118,0.3)" : "var(--border)"}`, color: editing ? "#00E676" : "var(--text-2)", padding: "6px 16px", borderRadius: 100, fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              {saving ? <div style={{ width: 14, height: 14, border: "2px solid rgba(0,230,118,0.3)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : (editing ? <Check size={14} color="#00E676" strokeWidth={1.8} /> : <Pencil size={14} color="var(--text-2)" strokeWidth={1.8} />)}
              {editing ? (saving ? "Saving..." : "Save") : "Edit"}
            </button>
          )}
        </div>

        <GlassCard accent="#00E676" lift={false} style={{ padding: 24, marginBottom: 18, textAlign: "center" }}>
          {auth.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={auth.image} alt="" width={72} height={72} style={{ borderRadius: "50%", objectFit: "cover", margin: "0 auto 12px", display: "block", boxShadow: "0 0 24px rgba(0,230,118,0.2)" }} />
          ) : (
            <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#00E676,#00B4D8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#04060D", fontWeight: 800, margin: "0 auto 12px", boxShadow: "0 0 24px rgba(0,230,118,0.2)" }}>
              {(profile.name || auth.name) ? (profile.name || auth.name)[0].toUpperCase() : <User size={28} color="#04060D" strokeWidth={1.8} />}
            </div>
          )}
          <div style={{ fontSize: 20, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-display)" }}>{profile.name || auth.name || "Aapka Naam"}</div>
          {auth.email && <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 5, fontFamily: "var(--font-body)" }}>{auth.email}</div>}
          <div style={{ fontSize: 12, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 4 }}>
            {profile.village && `${profile.village}, `}{profile.district}
          </div>
          {profile.blood_group && (
            <div style={{ display: "inline-flex", alignItems: "center", gap: 5, marginTop: 8, background: "rgba(255,71,87,0.1)", border: "1px solid rgba(255,71,87,0.25)", borderRadius: 100, padding: "3px 12px", fontSize: 12, color: "#FF4757", fontFamily: "var(--font-mono)" }}>
              <Droplet size={13} color="#FF4757" strokeWidth={1.8} /> {profile.blood_group}
            </div>
          )}
        </GlassCard>

        <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
          {([["profile", "Profile", User], ["history", "History", MessageCircle], ["reports", "Reports", FileText], ["passport", "Passport", IdCard]] as const).map(([key, label, Icon]) => (
            <button key={key} onClick={() => setTab(key)} style={{ flex: 1, minWidth: 0, padding: "9px 4px", borderRadius: 100, border: `1px solid ${tab === key ? "#00E676" : "var(--border)"}`, background: tab === key ? "rgba(0,230,118,0.08)" : "transparent", color: tab === key ? "#00E676" : "var(--text-3)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", fontWeight: tab === key ? 600 : 400, transition: "all 0.2s", whiteSpace: "nowrap", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}><Icon size={14} color={tab === key ? "#00E676" : "var(--text-3)"} strokeWidth={1.8} />{label}</button>
          ))}
        </div>

        <div>
        {tab === "profile" && (
          <div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {fields.map((field) => (
                <div key={field.key} style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ flexShrink: 0, display: "flex" }}><field.icon size={18} color="#00E676" strokeWidth={1.8} /></span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", marginBottom: 3 }}>{field.label.toUpperCase()}</div>
                    {editing ? (
                      <input value={profile[field.key]} onChange={(e) => setProfile((prev) => ({ ...prev, [field.key]: e.target.value }))} placeholder={field.placeholder} style={{ background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)", width: "100%" }} />
                    ) : (
                      <div style={{ fontSize: 14, color: profile[field.key] ? "#F0F4FF" : "var(--text-3)" }}>
                        {profile[field.key] || field.placeholder}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            <GlassCard accent="#FF4757" lift={false} style={{ marginTop: 20, padding: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#FF4757", marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><Siren size={15} color="#FF4757" strokeWidth={1.8} />Emergency</div>
              <div style={{ fontSize: 12, color: "var(--text-3)", marginBottom: 14, lineHeight: 1.6 }}>Koi bhi emergency mein 108 call karein · AI automatically location bhejta hai.</div>
              <a href="tel:108" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "rgba(255,71,87,0.12)", border: "1px solid rgba(255,71,87,0.3)", borderRadius: 12, padding: "13px", textAlign: "center", color: "#FF4757", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 15 }}><Phone size={16} color="#FF4757" strokeWidth={1.8} />108 Call Karein</a>
            </GlassCard>
            <button onClick={logout} style={{ width: "100%", marginTop: 12, background: "transparent", border: "1px solid var(--border)", borderRadius: 12, padding: "12px", color: "var(--text-3)", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13 }}>Logout</button>
          </div>
        )}

        {tab === "history" && (
          <div>
            {messages.length === 0 ? (
              <GlassCard accent="#00E676" lift={false} style={{ textAlign: "center", padding: "48px 24px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><MessageCircle size={40} color="#00E676" strokeWidth={1.8} /></div>
                <p style={{ color: "var(--text-3)", fontSize: 14 }}>Abhi tak koi conversation nahi</p>
                <button onClick={() => router.push("/chat")} style={{ marginTop: 16, background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px 24px", color: "#04060D", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)" }}>Chat Shuru Karein</button>
              </GlassCard>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {messages.map((msg) => (
                  <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "patient" ? "flex-end" : "flex-start" }}>
                    <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: msg.role === "patient" ? "16px 16px 4px 16px" : "16px 16px 16px 4px", background: msg.role === "patient" ? "rgba(0,230,118,0.15)" : "rgba(255,255,255,0.025)", fontSize: 13, color: "#F0F4FF", lineHeight: 1.6, border: `1px solid ${msg.role === "patient" ? "rgba(0,230,118,0.2)" : "var(--border)"}` }}>
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "reports" && (
          <div>
            <button onClick={() => router.push("/report")} style={{ width: "100%", background: "rgba(0,230,118,0.06)", border: "1px dashed rgba(0,230,118,0.25)", borderRadius: 16, padding: "16px", color: "#00E676", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14, marginBottom: 16, fontWeight: 600 }}>
              + Nayi Report Upload Karein
            </button>
            {reports.length === 0 ? (
              <GlassCard accent="#00B4D8" lift={false} style={{ textAlign: "center", padding: "32px" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><FileText size={40} color="#00B4D8" strokeWidth={1.8} /></div>
                <p style={{ color: "var(--text-3)", fontSize: 14 }}>Koi report upload nahi ki abhi tak</p>
              </GlassCard>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {reports.map((r) => (
                  <GlassCard key={r.id} accent={riskColor(r.risk_level)} lift={false} style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ display: "flex", flexShrink: 0 }}><FileText size={20} color={riskColor(r.risk_level)} strokeWidth={1.8} /></span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F4FF" }}>{(r.file_type || "other").replace(/_/g, " ").toUpperCase()}</div>
                        <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{new Date(r.uploaded_at).toLocaleDateString("hi-IN")}</div>
                      </div>
                      <div style={{ fontSize: 10, padding: "2px 8px", borderRadius: 100, background: `${riskColor(r.risk_level)}15`, color: riskColor(r.risk_level), fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>{r.risk_level}</div>
                    </div>
                    <div style={{ fontSize: 12, color: "var(--text-2)", lineHeight: 1.6 }}>{(r.ai_summary || "").slice(0, 120)}...</div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === "passport" && (
          <div>
            <GlassCard accent="#00E676" lift={false} style={{ padding: 24, marginBottom: 16, textAlign: "center" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><IdCard size={48} color="#00E676" strokeWidth={1.8} /></div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#F0F4FF", fontFamily: "var(--font-display)", marginBottom: 6 }}>Health Passport</div>
              <div style={{ fontSize: 13, color: "var(--text-2)", lineHeight: 1.7, marginBottom: 20 }}>Aapka poora health record ek jagah. QR code se kisi bhi doctor ke saath share karein.</div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(`Arogya Vaani Health Passport\nName: ${profile.name || "-"}\nBlood: ${profile.blood_group || "-"}\nAllergies: ${profile.allergies || "None"}\nABHA: ${profile.abha_id || "-"}\nDistrict: ${profile.district}`)}`}
                alt="Health passport QR code"
                width={160}
                height={160}
                style={{ borderRadius: 12, background: "#fff", padding: 8, marginBottom: 20 }}
              />
              {profile.abha_id ? (
                <div style={{ background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.25)", borderRadius: 14, padding: "14px 20px" }}>
                  <div style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "#00E676", marginBottom: 4, letterSpacing: "0.08em" }}>ABHA ID</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#F0F4FF", fontFamily: "var(--font-mono)" }}>{profile.abha_id}</div>
                </div>
              ) : (
                <button onClick={() => { setTab("profile"); setEditing(true); }} style={{ background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "13px 28px", color: "#04060D", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>
                  + ABHA ID Link Karein
                </button>
              )}
            </GlassCard>
            <div className="m-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {([[Stethoscope, "Total Checkups", "0"], [FileText, "Reports", reports.length.toString()], [Pill, "Medicines", "0"], [Building2, "Doctor Visits", "0"]] as const).map(([Icon, label, value]) => (
                <GlassCard key={label} accent="#00E676" lift={false} style={{ padding: "16px", textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}><Icon size={24} color="#00E676" strokeWidth={1.8} /></div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#00E676", fontFamily: "var(--font-display)", letterSpacing: "-0.02em" }}>{value}</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 3 }}>{label}</div>
                </GlassCard>
              ))}
            </div>

            <GlassCard accent="#00E676" lift={false} style={{ marginTop: 16, padding: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F4FF", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}><Syringe size={14} color="#00E676" strokeWidth={1.8} />Vaccination Records</div>
              <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
                <input value={newVaccine} onChange={e => setNewVaccine(e.target.value)} onKeyDown={e => { if (e.key === "Enter") addVaccine(); }} placeholder="Vaccine ka naam (e.g. Tetanus, COVID)" style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", color: "#F0F4FF", fontSize: 13, fontFamily: "var(--font-body)", outline: "none" }} />
                <button onClick={addVaccine} style={{ background: "rgba(0,230,118,0.12)", border: "1px solid rgba(0,230,118,0.3)", borderRadius: 10, padding: "0 16px", color: "#00E676", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13 }}>+ Add</button>
              </div>
              {vaccines.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--text-3)", textAlign: "center", padding: "8px 0" }}>Abhi koi vaccine record nahi</div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {vaccines.map((v, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(0,230,118,0.04)", borderRadius: 10, padding: "8px 12px" }}>
                      <span style={{ fontSize: 13, color: "#F0F4FF", display: "inline-flex", alignItems: "center", gap: 6 }}><Syringe size={13} color="#00E676" strokeWidth={1.8} />{v.name}</span>
                      <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{v.date}</span>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        )}
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
