export default function Loading() {
  return (
    <div style={{ minHeight: "100vh", background: "#06090f", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20 }}>
      <div style={{ position: "relative", width: 64, height: 64 }}>
        <div style={{ position: "absolute", inset: 0, border: "3px solid rgba(0,230,118,0.1)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
        <div style={{ position: "absolute", inset: 8, border: "2px solid rgba(0,180,216,0.1)", borderBottomColor: "#00B4D8", borderRadius: "50%", animation: "spin 0.7s linear infinite reverse" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏥</div>
      </div>
      <p style={{ fontSize: 13, color: "rgba(249,246,240,0.35)", fontFamily: "var(--font-mono)", letterSpacing: "0.08em" }}>LOADING...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
