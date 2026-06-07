# Hugging Face Spaces (Docker SDK) — listens on 7860. Non-root user (UID 1000).
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libgl1 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    HF_HOME=/home/user/.cache/huggingface

WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user eye_service.py .

EXPOSE 7860
CMD ["uvicorn", "eye_service:app", "--host", "0.0.0.0", "--port", "7860"]
