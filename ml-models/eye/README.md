---
title: Arogya Vaani Eye
emoji: 👁️
colorFrom: indigo
colorTo: blue
sdk: docker
app_port: 7860
pinned: false
---

# Arogya Vaani — Diabetic Retinopathy (Eye)

Pretrained **ViT** ([rafalosa/diabetic-retinopathy-224-procnorm-vit](https://huggingface.co/rafalosa/diabetic-retinopathy-224-procnorm-vit))
grading a **fundus (retina) image** into 5 DR severity levels (no DR / mild /
moderate / severe / proliferative). **Screening aid — NOT a diagnosis.**

## ⚠️ Input requirement (important)
This model needs a **FUNDUS / retina image** (from a fundus camera or a cheap
phone-fundus lens like D-EYE/oDocs). A normal **phone selfie of the eye will NOT
work** — for that, the app's Gemini-Vision eye screener (redness/cataract) is used.

## Deploy (free, like the X-ray/skin Spaces)
1. New HF Space → **Docker** → CPU basic (free).
2. Upload the 4 files in this folder at the Space root.
3. Set `EYE_SERVICE_URL=https://<you>-<space>.hf.space` in the app.

## Endpoints
- `GET /` → health + labels
- `POST /predict` (multipart `file`) → `{ findings, top, disclaimer }`
