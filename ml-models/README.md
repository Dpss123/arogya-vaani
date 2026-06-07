---
title: Arogya Vaani X-Ray
emoji: 🫁
colorFrom: blue
colorTo: green
sdk: docker
app_port: 7860
pinned: false
---

# Arogya Vaani — ML Models (Chest X-ray)

Layer-2 diagnostics service. A pretrained **TorchXRayVision** DenseNet-121
(trained across NIH ChestX-ray14 + CheXpert + MIMIC + PadChest) flags chest
X-ray findings. **This is a screening aid for research/education — NOT a
diagnosis and NOT clinically cleared (no FDA/CDSCO).**

## Why a separate service?
The model is PyTorch (~hundreds of MB) — it can't run inside the Next.js /
Vercel serverless app. It runs as its own Python service; the Next app calls it
over HTTP via the `XRAY_SERVICE_URL` env var.

## Run locally
```bash
cd ml-models
pip install -r requirements.txt
uvicorn xray_service:app --host 0.0.0.0 --port 7860
# Health check:
curl http://localhost:7860/
# Then in the Next app .env.local:
#   XRAY_SERVICE_URL=http://localhost:7860
```

## Deploy free (Hugging Face Spaces)
1. Create a new Space → SDK: **Docker** (or **Gradio/FastAPI**), hardware: free CPU.
2. Add `xray_service.py` + `requirements.txt` (+ a `Dockerfile` running uvicorn on port 7860).
3. Push. The Space gives you a public URL like `https://<user>-<space>.hf.space`.
4. Set `XRAY_SERVICE_URL` to that URL in the Vercel project.

> Free CPU Spaces **sleep** after inactivity → the first request after idle is slow (cold start). That's the cost of "free."

## Endpoints
- `GET /` → health + list of pathologies
- `POST /predict` (multipart `file`) → `{ findings: [{name, hindi, probability}], disclaimer }`

## Honest limitations
- Trained on adult **frontal** chest X-rays (hospital DICOMs). A phone photo of a
  printed film is noisier → expect lower accuracy.
- **TB is not a reliable label here** — for TB use a model trained on
  Montgomery/Shenzhen/TBX11K instead.
- Output is a probability, never a diagnosis. Always route to a doctor.

## Alternatives / sources
- `mlmed/torchxrayvision` (used here — maintained, multi-dataset)
- `jrzech/reproduce-chexnet`, `arnoweng/CheXNet`, `brucechou1983/CheXNet-Keras`
