---
title: Arogya Vaani Skin
emoji: 🔬
colorFrom: purple
colorTo: pink
sdk: docker
app_port: 7860
pinned: false
---

# Arogya Vaani — Skin Lesion Screening

Pretrained **ViT** fine-tuned on **HAM10000**
([Anwarkh1/Skin_Cancer-Image_Classification](https://huggingface.co/Anwarkh1/Skin_Cancer-Image_Classification)),
classifying a skin photo into 7 lesion types (melanoma, basal-cell carcinoma,
actinic keratoses, benign keratosis, melanocytic nevi, dermatofibroma, vascular).

**Screening aid for research/education — NOT a diagnosis (no FDA/CDSCO).**

## Deploy (free, like the X-ray Space)
1. huggingface.co → New Space → **SDK: Docker** → CPU basic (free).
2. Upload the 4 files in this folder (`skin_service.py`, `requirements.txt`, `Dockerfile`, `README.md`) at the Space root.
3. Wait for **Running**, then set `SKIN_SERVICE_URL=https://<you>-<space>.hf.space` in the Next app.

## Endpoints
- `GET /` → health + labels
- `POST /predict` (multipart `file`) → `{ findings: [{name, hindi, probability, danger}], top, disclaimer }`

## ⚠️ Honest limitations
- Trained on **dermoscopy images, mostly light skin** → noticeably **less accurate on
  Indian skin and ordinary phone photos** than on its training data.
- A probability, never a diagnosis. Always route to a dermatologist.
- The app falls back to Gemini-Vision skin screening automatically if this service is not set.
