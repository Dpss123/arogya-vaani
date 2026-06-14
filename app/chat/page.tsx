"use client";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { Paperclip, Mic, Square, ArrowRight } from "lucide-react";
import LangSelect from "@/components/LangSelect";
import BackButton from "@/components/ui/BackButton";
import { getLang } from "@/lib/lang";
import { useT } from "@/components/LanguageProvider";

type Message = { id: string; role: "patient" | "ai"; content: string; time: string; };

// Map the app's language to a speech-recognition locale, so the mic listens in
// the user's chosen language (not only Hindi).
const SPEECH_LOCALE: Record<string, string> = {
  hinglish: "hi-IN", hindi: "hi-IN", english: "en-IN", tamil: "ta-IN",
  telugu: "te-IN", bengali: "bn-IN", marathi: "mr-IN", gujarati: "gu-IN",
  kannada: "kn-IN", punjabi: "pa-IN", odia: "or-IN", malayalam: "ml-IN",
};
type SREvent = { resultIndex: number; results: { length: number; [i: number]: { isFinal: boolean; [j: number]: { transcript: string } } } };
type SRInstance = {
  lang: string; continuous: boolean; interimResults: boolean;
  onresult: ((e: SREvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  start: () => void; stop: () => void;
};

function AiAvatar({ size = 32 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/bot-avatar.png" alt="" width={size} height={size} style={{ width: size, height: size, flexShrink: 0, alignSelf: "flex-end", objectFit: "contain" }} />
  );
}

// Floating bot mascot for the welcome greeting (brand icon, gentle float).
function BotMascot({ size = 104 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size, flexShrink: 0, animation: "floaty 3.2s ease-in-out infinite", filter: "drop-shadow(0 10px 18px rgba(0,0,0,0.4))" }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bot-avatar.png" alt="Arogya Vaani" width={size} height={size} style={{ width: "100%", height: "100%", display: "block", objectFit: "contain" }} />
    </div>
  );
}

export default function ChatPage() {
  const { t } = useT();
  const [messages, setMessages] = useState<Message[]>([{
    id: "1", role: "ai",
    content: t("Namaskar! Main Arogya Vaani hoon.\n\nApni sehat ki koi bhi baat poochhein, Hindi ya English mein.\n\nReport bhejne ke liye neeche clip button, aur bolne ke liye mic button dabayein.\n\nYeh AI advice hai, serious symptoms mein 108 call karein."),
    time: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" })
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [uploadingReport, setUploadingReport] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SRInstance | null>(null);
  const keepListeningRef = useRef(false);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  // Stop the mic if the user leaves the chat while it is listening
  useEffect(() => () => { keepListeningRef.current = false; recognitionRef.current?.stop(); }, []);

  const addMessage = (role: "patient" | "ai", content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, time: new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" }) }]);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    addMessage("patient", text);
    setInput("");
    setLoading(true);
    const aiId = (Date.now() + 1).toString();
    const aiTime = new Date().toLocaleTimeString("hi-IN", { hour: "2-digit", minute: "2-digit" });
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text, history: messages.slice(-6), lang: getLang() }) });
      if (!res.body) { addMessage("ai", t("Kuch problem aayi. Dobara try karein.")); return; }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      let started = false;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        if (!started && acc.trim()) {
          started = true;
          setLoading(false);
          setMessages(prev => [...prev, { id: aiId, role: "ai", content: acc, time: aiTime }]);
        } else if (started) {
          setMessages(prev => prev.map(m => (m.id === aiId ? { ...m, content: acc } : m)));
        }
      }
      if (!started) addMessage("ai", t("Kuch problem aayi. Dobara try karein."));
    } catch { addMessage("ai", t("Network error. Please check connection.")); }
    finally { setLoading(false); }
  };

  const handleVoice = () => {
    const w = window as Window & { SpeechRecognition?: new () => SRInstance; webkitSpeechRecognition?: new () => SRInstance };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) { toast.error(t("Chrome use karein voice ke liye")); return; }
    // tapping the mic again stops listening
    if (isListening) { keepListeningRef.current = false; recognitionRef.current?.stop(); setIsListening(false); return; }

    const baseText = input.trim() ? input.trim() + " " : "";   // keep what is already typed
    const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    let finalText = "";
    const recognition = new SR();
    recognition.lang = SPEECH_LOCALE[getLang()] || "hi-IN";   // listen in the chosen language
    recognition.continuous = !isMobile;                       // desktop: hands-free; phones: single utterance (continuous is unreliable there) + auto-restart below
    recognition.interimResults = true;                        // live partial text in the box
    recognition.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const tr = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += tr + " ";
        else interim += tr;
      }
      setInput((baseText + finalText + interim).trim());
    };
    recognition.onend = () => {
      // Chrome ends the session after a short silence — restart while the mic is still on
      if (keepListeningRef.current) { try { recognition.start(); } catch { setIsListening(false); } }
      else setIsListening(false);
    };
    recognition.onerror = (ev) => {
      if (["not-allowed", "service-not-allowed", "audio-capture", "network"].includes(ev.error)) {
        if (ev.error !== "network") toast.error(t("Mic access do"));
        keepListeningRef.current = false;
        setIsListening(false);
      }
      // no-speech / aborted → let onend restart so a pause does not cut it off
    };
    recognitionRef.current = recognition;
    keepListeningRef.current = true;
    try { recognition.start(); } catch { /* already started */ }
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
      <div style={{ padding: "11px clamp(16px,4vw,28px)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
        <BackButton size={19} style={{ flexShrink: 0 }} />
        <AiAvatar size={36} />
        <div style={{ minWidth: 0 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "clamp(17px,2.2vw,21px)", letterSpacing: "-0.025em", color: "#F0F4FF", margin: 0 }}>{t("Arogya Vaani")}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 1 }}>
            <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#00E676", boxShadow: "0 0 8px #00E676", animation: "heartbeat 1.8s infinite" }} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", letterSpacing: "0.06em" }}>{t("Online · Hindi + English")}</span>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <LangSelect />
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

      <div style={{ padding: "8px clamp(16px,4vw,28px) 10px", borderTop: "1px solid var(--border)", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end", maxWidth: 720, margin: "0 auto" }}>
          <input type="file" ref={fileRef} accept="image/*,.pdf" onChange={handleReportUpload} style={{ display: "none" }} />
          <button onClick={() => fileRef.current?.click()} disabled={uploadingReport} style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", color: "var(--text-2)", cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {uploadingReport ? <div style={{ width: 16, height: 16, border: "2px solid rgba(0,230,118,0.3)", borderTopColor: "#00E676", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} /> : <Paperclip size={18} />}
          </button>
          <div className="chat-input-box" style={{ flex: 1, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border)", borderRadius: 24, padding: "10px 16px", transition: "border-color 0.2s, box-shadow 0.2s" }}>
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }} placeholder={t("Apni problem batayein...")} rows={1} style={{ width: "100%", background: "transparent", border: "none", outline: "none", boxShadow: "none", color: "#F0F4FF", fontSize: 14, fontFamily: "var(--font-body)", resize: "none", lineHeight: 1.5 }} />
          </div>
          <button onClick={handleVoice} style={{ width: 42, height: 42, borderRadius: "50%", background: isListening ? "rgba(255,71,87,0.15)" : "rgba(255,255,255,0.03)", border: `1px solid ${isListening ? "rgba(255,71,87,0.4)" : "var(--border)"}`, color: isListening ? "#FF4757" : "var(--text-2)", animation: isListening ? "micpulse 1.2s ease-out infinite" : undefined, cursor: "pointer", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {isListening ? <Square size={16} fill="currentColor" /> : <Mic size={18} />}
          </button>
          <button onClick={() => sendMessage(input)} disabled={!input.trim() || loading} style={{ width: 42, height: 42, borderRadius: "50%", background: input.trim() && !loading ? "linear-gradient(135deg,#00E676,#00C4FF)" : "rgba(255,255,255,0.03)", border: "none", color: input.trim() && !loading ? "#04060D" : "var(--text-3)", cursor: input.trim() && !loading ? "pointer" : "not-allowed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}><ArrowRight size={18} /></button>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes wave{0%,100%{transform:scale(0.5)}50%{transform:scale(1)}}`}</style>
    </div>
  );
}
