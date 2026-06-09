"use client";
import Image from "next/image";

// Brand logo — the Arogya Vaani mark (transparent PNG: glowing leaf + voice
// wave). No badge box: it floats directly on the dark theme. next/image
// auto-optimises the source.
export default function Logo({
  size = 30, withText = false, textSize = 17, color = "#F0F4FF",
}: {
  size?: number; withText?: boolean; textSize?: number; color?: string;
}) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <span style={{ position: "relative", width: size * 1.65, height: size * 1.65, flexShrink: 0 }}>
        <Image src="/logo.png" alt="Arogya Vaani" fill sizes="120px" priority style={{ objectFit: "contain" }} />
      </span>
      {withText && (
        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: textSize, letterSpacing: "-0.02em", color }}>
          Arogya Vaani
        </span>
      )}
    </span>
  );
}
