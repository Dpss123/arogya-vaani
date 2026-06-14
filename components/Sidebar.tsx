"use client";
import { useRouter, usePathname } from "next/navigation";
import {
  Home, MessageCircle, Microscope, FileText, Pill, Brain, HeartPulse, Baby,
  Apple, TrendingUp, Activity, Landmark, Stethoscope, Cross, ClipboardList,
  User, LayoutDashboard, Siren, X, type LucideIcon,
} from "lucide-react";
import Logo from "./Logo";
import { useT } from "./LanguageProvider";

const GROUPS: { label: string; items: [LucideIcon, string, string][] }[] = [
  { label: "Main", items: [
    [Home, "Dashboard", "/home"],
    [MessageCircle, "AI Chat", "/chat"],
    [Microscope, "Diagnostics", "/diagnostics"],
    [FileText, "Report Reader", "/report"],
    [Pill, "Medicine", "/medicine"],
  ]},
  { label: "Care", items: [
    [Brain, "Mental Health", "/mental-health"],
    [HeartPulse, "Pregnancy", "/pregnancy"],
    [Baby, "Child Growth", "/growth"],
    [Apple, "Nutrition", "/nutrition"],
    [TrendingUp, "Health Trends", "/predictive"],
  ]},
  { label: "Community", items: [
    [Activity, "Outbreaks", "/outbreak"],
    [Landmark, "Schemes", "/schemes"],
    [Stethoscope, "Find Doctor", "/doctors"],
    [Cross, "First Aid", "/first-aid"],
    [ClipboardList, "ASHA Tools", "/asha"],
  ]},
  { label: "Account", items: [
    [User, "My Account", "/account"],
    [LayoutDashboard, "Doctor Dashboard", "/dashboard"],
  ]},
];

export default function Sidebar({ open = false, onClose }: { open?: boolean; onClose?: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useT();
  const go = (href: string) => { router.push(href); onClose?.(); };

  return (
    <>
      <div className={`app-nav-backdrop${open ? " open" : ""}`} onClick={onClose} aria-hidden />
      <aside className={`app-sidebar glass${open ? " open" : ""}`} style={{
        position: "fixed", top: 0, left: 0, bottom: 0,
        borderRight: "1px solid rgba(0,230,118,0.18)", borderRadius: 0,
        padding: "20px 12px",
        background: "linear-gradient(180deg, #0c1428 0%, #070c18 100%)",
      }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 6px 16px", marginBottom: 6, borderBottom: "1px solid var(--border-soft)" }}>
        <div onClick={() => go("/home")} style={{ display: "flex", cursor: "pointer" }}>
          <Logo size={24} withText textSize={16} />
        </div>
        <button className="sidebar-close" onClick={onClose} aria-label="Close menu" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "var(--text-2)", borderRadius: 10, padding: 6, cursor: "pointer" }}><X size={17} /></button>
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 10px 8px" }}>{t(g.label)}</div>
            {g.items.map(([Icon, label, href]) => {
              const active = pathname === href;
              return (
                <button key={href} onClick={() => go(href)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 10px",
                  borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
                  fontFamily: "var(--font-body)", fontSize: 13.5, marginBottom: 2,
                  background: active ? "rgba(0,230,118,0.1)" : "transparent",
                  color: active ? "#00E676" : "var(--text-2)",
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? "inset 2px 0 0 #00E676" : "none",
                }}>
                  <Icon size={17} strokeWidth={active ? 2.4 : 1.9} color={active ? "#00E676" : "currentColor"} />
                  {t(label)}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <button onClick={() => go("/emergency")} style={{
        marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "11px", borderRadius: 12, border: "1px solid rgba(255,71,87,0.3)", background: "rgba(255,71,87,0.1)",
        color: "#FF4757", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13,
      }}>
        <Siren size={16} strokeWidth={2.2} /> {t("Emergency")}
      </button>
      </aside>
    </>
  );
}
