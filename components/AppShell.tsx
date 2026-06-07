"use client";
import { usePathname } from "next/navigation";
import BottomNav from "./BottomNav";
import Sidebar from "./Sidebar";

// Routes that render full-bleed without the app chrome (sidebar / bottom nav).
const BARE = ["/", "/login", "/emergency"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (BARE.includes(pathname)) return <>{children}</>;

  return (
    <>
      <Sidebar />
      <div className="app-main">{children}</div>
      <BottomNav />
    </>
  );
}
