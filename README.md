<p align="center">
  <img src="public/logo.png" alt="Arogya Vaani" width="140" />
</p>

# Arogya Vaani
## India's First WhatsApp-Native AI Healthcare Platform

> Built by **Dheerendra** | CEO, Trixo Technologies | Haridwar, Uttarakhand
> B.Tech Final Year Project + Startup + Research Paper

---

## 🚀 Setup in 5 Minutes

### Step 1 — Get Free API Keys (all free!)

| Service | Link | Cost |
|---------|------|------|
| Gemini AI | aistudio.google.com | FREE |
| Groq (Whisper + LLaMA) | console.groq.com | FREE |
| Meta WhatsApp API | developers.facebook.com | FREE 1000 msgs |
| Supabase | supabase.com | FREE |
| Google OAuth | console.cloud.google.com | FREE |

### Step 2 — Install & Run

```bash
git clone https://github.com/Dpss123/arogya-vaani
cd arogya-vaani
npm install
cp .env.local.example .env.local
# Fill all keys in .env.local
npm run dev
# Open http://localhost:3000
```

### Step 3 — Setup Database

```
1. Go to supabase.com → New Project
2. SQL Editor → paste lib/supabase-schema.sql → Run
3. Copy URL + keys to .env.local
```

### Step 4 — Test WhatsApp

```bash
npx ngrok http 3000
# Copy https URL
# Paste in Meta WhatsApp webhook: https://xxx.ngrok.io/api/whatsapp
# Verify token: arogya_vaani_verify_2025
```

---

## 📁 Complete Folder Structure

```
arogya-vaani/
├── app/
│   ├── page.tsx                 ← Landing page (public)
│   ├── home/page.tsx            ← Patient dashboard
│   ├── login/page.tsx           ← Google login
│   ├── chat/page.tsx            ← AI chat (CORE) ⭐
│   ├── report/page.tsx          ← Report upload & analysis ⭐
│   ├── medicine/page.tsx        ← Medicine scanner ⭐
│   ├── triage/page.tsx          ← Triage result page
│   ├── mental-health/page.tsx   ← PHQ-9 depression screener
│   ├── pregnancy/page.tsx       ← Pregnancy week tracker
│   ├── outbreak/page.tsx        ← Disease surveillance (Research) ⭐
│   ├── doctors/page.tsx         ← Nearest doctor finder
│   ├── schemes/page.tsx         ← Govt scheme navigator
│   ├── emergency/page.tsx       ← 108 emergency alert
│   ├── dashboard/page.tsx       ← Doctor dashboard ⭐
│   ├── account/page.tsx         ← Patient profile
│   └── api/
│       ├── whatsapp/route.ts    ← Meta WhatsApp webhook ⭐
│       ├── chat/route.ts        ← AI conversation
│       ├── triage/route.ts      ← Urgency decision
│       ├── report/route.ts      ← PDF/image analysis
│       ├── medicine/route.ts    ← Medicine identifier
│       ├── emergency/route.ts   ← 108 alert
│       ├── outbreak/route.ts    ← Cluster detection
│       ├── mental-health/route.ts ← PHQ-9 AI analysis
│       ├── schemes/route.ts     ← Scheme eligibility
│       └── auth/[...nextauth]/  ← Google OAuth
│
├── components/
│   └── BottomNav.tsx            ← Mobile navigation
│
├── lib/
│   ├── gemini.ts                ← Google Gemini FREE ⭐
│   ├── supabase.ts              ← Database helpers
│   ├── whatsapp.ts              ← Meta Cloud API FREE ⭐
│   ├── whisper.ts               ← Voice transcription FREE ⭐
│   ├── prompts.ts               ← ALL AI prompts ⭐
│   └── supabase-schema.sql      ← Database tables
│
├── types/index.ts               ← TypeScript types
├── .env.local.example           ← API keys template
└── README.md                    ← This file
```

---

## 💰 Total Cost = ₹0

Everything runs on free tiers for development and small scale.

---

## 📄 Research Paper

**Title:** "Vaidya GPT: LLM-Based Multilingual Health Triage System for Rural India via WhatsApp Voice Interface"

**Target Journal:** IEEE INDICON / Springer LNCS / arXiv

**Key Contributions:**
1. First Hindi voice-based health triage system via WhatsApp
2. Real-time disease outbreak detection from conversational AI data
3. PHQ-9 mental health screening in Indian languages
4. Zero-cost architecture using free-tier APIs

---

## 🌟 Features

| Feature | Status |
|---------|--------|
| WhatsApp voice triage | ✅ |
| Report reader (blood/X-ray/MRI) | ✅ |
| Medicine scanner | ✅ |
| Emergency 108 alert | ✅ |
| Doctor dashboard | ✅ |
| Disease outbreak detection | ✅ |
| Mental health PHQ-9 | ✅ |
| Pregnancy companion | ✅ |
| Nearest doctor finder | ✅ |
| Govt scheme navigator | ✅ |
| Patient health passport | ✅ |
| 12 Indian languages | ✅ |
| Chest X-ray / Skin / Eye / Dental AI models | ✅ |
| Child growth (WHO) + Thali nutrition | ✅ |
| First-aid guide + Generic medicine advisor | ✅ |

---

© 2025 Trixo Technologies · hello@trixo.in · Haridwar, Uttarakhand
