#!/usr/bin/env bash
# MediKiosk OCR backend — one-shot install + start
# Run from the /backend directory

set -e

echo "=== MediKiosk OCR Backend ==="

# ── 1. OS-level Tesseract ──────────────────────────────────────────────────
if ! command -v tesseract &>/dev/null; then
  echo "[install] Installing Tesseract OCR..."
  if command -v apt-get &>/dev/null; then
    sudo apt-get update -q && sudo apt-get install -y tesseract-ocr tesseract-ocr-all
  elif command -v brew &>/dev/null; then
    brew install tesseract
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y tesseract
  else
    echo "[warn] Could not auto-install Tesseract. Install manually: https://github.com/tesseract-ocr/tesseract"
  fi
else
  echo "[ok] Tesseract: $(tesseract --version 2>&1 | head -1)"
fi

# ── 2. Python dependencies ────────────────────────────────────────────────
echo "[install] Installing Python packages..."
pip install -r requirements.txt --quiet

# ── 3. Copy env if missing ────────────────────────────────────────────────
if [ ! -f .env ]; then
  cp .env.example .env
  echo "[info] Created .env from .env.example — edit OLLAMA_MODEL if needed."
fi

# ── 4. Start server ───────────────────────────────────────────────────────
echo "[start] Starting backend on port 8000..."
echo "[info]  Health check: http://localhost:8000/health"
echo "[info]  API endpoint: POST http://localhost:8000/api/medical-document/process"
echo ""

# Load .env
set -o allexport
# shellcheck disable=SC1091
[ -f .env ] && source .env
set +o allexport

uvicorn main:app --host 0.0.0.0 --port "${BACKEND_PORT:-8000}" --reload
