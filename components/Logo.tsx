"use client";
import Image from "next/image";

// Brand logo: the real Arogya Vaani artwork on a clean rounded badge so it
// reads premium on the dark theme. next/image auto-optimises the large source
// down to a tiny served size.
export default function Logo({
  size = 30, withText = false, textSize = 17, color = "#F0F4FF",
}: {
  size?: number; withText?: boolean; textSize?: number; color?: string;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 11 }}>
      <span style={{
        position: "relative", width: size, height: size, borderRadius: size * 0.26,
        background: "#ffffff", overflow: "hidden", flexShrink: 0,
        boxShadow: "0 4px 14px rgba(0,0,0,0.28)", border: "1px solid rgba(0,0,0,0.06)",
      }}>
        <Image src="/logo.png" alt="Arogya Vaani" fill sizes="80px" priority style={{ objectFit: "cover" }} />
      </span>
      {withText && (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: textSize, letterSpacing: "-0.02em", color }}>
          Arogya Vaani
        </span>
      )}
    </span>
  );
}
