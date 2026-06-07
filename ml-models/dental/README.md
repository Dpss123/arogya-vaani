---
title: Arogya Vaani Dental
emoji: 🦷
colorFrom: pink
colorTo: yellow
sdk: docker
app_port: 7860
pinned: false
---

# Arogya Vaani — Dental (experimental)

Pretrained **ViT** ([vishnu027/dental_classification_model_010424](https://huggingface.co/vishnu027/dental_classification_model_010424))
classifying 7 dental/oral pathologies (caries, periodontitis, pulpitis, impacted
tooth, etc.). **Screening aid — NOT a diagnosis.**

## ⚠️ Honest limitations (read this)
- Trained on **dental X-RAY (radiograph)** images, **not** phone photos of the mouth.
- **Low-validation** model (small dataset, few downloads) → treat as **experimental**.
- For an ordinary mouth photo, the app's Gemini-Vision dental screener is used instead.

## Deploy (free)
1. New HF Space → **Docker** → CPU basic (free).
2. Upload the 4 files in this folder at the Space root.
3. Set `DENTAL_SERVICE_URL=https://<you>-<space>.hf.space` in the app.

## Endpoints
- `GET /` → health + labels
- `POST /predict` (multipart `file`) → `{ findings, top, disclaimer }`
