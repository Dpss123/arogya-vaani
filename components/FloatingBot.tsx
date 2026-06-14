"use client";
import { useRouter, usePathname } from "next/navigation";

// Floating AI assistant launcher — a blinking bot mascot pinned to the lower-left
// that opens the chat. Rendered only inside the authenticated AppShell; hidden on
// the chat page itself (you are already there).
export default function FloatingBot() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/chat") return null;

  return (
    <button onClick={() => router.push("/chat")} aria-label="Ask the AI assistant" className="floating-bot">
      <span className="floating-bot-ring" aria-hidden />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bot-avatar.png" alt="AI assistant" className="floating-bot-img" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bot-avatar-blink.png" alt="" className="floating-bot-blink" aria-hidden />
      <span className="floating-bot-dot" aria-hidden />
    </button>
  );
}
