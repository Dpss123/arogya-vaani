"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

// Top-of-page back control. Goes to the ACTUAL previous page (the section the
// user came from); on a fresh load with no history it falls back to the
// dashboard (/home). It never sends the user to the marketing landing.
export default function BackButton({
  onClick, fallback = "/home", size = 20, style,
}: {
  onClick?: () => void; fallback?: string; size?: number; style?: React.CSSProperties;
}) {
  const router = useRouter();
  const go = () => {
    if (onClick) { onClick(); return; }
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else router.push(fallback);
  };
  return (
    <button onClick={go} aria-label="Back" style={{ background: "transparent", border: "none", color: "var(--text-3)", cursor: "pointer", display: "inline-flex", alignItems: "center", lineHeight: 1, padding: 0, ...style }}>
      <ArrowLeft size={size} />
    </button>
  );
}
