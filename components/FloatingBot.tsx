"use client";
import { useRouter, usePathname } from "next/navigation";

// Floating AI assistant launcher — the brand bot icon pinned to the lower-right
// that opens the chat. Rendered only inside the authenticated AppShell; hidden on
// the chat page itself (you are already there).
export default function FloatingBot() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/chat") return null;

  return (
    <button onClick={() => router.push("/chat")} aria-label="Ask the AI assistant" className="floating-bot">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/bot-avatar.png" alt="AI assistant" width={54} height={54} style={{ width: 54, height: 54, objectFit: "contain", display: "block" }} />
    </button>
  );
}
