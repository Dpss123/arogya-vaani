"use client";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";
import BrandSpinner from "./BrandSpinner";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

// Public routes (no login needed). Emergency stays open on purpose — never
// block someone in an emergency behind a login.
const BARE = ["/", "/login", "/emergency"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const bare = BARE.includes(pathname);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    if (bare) { setAuthed(true); return; }
    let active = true;
    setAuthed(null);
    (async () => {
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
      <Sidebar />
      <div className="app-main">{children}</div>
      <BottomNav />
    </>
  );
}
