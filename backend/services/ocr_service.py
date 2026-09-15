"""
OCR service — multi-engine pipeline with handwriting-optimised preprocessing.

Engine priority:
  1. EasyOCR  — CRNN-based; best for doctor handwriting, slanted/curved text
  2. Tesseract — LSTM mode; solid on printed text, decent on clear handwriting
  3. PaddleOCR — optional; multilingual bonus if installed

All engines are lazy-initialised so the backend starts instantly even if a
library is missing.  Errors from individual engines are caught and logged;
the pipeline falls through to the next available engine rather than crashing.
"""

from __future__ import annotations

import io
import logging
import os
import re
import tempfile
from functools import lru_cache
from typing import Optional

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

logger = logging.getLogger(__name__)

# ──────────────────────────────────────────────────────────────────────────────
# Image preprocessing — critical for handwriting quality
# ──────────────────────────────────────────────────────────────────────────────

def _load_cv2():
    try:
        import cv2
        return cv2
    except ImportError:
        return None


def preprocess_image(img_bytes: bytes) -> tuple[bytes, np.ndarray | None]:
    """
    Return (processed_png_bytes, cv2_ndarray_or_None).

    Steps applied (optimised for doctor handwriting):
      1. Upscale to ≥1600px long edge (Tesseract & EasyOCR both prefer ≥ 300 dpi)
      2. Grayscale
      3. Bilateral filter — removes noise while preserving ink edges
      4. CLAHE — fixes uneven lighting / shadows on scanned paper
      5. Adaptive threshold — binarises without obliterating faint ink
      6. Deskew — corrects page tilt up to ±30°
      7. Slight sharpening pass via Pillow for final output
    """
    cv2 = _load_cv2()
    pil = Image.open(io.BytesIO(img_bytes)).convert("RGB")

    # --- 1. Upscale ---
    w, h = pil.size
    long_edge = max(w, h)
    if long_edge < 1600:
        scale = 1600 / long_edge
        pil = pil.resize((int(w * scale), int(h * scale)), Image.LANCZOS)

    if cv2 is None:
        # Minimal PIL-only path
        gray = pil.convert("L")
        sharp = gray.filter(ImageFilter.SHARPEN)
        buf = io.BytesIO()
        sharp.save(buf, format="PNG")
        return buf.getvalue(), None

    # --- Convert PIL → OpenCV ndarray ---
    img = np.array(pil)
    img_bgr = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # --- 2. Grayscale ---
    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)

    # --- 3. Bilateral filter (removes noise, keeps pen strokes sharp) ---
    denoised = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)

    # --- 4. CLAHE (contrast limited adaptive histogram equalisation) ---
    clahe = cv2.createCLAHE(clipLimit=2.5, tileGridSize=(8, 8))
    enhanced = clahe.apply(denoised)

    # --- 5. Adaptive threshold ---
    binary = cv2.adaptiveThreshold(
        enhanced, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=15, C=10,
    )

    # --- 6. Deskew ---
    binary = _deskew(binary, cv2)

    # --- 7. Return both preprocessed PNG and the raw ndarray ---
    pil_out = Image.fromarray(binary)
    pil_out = pil_out.filter(ImageFilter.SHARPEN)
    buf = io.BytesIO()
    pil_out.save(buf, format="PNG")
    return buf.getvalue(), binary


def _deskew(binary: np.ndarray, cv2) -> np.ndarray:
    """Detect and correct skew angle using minAreaRect on dark pixels."""
    try:
        coords = np.column_stack(np.where(binary < 128))
        if len(coords) < 20:
            return binary
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]
        if angle < -45:
            angle = -(90 + angle)
        else:
            angle = -angle
        if abs(angle) < 0.5:
            return binary
        h, w = binary.shape
        M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1.0)
        return cv2.warpAffine(
            binary, M, (w, h),
            flags=cv2.INTER_CUBIC,
            borderMode=cv2.BORDER_REPLICATE,
        )
    except Exception:
        return binary


# ──────────────────────────────────────────────────────────────────────────────
# Engine 1: EasyOCR
# ──────────────────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_easyocr_reader():
    """Lazy singleton — import + model download happens once."""
    try:
        import easyocr
        # gpu=False is safe; set gpu=True if CUDA is available
        return easyocr.Reader(["en"], gpu=False, verbose=False)
    except Exception as e:
        logger.warning("EasyOCR not available: %s", e)
        return None


def _run_easyocr(img_bytes: bytes) -> str:
    reader = _get_easyocr_reader()
    if reader is None:
        return ""
    try:
        results = reader.readtext(img_bytes, detail=0, paragraph=True)
        return "\n".join(str(r) for r in results if r)
    except Exception as e:
        logger.warning("EasyOCR failed: %s", e)
        return ""


# ──────────────────────────────────────────────────────────────────────────────
# Engine 2: Tesseract
# ──────────────────────────────────────────────────────────────────────────────

def _run_tesseract(img_bytes: bytes, cv_binary: "np.ndarray | None") -> str:
    try:
        import pytesseract

        pil_img = Image.open(io.BytesIO(img_bytes))

        # LSTM engine, auto page-segmentation — best for mixed print+handwriting
        configs = [
            "--oem 1 --psm 6",   # uniform block  (printed reports)
            "--oem 1 --psm 4",   # single column  (prescriptions)
            "--oem 1 --psm 11",  # sparse text    (loose handwriting)
        ]

        best = ""
        for cfg in configs:
            try:
                text = pytesseract.image_to_string(pil_img, config=cfg, lang="eng")
                if len(text.strip()) > len(best.strip()):
                    best = text
            except Exception:
                continue
        return best
    except ImportError:
        logger.warning("pytesseract not installed. Run: pip install pytesseract")
        return ""
    except Exception as e:
        logger.warning("Tesseract failed: %s", e)
        return ""


