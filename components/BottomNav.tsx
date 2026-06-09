"use client";
import { useRouter, usePathname } from "next/navigation";
import { MessageCircle, FileText, Pill, Stethoscope, User, type LucideIcon } from "lucide-react";
import { useT } from "./LanguageProvider";

const NAV_ITEMS: { href: string; icon: LucideIcon; label: string }[] = [
  { href: "/chat", icon: MessageCircle, label: "Chat" },
  { href: "/report", icon: FileText, label: "Report" },
  { href: "/medicine", icon: Pill, label: "Medicine" },
  { href: "/doctors", icon: Stethoscope, label: "Doctors" },
  { href: "/account", icon: User, label: "Account" },
];

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useT();

  // Don't show on landing, login, emergency pages
  const hidden = ["/", "/login", "/emergency"].includes(pathname);
  if (hidden) return null;

  return (
    <nav className="bottom-nav glass" style={{
      position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 100,
      borderTop: "1px solid var(--border)", borderRadius: 0,
      padding: "9px 0 max(9px, env(safe-area-inset-bottom))",
    }}>
      {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
        const active = pathname === href;
        return (
          <button
            key={href}
            onClick={() => router.push(href)}
            style={{
              position: "relative", flex: 1, background: "transparent", border: "none",
              display: "flex", flexDirection: "column", alignItems: "center",
              gap: 4, padding: "4px 0", cursor: "pointer",
            }}
          >
            <Icon
              size={21}
              strokeWidth={active ? 2.4 : 1.9}
              color={active ? "#00E676" : "rgba(240,244,255,0.4)"}
              style={{ filter: active ? "drop-shadow(0 0 6px rgba(0,230,118,0.7))" : "none", transition: "all 0.2s" }}
            />
            <span style={{
              fontSize: 10,
              color: active ? "#00E676" : "var(--text-3)",
              fontFamily: "var(--font-mono)",
              letterSpacing: "0.04em",
              fontWeight: active ? 600 : 400,
            }}>{t(label)}</span>
            {active && (
              <div style={{ position: "absolute", top: -9, width: 22, height: 2, borderRadius: 2, background: "#00E676", boxShadow: "0 0 8px #00E676" }} />
            )}
          </button>
        );
      })}
    </nav>
  );
}
