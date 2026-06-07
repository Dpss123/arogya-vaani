type Props = { size?: number; color?: string; text?: string; };

export default function LoadingSpinner({ size = 32, color = "#00E676", text }: Props) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{
        width: size, height: size,
        border: `${size / 16}px solid rgba(0,230,118,0.15)`,
        borderTopColor: color, borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      {text && <p style={{ fontSize: 13, color: "rgba(249,246,240,0.4)", fontFamily: "DM Mono,monospace", letterSpacing: "0.06em" }}>{text}</p>}
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
