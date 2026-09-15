"""AI service — sends OCR text to Ollama and returns structured medical JSON."""

import json
import os
import re
import httpx

OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")

SYSTEM_PROMPT = """You are a clinical document parser. Your ONLY job is to extract medical information \
that is explicitly present in the provided text.

STRICT RULES:
1. NEVER invent, fabricate, assume, or hallucinate any medical data.
2. If a field is not clearly present in the text, set it to null.
3. Return ONLY valid JSON — no markdown, no explanation, no extra text.
4. Confidence score: 0.0 to 1.0 based on how clearly the document type was identified.
5. For tests/medications/allergies arrays: only include items explicitly mentioned in the text.
6. If the text is empty or unreadable, return the empty template with null fields.

Output format (fill only from text, keep null for missing):
{
  "documentType": "lab_report" | "prescription" | "medication" | "allergy" | "other",
  "confidence": <float 0.0-1.0>,
  "extractedData": {
    "patientName": <string or null>,
    "date": <string or null>,
    "doctorName": <string or null>,
    "hospital": <string or null>,
    "tests": [
      {
        "name": <string>,
        "value": <string or null>,
        "unit": <string or null>,
        "referenceRange": <string or null>
      }
    ] or null,
    "medications": [<string>, ...] or null,
    "allergies": [<string>, ...] or null
  },
  "warnings": [<string>, ...]
}"""


async def classify_document(ocr_text: str) -> dict:
    """Send OCR text to Ollama and return parsed clinical JSON."""
    if not ocr_text.strip():
        return _empty_result("other", 0.0, ["No text could be extracted from the document."])

    truncated = ocr_text[:6000]  # stay within context limits for smaller models

    payload = {
        "model": OLLAMA_MODEL,
        "prompt": f"Extract clinical data from the following medical document text:\n\n{truncated}",
        "system": SYSTEM_PROMPT,
        "stream": False,
        "format": "json",
        "options": {"temperature": 0},
    }

    try:
        async with httpx.AsyncClient(timeout=120) as client:
            resp = await client.post(f"{OLLAMA_BASE_URL}/api/generate", json=payload)
            resp.raise_for_status()
            data = resp.json()
            raw = data.get("response", "{}")
            return _parse_and_validate(raw)
    except httpx.ConnectError:
        raise RuntimeError(
            f"Cannot connect to Ollama at {OLLAMA_BASE_URL}. "
            "Ensure Ollama is running: ollama serve"
        )
    except httpx.HTTPStatusError as e:
        raise RuntimeError(f"Ollama returned HTTP {e.response.status_code}: {e.response.text}")
    except Exception as e:
        raise RuntimeError(f"AI processing error: {str(e)}")


def _parse_and_validate(raw: str) -> dict:
    """Parse model JSON output and enforce schema."""
    # Strip markdown fences if present
    clean = re.sub(r"```(?:json)?|```", "", raw).strip()
    try:
        parsed = json.loads(clean)
    except json.JSONDecodeError:
        # Try extracting first {...} block
        match = re.search(r"\{.*\}", clean, re.DOTALL)
        if match:
            try:
                parsed = json.loads(match.group())
            except json.JSONDecodeError:
                return _empty_result("other", 0.0, ["AI returned unparseable output."])
        else:
            return _empty_result("other", 0.0, ["AI returned unparseable output."])

    valid_types = {"lab_report", "prescription", "medication", "allergy", "other"}
    doc_type = parsed.get("documentType", "other")
    if doc_type not in valid_types:
        doc_type = "other"

    confidence = float(parsed.get("confidence", 0.5))
    confidence = max(0.0, min(1.0, confidence))

    raw_data = parsed.get("extractedData", {}) or {}

    tests = raw_data.get("tests")
    if tests and isinstance(tests, list):
        tests = [
            {
                "name": str(t.get("name", "")),
                "value": str(t["value"]) if t.get("value") is not None else None,
                "unit": str(t["unit"]) if t.get("unit") is not None else None,
                "referenceRange": str(t["referenceRange"]) if t.get("referenceRange") is not None else None,
            }
            for t in tests
            if isinstance(t, dict) and t.get("name")
        ] or None
    else:
        tests = None

    def clean_list(val) -> list[str] | None:
        if not val or not isinstance(val, list):
            return None
        result = [str(v).strip() for v in val if v and str(v).strip()]
        return result if result else None

    return {
        "success": True,
        "documentType": doc_type,
        "confidence": confidence,
        "extractedData": {
            "patientName": str(raw_data["patientName"]) if raw_data.get("patientName") else None,
            "date": str(raw_data["date"]) if raw_data.get("date") else None,
            "doctorName": str(raw_data["doctorName"]) if raw_data.get("doctorName") else None,
            "hospital": str(raw_data["hospital"]) if raw_data.get("hospital") else None,
            "tests": tests,
            "medications": clean_list(raw_data.get("medications")),
            "allergies": clean_list(raw_data.get("allergies")),
        },
        "warnings": parsed.get("warnings", []) or [],
    }


def _empty_result(doc_type: str, confidence: float, warnings: list[str]) -> dict:
    return {
        "success": True,
        "documentType": doc_type,
        "confidence": confidence,
        "extractedData": {
            "patientName": None,
            "date": None,
            "doctorName": None,
            "hospital": None,
            "tests": None,
            "medications": None,
            "allergies": None,
        },
        "warnings": warnings,
    }
