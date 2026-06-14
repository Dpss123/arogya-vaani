"use client";
import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import React, { useRef } from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  style?: React.CSSProperties;
};

// Premium button: magnetic cursor-pull, glow + lift on hover, press feedback,
// and a subtle shine sweep on the primary gradient.
export default function Button({ children, onClick, variant = "primary", style }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 280, damping: 18 });
  const y = useSpring(my, { stiffness: 280, damping: 18 });

  const onMove = (e: React.MouseEvent) => {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const clamp = (v: number) => Math.max(-7, Math.min(7, v));
    mx.set(clamp((e.clientX - (r.left + r.width / 2)) * 0.3));
    my.set(clamp((e.clientY - (r.top + r.height / 2)) * 0.3));
  };
  const reset = () => { mx.set(0); my.set(0); };

  const base: React.CSSProperties = {
    position: "relative",
    border: variant === "ghost" ? "1px solid var(--border)" : "none",
    borderRadius: 100,
    padding: "14px 30px",
    fontSize: 15,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "var(--font-body)",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    overflow: "hidden",
    background: variant === "primary" ? "linear-gradient(135deg,#00E676,#00C4FF)" : "transparent",
    color: variant === "primary" ? "#04060D" : "#F0F4FF",
    ...style,
  };

  return (
    <motion.button
      ref={ref}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ ...base, x, y }}
      whileHover={variant === "primary"
        ? { boxShadow: "0 18px 52px rgba(0,230,118,0.42)" }
        : { borderColor: "rgba(255,255,255,0.32)", boxShadow: "0 8px 28px rgba(0,0,0,0.35)" }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      {variant === "primary" && !reduce && (
        <span aria-hidden style={{ position: "absolute", top: 0, left: 0, width: "32%", height: "100%", background: "linear-gradient(100deg, transparent, rgba(255,255,255,0.4), transparent)", animation: "shine 4.5s ease-in-out infinite", pointerEvents: "none" }} />
      )}
      <span style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 8 }}>{children}</span>
    </motion.button>
  );
}
