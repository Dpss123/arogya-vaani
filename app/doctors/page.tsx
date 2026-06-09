"use client";
import { useState, useEffect } from "react";
import { useT } from "@/components/LanguageProvider";
import GlassCard from "@/components/ui/GlassCard";
import BackButton from "@/components/ui/BackButton";
import { MapPin, Search, Check, Square, Stethoscope, Building2, Clock, Star, Map } from "lucide-react";

const DOCTORS = [
  { id: "1", name: "Dr. Rajesh Kumar", speciality: "General Physician", clinic: "Jwalapur PHC", address: "Main Road, Jwalapur, Haridwar", distance: "1.2 km", timing: "Mon-Sat 9AM-5PM", phone: "01334-220001", ayushman: true, free: true, rating: 4.8 },
  { id: "2", name: "Dr. Sunita Sharma", speciality: "Gynaecologist", clinic: "District Women Hospital", address: "Hospital Road, Haridwar", distance: "3.4 km", timing: "Mon-Fri 8AM-2PM", phone: "01334-220100", ayushman: true, free: true, rating: 4.9 },
  { id: "3", name: "Dr. Mohan Lal Gupta", speciality: "Paediatrician", clinic: "Children Welfare Clinic", address: "Shivalik Nagar, Haridwar", distance: "2.1 km", timing: "Daily 10AM-8PM", phone: "9876543210", ayushman: false, free: false, rating: 4.6 },
  { id: "4", name: "Dr. Priya Singh", speciality: "Internal Medicine", clinic: "Roorkee CHC", address: "Civil Lines, Roorkee", distance: "18 km", timing: "Mon-Sat 8AM-2PM", phone: "01332-272100", ayushman: true, free: true, rating: 4.7 },
  { id: "5", name: "Dr. Amit Verma", speciality: "Dermatologist", clinic: "Skin Care Clinic", address: "Railway Road, Haridwar", distance: "4.5 km", timing: "Tue-Sun 11AM-7PM", phone: "9988776655", ayushman: false, free: false, rating: 4.5 },
];

