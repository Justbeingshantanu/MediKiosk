// Medical document processing API service.
// All OCR and AI work happens on the backend — no secrets in this file.

const PROCESS_URL = "/api/medical-document/process"

export interface MedicalTest {
  name: string
  value: string | null
  unit: string | null
  referenceRange: string | null
}

export interface MedicalExtractedData {
  patientName: string | null
  date: string | null
  doctorName: string | null
  hospital: string | null
  tests: MedicalTest[] | null
  medications: string[] | null
  allergies: string[] | null
}

export type DocumentType = "lab_report" | "prescription" | "medication" | "allergy" | "other"

export interface MedicalProcessingResult {
  success: boolean
  documentType: DocumentType | null
  confidence: number
  extractedData: MedicalExtractedData | null
  warnings: string[]
  error?: string
  message?: string
}

function gatewayMessage(status: number): string {
  if (status === 502 || status === 503 || status === 504) {
    return (
      "OCR backend is not running (HTTP " +
      status +
      "). " +
      "Start it: cd backend && bash start.sh"
    )
  }
  return `Server returned ${status}`
}

export async function processMedicalDocument(file: File): Promise<MedicalProcessingResult> {
  const form = new FormData()
  form.append("file", file)

  let res: Response
  try {
    res = await fetch(PROCESS_URL, { method: "POST", body: form })
  } catch {
    // Network-level failure — backend unreachable
    return {
      success: false,
      documentType: null,
      confidence: 0,
      extractedData: null,
      warnings: [],
      error: "network_error",
      message: "Cannot reach OCR backend. Start it: cd backend && bash start.sh",
    }
  }

  if (!res.ok) {
    let msg = gatewayMessage(res.status)
    try {
      const body = await res.json()
      if (body?.detail) msg = body.detail
    } catch {
      // ignore
    }
    return {
      success: false,
      documentType: null,
      confidence: 0,
      extractedData: null,
      warnings: [],
      error: "http_error",
      message: msg,
    }
  }

  return res.json() as Promise<MedicalProcessingResult>
}
