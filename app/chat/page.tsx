"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { FileText, Siren, User, Paperclip, Mic, Square, ArrowRight } from "lucide-react";
import LangSelect from "@/components/LangSelect";
import BackButton from "@/components/ui/BackButton";
import { getLang } from "@/lib/lang";
import { useT } from "@/components/LanguageProvider";

type Message = { id: string; role: "patient" | "ai"; content: string; time: string; };

function AiAvatar({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/bot-avatar.png" alt="" width={size} height={size} style={{ width: size, height: size, flexShrink: 0, alignSelf: "flex-end", objectFit: "contain" }} />
  );
}

// Floating, blinking bot mascot for the welcome greeting.
// Two frames crossfade: eyes open (bot-avatar) and a quick blink (bot-avatar-blink).
function BotMascot({ size = 104 }: { size?: number }) {
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0, animation: "floaty 3.2s ease-in-out infinite", filter: "drop-shadow(0 12px 22px rgba(0,230,118,0.4))" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bot-avatar.png" alt="Arogya Vaani AI" width={size} height={size} style={{ width: "100%", height: "100%", display: "block" }} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bot-avatar-blink.png" alt="" width={size} height={size} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", opacity: 0, animation: "botBlink 4s ease-in-out infinite" }} />
    </div>
  );
}

