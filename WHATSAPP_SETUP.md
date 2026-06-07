# WhatsApp Setup — Arogya Vaani

The WhatsApp bot is **fully built**. To go live you only connect a Meta number and fill 4 keys. Everything below is **free** for testing + pilot.

## What the bot can do (live once connected)
Send `menu` (or `hi`) → a tappable list appears:

| Option | What happens |
|---|---|
| 🩺 Lakshan batao | Describe symptoms → AI advice (multi-turn, Hindi/English) |
| 📋 Report / Photo | Send a photo (X-ray, blood test, medicine) → Vision AI explains it |
| 🧠 Mann ki jaanch | **PHQ-9 screener** — 9 tappable questions → score + KIRAN helpline |
| 📍 Doctor dhundo | Share location → nearest clinics/hospitals (OpenStreetMap) |
| 🏛️ Govt schemes | Give age/income/state → eligible govt health schemes (AI) |
| 🚨 Emergency | 108 + first-aid response |

Plus: **voice notes** (Whisper transcribes → AI replies) and **emergency keywords** (auto-detected in any message). Users can also just type naturally; the menu is optional.

---

## One-time setup

### 0. Run the session SQL in Supabase
Supabase → SQL Editor → paste & run [`lib/supabase-whatsapp-sessions.sql`](lib/supabase-whatsapp-sessions.sql). (Creates the `whatsapp_sessions` table that powers the multi-step screener.)

### 1. Meta app + WhatsApp
- [developers.facebook.com](https://developers.facebook.com) → create a **Business** app → add the **WhatsApp** product.
- This gives a free **test number**, a **temporary token (24h)**, and a **Phone Number ID** (on the *WhatsApp → API Setup* page).

### 2. Fill 4 keys in `.env.local` (and in Vercel env when you deploy)
```
META_VERIFY_TOKEN=arogya_verify_2026          # you choose any string
META_WHATSAPP_TOKEN=<API Setup: temporary access token>
META_PHONE_NUMBER_ID=<API Setup: Phone number ID>
META_APP_SECRET=<App Settings → Basic → App Secret>
```
*(Production: replace the 24h token with a permanent System-User token.)*

### 3. Make the webhook reachable (HTTPS)
- **Vercel (recommended):** deploy → webhook URL = `https://<your-app>.vercel.app/api/whatsapp`
- **Local:** `npm run dev` + `npx ngrok http 3000` → use the ngrok `https://…/api/whatsapp`

### 4. Configure the webhook in Meta
WhatsApp → **Configuration** → Webhook → **Edit**:
- **Callback URL** = your `/api/whatsapp` URL
- **Verify token** = same as `META_VERIFY_TOKEN`
- **Verify and Save** → then **Subscribe** to the **`messages`** field.

### 5. Test
- *API Setup* page → add your own WhatsApp number under **"To"** (test mode: up to 5 recipients).
- From your phone, message the test number: send `menu`, try the screener, send a photo, share a location.

---

## Number notes
- Use a **dedicated/spare number** (or the Meta test number). Don't use your personal WhatsApp number — it gets removed from regular WhatsApp.
- A **Jio Fibre landline** works too: verify with the **"Call me" (voice OTP)** option (landlines don't get SMS).

## Cost
- Cloud API, webhook hosting (Vercel), and **user-initiated conversations are free**. You'd only pay for business-initiated *template* messages (which this bot doesn't send). Demo + pilot = ₹0.
