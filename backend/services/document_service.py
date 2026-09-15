"""Document processing orchestrator — coordinates OCR then AI classification."""

from .ocr_service import extract_text
from .ai_service import classify_document


async def process_document(file_data: bytes, filename: str, content_type: str | None) -> dict:
    """
    Full pipeline: OCR → AI extraction.
    Returns structured JSON ready for the frontend.
    Errors from OCR or AI are surfaced as structured error responses.
    """
    # Step 1: OCR
    try:
        text = await extract_text(file_data, filename, content_type)
    except RuntimeError as e:
        return {
            "success": False,
            "error": "ocr_unavailable",
            "message": str(e),
            "documentType": None,
            "confidence": 0.0,
            "extractedData": None,
            "warnings": [],
        }

    if not text.strip():
        return {
            "success": False,
            "error": "no_text_extracted",
            "message": "No readable text was found in the document. The image may be too dark, blurry, or low resolution.",
            "documentType": None,
            "confidence": 0.0,
            "extractedData": None,
            "warnings": [],
        }

    # Step 2: AI classification
    try:
        result = await classify_document(text)
    except RuntimeError as e:
        return {
            "success": False,
            "error": "ai_unavailable",
            "message": str(e),
            "documentType": None,
            "confidence": 0.0,
            "extractedData": None,
            "warnings": [],
        }

    return result
