# ============================================
# AROGYA VAANI — DIABETIC RETINOPATHY (EYE) SERVICE
# Pretrained ViT: rafalosa/diabetic-retinopathy-224-procnorm-vit
# 5 DR severity grades. Research/screening aid ONLY — NOT a diagnosis.
#
# ⚠️ INPUT: needs a FUNDUS (retina) image from a fundus camera / phone-fundus
# lens. A normal phone selfie of the eye will NOT give a valid result.
# ============================================
import io

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import pipeline

app = FastAPI(title="Arogya Vaani Eye Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL = "rafalosa/diabetic-retinopathy-224-procnorm-vit"
pipe = pipeline("image-classification", model=MODEL)

HINDI = {
    "no dr": "Koi diabetic retinopathy nahi",
    "mild": "Halki (mild) DR",
    "moderate": "Moderate DR",
    "severe": "Severe DR",
    "proliferative": "Proliferative DR (sabse serious)",
}
DANGER = {"moderate", "severe", "proliferative"}
DISCLAIMER = (
    "Yeh AI screening hai, diagnosis nahi. Yeh model FUNDUS (retina) image par "
    "chalta hai — aam phone photo se sahi result nahi aayega. Aankh ke doctor "
    "(ophthalmologist) se zaroor confirm karein."
)


@app.get("/")
def health():
    return {"status": "ok", "model": MODEL, "labels": list(pipe.model.config.id2label.values())}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    raw = await file.read()
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    preds = pipe(img, top_k=5)
    findings = [
        {
            "name": p["label"].upper(),
            "hindi": HINDI.get(p["label"].lower(), p["label"]),
            "probability": round(float(p["score"]), 3),
            "danger": p["label"].lower() in DANGER,
        }
        for p in preds
    ]
    return {"model": MODEL, "findings": findings, "top": findings[0] if findings else None, "disclaimer": DISCLAIMER}
