-- ============================================
-- AROGYA VAANI — COMPLETE SUPABASE SCHEMA
-- Paste into Supabase → SQL Editor → Run. 100% free tier.
-- Safe to re-run: every statement is idempotent.
-- ============================================

create extension if not exists "pgcrypto";

-- ── PATIENTS ──────────────────────────────
create table if not exists patients (
  id                uuid default gen_random_uuid() primary key,
  phone             text unique not null,
  name              text,
  age               integer,
  gender            text check (gender in ('male','female','other')),
  village           text,
  district          text default 'Haridwar',
  state             text default 'Uttarakhand',
  blood_group       text,
  allergies         text,
  abha_id           text,
  pincode           text,
  emergency_contact text,
  language_pref     text default 'hindi',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
create index if not exists patients_phone_idx on patients(phone);

-- ── MESSAGES ──────────────────────────────
create table if not exists messages (
  id            uuid default gen_random_uuid() primary key,
  patient_phone text not null references patients(phone) on delete cascade,
  role          text check (role in ('patient','ai')) not null,
  content       text not null,
  language      text default 'hindi' check (language in ('hindi','english')),
  message_type  text default 'text',
  created_at    timestamptz default now()
);
create index if not exists messages_phone_idx on messages(patient_phone, created_at desc);

-- ── TRIAGE RESULTS ────────────────────────
create table if not exists triage_results (
  id                uuid default gen_random_uuid() primary key,
  patient_phone     text not null references patients(phone) on delete cascade,
  symptoms          text not null,
  verdict           text check (verdict in ('rest','clinic','emergency')) not null,
  advice            text,
  warning_signs     text[],
  call_108          boolean default false,
  see_doctor_within text default 'home_rest',
  created_at        timestamptz default now()
);
create index if not exists triage_phone_idx on triage_results(patient_phone, created_at desc);
create index if not exists triage_verdict_idx on triage_results(verdict);

-- ── REPORTS ───────────────────────────────
create table if not exists reports (
  id            uuid default gen_random_uuid() primary key,
  patient_phone text not null references patients(phone) on delete cascade,
  file_url      text not null,
  file_type     text check (file_type in ('blood_test','xray','urine','mri','ecg','prescription','other')) default 'other',
  ai_summary    text,
  risk_level    text check (risk_level in ('normal','borderline','urgent')) default 'normal',
  uploaded_at   timestamptz default now()
);
create index if not exists reports_phone_idx on reports(patient_phone, uploaded_at desc);

-- ── MEDICINE SCANS ────────────────────────
create table if not exists medicine_scans (
  id            uuid default gen_random_uuid() primary key,
  patient_phone text references patients(phone) on delete cascade,
  medicine_name text,
  analysis      text,
  created_at    timestamptz default now()
);

-- ── DOCTORS ───────────────────────────────
create table if not exists doctors (
  id               uuid default gen_random_uuid() primary key,
  name             text not null,
  email            text unique,
  phone            text,
  speciality       text default 'General Physician',
  clinic_address   text,
  district         text default 'Haridwar',
  is_verified      boolean default false,
  accepts_ayushman boolean default true,
  created_at       timestamptz default now()
);
create index if not exists doctors_district_idx on doctors(district);

-- ── OUTBREAK ALERTS ───────────────────────
create table if not exists outbreak_alerts (
  id               uuid default gen_random_uuid() primary key,
  location         text not null,
  pincode          text,
  probable_disease text,
  risk_level       text check (risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')) default 'LOW',
  case_count       integer default 0,
  alert_sent       boolean default false,
  created_at       timestamptz default now()
);

-- ============================================
-- ROW LEVEL SECURITY (health-data safe default)
--
-- RLS is enabled on EVERY table and NO public/anon policies are created.
-- The server uses the SERVICE ROLE key, which bypasses RLS, so all
-- server-side reads/writes keep working. The browser's ANON key has no
-- policy, so it cannot read patient data directly — which is what we want.
-- Add narrow policies later (e.g. a verified doctor reading their district)
-- only if you move any read into the browser.
-- ============================================
alter table patients       enable row level security;
alter table messages        enable row level security;
alter table triage_results  enable row level security;
alter table reports         enable row level security;
alter table medicine_scans  enable row level security;
alter table doctors         enable row level security;
alter table outbreak_alerts enable row level security;

-- ── STORAGE BUCKET (reports / X-rays / voice notes) ──
-- Free tier = 1 GB. Private bucket; serve via signed URLs from the server.
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;
