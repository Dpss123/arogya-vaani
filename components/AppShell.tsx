"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import BrandSpinner from "./BrandSpinner";
import Logo from "./Logo";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

// Public routes (no login needed). Emergency stays open on purpose — never
// block someone in an emergency behind a login.
const BARE = ["/", "/login", "/emergency"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const bare = BARE.includes(pathname);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    if (bare) return;
    let active = true;
    (async () => {
      setAuthed(null);
      try {
        // 1) Supabase email/password session (localStorage — no network)
        const { data } = await supabaseBrowser.auth.getSession();
        if (data.session) { if (active) setAuthed(true); return; }
        // 2) Google / NextAuth session
        const res = await fetch("/api/auth/session");
        const s = await res.json().catch(() => null);
        if (s && s.user) { if (active) setAuthed(true); return; }
      } catch { /* fall through */ }
      if (active) { setAuthed(false); router.replace("/login"); }
    })();
    return () => { active = false; };
  }, [pathname, bare, router]);

  if (bare) return <>{children}</>;

  // Checking auth / redirecting → minimal loader (no flash of protected content)
  if (authed !== true) {
    return (
      <div style={{ minHeight: "100vh", background: "#06090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BrandSpinner size={62} />
      </div>
    );
  }

  return (
    <>
      {/* Mobile top bar — hamburger + brand (hidden on desktop via .app-topbar) */}
      <header className="app-topbar glass" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 52, zIndex: 120,
        alignItems: "center", gap: 12, padding: "0 14px", borderBottom: "1px solid var(--border)", borderRadius: 0,
      }}>
        <button onClick={() => setNavOpen(true)} aria-label="Open menu" style={{
          background: "rgba(255,255,255,0.05)", border: "1px solid var(--border)", color: "#F0F4FF",
          borderRadius: 10, padding: 7, cursor: "pointer", display: "flex",
        }}><Menu size={20} /></button>
        <div onClick={() => router.push("/home")} style={{ cursor: "pointer", display: "flex" }}>
          <Logo size={20} withText textSize={15} />
        </div>
      </header>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <div className="app-main">{children}</div>
      <BottomNav />
    </>
  );
}
