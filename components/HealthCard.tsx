"use client";

type Props = {
  icon: string;
  title: string;
  value: string;
  subtitle?: string;
  color?: string;
  onClick?: () => void;
};

export default function HealthCard({ icon, title, value, subtitle, color = "#00E676", onClick }: Props) {
  return (
    <div onClick={onClick} style={{
      background: `${color}06`, border: `1px solid ${color}20`,
      borderRadius: 16, padding: "16px 18px",
      cursor: onClick ? "pointer" : "default",
      transition: "all 0.2s",
    }}
      onMouseEnter={e => { if (onClick) { (e.currentTarget as HTMLDivElement).style.background = `${color}10`; (e.currentTarget as HTMLDivElement).style.borderColor = `${color}35`; }}}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = `${color}06`; (e.currentTarget as HTMLDivElement).style.borderColor = `${color}20`; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <span style={{ fontSize: 12, color: "rgba(249,246,240,0.4)", fontFamily: "DM Mono,monospace", letterSpacing: "0.06em", textTransform: "uppercase" }}>{title}</span>
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color, fontFamily: "Playfair Display,serif", letterSpacing: "-0.02em", marginBottom: 2 }}>{value}</div>
      {subtitle && <div style={{ fontSize: 12, color: "rgba(249,246,240,0.4)" }}>{subtitle}</div>}
    </div>
  );
}
