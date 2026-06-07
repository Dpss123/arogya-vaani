"use client";
import { useRouter, usePathname } from "next/navigation";
import {
  Home, MessageCircle, Microscope, FileText, Pill, Brain, HeartPulse, Baby,
  Apple, TrendingUp, Activity, Landmark, Stethoscope, Cross, ClipboardList,
  User, LayoutDashboard, Siren, type LucideIcon,
} from "lucide-react";
import Logo from "./Logo";

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

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <aside className="app-sidebar glass" style={{
      position: "fixed", top: 0, left: 0, bottom: 0, width: 248, zIndex: 90,
      borderRight: "1px solid var(--border)", borderRadius: 0,
      display: "flex", flexDirection: "column", padding: "20px 14px",
    }}>
      <div onClick={() => router.push("/")} style={{ display: "flex", alignItems: "center", padding: "4px 10px 20px", cursor: "pointer" }}>
        <Logo size={26} withText textSize={16} />
      </div>

      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {GROUPS.map((g) => (
          <div key={g.label}>
            <div style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--text-3)", letterSpacing: "0.12em", textTransform: "uppercase", padding: "0 10px 8px" }}>{g.label}</div>
            {g.items.map(([Icon, label, href]) => {
              const active = pathname === href;
              return (
                <button key={href} onClick={() => router.push(href)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "9px 10px",
                  borderRadius: 11, border: "none", cursor: "pointer", textAlign: "left",
                  fontFamily: "var(--font-body)", fontSize: 13.5, marginBottom: 2,
                  background: active ? "rgba(0,230,118,0.1)" : "transparent",
                  color: active ? "#00E676" : "var(--text-2)",
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? "inset 2px 0 0 #00E676" : "none",
                }}>
                  <Icon size={17} strokeWidth={active ? 2.4 : 1.9} color={active ? "#00E676" : "currentColor"} />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <button onClick={() => router.push("/emergency")} style={{
        marginTop: 12, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "11px", borderRadius: 12, border: "1px solid rgba(255,71,87,0.3)", background: "rgba(255,71,87,0.1)",
        color: "#FF4757", fontWeight: 700, cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13,
      }}>
        <Siren size={16} strokeWidth={2.2} /> Emergency
      </button>
    </aside>
  );
}
