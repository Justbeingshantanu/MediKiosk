"""MediKiosk OCR/AI backend — FastAPI server."""

from __future__ import annotations

import logging
import os

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from services.document_service import process_document

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="MediKiosk OCR API", version="1.0.0")

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:8443,http://localhost:3000,http://0.0.0.0:8443",
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten to ALLOWED_ORIGINS in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALLOWED_EXTENSIONS = {
    ".pdf", ".jpg", ".jpeg", ".png",
    ".bmp", ".tiff", ".webp", ".heic",
    ".doc", ".docx",
}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB


@app.get("/health")
async def health():
    """Diagnostic endpoint — reports which OCR engines are available."""
    engines: dict[str, bool] = {}

    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        engines["tesseract"] = True
    except Exception:
        engines["tesseract"] = False

    try:
        import easyocr  # noqa: F401
        engines["easyocr"] = True
    except Exception:
        engines["easyocr"] = False

    try:
        from paddleocr import PaddleOCR  # noqa: F401
        engines["paddleocr"] = True
    except Exception:
        engines["paddleocr"] = False

    try:
        import fitz  # noqa: F401
        engines["pymupdf"] = True
    except Exception:
        engines["pymupdf"] = False

    try:
        import cv2  # noqa: F401
        engines["opencv"] = True
    except Exception:
        engines["opencv"] = False

    ready = engines.get("tesseract") or engines.get("easyocr")
    return {"status": "ok" if ready else "degraded", "engines": engines}


@app.post("/api/medical-document/process")
async def process_medical_document(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided.")

    ext = ""
    if "." in file.filename:
        ext = "." + file.filename.rsplit(".", 1)[-1].lower()

    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"File type '{ext}' is not supported. Accepted: PDF, JPG, PNG, DOCX.",
        )

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File is too large. Maximum allowed size is 25 MB.",
        )

    logger.info("Processing file: %s (%d bytes)", file.filename, len(contents))
    result = await process_document(contents, file.filename, file.content_type)
    logger.info("Result: type=%s success=%s", result.get("documentType"), result.get("success"))
    return result


if __name__ == "__main__":
    port = int(os.getenv("BACKEND_PORT", "8000"))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