export default function DoctorsPage() {
  const [search, setSearch] = useState("");
  const [speciality, setSpeciality] = useState("All");
  const [ayushmanOnly, setAyushmanOnly] = useState(false);
  const [selected, setSelected] = useState<(typeof DOCTORS)[0] | null>(null);
  const [doctors, setDoctors] = useState(DOCTORS);
  const [locating, setLocating] = useState(true);
  const { t } = useT();

  // Try GPS → real nearby facilities (free OpenStreetMap). Fall back to DB,
  // then to the curated list. Never blank.
  useEffect(() => {
    const load = (url: string) =>
      fetch(url)
        .then(r => r.json())
        .then(d => { if (d.doctors && d.doctors.length) { setDoctors(d.doctors); setSpeciality("All"); } })
        .catch(() => { /* keep current fallback */ })
        .finally(() => setLocating(false));

    if (typeof navigator !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => load(`/api/doctors?lat=${pos.coords.latitude}&lng=${pos.coords.longitude}`),
        () => load("/api/doctors?district=Haridwar"),
        { timeout: 6000 }
      );
    } else {
      load("/api/doctors?district=Haridwar");
    }
  }, []);

  // Chips derived from the actual loaded data, so OSM labels (Hospital/Clinic/
  // Pharmacy) and DB specialities both appear instead of being filtered out.
  const specialities = ["All", ...Array.from(new Set(doctors.map(d => d.speciality).filter(Boolean)))];

  const filtered = doctors.filter(d => {
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.speciality.toLowerCase().includes(search.toLowerCase()) || d.clinic.toLowerCase().includes(search.toLowerCase());
    const matchSpec = speciality === "All" || d.speciality === speciality;
    const matchAyushman = !ayushmanOnly || d.ayushman;
    return matchSearch && matchSpec && matchAyushman;
  });

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "32px clamp(20px,4vw,40px) 100px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 26 }}>
          <BackButton size={20} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-3)", letterSpacing: "0.08em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>{locating ? <><MapPin size={13} color="var(--text-3)" strokeWidth={1.8} /> {t("Aas-paas dhundh rahe hain...")}</> : `${doctors.length} jagah mili · aapke aas-paas`}</div>
            <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(26px,4vw,38px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: "5px 0 0" }}>{t("Nearest Doctor")}</h1>
          </div>
        </div>
        {/* SEARCH */}
        <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 14, padding: "12px 16px", marginBottom: 14, display: "flex", gap: 10, alignItems: "center" }}>
          <Search size={18} color="var(--text-3)" strokeWidth={1.8} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("Doctor ka naam, speciality ya clinic...")} style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)" }} />
        </div>

        {/* FILTERS */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8, marginBottom: 10 }}>
            {specialities.map(s => (
              <button key={s} onClick={() => setSpeciality(s)} style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${speciality === s ? "rgba(0,230,118,0.4)" : "var(--border)"}`, background: speciality === s ? "rgba(0,230,118,0.1)" : "transparent", color: speciality === s ? "#00E676" : "var(--text-2)", fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-body)", transition: "all 0.2s" }}>
                {t(s)}
              </button>
            ))}
          </div>
          <button onClick={() => setAyushmanOnly(!ayushmanOnly)} style={{ padding: "6px 14px", borderRadius: 100, border: `1px solid ${ayushmanOnly ? "rgba(0,230,118,0.4)" : "var(--border)"}`, background: ayushmanOnly ? "rgba(0,230,118,0.1)" : "transparent", color: ayushmanOnly ? "#00E676" : "var(--text-2)", fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)", transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: 6 }}>
            {ayushmanOnly ? <Check size={14} color="#00E676" strokeWidth={2} /> : <Square size={14} color="var(--text-2)" strokeWidth={1.8} />} {t("Sirf Ayushman Accepted")}
          </button>
        </div>

        {/* DOCTOR CARDS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(doctor => (
            <GlassCard key={doctor.id} accent="#00E676" style={{ padding: 0, borderColor: selected?.id === doctor.id ? "rgba(0,230,118,0.25)" : "var(--border)" }}>
              <div onClick={() => setSelected(selected?.id === doctor.id ? null : doctor)} style={{ padding: "18px 20px", cursor: "pointer", display: "flex", gap: 14, alignItems: "flex-start" }}>
                <div style={{ width: 50, height: 50, borderRadius: "50%", background: "linear-gradient(135deg,rgba(0,230,118,0.2),rgba(0,180,216,0.2))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Stethoscope size={24} color="#fff" strokeWidth={1.8} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#F0F4FF" }}>{doctor.name}</span>
                    {doctor.ayushman && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "rgba(0,230,118,0.1)", color: "#00E676", fontFamily: "var(--font-mono)", letterSpacing: "0.04em" }}>{t("AYUSHMAN")}</span>}
                    {doctor.free && <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 100, background: "rgba(0,180,216,0.1)", color: "#00B4D8", fontFamily: "var(--font-mono)" }}>{t("FREE")}</span>}
                  </div>
                  <div style={{ fontSize: 13, color: "#00E676", marginBottom: 4 }}>{t(doctor.speciality)}</div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", display: "flex", alignItems: "center", gap: 5 }}><Building2 size={13} color="var(--text-2)" strokeWidth={1.8} /> {doctor.clinic}</div>
                  <div style={{ fontSize: 12, color: "var(--text-3)", marginTop: 2, display: "flex", alignItems: "center", gap: 5, flexWrap: "wrap" }}><MapPin size={13} color="var(--text-3)" strokeWidth={1.8} /> {doctor.distance} · <Clock size={13} color="var(--text-3)" strokeWidth={1.8} /> {doctor.timing}</div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fbbf24", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>{doctor.rating > 0 ? <><Star size={15} color="#fbbf24" fill="#fbbf24" strokeWidth={1.8} /> {doctor.rating}</> : <Map size={18} color="#fbbf24" strokeWidth={1.8} />}</div>
                  <div style={{ fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{doctor.distance}</div>
                </div>
              </div>
              {selected?.id === doctor.id && (
                <div style={{ borderTop: "1px solid var(--border)", padding: "16px 20px", background: "rgba(0,230,118,0.02)" }}>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12, display: "flex", alignItems: "center", gap: 5 }}><MapPin size={13} color="var(--text-2)" strokeWidth={1.8} /> {doctor.address}</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <a href={`tel:${doctor.phone}`} style={{ flex: 1, background: "linear-gradient(135deg,#00E676,#00C4FF)", border: "none", borderRadius: 100, padding: "12px", textAlign: "center", color: "#04060D", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14 }}>📞 {t("Call Karein")}</a>
                    <button onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(doctor.address)}`, "_blank")} style={{ flex: 1, background: "rgba(255,255,255,0.025)", border: "1px solid var(--border)", borderRadius: 100, padding: "12px", color: "#F0F4FF", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 14 }}>🗺️ {t("Directions")}</button>
                  </div>
                  {(() => {
                    // Only show WhatsApp for a valid 10-digit Indian mobile (landlines/STD numbers have no WhatsApp).
                    const wa = doctor.phone.replace(/\D/g, "").replace(/^0+/, "").replace(/^91/, "");
                    return /^[6-9]\d{9}$/.test(wa) ? (
                      <a href={`https://wa.me/91${wa}?text=${encodeURIComponent("Namaste, mujhe appointment chahiye. (Arogya Vaani)")}`} target="_blank" rel="noreferrer" style={{ display: "block", marginTop: 10, background: "#25D366", borderRadius: 100, padding: "12px", textAlign: "center", color: "#fff", fontWeight: 600, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14 }}>💬 {t("WhatsApp Pe Appointment Maango")}</a>
                    ) : null;
                  })()}
                </div>
              )}
            </GlassCard>
          ))}

          {filtered.length === 0 && (
            <div style={{ textAlign: "center", padding: "48px 24px", color: "var(--text-3)" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔍</div>
              <p>{t("Koi doctor nahi mila. Search change karein.")}</p>
            </div>
          )}
        </div>

        {/* EMERGENCY */}
        <GlassCard accent="#FF4757" lift={false} style={{ marginTop: 20, padding: "16px 20px", display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 28 }}>🚨</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#FF4757", marginBottom: 2 }}>{t("Emergency hai?")}</div>
            <div style={{ fontSize: 12, color: "var(--text-3)" }}>{t("Doctor dhundne ka wait mat karo")}</div>
          </div>
          <a href="tel:108" style={{ background: "rgba(255,71,87,0.9)", color: "#fff", border: "none", borderRadius: 100, padding: "10px 20px", fontWeight: 700, textDecoration: "none", fontFamily: "var(--font-body)", fontSize: 14, flexShrink: 0 }}>{t("108 Call")}</a>
        </GlassCard>
      </div>
    </div>
  );
}
