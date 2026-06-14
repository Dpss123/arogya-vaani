"use client";

// Arogya Vaani assistant mascot — a friendly green robot face whose round eyes
// blink cleanly (CSS scaleY, no misaligned PNG frames). Pure SVG, scales to any
// size. Uses the site green (#00E676 family). Set blink={false} for a static avatar.
export default function BotAvatar({
  size = 56, blink = true, style,
}: {
  size?: number; blink?: boolean; style?: React.CSSProperties;
}) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} fill="none" aria-hidden
      xmlns="http://www.w3.org/2000/svg" style={{ display: "block", flexShrink: 0, ...style }}>
      <defs>
        <linearGradient id="avBotBody" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00F58C" />
          <stop offset="1" stopColor="#00B257" />
        </linearGradient>
      </defs>
      {/* antenna */}
      <line x1="32" y1="6" x2="32" y2="13" stroke="#00E676" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="32" cy="4.6" r="2.8" fill="#7CFFC0" />
      {/* side ears */}
      <rect x="8" y="28" width="4.5" height="11" rx="2.2" fill="url(#avBotBody)" />
      <rect x="51.5" y="28" width="4.5" height="11" rx="2.2" fill="url(#avBotBody)" />
      {/* head */}
      <rect x="13" y="13" width="38" height="38" rx="13" fill="url(#avBotBody)" />
      {/* dark face screen */}
      <rect x="18" y="22" width="28" height="20" rx="9" fill="#06281A" />
      {/* round eyes that blink in place */}
      <g className={blink ? "bot-eyes" : undefined} fill="#C8FFE4">
        <circle cx="26" cy="32" r="4" />
        <circle cx="38" cy="32" r="4" />
      </g>
    </svg>
  );
}
