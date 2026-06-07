# Hugging Face Spaces (Docker SDK) — listens on 7860.
# HF runs the container as UID 1000, so we create a matching non-root user
# with a writable HOME (torchxrayvision downloads model weights there at start).
FROM python:3.11-slim

# System libs needed by scikit-image / pillow.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libglib2.0-0 libgl1 && rm -rf /var/lib/apt/lists/*

RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR /home/user/app

COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

COPY --chown=user xray_service.py .

EXPOSE 7860
CMD ["uvicorn", "xray_service:app", "--host", "0.0.0.0", "--port", "7860"]
