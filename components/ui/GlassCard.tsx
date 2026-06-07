"use client";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";

// Generic premium container: glass surface + cursor-tracking radial glow + hover lift.
export default function GlassCard({
  children, style, accent = "#00E676", onClick, lift = true,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
  accent?: string;
  onClick?: () => void;
  lift?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [g, setG] = useState({ x: 50, y: 50, on: false });

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setG({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100, on: true });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setG((s) => ({ ...s, on: false }))}
      onClick={onClick}
      whileHover={lift ? { y: -4, borderColor: accent + "44" } : undefined}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      style={{
        position: "relative",
        borderRadius: 24,
        border: "1px solid var(--border)",
        background: "rgba(255,255,255,0.02)",
        overflow: "hidden",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      <div
        style={{
          position: "absolute", inset: 0, opacity: g.on ? 1 : 0, transition: "opacity 0.3s",
          pointerEvents: "none",
          background: `radial-gradient(440px circle at ${g.x}% ${g.y}%, ${accent}14, transparent 70%)`,
        }}
      />
      <div style={{ position: "relative", height: "100%" }}>{children}</div>
    </motion.div>
  );
}
