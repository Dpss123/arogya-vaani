"use client";
import { useRouter, usePathname } from "next/navigation";
import BotAvatar from "./ui/BotAvatar";

// Floating AI assistant launcher — the blinking bot mascot pinned to the lower-left
// that opens the chat. Rendered only inside the authenticated AppShell; hidden on
// the chat page itself (you are already there).
export default function FloatingBot() {
  const router = useRouter();
  const pathname = usePathname();
  if (pathname === "/chat") return null;

  return (
    <button onClick={() => router.push("/chat")} aria-label="Ask the AI assistant" className="floating-bot">
      <BotAvatar size={58} />
    </button>
  );
}