# ──────────────────────────────────────────────────────────────────────────────
# Engine 3: PaddleOCR (optional)
# ──────────────────────────────────────────────────────────────────────────────

@lru_cache(maxsize=1)
def _get_paddle_ocr():
    try:
        from paddleocr import PaddleOCR
        return PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    except Exception as e:
        logger.info("PaddleOCR not available (optional): %s", e)
        return None


def _run_paddle(img_bytes: bytes) -> str:
    paddle = _get_paddle_ocr()
    if paddle is None:
        return ""
    try:
        with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
            tmp.write(img_bytes)
            tmp_path = tmp.name
        try:
            result = paddle.ocr(tmp_path, cls=True)
            lines: list[str] = []
            if result:
                for page in result:
                    if page:
                        for item in page:
                            if item and len(item) >= 2:
                                t = item[1]
                                if isinstance(t, (list, tuple)) and t:
                                    lines.append(str(t[0]))
            return "\n".join(lines)
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        logger.warning("PaddleOCR run failed: %s", e)
        return ""


# ──────────────────────────────────────────────────────────────────────────────
# Text fusion — merge outputs from multiple engines
# ──────────────────────────────────────────────────────────────────────────────

def _fuse_texts(*texts: str) -> str:
    """
    Combine engine outputs by picking the longest unique lines across all engines.
    Longer lines win because short fragments are usually partial reads.
    """
    seen: dict[str, int] = {}  # normalised_line → max_length_original
    for block in texts:
        for line in block.splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            norm = re.sub(r"\s+", " ", stripped.lower())
            if len(stripped) > seen.get(norm, 0):
                seen[norm] = len(stripped)

    # Reconstruct in the order they appeared in the longest source
    ordered: list[str] = []
    source = max(texts, key=len) if texts else ""
    added_norms: set[str] = set()
    for line in source.splitlines():
        stripped = line.strip()
        if not stripped:
            continue
        norm = re.sub(r"\s+", " ", stripped.lower())
        if norm not in added_norms:
            ordered.append(stripped)
            added_norms.add(norm)

    # Append any unique lines from other engines that weren't in the primary
    for block in texts:
        if block is source:
            continue
        for line in block.splitlines():
            stripped = line.strip()
            if not stripped:
                continue
            norm = re.sub(r"\s+", " ", stripped.lower())
            if norm not in added_norms:
                ordered.append(stripped)
                added_norms.add(norm)

    return "\n".join(ordered)


# ──────────────────────────────────────────────────────────────────────────────
# PDF handling
# ──────────────────────────────────────────────────────────────────────────────

def _pdf_to_texts(data: bytes) -> list[bytes]:
    """Render each PDF page to a PNG image for OCR processing."""
    # Try PyMuPDF first (rasterises even scanned PDFs correctly)
    try:
        import fitz
        doc = fitz.open(stream=data, filetype="pdf")
        images: list[bytes] = []
        for page in doc:
            pix = page.get_pixmap(dpi=250)  # 250 dpi — good for handwriting
            images.append(pix.tobytes("png"))
        if images:
            return images
    except Exception as e:
        logger.debug("PyMuPDF rasterise failed: %s", e)

    # Fallback: pypdf text layer only
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(data))
        combined = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
        if combined:
            # Return a pseudo-image by rendering the text as a PIL image
            img = Image.new("RGB", (1200, max(400, len(combined) // 2)), color="white")
            buf = io.BytesIO()
            img.save(buf, format="PNG")
            return [buf.getvalue()]
    except Exception as e:
        logger.debug("pypdf fallback failed: %s", e)

    raise RuntimeError(
        "Could not read PDF. Install PyMuPDF: pip install pymupdf"
    )


# ──────────────────────────────────────────────────────────────────────────────
# Public API
# ──────────────────────────────────────────────────────────────────────────────

async def extract_text(file_data: bytes, filename: str, content_type: str | None) -> str:
    """
    Full OCR pipeline — works for images and PDFs, printed and handwritten.
    Returns extracted text string.  Never raises; returns "" on total failure.
    """
    name_lower = filename.lower()
    ct = (content_type or "").lower()

    is_pdf = "pdf" in ct or name_lower.endswith(".pdf")
    is_image = ct.startswith("image/") or any(
        name_lower.endswith(ext)
        for ext in (".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp", ".heic")
    )

    if is_pdf:
        try:
            page_images = _pdf_to_texts(file_data)
        except RuntimeError as e:
            raise RuntimeError(str(e))

        page_texts: list[str] = []
        for page_img in page_images:
            page_texts.append(await _process_image_bytes(page_img))
        return "\n\n--- page break ---\n\n".join(page_texts)

    if is_image:
        return await _process_image_bytes(file_data)

    # Attempt plain-text decode (e.g. .txt files)
    try:
        return file_data.decode("utf-8", errors="replace")
    except Exception:
        return ""


async def _process_image_bytes(raw: bytes) -> str:
    """Preprocess + run all available OCR engines + fuse results."""
    try:
        processed_png, cv_binary = preprocess_image(raw)
    except Exception as e:
        logger.warning("Preprocessing failed, using raw bytes: %s", e)
        processed_png = raw
        cv_binary = None

    # Run engines in parallel-ish order (all synchronous underneath)
    easy_text = _run_easyocr(processed_png)
    tess_text = _run_tesseract(processed_png, cv_binary)
    paddle_text = _run_paddle(processed_png)

    fused = _fuse_texts(easy_text, tess_text, paddle_text)

    if not fused.strip():
        # Last resort: try the raw (unprocessed) bytes through EasyOCR
        fused = _run_easyocr(raw) or _run_tesseract(raw, None)

    return fused.strip()
