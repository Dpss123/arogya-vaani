-- ============================================
-- AROGYA VAANI — DB RESET (DESTRUCTIVE)
-- ============================================
-- Use this ONLY when an older/incompatible schema already exists in the
-- project (e.g. tables built around `patient_id` instead of `patient_phone`).
--
-- ⚠️  THIS DELETES the listed tables AND ALL THEIR DATA, then recreates them
--     fresh from this repo's schema. Run in Supabase → SQL Editor.
--     Safe here because the only existing rows are old test data.
-- ============================================

-- 1) Drop the conflicting tables (CASCADE clears their indexes/FKs/policies).
drop table if exists medicine_scans  cascade;
drop table if exists messages         cascade;
drop table if exists triage_results   cascade;
drop table if exists reports          cascade;
drop table if exists outbreak_alerts  cascade;
drop table if exists doctors          cascade;
drop table if exists patients         cascade;

-- 2) Recreate everything from scratch (same as lib/supabase-schema.sql).
create extension if not exists "pgcrypto";

create table patients (
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
create index patients_phone_idx on patients(phone);

create table messages (
  id            uuid default gen_random_uuid() primary key,
  patient_phone text not null references patients(phone) on delete cascade,
  role          text check (role in ('patient','ai')) not null,
  content       text not null,
  language      text default 'hindi' check (language in ('hindi','english')),
  message_type  text default 'text',
  created_at    timestamptz default now()
);
create index messages_phone_idx on messages(patient_phone, created_at desc);

create table triage_results (
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
create index triage_phone_idx on triage_results(patient_phone, created_at desc);
create index triage_verdict_idx on triage_results(verdict);

create table reports (
  id            uuid default gen_random_uuid() primary key,
  patient_phone text not null references patients(phone) on delete cascade,
  file_url      text not null,
  file_type     text check (file_type in ('blood_test','xray','urine','mri','ecg','prescription','other')) default 'other',
  ai_summary    text,
  risk_level    text check (risk_level in ('normal','borderline','urgent')) default 'normal',
  uploaded_at   timestamptz default now()
);
create index reports_phone_idx on reports(patient_phone, uploaded_at desc);

create table medicine_scans (
  id            uuid default gen_random_uuid() primary key,
  patient_phone text references patients(phone) on delete cascade,
  medicine_name text,
  analysis      text,
  created_at    timestamptz default now()
);

create table doctors (
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
create index doctors_district_idx on doctors(district);

create table outbreak_alerts (
  id               uuid default gen_random_uuid() primary key,
  location         text not null,
  pincode          text,
  probable_disease text,
  risk_level       text check (risk_level in ('LOW','MEDIUM','HIGH','CRITICAL')) default 'LOW',
  case_count       integer default 0,
  alert_sent       boolean default false,
  created_at       timestamptz default now()
);

-- Row Level Security: on for every table, no anon policies (service role bypasses).
alter table patients       enable row level security;
alter table messages        enable row level security;
alter table triage_results  enable row level security;
alter table reports         enable row level security;
alter table medicine_scans  enable row level security;
alter table doctors         enable row level security;
alter table outbreak_alerts enable row level security;

-- Storage bucket for reports / X-rays / voice notes (private).
insert into storage.buckets (id, name, public)
values ('reports', 'reports', false)
on conflict (id) do nothing;
