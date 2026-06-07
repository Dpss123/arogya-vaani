-- ============================================
-- AROGYA VAANI — WhatsApp bot session state
-- Paste into Supabase → SQL Editor → Run. Free tier.
-- Tracks where each WhatsApp user is in a multi-step flow
-- (e.g. the PHQ-9 mental-health screener).
-- ============================================
create table if not exists whatsapp_sessions (
  phone      text primary key,
  flow       text,                      -- null = idle, else "phq9" / "scheme" / "doctor"
  step       integer default 0,
  data       jsonb default '{}'::jsonb, -- accumulated answers etc.
  updated_at timestamptz default now()
);

alter table whatsapp_sessions enable row level security;
-- No anon policy: only the service-role key (server) reads/writes this.
