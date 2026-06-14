"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import FloatingBot from "./FloatingBot";
import BrandSpinner from "./BrandSpinner";
import Logo from "./Logo";
import LangSelect from "./LangSelect";
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
  const [barHidden, setBarHidden] = useState(false);
  const lastY = useRef(0);

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

  // Smart auto-hide top bar: slide it away when scrolling down, reveal on scroll up.
  useEffect(() => {
    if (bare) return;
    const onScroll = () => {
      const y = window.scrollY;
      if (y < 60) setBarHidden(false);
      else if (y > lastY.current + 6) setBarHidden(true);
      else if (y < lastY.current - 6) setBarHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [bare]);

  if (bare) return <>{children}</>;

  // Checking auth / redirecting → minimal loader (no flash of protected content)
  if (authed !== true) {
    return (
      <div style={{ minHeight: "100vh", background: "#06090f", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <BrandSpinner size={62} />
      </div>
    );
  }

  // Chat is a focused, full-screen conversation: it owns its header + input bar,
  // so skip the app chrome (top bar, sidebar, bottom nav, floating bot) and padding.
  if (pathname === "/chat") return <>{children}</>;

  return (
    <>
      {/* Mobile top bar — brand + language (hidden on desktop via .app-topbar) */}
      <header className="app-topbar" style={{
        position: "fixed", top: 0, left: 0, right: 0, height: 56, zIndex: 120,
        alignItems: "center", justifyContent: "space-between", padding: "0 16px",
        background: "linear-gradient(180deg, rgba(13,21,42,0.92) 0%, rgba(8,12,24,0.86) 100%)",
        backdropFilter: "blur(18px) saturate(160%)", WebkitBackdropFilter: "blur(18px) saturate(160%)",
        borderBottom: "1px solid rgba(0,230,118,0.14)", boxShadow: "0 6px 26px rgba(0,0,0,0.38)",
        transform: barHidden ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div onClick={() => router.push("/home")} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
          <Logo size={22} withText textSize={16} />
        </div>
        <LangSelect />
      </header>

      <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
      <FloatingBot />
      <div className="app-main">{children}</div>
      <BottomNav onMenu={() => setNavOpen(true)} />
    </>
  );
}
