# =========================================================
# REVIX — FastAPI + OCR Backend
# =========================================================

FROM python:3.12-slim

# =========================================================
# SYSTEM DEPENDENCIES
# =========================================================

RUN apt-get update && apt-get install -y \
    tesseract-ocr \
    poppler-utils \
    && rm -rf /var/lib/apt/lists/*

# =========================================================
# WORKING DIRECTORY
# =========================================================

WORKDIR /app

# =========================================================
# PYTHON DEPENDENCIES
# =========================================================

COPY requirements.txt .

RUN pip install --no-cache-dir -r requirements.txt

# =========================================================
# APPLICATION
# =========================================================

COPY backend ./backend

# =========================================================
# RUNTIME
# =========================================================

ENV PYTHONUNBUFFERED=1

# Render provides the PORT environment variable.
CMD ["sh", "-c", "uvicorn backend.main:app --host 0.0.0.0 --port ${PORT:-8000}"]