"use client";
import { motion } from "framer-motion";
import React from "react";

type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "ghost";
  style?: React.CSSProperties;
};

export default function Button({ children, onClick, variant = "primary", style }: Props) {
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
    gap: 8,
    background: variant === "primary" ? "linear-gradient(135deg,#00E676,#00C4FF)" : "transparent",
    color: variant === "primary" ? "#04060D" : "#F0F4FF",
    ...style,
  };
  return (
    <motion.button
      onClick={onClick}
      style={base}
      whileHover={variant === "primary"
        ? { y: -2, boxShadow: "0 16px 48px rgba(0,230,118,0.35)" }
        : { y: -2, borderColor: "rgba(255,255,255,0.32)" }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      {children}
    </motion.button>
  );
}
