# ============================================
# AROGYA VAANI — CHEST X-RAY AI SERVICE
# Pretrained model via TorchXRayVision (DenseNet-121, multi-dataset).
# Research/screening aid ONLY — NOT a diagnosis, NOT clinically cleared.
#
# Run locally:   uvicorn xray_service:app --host 0.0.0.0 --port 7860
# Deploy free:   push this folder to a Hugging Face Space (SDK: docker / fastapi)
# Then set XRAY_SERVICE_URL in the Next.js app to this service's URL.
# ============================================
import io

import numpy as np
import skimage.io
import torch
import torchvision
import torchxrayvision as xrv
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Arogya Vaani X-ray Service")
app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"]
)

# Loaded once at startup. Weights auto-download (~30 MB) on first run.
model = xrv.models.DenseNet(weights="densenet121-res224-all")
model.eval()

_transform = torchvision.transforms.Compose(
    [xrv.datasets.XRayCenterCrop(), xrv.datasets.XRayResizer(224)]
)

# Plain-language Hindi labels for the findings we surface.
HINDI = {
    "Pneumonia": "Nimoniya (phephdon ka infection)",
    "Effusion": "Phephdon ke aas-paas paani",
    "Cardiomegaly": "Dil ka bada hona",
    "Edema": "Phephdon mein sujan/paani",
    "Consolidation": "Phephde ka block hona",
    "Infiltration": "Phephde mein dhabba",
    "Atelectasis": "Phephde ka collapse",
    "Mass": "Gaanth",
    "Nodule": "Chhoti gaanth",
    "Pneumothorax": "Phephde mein hawa (collapse)",
    "Fracture": "Haddi toot",
    "Lung Opacity": "Phephde par dhundla nishan",
    "Enlarged Cardiomediastinum": "Dil/seene ka beech hissa bada",
}


@app.get("/")
def health():
    return {"status": "ok", "model": "densenet121-res224-all", "pathologies": model.pathologies}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    raw = await file.read()
    img = skimage.io.imread(io.BytesIO(raw))

    # Normalise an 8-bit image into the model's expected range.
    img = xrv.datasets.normalize(img, 255)
    if img.ndim == 3:          # RGB photo of a film -> single channel
        img = img.mean(2)
    img = img[None, ...]       # add channel dim
    img = _transform(img)

    with torch.no_grad():
        out = model(torch.from_numpy(img)[None])[0].numpy()

    findings = [
        {
            "name": name,
            "hindi": HINDI.get(name, name),
            "probability": round(float(p), 3),
        }
        for name, p in zip(model.pathologies, out)
        if name  # some slots are blank in the multi-dataset model
    ]
    findings.sort(key=lambda f: f["probability"], reverse=True)

    return {
        "model": "densenet121-res224-all",
        "findings": findings,
        "disclaimer": "Yeh AI screening hai, diagnosis nahi. Radiologist/doctor se confirm karein.",
    }
