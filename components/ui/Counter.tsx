"use client";
import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

// Counts up from 0 to `to` when scrolled into view (easeOutCubic).
export default function Counter({
  to, suffix = "", prefix = "", decimals = 0, duration = 1600, style,
}: {
  to: number; suffix?: string; prefix?: string; decimals?: number; duration?: number; style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  const display = decimals > 0 ? val.toFixed(decimals) : Math.round(val).toLocaleString("en-IN");
  return <span ref={ref} style={style}>{prefix}{display}{suffix}</span>;
}
