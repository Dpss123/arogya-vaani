# ============================================
# AROGYA VAANI — SKIN LESION SCREENING SERVICE
# Pretrained ViT (HAM10000): Anwarkh1/Skin_Cancer-Image_Classification
# 7 classes. Research/screening aid ONLY — NOT a diagnosis.
# NOTE: trained mostly on light-skin dermoscopy data → less accurate on
# Indian skin and on ordinary phone photos. Always confirm with a doctor.
#
# Run:    uvicorn skin_service:app --host 0.0.0.0 --port 7860
# Deploy: push this folder to a Hugging Face Space (Docker SDK).
# ============================================
import io

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import pipeline

app = FastAPI(title="Arogya Vaani Skin Service")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

MODEL = "Anwarkh1/Skin_Cancer-Image_Classification"
pipe = pipeline("image-classification", model=MODEL)

HINDI = {
    "melanoma": "Melanoma (khatarnaak skin cancer ho sakta hai)",
    "basal_cell_carcinoma": "Basal cell carcinoma (skin cancer)",
    "actinic_keratoses": "Actinic keratoses (dhoop se pre-cancer daag)",
    "benign_keratosis-like_lesions": "Benign keratosis (aam, non-cancer daag)",
    "melanocytic_Nevi": "Til/mole (aam, non-cancer)",
    "dermatofibroma": "Dermatofibroma (aam gaanth)",
    "vascular_lesions": "Vascular lesion (khoon ki nas ka nishan)",
}
# Classes that warrant urgent dermatologist referral.
DANGER = {"melanoma", "basal_cell_carcinoma", "actinic_keratoses"}

DISCLAIMER = (
    "Yeh AI screening hai, diagnosis nahi. Yeh model zyadatar light-skin data par "
    "bana hai — Indian skin/phone photo par kam sateek ho sakta hai. Skin doctor "
    "(dermatologist) se zaroor confirm karein."
)


@app.get("/")
def health():
    return {"status": "ok", "model": MODEL, "labels": list(pipe.model.config.id2label.values())}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    raw = await file.read()
    img = Image.open(io.BytesIO(raw)).convert("RGB")
    preds = pipe(img, top_k=7)  # all 7 classes, sorted by score

    findings = [
        {
            "name": p["label"].replace("_", " "),
            "hindi": HINDI.get(p["label"], p["label"]),
            "probability": round(float(p["score"]), 3),
            "danger": p["label"] in DANGER,
        }
        for p in preds
    ]
    return {
        "model": MODEL,
        "findings": findings,
        "top": findings[0] if findings else None,
        "disclaimer": DISCLAIMER,
    }