export default function ChatPage() {
  const router = useRouter();
  const { t } = useT();
  const [messages, setMessages] = useState<Message[]>([{
    id: "1", role: "ai",
    content: t("Namaskar! Main Arogya Vaani AI hoon.\n\nApni sehat ki koi bhi baat poochhein, Hindi ya English mein.\n\nReport bhejne ke liye neeche clip button, aur bolne ke liye mic button dabayein.\n\nYeh AI advice hai, serious symptoms mein 108 call karein."),
    time: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const addMessage = (role: "patient" | "ai", content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, time: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }) }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    addMessage("patient", text);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history: messages.slice(-6), lang: getLang() }) });
      const data = await res.json();
      addMessage("ai", data.reply || t("Kuch problem aayi. Dobara try karein."));
    } catch { addMessage("ai", t("Network error. Please check connection.")); }
    finally { setLoading(false); }
  };

  const handleVoice = () => {
    const w = window as Window & { SpeechRecognition?: new() => { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void; }; webkitSpeechRecognition?: new() => { lang: string; continuous: boolean; interimResults: boolean; onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null; onend: (() => void) | null; onerror: (() => void) | null; start: () => void; stop: () => void; } };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.error(t("Chrome use karein voice ke liye")); return; }
    if (isListening) { setIsListening(false); return; }
    const recognition = new SR();
    recognition.lang = "hi-IN";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => { toast.error(t("Mic access do")); setIsListening(false); };
    recognition.start();
    setIsListening(true);
  };

  const handleReportUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingReport(true);
    addMessage("patient", `Report upload: ${file.name}`);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await fetch("/api/report", { method: "POST", body: formData });
      const data = await res.json();
      addMessage("ai", data.summary || t("Report padh nahi paya."));
    } catch { addMessage("ai", t("Report upload mein problem aayi.")); }
    finally { setUploadingReport(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const quickActions = ["Mujhe bukhaar hai", "Seene mein dard hai", "Blood report explain karo", "Khansi aur sardi hai", "Pet mein dard hai", "Neend nahi aa rahi"];

  return (
    <div style={{ height: "100dvh", overflow: "hidden", display: "flex", flexDirection: "column", background: "#06090f" }}>
      <div className="m-wrap" style={{ padding: "11px clamp(16px,4vw,28px)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackButton size={19} style={{ flexShrink: 0 }} />
        <AiAvatar size={36} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(17px,2.2vw,21px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: 0 }}>{t("Arogya Vaani AI")}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 8px #00E676", animation: "heartbeat 1.8s infinite" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>{t("Online · Hindi + English")}</span>
          </div>
        </div>
        <div className="m-wrap" style={{ marginLeft: "auto", display: "flex", gap: 8, alignItems: "center" }}>
          <LangSelect />
          <button onClick={() => router.push("/report")} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(0,230,118,0.08)", border: "1px solid rgba(0,230,118,0.15)", color: "#00E676", padding: "7px 14px", borderRadius: 100, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}><FileText size={14} /> {t("Report")}</button>
          <button onClick={() => router.push("/emergency")} style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,71,87,0.08)", border: "1px solid rgba(255,71,87,0.2)", color: "#FF4757", padding: "7px 14px", borderRadius: 100, fontSize: 12, cursor: "pointer", fontFamily: "var(--font-body)" }}><Siren size={14} /> {t("Emergency")}</button>
          <button onClick={() => router.push("/account")} style={{ display: "flex", alignItems: "center", background: "transparent", border: "1px solid var(--border)", color: "var(--text-2)", padding: 8, borderRadius: 100, cursor: "pointer" }}><User size={15} /></button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "24px clamp(16px,4vw,28px)", display: "flex", flexDirection: "column", gap: 14, maxWidth: 720, width: "100%", margin: "0 auto" }}>
        {messages.length <= 1 && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, padding: "10px 0 6px" }}>
            <BotMascot size={104} />
            <div style={{ fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 15, color: "#C9D4F0", letterSpacing: "-0.01em" }}>{t("Namaste! Main aapki madad ke liye hoon")}</div>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: "flex", justifyContent: msg.role === "patient" ? "flex-end" : "flex-start", gap: 8 }}>
            {msg.role === "ai" && <AiAvatar />}
            <div style={{ maxWidth: "76%" }}>
              <div style={{ padding: "12px 16px", borderRadius: msg.role === "patient" ? "18px 18px 4px 18px" : "18px 18px 18px 4px", background: msg.role === "patient" ? "linear-gradient(135deg,#00E676,#00C4FF)" : "rgba(255,255,255,0.03)", color: msg.role === "patient" ? "#04060D" : "#F0F4FF", border: msg.role === "ai" ? "1px solid var(--border)" : "none", fontSize: 14, lineHeight: 1.65, whiteSpace: "pre-wrap", fontWeight: msg.role === "patient" ? 500 : 400 }}>
                {msg.content}
              </div>
              <div style={{ fontSize: 10, color: "var(--text-3)", marginTop: 4, textAlign: msg.role === "patient" ? "right" : "left", fontFamily: "var(--font-mono)" }}>{msg.time}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", gap: 8 }}>
            <AiAvatar />
            <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.03)", borderRadius: "18px 18px 18px 4px", border: "1px solid var(--border)", display: "flex", gap: 5, alignItems: "center" }}>
              {[0, 0.15, 0.3].map((d, i) => <div key={i} style={{ width: 7, height: 7, borderRadius: "50%", background: "#00E676", animation: `wave 1s ease-in-out infinite`, animationDelay: `${d}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {messages.length <= 1 && (
        <div style={{ padding: "0 clamp(16px,4vw,28px) 12px", display: "flex", gap: 8, overflowX: "auto", flexShrink: 0, maxWidth: 720, width: "100%", margin: "0 auto" }}>
          {quickActions.map(action => (
            <button key={action} onClick={() => sendMessage(action)} style={{ background: "rgba(0,230,118,0.06)", border: "1px solid rgba(0,230,118,0.15)", color: "#00E676", padding: "8px 14px", borderRadius: 100, fontSize: 12, cursor: "pointer", whiteSpace: "nowrap", fontFamily: "var(--font-body)", flexShrink: 0 }}>{t(action)}</button>
          ))}
        </div>
      )}

      <div style={{ padding: "12px clamp(16px,4vw,28px) 20px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-end", maxWidth: 720, margin: "0 auto" }}>
          <input type="file" ref={fileRef} accept="image/*,.pdf" onChange={handleReportUpload} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploadingReport} style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {uploadingReport ? <div style={{ width: 16, height: 16, border: "2px solid rgba(0,230,118,0.3)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Paperclip size={18} />}
          </button>
          <div style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 24, padding: "10px 16px" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} placeholder={t("Apni problem batayein...")} rows={1} style={{ width: "100%", background: "transparent", border: "none", outline: "none", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)", resize: "none", lineHeight: 1.5 }} />
          </div>
          <button onClick={handleVoice} style={{ width: 44, height: 44, borderRadius: "50%", background: isListening ? "rgba(255,71,87,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${isListening ? "rgba(255,71,87,0.4)" : "var(--border)"}`, color: isListening ? "#FF4757" : "var(--text-2)", animation: isListening ? "micpulse 1.2s ease-out infinite" : undefined, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
          </button>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{ width: 44, height: 44, borderRadius: "50%", background: input.trim() && !loading ? "linear-gradient(135deg,#00E676,#00C4FF)" : "rgba(255,255,255,0.03)", border: "none", color: input.trim() && !loading ? "#04060D" : "var(--text-3)", cursor: input.trim() && !loading ? "pointer" : "not-allowed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={18} /></button>
        </div>
        <div style={{ textAlign: "center", marginTop: 8, fontSize: 10, color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>{t("AI ADVICE · EMERGENCY → 108")}</div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes wave{0%,100%{transform:scale(0.5)}50%{transform:scale(1)}}`}</style>
    </div>
  );
}
