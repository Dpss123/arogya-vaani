# ============================================
# AROGYA VAANI — DENTAL SERVICE (experimental)
# Pretrained ViT: vishnu027/dental_classification_model_010424
# 7 dental/oral pathologies. Research/screening aid ONLY — NOT a diagnosis.
#
# ⚠️ INPUT: trained on DENTAL X-RAY (radiograph) images, not phone mouth photos.
# ⚠️ Low-validation model (small dataset) — treat results as experimental.
# ============================================
import io

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import pipeline

app = FastAPI(title="Arogya Vaani Dental Service")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

MODEL = "vishnu027/dental_classification_model_010424"
pipe = pipeline("image-classification", model=MODEL)

HINDI = {
    "Dental_caries_(proximal)": "Daant mein keeda (caries)",
    "Periodontitis": "Masudon ki bimari (periodontitis)",
    "Irreversible_pulpitis_with_Acute_periodontitis": "Pulp/nas ki sujan + periodontitis",
    "Chronic_apical_periodontitis_with_vertical_bone_loss": "Jad ke infection + haddi loss",
    "Impacted_tooth_(fully_bony_impaction)": "Phansa hua daant (impacted)",
    "Embeded_tooth": "Daant andar dhansa (embedded)",
    "improper_restoration_with_chronic_apical_periodontitis": "Galat filling + infection",
}
DISCLAIMER = (
    "Yeh EXPERIMENTAL AI screening hai, diagnosis nahi. Yeh model dental X-RAY "
    "par chalta hai (aam mooh ki photo nahi) aur chhote dataset par bana hai. "
    "Dentist se zaroor confirm karein."
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
            "name": p["label"].replace("_", " "),
            "hindi": HINDI.get(p["label"], p["label"].replace("_", " ")),
            "probability": round(float(p["score"]), 3),
            "danger": False,
        }
        for p in preds
    ]
    return {"model": MODEL, "findings": findings, "top": findings[0] if findings else None, "disclaimer": DISCLAIMER}
