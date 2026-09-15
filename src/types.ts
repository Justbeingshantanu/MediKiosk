import type { MedicalTest } from "./services/medicalDocumentApi"

// ──────────────────────────────────────────────
// PAGE TYPE
// ──────────────────────────────────────────────
export type Page =
  | "welcome"
  | "language"
  | "auth"
  | "dashboard"
  | "voice"
  | "questions"
  | "documents"
  | "summary"
  | "consent"
  | "doctor"
  | "settings"
  | "completion"
  | "error"

// ──────────────────────────────────────────────
// LANGUAGE CODE
// ──────────────────────────────────────────────
export type LangCode = "en" | "hi" | "ta" | "bn" | "mr" | "gu" | "kn" | "te" | "ur" | "pa" | "ml"

// ──────────────────────────────────────────────
// PATIENT DATA
// ──────────────────────────────────────────────
export type PatientData = {
  full_name: string
  patient_id: string
  age: number | null
  gender: string
  department: string
  phone: string
  created_at: string
}

// ──────────────────────────────────────────────
// MEDICAL NLP ENTITIES
// ──────────────────────────────────────────────
export type MedEntities = {
  chiefComplaint: string
  symptoms: string[]
  duration: string
  severity: string
  medications: string[]
  allergies: string[]
  familyHistory: string[]
  vitals: string[]
}

// ──────────────────────────────────────────────
// SESSION DATA
// ──────────────────────────────────────────────
export interface IntakeSession {
  // from VoicePage
  voiceEntities: MedEntities | null
  voiceSummary: string
  voiceConfidence: number
  voiceDuration: string
  // from QuestionsPage
  questionAnswers: Record<number, string | number | string[]>
  questionsAnswered: number
  // from DocumentsPage
  docData: {
    labTests: MedicalTest[]
    medications: string[]
    allergies: string[]
    prescriptions: string[]
    docCount: number
    processedCount: number
    avgConfidence: number
  }
}

export interface SessionRecord {
  id: string
  timestamp: string
  session: IntakeSession
  patientName: string | null
  patientId: string | null
  hospitalName: string
}

// ──────────────────────────────────────────────
// QUESTIONS
// ──────────────────────────────────────────────
export const QUESTIONS = [
  {
    id: 1,
    category: "Chief Complaint",
    text: "Have you been diagnosed with diabetes or high blood pressure?",
    type: "yesno",
    subtitle: "क्या आपको मधुमेह या उच्च रक्तचाप का निदान हुआ है?",
  },
  {
    id: 2,
    category: "Past Medical History",
    text: "Which of the following conditions have you been diagnosed with?",
    type: "multi",
    subtitle: "पिछली बीमारियाँ",
    options: [
      "Hypertension",
      "Diabetes Type 1",
      "Diabetes Type 2",
      "Pre-diabetes",
      "Hypothyroidism",
      "None of these",
    ],
  },
  {
    id: 3,
    category: "Current Symptoms",
    text: "Rate your current pain level:",
    type: "slider",
    subtitle: "दर्द का स्तर 1 से 10 में बताएं",
  },
  {
    id: 4,
    category: "Medications",
    text: "How many medications are you currently taking?",
    type: "number",
    subtitle: "आप कितनी दवाइयाँ ले रहे हैं?",
  },
  {
    id: 5,
    category: "Family History",
    text: "Does any immediate family member have heart disease?",
    type: "yesno",
    subtitle: "परिवार में हृदय रोग?",
  },
]

// ──────────────────────────────────────────────
// EMPTY SESSION
// ──────────────────────────────────────────────
export const EMPTY_SESSION: IntakeSession = {
  voiceEntities: null,
  voiceSummary: "",
  voiceConfidence: 0,
  voiceDuration: "",
  questionAnswers: {},
  questionsAnswered: 0,
  docData: {
    labTests: [],
    medications: [],
    allergies: [],
    prescriptions: [],
    docCount: 0,
    processedCount: 0,
    avgConfidence: 0,
  },
}
