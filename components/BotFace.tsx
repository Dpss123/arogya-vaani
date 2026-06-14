"use client";
import { useId, type CSSProperties } from "react";

// Arogya Vaani chat mascot — a friendly green robot (SVG, scales crisply).
// blink: eyes squash shut periodically · float: gentle bob · glow: soft halo.
export default function BotFace({
  size = 104, blink = false, float = false, glow = false,
}: { size?: number; blink?: boolean; float?: boolean; glow?: boolean }) {
  const gid = "bg" + useId().replace(/:/g, "");
  const eye: CSSProperties = blink
    ? { animation: "botBlink 3.6s ease-in-out infinite", transformBox: "fill-box", transformOrigin: "center" }
    : {};
  const wrap: CSSProperties = {
    width: size, height: size, flexShrink: 0,
    ...(float ? { animation: "floaty 3.2s ease-in-out infinite" } : {}),
    ...(glow ? { filter: "drop-shadow(0 10px 20px rgba(0,230,118,0.38))" } : {}),
  };
  return (
    <div style={wrap}>
      <svg viewBox="0 0 120 120" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style={{ display: "block" }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#00E676" />
            <stop offset="1" stopColor="#00C4FF" />
          </linearGradient>
        </defs>
        {/* headphone band + ear cups */}
        <path d="M22 56 Q60 -22 98 56" stroke={`url(#${gid})`} strokeWidth="8" fill="none" strokeLinecap="round" />
        <rect x="12" y="46" width="15" height="31" rx="7.5" fill="#00C4FF" />
        <rect x="93" y="46" width="15" height="31" rx="7.5" fill="#00C4FF" />
        {/* speech-bubble tail + head */}
        <path d="M41 84 L26 100 L55 86 Z" fill={`url(#${gid})`} />
        <rect x="26" y="22" width="68" height="64" rx="21" fill={`url(#${gid})`} />
        {/* white face */}
        <rect x="36" y="35" width="48" height="40" rx="15" fill="#FFFFFF" />
        {/* eyes (blink) + smile */}
        <ellipse cx="51" cy="52" rx="4.6" ry="6.4" fill="#06231A" style={eye} />
        <ellipse cx="69" cy="52" rx="4.6" ry="6.4" fill="#06231A" style={eye} />
        <path d="M52 62 Q60 69.5 68 62" stroke="#06231A" strokeWidth="3.4" fill="none" strokeLinecap="round" />
      </svg>
    </div>
  );
}
