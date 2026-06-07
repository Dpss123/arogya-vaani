# 🚀 Deploy — Next.js on Vercel + X-ray model on Hugging Face

Recommended split: the **app** runs on Vercel (fast, always-on, free) and the
**chest X-ray model** runs on a Hugging Face Space (free, the only place that
can run PyTorch). They connect via one env var (`XRAY_SERVICE_URL`).

---

## Step 0 — Push the code to GitHub (once)
Both platforms deploy from git.
```bash
git init && git add . && git commit -m "Arogya Vaani"
# create an empty repo on github.com, then:
git remote add origin https://github.com/<you>/arogya-vaani.git
git push -u origin main
```

---

## Part 1 — X-ray model on Hugging Face (do this first to get its URL)

1. huggingface.co → **New Space** → **SDK: Docker** → Hardware: **CPU basic (free)**.
2. Upload the **3 files** from `ml-models/`:
   `xray_service.py`, `requirements.txt`, `Dockerfile`
   (put them at the Space root — NOT inside an `ml-models/` folder).
3. It builds (first build is slow — torch is big). When done you get:
   `https://<you>-<space>.hf.space`
4. Test it: open that URL — you should see `{"status":"ok", ...}`.

> Free Spaces sleep after inactivity → the first X-ray scan after idle is slow. That only affects `/xray`, not the rest of the app.

---

## Part 2 — Next.js app on Vercel

1. vercel.com → **Add New → Project** → import your GitHub repo.
2. Framework preset: **Next.js** (auto-detected). Leave build settings default.
3. **Environment Variables** — add all of these (Project → Settings → Environment Variables):

   | Name | Value |
   |------|-------|
   | `GEMINI_API_KEY` | your Gemini key |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://tyocseqmsoppypandoxo.supabase.co` |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your anon key |
   | `SUPABASE_SERVICE_ROLE_KEY` | your service-role key |
   | `GROQ_API_KEY` | your Groq key |
   | `NEXTAUTH_SECRET` | a random string |
   | `NEXTAUTH_URL` | **your Vercel URL** (e.g. `https://arogya-vaani.vercel.app`) |
   | `XRAY_SERVICE_URL` | the HF Space URL from Part 1 |
   | `META_WHATSAPP_TOKEN` / `META_PHONE_NUMBER_ID` / `META_VERIFY_TOKEN` | when ready |
   | `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | for doctor login (optional) |

   > Vercel inlines `NEXT_PUBLIC_*` at build automatically — no special handling needed (unlike the HF-Docker path).

4. **Deploy.** You get `https://<project>.vercel.app`.
5. Set `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to that final URL, then **redeploy** once.

---

## Step 3 — Wire the rest

- **Supabase:** run `lib/supabase-reset.sql` in the SQL Editor (fixes the old `patient_id` schema conflict) — required, or all saves fail.
- **WhatsApp:** in the Meta dashboard, set the webhook to
  `https://<project>.vercel.app/api/whatsapp`, verify token `arogya_vaani_verify_2025`.
- **Google OAuth:** add `https://<project>.vercel.app/api/auth/callback/google`
  to the authorized redirect URIs in Google Cloud Console.

---

## ⚠️ Before going public
- **Rotate** the Supabase service-role key, Gemini key, and Groq key (they were shared in chat).
- Add `public/icon-192.png` + `icon-512.png` (PWA install icons).
- Supabase free tier sleeps a project after ~1 week of inactivity — fine for a project, ping it to wake.

---

## Why this split (not all-Vercel or all-HF)
- **Vercel can't run PyTorch** → the X-ray model must live on HF (or Render).
- **HF free Spaces sleep** → bad for the always-on app, fine for the occasional model call.
- So: app on Vercel (always-on), model on HF (free GPU/CPU). Best of both.
