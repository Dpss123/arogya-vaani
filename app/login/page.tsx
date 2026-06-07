"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Stethoscope, FileText, Languages, ShieldCheck, Mail, Lock, User, ArrowRight } from "lucide-react";
import Logo from "@/components/Logo";
import { supabaseBrowser } from "@/lib/supabaseBrowser";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) { toast.error("Email aur password daalein"); return; }
    if (password.length < 6) { toast.error("Password kam se kam 6 characters ka ho"); return; }
    if (mode === "signup" && !name.trim()) { toast.error("Apna naam daalein"); return; }
    setLoading(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabaseBrowser.auth.signUp({ email: email.trim(), password, options: { data: { name: name.trim() } } });
        if (error) throw error;
        if (data.session) { toast.success("Account ban gaya! Welcome 🌿"); router.push("/home"); }
        else { toast.success("Confirmation email bheji gayi. Email confirm karke sign in karein."); setMode("signin"); setPassword(""); }
      } else {
        const { error } = await supabaseBrowser.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        toast.success("Welcome back!");
        router.push("/home");
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Kuch galat ho gaya. Dobara try karein.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      const { signIn } = await import("next-auth/react");
      await signIn("google", { callbackUrl: "/home" });
    } catch { setGoogleLoading(false); }
  };

  const FEATURES: [typeof Stethoscope, string, string][] = [
    [Stethoscope, "Free AI triage", "Symptoms se 60-second verdict"],
    [FileText, "Report reader", "Blood test, X-ray Hindi mein"],
    [Languages, "12 languages", "Apni bhasha mein baat karein"],
    [ShieldCheck, "Private", "Aapka data kabhi share nahi hoga"],
  ];

  const field: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)",
    borderRadius: 12, padding: "12px 14px 12px 42px", color: "#F0F4FF", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none",
  };
  const iconWrap: React.CSSProperties = { position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-3)", display: "flex" };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex" }}>
      {/* LEFT — brand panel (desktop) */}
      <div className="login-brand grid-bg" style={{ flex: 1, position: "relative", padding: "56px 56px", flexDirection: "column", justifyContent: "space-between", borderRight: "1px solid var(--border)", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "-10%", left: "-10%", width: 480, height: 480, background: "radial-gradient(circle, rgba(0,230,118,0.1), transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: "-10%", right: "-10%", width: 480, height: 480, background: "radial-gradient(circle, rgba(0,196,255,0.08), transparent 70%)", pointerEvents: "none" }} />

        <Logo size={32} withText textSize={20} />

        <div style={{ position: "relative" }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#00E676", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 16 }}>India&apos;s WhatsApp-native Health OS</div>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(32px,3.4vw,52px)", lineHeight: 1.02, letterSpacing: "-0.03em", color: "#F0F4FF", margin: 0 }}>
            The doctor for<br />every <span className="shimmer-text">Indian.</span>
          </h1>
          <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: 18, color: "var(--text-2)", marginTop: 20, maxWidth: 380, lineHeight: 1.55 }}>
            Free symptom triage, report analysis, and 4 trained AI models. In your language.
          </p>
        </div>

        <div style={{ position: "relative", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 460 }}>
          {FEATURES.map(([Icon, t, d]) => (
            <div key={t} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(0,230,118,0.1)", border: "1px solid rgba(0,230,118,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icon size={16} color="#00E676" />
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#F0F4FF" }}>{t}</div>
                <div style={{ fontSize: 11, color: "var(--text-3)", lineHeight: 1.4, marginTop: 1 }}>{d}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — auth */}
      <div style={{ width: "min(100%, 500px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "40px clamp(24px,5vw,56px)" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          <div className="login-mobile-logo" style={{ marginBottom: 28, justifyContent: "center" }}>
            <Logo size={30} withText textSize={18} />
          </div>

          <h2 style={{ fontSize: 26, fontWeight: 800, color: "#F0F4FF", fontFamily: "var(--font-display)", letterSpacing: "-0.02em", marginBottom: 6 }}>
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h2>
          <p style={{ fontSize: 14, color: "var(--text-3)", marginBottom: 24, lineHeight: 1.6 }}>
            {mode === "signin" ? "Apne account mein sign in karein." : "Apna free account banayein. 2 minute."}
          </p>

          {/* tab switch */}
          <div style={{ display: "flex", gap: 4, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 100, padding: 4, marginBottom: 24 }}>
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: "9px", borderRadius: 100, border: "none", cursor: "pointer", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 600,
                background: mode === m ? "linear-gradient(135deg,#00E676,#00C4FF)" : "transparent",
                color: mode === m ? "#04060D" : "var(--text-2)",
              }}>{m === "signin" ? "Sign In" : "Sign Up"}</button>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {mode === "signup" && (
              <div style={{ position: "relative" }}>
                <span style={iconWrap}><User size={16} /></span>
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Poora naam" style={field} />
              </div>
            )}
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Mail size={16} /></span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" style={field} />
            </div>
            <div style={{ position: "relative" }}>
              <span style={iconWrap}><Lock size={16} /></span>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") submit(); }} placeholder="Password (min 6)" style={field} />
            </div>

            <button onClick={submit} disabled={loading} style={{
              width: "100%", marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: loading ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg,#00E676,#00C4FF)",
              border: "none", borderRadius: 100, padding: "14px", fontSize: 15, fontWeight: 700,
              color: loading ? "var(--text-3)" : "#04060D", cursor: loading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)",
            }}>
              {loading
                ? <div style={{ width: 18, height: 18, border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "#04060D", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                : <>{mode === "signin" ? "Sign In" : "Create Account"} <ArrowRight size={16} /></>}
            </button>
          </div>

          <div style={{ position: "relative", margin: "20px 0", textAlign: "center" }}>
            <div style={{ height: 1, background: "var(--border)" }} />
            <span style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", background: "var(--bg)", padding: "0 12px", fontSize: 11, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>YA</span>
          </div>

          <button onClick={handleGoogle} disabled={googleLoading} style={{ width: "100%", background: googleLoading ? "rgba(255,255,255,0.04)" : "#fff", border: "none", borderRadius: 100, padding: "13px 20px", fontSize: 14, fontWeight: 600, color: "#1a1a1a", cursor: googleLoading ? "not-allowed" : "pointer", fontFamily: "var(--font-body)", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
            {googleLoading
              ? <div style={{ width: 18, height: 18, border: "2px solid rgba(0,0,0,0.15)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
              : <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>}
            Continue with Google
          </button>

          <p style={{ marginTop: 22, textAlign: "center", fontSize: 12, color: "var(--text-3)", lineHeight: 1.6 }}>
            {mode === "signin" ? (
              <>Naya user? <span onClick={() => setMode("signup")} style={{ color: "#00E676", cursor: "pointer", fontWeight: 600 }}>Sign up karein</span></>
            ) : (
              <>Pehle se account hai? <span onClick={() => setMode("signin")} style={{ color: "#00E676", cursor: "pointer", fontWeight: 600 }}>Sign in karein</span></>
            )}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .login-brand { display: none; }
        .login-mobile-logo { display: flex; }
        input::placeholder { color: var(--text-3); }
        @media (min-width: 900px) {
          .login-brand { display: flex; }
          .login-mobile-logo { display: none; }
        }
      `}</style>
    </div>
  );
}
