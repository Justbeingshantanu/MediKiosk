import { useState, useEffect, useRef } from "react"
import { projectId, publicAnonKey } from "../utils/supabase/info"
import supabase from "./supabaseClient"
import type { MedicalExtractedData, MedicalProcessingResult, MedicalTest } from "./services/medicalDocumentApi"
import { processMedicalDocument } from "./services/medicalDocumentApi"

// ──────────────────────────────────────────────
// TYPES
// ──────────────────────────────────────────────
type Page = "welcome" | "language" | "auth" | "dashboard" | "voice" | "questions" | "documents" | "summary" | "consent" | "doctor" | "settings" | "completion" | "error"

// ──────────────────────────────────────────────
// ICONS (inline SVG)
// ──────────────────────────────────────────────
const Icon = {
  Stethoscope: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  ),
  Mic: ({ active }: { active?: boolean }) => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path
        d="M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z"
        fill={active ? "currentColor" : "none"}
      />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
      <line x1="8" y1="22" x2="16" y2="22" />
    </svg>
  ),
  Upload: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  ChevronRight: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  ),
  ChevronDown: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  ),
  Volume: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  ),
  Lock: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  User: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Settings: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Alert: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  FileText: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  ),
  Camera: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),
  LogOut: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Help: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Download: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  ),
  Share: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  Pill: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z" />
      <path d="m8.5 8.5 7 7" />
    </svg>
  ),
  Heart: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  Globe: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="w-full h-full"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  ),
}

// ──────────────────────────────────────────────
// SHARED COMPONENTS
// ──────────────────────────────────────────────
function TopNav({
  onNavigate,
  patientName,
}: {
  onNavigate: (p: Page) => void
  patientName?: string | null
}) {
  return (
    <nav className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#0066CC] rounded-lg flex items-center justify-center">
          <div className="w-5 h-5 text-white">
            <Icon.Stethoscope />
          </div>
        </div>
        <span
          style={{ fontFamily: "Poppins, sans-serif" }}
          className="font-700 text-[#0066CC] text-lg tracking-tight"
        >
          MediKiosk
        </span>
        <span className="text-gray-300 mx-2">|</span>
        {patientName && (
          <span className="text-sm text-gray-600">
            Welcome, <span className="font-600 text-gray-800">{patientName}</span>
          </span>
        )}
      </div>
      <div className="flex items-center gap-1">
        <div className="flex items-center gap-1.5 bg-[#10B981]/10 text-[#10B981] text-xs font-600 px-3 py-1.5 rounded-full">
          <span className="w-1.5 h-1.5 bg-[#10B981] rounded-full animate-pulse inline-block"></span>
          Consultation Active
        </div>
        <button
          onClick={() => onNavigate("settings")}
          className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors ml-1"
        >
          <div className="w-4.5 h-4.5">
            <Icon.Settings />
          </div>
        </button>
        <button className="w-9 h-9 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 transition-colors">
          <div className="w-4.5 h-4.5">
            <Icon.Help />
          </div>
        </button>
        <button
          onClick={() => onNavigate("welcome")}
          className="w-9 h-9 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <div className="w-4.5 h-4.5">
            <Icon.LogOut />
          </div>
        </button>
      </div>
    </nav>
  )
}

function SecurityBadge() {
  return (
    <div className="flex items-center gap-2 text-xs text-gray-500">
      <div className="w-3.5 h-3.5 text-[#10B981]">
        <Icon.Lock />
      </div>
      <span>Data encrypted & secure — DPDP Act 2023 compliant</span>
    </div>
  )
}

function PrimaryBtn({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{ fontFamily: "Poppins, sans-serif" }}
      className={`h-14 px-8 bg-[#0066CC] hover:bg-[#0055aa] disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-600 rounded-xl transition-all duration-150 active:scale-98 flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: "Poppins, sans-serif" }}
      className={`h-12 px-6 bg-white border border-gray-200 hover:border-[#0066CC] hover:text-[#0066CC] text-gray-700 font-500 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 ${className}`}
    >
      {children}
    </button>
  )
}

function Badge({
  text,
  color = "blue",
}: {
  text: string
  color?: "blue" | "green" | "orange" | "red" | "gray" | "teal"
}) {
  const colors = {
    blue: "bg-blue-50 text-[#0066CC]",
    green: "bg-emerald-50 text-[#10B981]",
    orange: "bg-orange-50 text-[#F97316]",
    red: "bg-red-50 text-red-600",
    gray: "bg-gray-100 text-gray-600",
    teal: "bg-teal-50 text-[#00897B]",
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-600 ${colors[color]}`}
    >
      {text}
    </span>
  )
}

function StageCard({
  number,
  title,
  icon,
  status,
  active,
  completed,
  locked,
  children,
  onClick,
}: {
  number: number
  title: string
  icon: string
  status: string
  active?: boolean
  completed?: boolean
  locked?: boolean
  children?: React.ReactNode
  onClick?: () => void
}) {
  return (
    <div
      onClick={locked ? undefined : onClick}
      className={`rounded-2xl border-2 transition-all duration-200 relative ${
        active
          ? "border-[#0066CC] shadow-lg shadow-blue-100"
          : completed
            ? "border-[#10B981] bg-emerald-50/30"
            : locked
              ? "border-gray-100 opacity-50 cursor-not-allowed"
              : "border-gray-100 opacity-60"
      } bg-white overflow-hidden ${
        onClick && !locked ? "cursor-pointer hover:shadow-md" : ""
      }`}
    >
      {locked && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5 z-10">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3 text-gray-400"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          <span className="text-[10px] text-gray-400 font-600">Complete Step {number - 1} first</span>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-700 ${
                active
                  ? "bg-[#0066CC] text-white"
                  : completed
                    ? "bg-[#10B981] text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
              style={{ fontFamily: "Poppins, sans-serif" }}
            >
              {completed ? "✓" : number}
            </div>
            <div>
              <div className="text-xs text-gray-400 font-500">{icon}</div>
              <h3
                style={{ fontFamily: "Poppins, sans-serif" }}
                className="font-600 text-gray-900 text-sm leading-tight"
              >
                {title}
              </h3>
            </div>
          </div>
          <Badge
            text={status}
            color={active ? "blue" : completed ? "green" : "gray"}
          />
        </div>
        {children}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 1: WELCOME / LANGUAGE SELECTION
// ──────────────────────────────────────────────
const LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧" },
  { code: "hi", name: "Hindi", native: "हिंदी", flag: "🇮🇳" },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🏴" },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🏴" },
  { code: "kn", name: "Kannada", native: "ಕನ್ನಡ", flag: "🏴" },
  { code: "gu", name: "Gujarati", native: "ગુજરાતી", flag: "🏴" },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🏴" },
  { code: "access", name: "Accessibility", native: "♿ Settings", flag: "♿" },
]

// ──────────────────────────────────────────────
// INTERACTIVE ASSISTANT HERO
// ──────────────────────────────────────────────
const GREETINGS = [
  { text: "Namaste! 🙏", sub: "How can I help you today?", lang: "English" },
  { text: "नमस्ते! 🙏", sub: "आज मैं आपकी कैसे मदद कर सकती हूँ?", lang: "हिंदी" },
  { text: "வணக்கம்! 🙏", sub: "இன்று நான் உங்களுக்கு எப்படி உதவலாம்?", lang: "தமிழ்" },
  { text: "నమస్కారం! 🙏", sub: "నేను మీకు ఎలా సహాయపడగలను?", lang: "తెలుగు" },
  { text: "ನಮಸ್ಕಾರ! 🙏", sub: "ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?", lang: "ಕನ್ನಡ" },
  { text: "નમસ્તે! 🙏", sub: "હું આજે તમારી કેવી રીતે મદદ કરી શકું?", lang: "ગુજરાતી" },
  { text: "নমস্কার! 🙏", sub: "আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?", lang: "বাংলা" },
]

// ── Coded SVG AI Doctor Figure ────────────────
function AIFigureSVG({ hovered, blink }: { hovered: boolean; blink: boolean }) {
  return (
    <svg
      viewBox="0 0 220 340"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-[220px] h-auto drop-shadow-xl"
    >
      {/* ── Coat / body ── */}
      {/* Lab coat */}
      <rect x="42" y="158" width="136" height="140" rx="28" fill="#EEF4FF" />
      {/* Coat lapels */}
      <path
        d="M110 158 L82 180 L82 240 L110 220 L138 240 L138 180 Z"
        fill="white"
      />
      {/* Left lapel edge */}
      <path d="M110 158 L82 180" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Right lapel edge */}
      <path d="M110 158 L138 180" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Blue collar/chest badge area */}
      <rect x="88" y="165" width="44" height="28" rx="8" fill="#0066CC" />
      {/* Badge text lines */}
      <rect
        x="95"
        y="171"
        width="30"
        height="3"
        rx="1.5"
        fill="white"
        opacity="0.8"
      />
      <rect
        x="98"
        y="177"
        width="24"
        height="3"
        rx="1.5"
        fill="white"
        opacity="0.5"
      />
      {/* ID badge lanyard */}
      <path
        d="M110 158 L110 165"
        stroke="#F97316"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* ── Stethoscope ── */}
      <path
        d="M82 200 Q68 210 68 226 Q68 242 84 242 Q98 242 98 228"
        stroke="#0D1B3E"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="84" cy="244" r="6" fill="#0D1B3E" />
      <circle cx="84" cy="244" r="3" fill="#0066CC" />
      {/* Earpieces */}
      <path
        d="M82 200 L76 192"
        stroke="#0D1B3E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <path
        d="M82 200 L88 192"
        stroke="#0D1B3E"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="76" cy="190" r="3" fill="#0D1B3E" />
      <circle cx="88" cy="190" r="3" fill="#0D1B3E" />

      {/* ── Left arm — Namaste hand ── */}
      <g
        style={{
          transformOrigin: "52px 190px",
          animation: hovered
            ? "wave-hand 0.5s ease-in-out infinite alternate"
            : "none",
        }}
      >
        {/* Upper arm */}
        <path
          d="M65 170 Q48 185 44 210 Q42 222 52 228"
          stroke="#F4C7A0"
          strokeWidth="18"
          strokeLinecap="round"
          fill="none"
        />
        {/* Forearm */}
        <path
          d="M52 228 Q50 250 60 264"
          stroke="#F4C7A0"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />
        {/* Hand — prayer fold */}
        <ellipse cx="65" cy="272" rx="11" ry="14" fill="#F4C7A0" />
        <ellipse cx="75" cy="272" rx="11" ry="14" fill="#F0BC96" />
        {/* Finger lines */}
        <path
          d="M60 264 Q65 258 70 264"
          stroke="#E8A87C"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <path
          d="M65 263 Q70 257 75 263"
          stroke="#E8A87C"
          strokeWidth="1.2"
          strokeLinecap="round"
        />
      </g>

      {/* ── Right arm — slightly raised ── */}
      <path
        d="M155 170 Q172 185 176 210 Q178 222 168 228"
        stroke="#F4C7A0"
        strokeWidth="18"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M168 228 Q172 248 162 260"
        stroke="#F4C7A0"
        strokeWidth="16"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right hand open */}
      <ellipse cx="158" cy="265" rx="13" ry="16" fill="#F4C7A0" />
      {/* Finger outlines */}
      <path
        d="M148 258 Q152 248 156 256"
        stroke="#E8A87C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M154 254 Q158 244 162 252"
        stroke="#E8A87C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M160 254 Q164 244 168 252"
        stroke="#E8A87C"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      {/* ── Neck ── */}
      <rect x="98" y="135" width="24" height="28" rx="10" fill="#F4C7A0" />

      {/* ── Head ── */}
      <ellipse cx="110" cy="110" rx="46" ry="50" fill="#F4C7A0" />

      {/* ── Hair ── */}
      <path d="M64 100 Q64 56 110 56 Q156 56 156 100" fill="#2D1A0E" />
      {/* Hair detail — side parts */}
      <path
        d="M64 100 Q62 80 72 68"
        stroke="#1A0F08"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M156 100 Q158 80 148 68"
        stroke="#1A0F08"
        strokeWidth="2"
        fill="none"
      />
      {/* Bun / updo */}
      <ellipse cx="110" cy="59" rx="22" ry="14" fill="#2D1A0E" />
      <ellipse cx="110" cy="54" rx="14" ry="10" fill="#3D2510" />

      {/* ── Eyebrows ── */}
      <path
        d="M88 98 Q96 93 104 98"
        stroke="#2D1A0E"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M116 98 Q124 93 132 98"
        stroke="#2D1A0E"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Eyes ── */}
      {/* Left eye */}
      <ellipse
        cx="96"
        cy="110"
        rx="9"
        ry={blink ? 1.5 : 9}
        fill="white"
        style={{ transition: "ry 0.1s" }}
      />
      <ellipse
        cx="96"
        cy="110"
        rx="5.5"
        ry={blink ? 1 : 5.5}
        fill="#2D4A8A"
        style={{ transition: "ry 0.1s" }}
      />
      <ellipse
        cx="96"
        cy="110"
        rx="3"
        ry={blink ? 0.5 : 3}
        fill="#0D1B3E"
        style={{ transition: "ry 0.1s" }}
      />
      <circle cx="98" cy="108" r="1.5" fill="white" />
      {/* Right eye */}
      <ellipse
        cx="124"
        cy="110"
        rx="9"
        ry={blink ? 1.5 : 9}
        fill="white"
        style={{ transition: "ry 0.1s" }}
      />
      <ellipse
        cx="124"
        cy="110"
        rx="5.5"
        ry={blink ? 1 : 5.5}
        fill="#2D4A8A"
        style={{ transition: "ry 0.1s" }}
      />
      <ellipse
        cx="124"
        cy="110"
        rx="3"
        ry={blink ? 0.5 : 3}
        fill="#0D1B3E"
        style={{ transition: "ry 0.1s" }}
      />
      <circle cx="126" cy="108" r="1.5" fill="white" />

      {/* ── Nose ── */}
      <path
        d="M107 120 Q110 128 113 120"
        stroke="#E8A87C"
        strokeWidth="1.5"
        strokeLinecap="round"
        fill="none"
      />

      {/* ── Mouth — smile widens on hover ── */}
      <path
        d={hovered ? "M96 134 Q110 148 124 134" : "M98 134 Q110 143 122 134"}
        stroke="#C07850"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        style={{ transition: "d 0.4s ease" }}
      />
      {/* Cheek blush */}
      <ellipse cx="84" cy="126" rx="9" ry="6" fill="#F97316" opacity="0.18" />
      <ellipse cx="136" cy="126" rx="9" ry="6" fill="#F97316" opacity="0.18" />

      {/* ── AI halo ring (glows on hover) ── */}
      <ellipse
        cx="110"
        cy="60"
        rx="30"
        ry="6"
        fill="none"
        stroke={hovered ? "#0066CC" : "#93C5FD"}
        strokeWidth={hovered ? "2.5" : "1.5"}
        strokeDasharray="4 3"
        opacity={hovered ? 1 : 0.5}
        style={{ transition: "stroke 0.4s, strokeWidth 0.4s, opacity 0.4s" }}
      />

      {/* ── Feet / coat bottom ── */}
      <rect x="80" y="285" width="22" height="12" rx="6" fill="#CBD5E1" />
      <rect x="118" y="285" width="22" height="12" rx="6" fill="#CBD5E1" />

      {/* ── Waveform on chest when hovered ── */}
      {hovered && (
        <g>
          <path
            d="M94 210 L98 202 L102 218 L106 206 L110 214 L114 206 L118 218 L122 202 L126 210"
            stroke="#0066CC"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            style={{ animation: "waveform 0.8s ease-in-out infinite" }}
          />
        </g>
      )}
    </svg>
  )
}

function AssistantHero({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [hovered, setHovered] = useState(false)
  const [greetIdx, setGreetIdx] = useState(0)
  const [ripple, setRipple] = useState(false)
  const [bubbleVisible, setBubbleVisible] = useState(false)
  const [chipIn, setChipIn] = useState(false)
  const [blink, setBlink] = useState(false)

  // Random blink
  useEffect(() => {
    const schedule = () => {
      const delay = 2000 + Math.random() * 3000
      return setTimeout(() => {
        setBlink(true)
        setTimeout(() => {
          setBlink(false)
          schedule()
        }, 150)
      }, delay)
    }
    const t = schedule()
    return () => clearTimeout(t)
  }, [])

  // Cycle greetings every 2.2 s when hovered
  useEffect(() => {
    if (!hovered) return
    const t = setInterval(
      () => setGreetIdx((i) => (i + 1) % GREETINGS.length),
      2200,
    )
    return () => clearInterval(t)
  }, [hovered])

  useEffect(() => {
    if (hovered) {
      setBubbleVisible(true)
    } else {
      const t = setTimeout(() => setBubbleVisible(false), 300)
      return () => clearTimeout(t)
    }
  }, [hovered])

  useEffect(() => {
    const t = setTimeout(() => setChipIn(true), 400)
    return () => clearTimeout(t)
  }, [])

  const handleClick = () => {
    setRipple(true)
    setTimeout(() => {
      setRipple(false)
      onNavigate("language")
    }, 600)
  }

  const g = GREETINGS[greetIdx]

  return (
    <div className="relative flex items-end justify-center pb-4 select-none">
      {/* Background circle */}
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700 ${
          hovered
            ? "w-[360px] h-[360px] bg-[#0066CC]/10"
            : "w-[310px] h-[310px] bg-[#D6E8FF]"
        }`}
      />
      <div
        className={`absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full border-2 transition-all duration-1000 ${
          hovered
            ? "w-[400px] h-[400px] border-[#0066CC]/15 opacity-100"
            : "w-[330px] h-[330px] border-transparent opacity-0"
        }`}
      />

      {/* Click ripple */}
      {ripple && (
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] h-[340px] rounded-full border-4 border-[#0066CC]/40"
          style={{ animation: "pulse-ring 0.6s ease-out forwards" }}
        />
      )}

      {/* Speech bubble */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 z-30 transition-all duration-300 ${
          bubbleVisible
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 px-5 py-3 min-w-[210px] text-center relative">
          <div className="absolute -bottom-[9px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-r border-b border-gray-100 rotate-45" />
          <p
            key={g.text}
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="font-700 text-[#0D1B3E] text-[15px] leading-tight animate-float-in"
          >
            {g.text}
          </p>
          <p
            key={g.sub}
            className="text-[11px] text-gray-500 mt-0.5 leading-snug animate-float-in"
          >
            {g.sub}
          </p>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <span className="w-1.5 h-1.5 bg-[#0066CC] rounded-full animate-pulse inline-block" />
            <span className="text-[9px] font-600 text-[#0066CC] tracking-widest uppercase">
              {g.lang}
            </span>
          </div>
        </div>
      </div>

      {/* Idle hint */}
      <div
        className={`absolute top-3 left-1/2 -translate-x-1/2 z-20 transition-all duration-300 ${
          hovered ? "opacity-0 scale-90" : "opacity-100 scale-100"
        }`}
      >
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full px-4 py-1.5 shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0066CC] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#0066CC]" />
          </span>
          <span className="text-[11px] font-600 text-gray-600">
            Hover to say hi · Tap to begin
          </span>
        </div>
      </div>

      {/* The coded figure */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={handleClick}
        className={`relative z-10 cursor-pointer focus:outline-none transition-transform duration-500 ${
          hovered ? "scale-105" : "scale-100"
        }`}
        style={{ animation: "float-bob 3.5s ease-in-out infinite" }}
        aria-label="Tap to begin your health intake"
      >
        <AIFigureSVG hovered={hovered} blink={blink} />
        {hovered && (
          <div className="absolute inset-0 rounded-full shadow-[0_0_70px_24px_rgba(0,102,204,0.12)] pointer-events-none" />
        )}
      </button>

      {/* Stat chips — staggered */}
      <div
        className={`absolute top-10 right-0 z-20 transition-all duration-500 ${
          chipIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}
        style={{ transitionDelay: "0ms" }}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-3.5 py-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#10B981]/10 rounded-xl flex items-center justify-center text-sm">
            🔒
          </div>
          <div>
            <p className="text-[11px] font-700 text-[#0D1B3E] leading-tight">
              End-to-End
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">Encrypted</p>
          </div>
        </div>
      </div>
      <div
        className={`absolute top-[38%] -left-3 z-20 transition-all duration-500 ${
          chipIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
        style={{ transitionDelay: "120ms" }}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-3.5 py-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#0066CC]/10 rounded-xl flex items-center justify-center text-sm">
            🌐
          </div>
          <div>
            <p className="text-[11px] font-700 text-[#0D1B3E] leading-tight">
              8+ Languages
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">
              Indian + English
            </p>
          </div>
        </div>
      </div>
      <div
        className={`absolute bottom-12 right-0 z-20 transition-all duration-500 ${
          chipIn ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
        }`}
        style={{ transitionDelay: "240ms" }}
      >
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 px-3.5 py-2.5 flex items-center gap-2.5">
          <div className="w-7 h-7 bg-[#F97316]/10 rounded-xl flex items-center justify-center text-sm">
            ⚡
          </div>
          <div>
            <p className="text-[11px] font-700 text-[#0D1B3E] leading-tight">
              6–8 min
            </p>
            <p className="text-[10px] text-gray-400 leading-tight">
              vs 15 min manual
            </p>
          </div>
        </div>
      </div>

      {/* Live dark chip */}
      <div
        className={`absolute bottom-12 -left-3 z-20 transition-all duration-500 ${
          chipIn ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
        }`}
        style={{ transitionDelay: "360ms" }}
      >
        <div className="bg-[#0D1B3E] rounded-2xl shadow-lg px-3.5 py-2.5 flex items-center gap-2">
          <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse flex-shrink-0" />
          <div>
            <p className="text-[11px] font-700 text-white leading-tight">
              Dr. Sharma ready
            </p>
            <p className="text-[10px] text-white/50 leading-tight">
              Room 402 · 15 min
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function WelcomePage({
  onNavigate,
  lang,
  light,
  onLightToggle,
  voiceActive,
  voiceLabel,
  onVoiceToggle,
}: {
  onNavigate: (p: Page) => void
  lang: LangCode
  light: boolean
  onLightToggle: () => void
  voiceActive: boolean
  voiceLabel: string
  onVoiceToggle: () => void
}) {
  const t = useT(lang)

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col transition-colors duration-500"
      style={{
        background: light
          ? "linear-gradient(145deg, #EEF5FF 0%, #DBEAFE 45%, #E0F2FE 100%)"
          : "linear-gradient(145deg, #060E24 0%, #0B1A3E 45%, #0D2A58 100%)",
      }}
    >
      {/* ── Animated background blobs ── */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div
          style={{
            position: "absolute",
            top: "-10%",
            left: "-5%",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: light
              ? "radial-gradient(circle, rgba(26,111,229,0.12) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(26,111,229,0.18) 0%, transparent 70%)",
            animation: "blob-drift-1 18s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-15%",
            right: "-8%",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: light
              ? "radial-gradient(circle, rgba(16,185,129,0.1) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
            animation: "blob-drift-2 22s ease-in-out infinite",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "38%",
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: light
              ? "radial-gradient(circle, rgba(26,111,229,0.07) 0%, transparent 70%)"
              : "radial-gradient(circle, rgba(96,165,250,0.08) 0%, transparent 70%)",
            animation: "blob-drift-3 14s ease-in-out infinite",
          }}
        />
        {/* Dot grid texture */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: light
              ? "radial-gradient(rgba(0,0,0,0.05) 1px, transparent 1px)"
              : "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Horizontal rule lines */}
        {[20, 40, 60, 80].map((p) => (
          <div
            key={p}
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: `${p}%`,
              height: 1,
              background: light
                ? "linear-gradient(90deg, transparent, rgba(26,111,229,0.1), transparent)"
                : "linear-gradient(90deg, transparent, rgba(96,165,250,0.06), transparent)",
            }}
          />
        ))}
      </div>

      {/* ── Top nav bar ── */}
      <div className="relative z-10 flex items-center justify-between px-10 pt-7 pb-2">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: "linear-gradient(135deg,#1A6FE5,#0EA5E9)",
              boxShadow: "0 4px 16px rgba(26,111,229,0.45)",
            }}
          >
            <div className="w-5 h-5 text-white">
              <Icon.Stethoscope />
            </div>
          </div>
          <div>
            <p
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 800,
                fontSize: 19,
                color: light ? "#0D1B3E" : "#fff",
                letterSpacing: "-0.5px",
                lineHeight: 1,
              }}
            >
              MediKiosk
            </p>
            <p
              style={{
                fontSize: 9.5,
                color: "#1A6FE5",
                letterSpacing: "0.18em",
                fontWeight: 600,
                textTransform: "uppercase",
                marginTop: 2,
              }}
            >
              Smart Patient Intake
            </p>
          </div>
        </div>
        {/* Status chips + toggle */}
        <div className="flex items-center gap-2.5">
          {[
            { label: t.online, dot: "#34D399" },
          ].map((c) => (
            <div
              key={c.label}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: light
                  ? "rgba(0,0,0,0.05)"
                  : "rgba(255,255,255,0.06)",
                border: light
                  ? "1px solid rgba(0,0,0,0.1)"
                  : "1px solid rgba(255,255,255,0.1)",
              }}
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: c.dot, boxShadow: `0 0 6px ${c.dot}` }}
              />
              <span
                style={{
                  fontSize: 11,
                  color: light ? "rgba(0,0,0,0.6)" : "rgba(255,255,255,0.7)",
                  fontWeight: 600,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {c.label}
              </span>
            </div>
          ))}
          {/* Light / Dark toggle */}
          <button
            onClick={() => onLightToggle()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300 focus:outline-none"
            style={{
              background: light
                ? "rgba(26,111,229,0.12)"
                : "rgba(255,255,255,0.08)",
              border: light
                ? "1px solid rgba(26,111,229,0.3)"
                : "1px solid rgba(255,255,255,0.15)",
            }}
            aria-label="Toggle light mode"
          >
            {/* Track */}
            <div
              className="relative flex-shrink-0"
              style={{ width: 32, height: 18 }}
            >
              <div
                className="absolute inset-0 rounded-full transition-colors duration-300"
                style={{
                  background: light ? "#1A6FE5" : "rgba(255,255,255,0.15)",
                }}
              />
              <div
                className="absolute top-0.5 rounded-full transition-all duration-300 flex items-center justify-center"
                style={{
                  width: 14,
                  height: 14,
                  left: light ? 16 : 2,
                  background: "#fff",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.25)",
                }}
              >
                <span style={{ fontSize: 8 }}>{light ? "☀️" : "🌙"}</span>
              </div>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: light ? "#1A6FE5" : "rgba(255,255,255,0.6)",
              }}
            >
              {light ? "Light" : "Dark"}
            </span>
          </button>
        </div>
      </div>

      {/* ── Main two-column hero ── */}
      <div className="relative z-10 flex-1 flex items-center px-10 gap-12 py-8">
        {/* LEFT: Hero copy */}
        <div className="flex-1 flex flex-col gap-7 max-w-[540px]">
          {/* Step pill */}
          <div
            className="flex items-center gap-2.5 self-start px-4 py-2 rounded-full"
            style={{
              background: "rgba(26,111,229,0.12)",
              border: "1px solid rgba(96,165,250,0.25)",
            }}
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: "#1A6FE5" }}
            >
              <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>
                1
              </span>
            </div>
            <span
              style={{
                fontSize: 12,
                color: light ? "#1A6FE5" : "#93C5FD",
                fontWeight: 600,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {t.stepLabel}
            </span>
          </div>

          {/* Headline */}
          <div>
            <h1
              style={{
                fontFamily: "Poppins, sans-serif",
                fontWeight: 800,
                fontSize: "clamp(32px, 4vw, 52px)",
                color: light ? "#0D1B3E" : "#fff",
                lineHeight: 1.1,
                letterSpacing: "-1px",
              }}
            >
              {t.headline1}
              <br />
              <span
                style={{
                  background: "linear-gradient(90deg,#1A6FE5,#0EA5E9)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {t.headline2}
              </span>
            </h1>
            <p
              style={{
                fontSize: 13,
                color: light ? "#4B6FA0" : "#6B7280",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                marginTop: 6,
                letterSpacing: "0.05em",
              }}
            >
              {t.hindiSub}
            </p>
          </div>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 15,
              color: light ? "#374151" : "rgba(255,255,255,0.6)",
              lineHeight: 1.7,
              fontFamily: "Inter, sans-serif",
              maxWidth: 440,
            }}
          >
            {t.welcomeSubtitle}
          </p>

          {/* Feature grid */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: "🤖", title: t.feat1title, sub: t.feat1sub },
              { icon: "🔒", title: t.feat2title, sub: t.feat2sub },
              { icon: "🌐", title: t.feat3title, sub: t.feat3sub },
            ].map((f) => (
              <div
                key={f.title}
                className="flex flex-col gap-1.5 p-4 rounded-2xl"
                style={{
                  background: light
                    ? "rgba(255,255,255,0.7)"
                    : "rgba(255,255,255,0.04)",
                  border: light
                    ? "1px solid rgba(26,111,229,0.12)"
                    : "1px solid rgba(255,255,255,0.08)",
                  boxShadow: light ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
                }}
              >
                <span style={{ fontSize: 22 }}>{f.icon}</span>
                <p
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: light ? "#0D1B3E" : "#fff",
                    fontFamily: "Poppins, sans-serif",
                  }}
                >
                  {f.title}
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: light ? "#6B7280" : "rgba(255,255,255,0.45)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  {f.sub}
                </p>
              </div>
            ))}
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => onNavigate("language")}
              className="flex items-center justify-center gap-2.5 flex-1 rounded-2xl font-700 text-white transition-all duration-150 active:scale-[0.97] focus:outline-none"
              style={{
                height: 58,
                background: "linear-gradient(135deg,#1A6FE5,#0EA5E9)",
                boxShadow: "0 8px 32px rgba(26,111,229,0.4)",
                fontFamily: "Poppins, sans-serif",
                fontSize: 15,
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4.5 h-4.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
              {t.continueBtn}
            </button>

            <button
              onClick={onVoiceToggle}
              className="flex items-center justify-center gap-2 rounded-2xl transition-all duration-200 active:scale-[0.97] focus:outline-none relative overflow-hidden"
              style={{
                height: 58,
                paddingLeft: 20,
                paddingRight: 20,
                background: voiceActive
                  ? "rgba(26,111,229,0.15)"
                  : light
                    ? "rgba(255,255,255,0.9)"
                    : "rgba(255,255,255,0.06)",
                border: voiceActive
                  ? "1.5px solid #1A6FE5"
                  : light
                    ? "1.5px solid rgba(26,111,229,0.3)"
                    : "1.5px solid rgba(255,255,255,0.12)",
                boxShadow: voiceActive
                  ? "0 0 24px rgba(26,111,229,0.25)"
                  : light
                    ? "0 2px 12px rgba(0,0,0,0.1)"
                    : "none",
              }}
            >
              {voiceActive && (
                <>
                  <span
                    className="absolute w-12 h-12 rounded-full border border-[#60A5FA] opacity-50 animate-ping"
                    style={{ animationDuration: "1.2s" }}
                  />
                  <span
                    className="absolute w-20 h-20 rounded-full border border-[#60A5FA] opacity-20 animate-ping"
                    style={{ animationDuration: "1.8s" }}
                  />
                </>
              )}
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke={
                  voiceActive
                    ? "#1A6FE5"
                    : light
                      ? "#1A6FE5"
                      : "rgba(255,255,255,0.6)"
                }
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-4.5 h-4.5 relative z-10 flex-shrink-0"
              >
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
              <div className="flex flex-col items-start relative z-10">
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontFamily: "Poppins, sans-serif",
                    color: voiceActive
                      ? "#1A6FE5"
                      : light
                        ? "#0D1B3E"
                        : "rgba(255,255,255,0.8)",
                  }}
                >
                  {voiceActive ? t.voiceListening : t.voiceBtn}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: "Inter, sans-serif",
                    color: voiceActive
                      ? "#1A6FE5"
                      : light
                        ? "#6B7280"
                        : "rgba(255,255,255,0.35)",
                  }}
                >
                  {voiceLabel || t.voiceHint}
                </span>
              </div>
            </button>
          </div>

          {/* Disclaimer */}
          <p
            style={{
              fontSize: 11,
              color: light ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.3)",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {t.disclaimer}
          </p>
        </div>

        {/* RIGHT: Kiosk screen mockup */}
        <div className="flex-shrink-0 relative" style={{ width: 380 }}>
          {/* Floating stat badges */}
          <div
            className="absolute -top-4 -left-8 flex items-center gap-2 px-4 py-2.5 rounded-2xl z-20"
            style={{
              background: "rgba(16,185,129,0.15)",
              border: "1px solid rgba(16,185,129,0.3)",
              backdropFilter: "blur(8px)",
              animation: "float-bob 4s ease-in-out infinite",
            }}
          >
            <span style={{ fontSize: 20 }}>✅</span>
            <div>
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#34D399",
                  fontFamily: "Poppins, sans-serif",
                }}
              >
                2.4M+ Patients
              </p>
              <p
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.45)",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Registered this year
              </p>
            </div>
          </div>
          {/* Monitor frame */}
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{
              background: light
                ? "linear-gradient(145deg,rgba(255,255,255,0.9),rgba(240,248,255,0.8))"
                : "linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))",
              border: light
                ? "1.5px solid rgba(26,111,229,0.2)"
                : "1.5px solid rgba(255,255,255,0.12)",
              boxShadow: light
                ? "0 32px 80px rgba(0,0,0,0.15), 0 2px 0 rgba(255,255,255,0.9) inset"
                : "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)",
              padding: 2,
            }}
          >
            <div
              className="rounded-[22px] overflow-hidden"
              style={{ background: light ? "#F0F7FF" : "#0B1635" }}
            >
              {/* Screen top bar */}
              <div
                className="flex items-center justify-between px-5 py-3.5"
                style={{
                  background: light
                    ? "rgba(26,111,229,0.08)"
                    : "rgba(26,111,229,0.15)",
                  borderBottom: light
                    ? "1px solid rgba(26,111,229,0.1)"
                    : "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <div className="w-2 h-2 rounded-full bg-[#10B981]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-[#10B981]"
                    style={{ boxShadow: "0 0 6px #10B981" }}
                  />
                  <span
                    style={{
                      fontSize: 10,
                      color: light
                        ? "rgba(0,0,0,0.4)"
                        : "rgba(255,255,255,0.5)",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    medikiosk.health
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 10,
                    color: light
                      ? "rgba(0,0,0,0.35)"
                      : "rgba(255,255,255,0.35)",
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  🔒 Secure
                </span>
              </div>

              {/* Screen body — mock intake UI */}
              <div className="p-5 flex flex-col gap-4">
                {/* Mock header */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: "linear-gradient(135deg,#1A6FE5,#0EA5E9)",
                    }}
                  >
                    <div className="w-4 h-4 text-white">
                      <Icon.Stethoscope />
                    </div>
                  </div>
                  <div>
                    <p
                      style={{
                        fontSize: 12,
                        fontWeight: 700,
                        color: light ? "#0D1B3E" : "#fff",
                        fontFamily: "Poppins, sans-serif",
                      }}
                    >
                      Patient Intake
                    </p>
                    <p
                      style={{
                        fontSize: 10,
                        color: light ? "#6B7280" : "rgba(255,255,255,0.4)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Apollo Hospital · Delhi
                    </p>
                  </div>
                  <div
                    className="ml-auto px-2.5 py-1 rounded-full"
                    style={{
                      background: "rgba(16,185,129,0.15)",
                      border: "1px solid rgba(16,185,129,0.3)",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        color: "#34D399",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Active
                    </span>
                  </div>
                </div>

                {/* Mock progress bar */}
                <div>
                  <div className="flex justify-between mb-1.5">
                    <span
                      style={{
                        fontSize: 10,
                        color: light ? "#6B7280" : "rgba(255,255,255,0.5)",
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Progress
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: "#60A5FA",
                        fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                      }}
                    >
                      Step 1/10
                    </span>
                  </div>
                  <div
                    className="w-full rounded-full overflow-hidden"
                    style={{
                      height: 5,
                      background: light
                        ? "rgba(0,0,0,0.08)"
                        : "rgba(255,255,255,0.08)",
                    }}
                  >
                    <div
                      style={{
                        width: "10%",
                        height: "100%",
                        background: "linear-gradient(90deg,#1A6FE5,#0EA5E9)",
                        borderRadius: 99,
                      }}
                    />
                  </div>
                </div>

                {/* Mock patient card */}
                <div
                  className="rounded-2xl p-4 flex flex-col gap-3"
                  style={{
                    background: light
                      ? "rgba(255,255,255,0.7)"
                      : "rgba(255,255,255,0.04)",
                    border: light
                      ? "1px solid rgba(26,111,229,0.1)"
                      : "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <p
                    style={{
                      fontSize: 11,
                      color: light ? "#6B7280" : "rgba(255,255,255,0.4)",
                      fontFamily: "Inter, sans-serif",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                    }}
                  >
                    Today's Patient
                  </p>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                      style={{
                        background: "linear-gradient(135deg,#1A6FE5,#7C3AED)",
                      }}
                    >
                      👤
                    </div>
                    <div>
                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: light ? "#0D1B3E" : "#fff",
                          fontFamily: "Poppins, sans-serif",
                        }}
                      >
                        Priya Sharma
                      </p>
                      <p
                        style={{
                          fontSize: 11,
                          color: light ? "#6B7280" : "rgba(255,255,255,0.45)",
                          fontFamily: "Inter, sans-serif",
                        }}
                      >
                        Age 34 · Female · ABHA #7821
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { k: "Dept", v: "Cardiology" },
                      { k: "Doctor", v: "Dr. R. Mehta" },
                      { k: "Token", v: "#A-047" },
                      { k: "ETA", v: "~12 mins" },
                    ].map((r) => (
                      <div
                        key={r.k}
                        className="px-3 py-2 rounded-xl"
                        style={{
                          background: light
                            ? "rgba(26,111,229,0.05)"
                            : "rgba(255,255,255,0.04)",
                        }}
                      >
                        <p
                          style={{
                            fontSize: 9,
                            color: light ? "#9CA3AF" : "rgba(255,255,255,0.35)",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {r.k}
                        </p>
                        <p
                          style={{
                            fontSize: 11,
                            fontWeight: 600,
                            color: light ? "#0D1B3E" : "#fff",
                            fontFamily: "Inter, sans-serif",
                          }}
                        >
                          {r.v}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mock waveform bar — decorative */}
                <div
                  className="flex items-end justify-center gap-0.5"
                  style={{ height: 28 }}
                >
                  {[4, 8, 14, 20, 12, 7, 18, 24, 10, 16, 22, 8, 13, 19, 6].map(
                    (h, i) => (
                      <div
                        key={i}
                        className="wave-bar rounded-sm flex-shrink-0"
                        style={{
                          width: 5,
                          height: h,
                          background: "linear-gradient(180deg,#1A6FE5,#0EA5E9)",
                          opacity: 0.6,
                          animationDelay: `${i * 0.07}s`,
                        }}
                      />
                    ),
                  )}
                </div>

                {/* Mock CTA inside screen */}
                <div
                  className="rounded-xl flex items-center justify-center gap-2 py-3"
                  style={{
                    background: "linear-gradient(135deg,#1A6FE5,#0EA5E9)",
                    boxShadow: "0 4px 16px rgba(26,111,229,0.35)",
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "white",
                      fontFamily: "Poppins, sans-serif",
                    }}
                  >
                    Begin Intake →
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Monitor stand */}
          <div className="flex flex-col items-center">
            <div
              style={{
                width: 3,
                height: 24,
                background: "rgba(255,255,255,0.1)",
                margin: "0 auto",
              }}
            />
            <div
              style={{
                width: 120,
                height: 8,
                borderRadius: 99,
                background: "rgba(255,255,255,0.06)",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Bottom footer strip ── */}
      <div
        className="relative z-10 flex items-center justify-between px-10 py-4"
        style={{
          borderTop: light
            ? "1px solid rgba(0,0,0,0.08)"
            : "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <p
          style={{
            fontSize: 11,
            color: light ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.25)",
            fontFamily: "Inter, sans-serif",
          }}
        >
          {t.copyright}
        </p>
        <div className="flex items-center gap-4">
          {[
            { label: t.privacy, em: false },
            { label: t.help, em: false },
            { label: t.emergency, em: true },
          ].map((item) => (
            <span
              key={item.label}
              style={{
                fontSize: 11,
                color: item.em
                  ? "#EF4444"
                  : light
                    ? "rgba(0,0,0,0.35)"
                    : "rgba(255,255,255,0.3)",
                fontFamily: "Inter, sans-serif",
                fontWeight: item.em ? 700 : 400,
              }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 1.5: LANGUAGE SELECTION
// ──────────────────────────────────────────────
const ALL_LANGUAGES = [
  { code: "hi", native: "हिंदी", sub: "Hindi", country: "in" },
  { code: "en", native: "English", sub: "English", country: "gb" },
  { code: "ta", native: "தமிழ்", sub: "Tamil", country: "in" },
  { code: "bn", native: "বাংলা", sub: "Bengali", country: "bd" },
  { code: "mr", native: "मराठी", sub: "Marathi", country: "in" },
  { code: "gu", native: "ગુજરાતી", sub: "Gujarati", country: "in" },
  { code: "kn", native: "ಕನ್ನಡ", sub: "Kannada", country: "in" },
  { code: "te", native: "తెలుగు", sub: "Telugu", country: "in" },
  { code: "ur", native: "اردو", sub: "Urdu", country: "pk" },
  { code: "pa", native: "ਪੰਜਾਬੀ", sub: "Punjabi", country: "in" },
  { code: "ml", native: "മലയാളം", sub: "Malayalam", country: "in" },
]

// ──────────────────────────────────────────────
// TRANSLATIONS
// ──────────────────────────────────────────────
type LangCode = "en" | "hi" | "ta" | "bn" | "mr" | "gu" | "kn" | "te" | "ur" | "pa" | "ml"

type PatientData = {
  full_name: string
  patient_id: string
  age: number | null
  gender: string
  department: string
  phone: string
  created_at: string
}

const T: Record<LangCode, Record<string, any>> = {
  en: {
    stepLabel: "Step 1 / 10 — Welcome",
    headline1: "Your Health Journey",
    headline2: "Starts Here",
    hindiSub: "आपकी स्वास्थ्य यात्रा यहाँ से शुरू होती है",
    welcomeSubtitle:
      "Complete your pre-consultation health intake in under 6 minutes. Fully bilingual, ABDM-integrated, and reviewed by your doctor before you step inside.",
    feat1title: "AI-Powered",
    feat1sub: "Smart symptom capture",
    feat2title: "ABDM Ready",
    feat2sub: "Aadhaar health ID",
    feat3title: "8 Languages",
    feat3sub: "Hindi, Tamil & more",
    continueBtn: "Tap to Continue",
    voiceBtn: "Voice Assistant",
    voiceListening: "Listening…",
    voiceHint: "Say 'Next' to continue",
    disclaimer:
      "🔐 Your data is encrypted and never shared without consent · Powered by ABDM",
    abdmLinked: "ABDM Linked",
    online: "Online",
    copyright: "© 2026 MediKiosk · Powered by ABDM · v3.2.1",
    privacy: "Privacy Policy",
    help: "Help",
    emergency: "Emergency: 112",
    nextWords: ["next", "continue", "start", "go"],
    prevWords: ["back", "previous", "return"],
    firstPageMsg: "Already on first page",
    langHeading: "Select Your Language",
    langSubtitle:
      "Choose your preferred language to continue.\nThe system will guide you in your selected language,\nwith both voice and text support.",
    langStep: "Step 2 of 10",
    langContinue: "Continue",
    langMore: "+ More Languages (ਪੰਜਾਬੀ, മലയാളം…)",
    langTagline: "Better Conversations\nfor Better Care",
    authTitle: "Patient Login",
    authSubtitle: "Secure, fast, paperless check-in",
    tabReturning: "Returning Patient",
    tabNew: "First Time Visit",
    tabAbha: "ABHA ID Login",
    patientId: "Patient ID",
    patientIdPh: "e.g. MK-2024-XXXXXX",
    pin: "4-digit PIN",
    pinPh: "Enter your PIN",
    forgotPin: "Forgot PIN?",
    loginBtn: "Log In",
    voiceCmdBtn: "Voice Command",
    tapToStop: "Tap to stop",
    fullName: "Full Name",
    namePh: "Enter your full name",
    phone: "Phone Number",
    phonePh: "+91 XXXXX XXXXX",
    age: "Age / DOB",
    agePh: "25 or 01/01/1999",
    gender: "Gender",
    dept: "Department",
    createBtn: "Create Profile & Continue",
    scanQR: "Scan ABHA QR Code",
    abhaId: "ABHA ID",
    abhaPh: "14-digit ABHA number",
    verifyBtn: "Verify & Continue",
    voiceDescReturning:
      "Welcome back! To log in as a returning patient, please enter your Patient ID and your 4-digit PIN.",
    voiceDescNew:
      "Welcome! To register as a new patient, fill in your full name, phone number, age, gender, and department.",
    voiceDescAbha:
      "To log in with ABHA, scan your QR code or enter your 14-digit ABHA ID.",
    dashTitle: "Your Consultation Workflow",
    dashSubtitle: "Complete all steps before meeting your doctor",
    inProgress: "In Progress",
    overallProgress: "Overall Progress",
    complete: "complete",
    stage1: "Voice History Recording",
    stage2: "Guided Questions",
    stage3: "Document Scanning & OCR",
    stage4: "Review & Confirm",
    stage1icon: "📢 Voice Conversation",
    stage2icon: "✋ Answer Questions",
    stage3icon: "📄 Upload Documents",
    stage4icon: "✅ Summary Review",
    continueRec: "Continue Recording",
    recSession: "Recording session",
    remaining: "remaining",
    s1hint: "Tell us about your health concerns in your language",
    s2hint: "Review your medical history with structured questions",
    s2count: "0 / 15 questions completed",
    s3hint: "Upload prescriptions, lab reports, discharge summaries",
    s3docs: "5 documents uploaded",
    s4hint: "Your complete medical history reviewed by doctor",
    s4eta: "Estimated: 2 min after history completion",
    upcoming: "Upcoming Consultation",
    startsIn: "⏰ Starts in 15 minutes",
    room: "📍 Room 402, Building A",
    age45: "45 years",
    lastVisit: "3 months ago",
    allergies: "Allergies",
    medications: "Medications",
    surgeries: "Surgeries",
    doctor: "Doctor",
    medActive: "5 active",
    surgCount: "1 surgery",
    editProfile: "Edit Profile",
    viewHistory: "View Full History",
    dashLabel: "Dashboard",
    liveTranscript: "Live Transcription",
    pauseReturn: "← Pause & Return",
    nextDocScan: "Next: Document Scan",
    startRec: "START",
    stopRec: "STOP",
    questionOf: "Question",
    prevBtn: "← Previous",
    skipBtn: "Skip",
    nextBtn: "Next →",
    finishBtn: "Finish",
    autoSave: "Auto-saving your answers...",
    yesBtn: "✓ Yes",
    noBtn: "✗ No",
    uploadTitle: "Upload Medical Documents",
    captureNow: "Capture Now",
    uploadFiles: "Upload Files",
    photoGallery: "Photo Gallery",
    dragDocs: "Drag medical documents here",
    tapBrowse: "Or tap to browse files",
    uploadedDocs: "Uploaded Documents",
    extractedData: "Extracted Clinical Data",
    continueToSummary: "Continue to Summary",
    manualReview: "Manual Review Needed",
    clinicalSummary: "Clinical Summary",
    continueConsent: "Continue to Consent",
    consentTitle: "Patient Consent",
    agreeBtn: "I Agree & Proceed",
    doctorReview: "Doctor Review",
    sentToDoctor: "Your information has been sent to the doctor",
    settingsTitle: "Settings",
    saveChanges: "Save Changes",
    completionTitle: "Registration Complete!",
    completionSubtitle: "Your health record has been submitted successfully",
    returnStart: "Return to Start",
  },
  hi: {
    stepLabel: "चरण 1 / 10 — स्वागत",
    headline1: "आपकी स्वास्थ्य यात्रा",
    headline2: "यहाँ से शुरू होती है",
    hindiSub: "Your health journey starts here",
    welcomeSubtitle:
      "6 मिनट से कम में स्वास्थ्य जानकारी भरें। पूरी तरह द्विभाषी, ABDM-एकीकृत, डॉक्टर द्वारा समीक्षित।",
    feat1title: "AI-संचालित",
    feat1sub: "स्मार्ट लक्षण रिकॉर्डिंग",
    feat2title: "ABDM तैयार",
    feat2sub: "आधार स्वास्थ्य ID",
    feat3title: "8 भाषाएँ",
    feat3sub: "हिंदी, तमिल और अधिक",
    continueBtn: "आगे बढ़ें",
    voiceBtn: "आवाज़ सहायक",
    voiceListening: "सुन रहा हूँ…",
    voiceHint: "आगे जाने के लिए 'आगे' कहें",
    disclaimer: "🔐 आपका डेटा एन्क्रिप्टेड है · ABDM द्वारा संचालित",
    abdmLinked: "ABDM जुड़ा है",
    online: "ऑनलाइन",
    copyright: "© 2026 MediKiosk · ABDM द्वारा संचालित · v3.2.1",
    privacy: "गोपनीयता नीति",
    help: "सहायता",
    emergency: "आपातकाल: 112",
    nextWords: [
      "next",
      "continue",
      "start",
      "go",
      "आगे",
      "अगला",
      "जारी",
      "शुरू",
      "चलो",
      "हाँ",
    ],
    prevWords: ["back", "previous", "return", "वापस", "पिछला", "नहीं"],
    firstPageMsg: "यह पहला पेज है",
    langHeading: "अपनी भाषा चुनें",
    langSubtitle:
      "जारी रखने के लिए अपनी पसंदीदा भाषा चुनें।\nसिस्टम आपको चुनी गई भाषा में मार्गदर्शन करेगा।",
    langStep: "चरण 2 / 10",
    langContinue: "जारी रखें",
    langMore: "+ अधिक भाषाएँ",
    langTagline: "बेहतर बातचीत\nबेहतर देखभाल के लिए",
    authTitle: "रोगी लॉगिन",
    authSubtitle: "सुरक्षित, तेज़, कागज़-रहित",
    tabReturning: "पुराना मरीज़",
    tabNew: "पहली बार",
    tabAbha: "ABHA ID लॉगिन",
    patientId: "मरीज़ ID",
    patientIdPh: "जैसे MK-2024-XXXXXX",
    pin: "4-अंकीय PIN",
    pinPh: "अपना PIN दर्ज करें",
    forgotPin: "PIN भूल गए?",
    loginBtn: "लॉग इन करें",
    voiceCmdBtn: "आवाज़ कमांड",
    tapToStop: "रोकने के लिए टैप करें",
    fullName: "पूरा नाम",
    namePh: "अपना पूरा नाम दर्ज करें",
    phone: "फ़ोन नंबर",
    phonePh: "+91 XXXXX XXXXX",
    age: "आयु / जन्मतिथि",
    agePh: "25 या 01/01/1999",
    gender: "लिंग",
    dept: "विभाग",
    createBtn: "प्रोफ़ाइल बनाएं और जारी रखें",
    scanQR: "ABHA QR कोड स्कैन करें",
    abhaId: "ABHA ID",
    abhaPh: "14-अंकीय ABHA नंबर",
    verifyBtn: "सत्यापित करें और जारी रखें",
    voiceDescReturning:
      "स्वागत है! पुराने मरीज़ के रूप में लॉगिन करने के लिए अपना मरीज़ ID और 4-अंकीय PIN दर्ज करें।",
    voiceDescNew:
      "स्वागत है! नए मरीज़ के रूप में पंजीकरण के लिए अपना नाम, फ़ोन, आयु, लिंग और विभाग भरें।",
    voiceDescAbha:
      "ABHA से लॉगिन करने के लिए QR कोड स्कैन करें या 14-अंकीय ABHA ID दर्ज करें।",
    dashTitle: "आपका परामर्श वर्कफ़्लो",
    dashSubtitle: "डॉक्टर से मिलने से पहले सभी चरण पूरे करें",
    inProgress: "जारी है",
    overallProgress: "कुल प्रगति",
    complete: "पूर्ण",
    stage1: "आवाज़ इतिहास रिकॉर्डिंग",
    stage2: "निर्देशित प्रश्न",
    stage3: "दस्तावेज़ स्कैनिंग और OCR",
    stage4: "समीक्षा और पुष्टि",
    stage1icon: "📢 आवाज़ बातचीत",
    stage2icon: "✋ प्रश्नों का उत्तर दें",
    stage3icon: "📄 दस्तावेज़ अपलोड करें",
    stage4icon: "✅ सारांश समीक्षा",
    continueRec: "रिकॉर्डिंग जारी रखें",
    recSession: "रिकॉर्डिंग सत्र",
    remaining: "शेष",
    s1hint: "अपनी भाषा में स्वास्थ्य समस्याएं बताएं",
    s2hint: "संरचित प्रश्नों से चिकित्सा इतिहास देखें",
    s2count: "0 / 15 प्रश्न पूर्ण",
    s3hint: "पर्चे, लैब रिपोर्ट, डिस्चार्ज सारांश अपलोड करें",
    s3docs: "5 दस्तावेज़ अपलोड किए गए",
    s4hint: "डॉक्टर द्वारा आपका पूरा इतिहास समीक्षित",
    s4eta: "अनुमानित: इतिहास पूर्ण होने के 2 मिनट बाद",
    upcoming: "आगामी परामर्श",
    startsIn: "⏰ 15 मिनट में शुरू",
    room: "📍 कमरा 402, भवन A",
    age45: "45 वर्ष",
    lastVisit: "3 महीने पहले",
    allergies: "एलर्जी",
    medications: "दवाइयाँ",
    surgeries: "शल्य चिकित्सा",
    doctor: "डॉक्टर",
    medActive: "5 सक्रिय",
    surgCount: "1 ऑपरेशन",
    editProfile: "प्रोफ़ाइल संपादित करें",
    viewHistory: "पूरा इतिहास देखें",
    dashLabel: "डैशबोर्ड",
    liveTranscript: "लाइव ट्रांसक्रिप्शन",
    pauseReturn: "← रुकें और वापस जाएं",
    nextDocScan: "अगला: दस्तावेज़ स्कैन",
    startRec: "शुरू",
    stopRec: "रोकें",
    questionOf: "प्रश्न",
    prevBtn: "← पिछला",
    skipBtn: "छोड़ें",
    nextBtn: "अगला →",
    finishBtn: "समाप्त",
    autoSave: "आपके उत्तर स्वतः सहेजे जा रहे हैं...",
    yesBtn: "✓ हाँ",
    noBtn: "✗ नहीं",
    uploadTitle: "चिकित्सा दस्तावेज़ अपलोड करें",
    captureNow: "अभी कैप्चर करें",
    uploadFiles: "फ़ाइलें अपलोड",
    photoGallery: "फ़ोटो गैलरी",
    dragDocs: "यहाँ दस्तावेज़ खींचें",
    tapBrowse: "या ब्राउज़ करें",
    uploadedDocs: "अपलोड किए गए दस्तावेज़",
    extractedData: "निकाला गया नैदानिक डेटा",
    continueToSummary: "सारांश पर जारी रखें",
    manualReview: "मैन्युअल समीक्षा आवश्यक",
    clinicalSummary: "नैदानिक सारांश",
    continueConsent: "सहमति पर जारी रखें",
    consentTitle: "मरीज़ सहमति",
    agreeBtn: "मैं सहमत हूँ",
    doctorReview: "डॉक्टर समीक्षा",
    sentToDoctor: "आपकी जानकारी डॉक्टर को भेज दी गई है",
    settingsTitle: "सेटिंग्स",
    saveChanges: "परिवर्तन सहेजें",
    completionTitle: "पंजीकरण पूर्ण!",
    completionSubtitle: "आपका स्वास्थ्य रिकॉर्ड सफलतापूर्वक जमा हो गया",
    returnStart: "शुरू में वापस जाएं",
  },
  ta: {
    stepLabel: "படி 1 / 10 — வரவேற்பு",
    headline1: "உங்கள் ஆரோக்கிய பயணம்",
    headline2: "இங்கே தொடங்குகிறது",
    hindiSub: "உங்கள் சுகாதார பயணம் இங்கிருந்து தொடங்குகிறது",
    welcomeSubtitle:
      "6 நிமிடங்களில் ஆரோக்கிய தகவல்களை பதிவு செய்யுங்கள். ABDM ஒருங்கிணைக்கப்பட்டது.",
    feat1title: "AI-இயக்கம்",
    feat1sub: "நுட்பமான அறிகுறி பதிவு",
    feat2title: "ABDM தயார்",
    feat2sub: "ஆதார் சுகாதார ID",
    feat3title: "8 மொழிகள்",
    feat3sub: "தமிழ், இந்தி மற்றும் பலவற்றில்",
    continueBtn: "தொடர்க",
    voiceBtn: "குரல் உதவியாளர்",
    voiceListening: "கேட்கிறேன்…",
    voiceHint: "தொடர 'next' என்று சொல்லுங்கள்",
    disclaimer: "🔐 உங்கள் தரவு குறியாக்கம் செய்யப்பட்டது · ABDM",
    abdmLinked: "ABDM இணைக்கப்பட்டது",
    online: "ஆன்லைன்",
    copyright: "© 2026 MediKiosk · ABDM · v3.2.1",
    privacy: "தனியுரிமை",
    help: "உதவி",
    emergency: "அவசரம்: 112",
    nextWords: ["next", "continue", "தொடர்", "முன்னோக்கி"],
    prevWords: ["back", "previous", "பின்னோக்கி"],
    firstPageMsg: "இது முதல் பக்கம்",
    langHeading: "உங்கள் மொழியை தேர்ந்தெடுங்கள்",
    langSubtitle: "தொடர உங்கள் மொழியை தேர்வுசெய்யவும்.",
    langStep: "படி 2 / 10",
    langContinue: "தொடர்க",
    langMore: "+ மேலும் மொழிகள்",
    langTagline: "சிறந்த உரையாடல்கள்\nசிறந்த சுகாதாரத்திற்கு",
    authTitle: "நோயாளி உள்நுழைவு",
    authSubtitle: "பாதுகாப்பான, விரைவான, காகிதமற்ற",
    tabReturning: "திரும்பி வரும் நோயாளி",
    tabNew: "முதல் முறை வருகை",
    tabAbha: "ABHA ID உள்நுழைவு",
    patientId: "நோயாளி ID",
    patientIdPh: "எ.கா. MK-2024-XXXXXX",
    pin: "4-இலக்க PIN",
    pinPh: "உங்கள் PIN ஐ உள்ளிடுங்கள்",
    forgotPin: "PIN மறந்துவிட்டதா?",
    loginBtn: "உள்நுழைக",
    voiceCmdBtn: "குரல் கட்டளை",
    tapToStop: "நிறுத்த தட்டவும்",
    fullName: "முழு பெயர்",
    namePh: "உங்கள் முழு பெயரை உள்ளிடுங்கள்",
    phone: "தொலைபேசி எண்",
    phonePh: "+91 XXXXX XXXXX",
    age: "வயது / பிறந்த தேதி",
    agePh: "25 அல்லது 01/01/1999",
    gender: "பாலினம்",
    dept: "துறை",
    createBtn: "சுயவிவரம் உருவாக்கி தொடரவும்",
    scanQR: "ABHA QR குறியீட்டை ஸ்கேன் செய்யுங்கள்",
    abhaId: "ABHA ID",
    abhaPh: "14 இலக்க ABHA எண்",
    verifyBtn: "சரிபார்த்து தொடரவும்",
    voiceDescReturning: "மீண்டும் வரவேற்கிறோம்! நோயாளி ID மற்றும் PIN உள்ளிடவும்.",
    voiceDescNew:
      "வரவேற்கிறோம்! பெயர், தொலைபேசி, வயது, பாலினம் மற்றும் துறை நிரப்பவும்.",
    voiceDescAbha: "QR கோடை ஸ்கேன் செய்யுங்கள் அல்லது ABHA ID உள்ளிடுங்கள்.",
    dashTitle: "உங்கள் ஆலோசனை பணிப்பாய்வு",
    dashSubtitle: "மருத்துவரை சந்திப்பதற்கு முன் அனைத்து படிகளையும் முடிக்கவும்",
    inProgress: "நடைபெறுகிறது",
    overallProgress: "ஒட்டுமொத்த முன்னேற்றம்",
    complete: "முடிந்தது",
    stage1: "குரல் வரலாறு பதிவு",
    stage2: "வழிகாட்டப்பட்ட கேள்விகள்",
    stage3: "ஆவண ஸ்கேனிங்",
    stage4: "மதிப்பாய்வு மற்றும் உறுதிப்படுத்தல்",
    stage1icon: "📢 குரல் உரையாடல்",
    stage2icon: "✋ கேள்விகளுக்கு பதில் அளிக்கவும்",
    stage3icon: "📄 ஆவணங்களை அப்லோட் செய்யவும்",
    stage4icon: "✅ சுருக்க மதிப்பாய்வு",
    continueRec: "பதிவைத் தொடரவும்",
    recSession: "பதிவு அமர்வு",
    remaining: "மீதமுள்ளது",
    s1hint: "உங்கள் மொழியில் சுகாதார கவலைகளை சொல்லுங்கள்",
    s2hint: "கட்டமைக்கப்பட்ட கேள்விகளுடன் இதிகாசத்தை மதிப்பாய்வு செய்யுங்கள்",
    s2count: "0 / 15 கேள்விகள் முடிந்தன",
    s3hint: "மருந்துச் சீட்டுகள், ஆய்வக அறிக்கைகளை அப்லோட் செய்யுங்கள்",
    s3docs: "5 ஆவணங்கள் அப்லோட்",
    s4hint: "மருத்துவரால் உங்கள் முழு வரலாறு மதிப்பாய்வு",
    s4eta: "மதிப்பீடு: வரலாறு முடிந்த 2 நிமிடங்களில்",
    upcoming: "வரவிருக்கும் ஆலோசனை",
    startsIn: "⏰ 15 நிமிடங்களில் தொடங்கும்",
    room: "📍 அறை 402, கட்டிடம் A",
    age45: "45 வயது",
    lastVisit: "3 மாதங்களுக்கு முன்",
    allergies: "ஒவ்வாமை",
    medications: "மருந்துகள்",
    surgeries: "அறுவை சிகிச்சை",
    doctor: "மருத்துவர்",
    medActive: "5 செயலில்",
    surgCount: "1 அறுவை சிகிச்சை",
    editProfile: "சுயவிவரத்தை திருத்து",
    viewHistory: "முழு வரலாற்றை பார்க்கவும்",
    dashLabel: "டாஷ்போர்டு",
    liveTranscript: "நேரடி உரை",
    pauseReturn: "← இடைநிறுத்தி திரும்பு",
    nextDocScan: "அடுத்து: ஆவண ஸ்கேன்",
    startRec: "தொடங்கு",
    stopRec: "நிறுத்து",
    questionOf: "கேள்வி",
    prevBtn: "← முந்தைய",
    skipBtn: "தவிர்",
    nextBtn: "அடுத்து →",
    finishBtn: "முடி",
    autoSave: "தானாக சேமிக்கிறது...",
    yesBtn: "✓ ஆம்",
    noBtn: "✗ இல்லை",
    uploadTitle: "மருத்துவ ஆவணங்கள் அப்லோட்",
    captureNow: "இப்போது கைப்பற்று",
    uploadFiles: "கோப்புகள் அப்லோட்",
    photoGallery: "புகைப்பட தொகுப்பு",
    dragDocs: "இங்கே ஆவணங்களை இழுக்கவும்",
    tapBrowse: "அல்லது கோப்புகளை உலாவு",
    uploadedDocs: "அப்லோட் ஆவணங்கள்",
    extractedData: "பிரித்தெடுக்கப்பட்ட தரவு",
    continueToSummary: "சுருக்கத்திற்கு தொடரவும்",
    manualReview: "கையேடு மதிப்பாய்வு தேவை",
    clinicalSummary: "மருத்துவ சுருக்கம்",
    continueConsent: "சம்மதத்திற்கு தொடரவும்",
    consentTitle: "நோயாளி சம்மதம்",
    agreeBtn: "நான் ஒப்புக்கொள்கிறேன்",
    doctorReview: "மருத்துவர் மதிப்பாய்வு",
    sentToDoctor: "தகவல் மருத்துவரிடம் அனுப்பப்பட்டது",
    settingsTitle: "அமைப்புகள்",
    saveChanges: "மாற்றங்களை சேமி",
    completionTitle: "பதிவு முடிந்தது!",
    completionSubtitle: "உங்கள் சுகாதார பதிவு சமர்ப்பிக்கப்பட்டது",
    returnStart: "தொடக்கத்திற்கு திரும்பு",
  },
  bn: {
    stepLabel: "ধাপ ১ / ১০ — স্বাগতম",
    headline1: "আপনার স্বাস্থ্য যাত্রা",
    headline2: "এখানে শুরু হয়",
    hindiSub: "আপনার স্বাস্থ্য যাত্রা এখান থেকে শুরু হয়",
    welcomeSubtitle: "৬ মিনিটের মধ্যে স্বাস্থ্য তথ্য পূরণ করুন। ABDM-সংযুক্ত।",
    feat1title: "AI-চালিত",
    feat1sub: "স্মার্ট লক্ষণ রেকর্ড",
    feat2title: "ABDM প্রস্তুত",
    feat2sub: "আধার স্বাস্থ্য ID",
    feat3title: "৮ ভাষা",
    feat3sub: "বাংলা, হিন্দি ও আরো",
    continueBtn: "এগিয়ে যান",
    voiceBtn: "ভয়েস সহায়তা",
    voiceListening: "শুনছি…",
    voiceHint: "এগিয়ে যেতে 'next' বলুন",
    disclaimer: "🔐 আপনার ডেটা এনক্রিপ্টেড · ABDM",
    abdmLinked: "ABDM সংযুক্ত",
    online: "অনলাইন",
    copyright: "© 2026 MediKiosk · ABDM · v3.2.1",
    privacy: "গোপনীয়তা নীতি",
    help: "সাহায্য",
    emergency: "জরুরি: 112",
    nextWords: ["next", "continue", "এগিয়ে", "আগে"],
    prevWords: ["back", "previous", "পিছনে"],
    firstPageMsg: "এটি প্রথম পৃষ্ঠা",
    langHeading: "আপনার ভাষা নির্বাচন করুন",
    langSubtitle: "চালিয়ে যেতে আপনার পছন্দের ভাষা নির্বাচন করুন।",
    langStep: "ধাপ ২ / ১০",
    langContinue: "চালিয়ে যান",
    langMore: "+ আরো ভাষা",
    langTagline: "উন্নত কথোপকথন\nউন্নত যত্নের জন্য",
    authTitle: "রোগী লগইন",
    authSubtitle: "নিরাপদ, দ্রুত, কাগজবিহীন",
    tabReturning: "পুরনো রোগী",
    tabNew: "প্রথম দর্শন",
    tabAbha: "ABHA ID লগইন",
    patientId: "রোগী ID",
    patientIdPh: "যেমন MK-2024-XXXXXX",
    pin: "৪-সংখ্যার PIN",
    pinPh: "আপনার PIN দিন",
    forgotPin: "PIN ভুলে গেছেন?",
    loginBtn: "লগ ইন করুন",
    voiceCmdBtn: "ভয়েস কমান্ড",
    tapToStop: "থামাতে ট্যাপ করুন",
    fullName: "পুরো নাম",
    namePh: "আপনার পুরো নাম লিখুন",
    phone: "ফোন নম্বর",
    phonePh: "+91 XXXXX XXXXX",
    age: "বয়স / জন্মতারিখ",
    agePh: "25 বা 01/01/1999",
    gender: "লিঙ্গ",
    dept: "বিভাগ",
    createBtn: "প্রোফাইল তৈরি করুন ও চালিয়ে যান",
    scanQR: "ABHA QR কোড স্ক্যান করুন",
    abhaId: "ABHA ID",
    abhaPh: "১৪-সংখ্যার ABHA নম্বর",
    verifyBtn: "যাচাই করুন ও চালিয়ে যান",
    voiceDescReturning: "স্বাগতম! রোগী ID এবং PIN দিন।",
    voiceDescNew: "স্বাগতম! নাম, ফোন, বয়স, লিঙ্গ ও বিভাগ পূরণ করুন।",
    voiceDescAbha: "QR স্ক্যান করুন বা ABHA ID দিন।",
    dashTitle: "আপনার পরামর্শ ওয়ার্কফ্লো",
    dashSubtitle: "ডাক্তারের সাথে দেখা করার আগে সব ধাপ সম্পন্ন করুন",
    inProgress: "চলছে",
    overallProgress: "সামগ্রিক অগ্রগতি",
    complete: "সম্পন্ন",
    stage1: "ভয়েস ইতিহাস রেকর্ডিং",
    stage2: "গাইডেড প্রশ্ন",
    stage3: "ডকুমেন্ট স্ক্যানিং",
    stage4: "পর্যালোচনা ও নিশ্চিত",
    stage1icon: "📢 ভয়েস কথোপকথন",
    stage2icon: "✋ প্রশ্নের উত্তর দিন",
    stage3icon: "📄 ডকুমেন্ট আপলোড",
    stage4icon: "✅ সারসংক্ষেপ পর্যালোচনা",
    continueRec: "রেকর্ডিং চালিয়ে যান",
    recSession: "রেকর্ডিং সেশন",
    remaining: "বাকি",
    s1hint: "আপনার ভাষায় স্বাস্থ্য সমস্যা বলুন",
    s2hint: "কাঠামোবদ্ধ প্রশ্ন দিয়ে ইতিহাস পর্যালোচনা করুন",
    s2count: "0 / 15 প্রশ্ন সম্পন্ন",
    s3hint: "প্রেসক্রিপশন, ল্যাব রিপোর্ট আপলোড করুন",
    s3docs: "৫টি নথি আপলোড হয়েছে",
    s4hint: "ডাক্তার দ্বারা সম্পূর্ণ ইতিহাস পর্যালোচিত",
    s4eta: "অনুমান: ২ মিনিট পর",
    upcoming: "আসন্ন পরামর্শ",
    startsIn: "⏰ ১৫ মিনিটে শুরু",
    room: "📍 কক্ষ 402, ভবন A",
    age45: "৪৫ বছর",
    lastVisit: "৩ মাস আগে",
    allergies: "অ্যালার্জি",
    medications: "ওষুধ",
    surgeries: "অস্ত্রোপচার",
    doctor: "ডাক্তার",
    medActive: "৫ সক্রিয়",
    surgCount: "১ অস্ত্রোপচার",
    editProfile: "প্রোফাইল সম্পাদনা করুন",
    viewHistory: "সম্পূর্ণ ইতিহাস দেখুন",
    dashLabel: "ড্যাশবোর্ড",
    liveTranscript: "লাইভ ট্রান্সক্রিপশন",
    pauseReturn: "← থামুন ও ফিরুন",
    nextDocScan: "পরবর্তী: নথি স্ক্যান",
    startRec: "শুরু",
    stopRec: "থামো",
    questionOf: "প্রশ্ন",
    prevBtn: "← পূর্ববর্তী",
    skipBtn: "এড়িয়ে যান",
    nextBtn: "পরবর্তী →",
    finishBtn: "শেষ",
    autoSave: "স্বয়ংক্রিয়ভাবে সংরক্ষণ...",
    yesBtn: "✓ হ্যাঁ",
    noBtn: "✗ না",
    uploadTitle: "চিকিৎসা নথি আপলোড",
    captureNow: "এখন ক্যাপচার",
    uploadFiles: "ফাইল আপলোড",
    photoGallery: "ফটো গ্যালারি",
    dragDocs: "এখানে নথি টেনে আনুন",
    tapBrowse: "বা ফাইল ব্রাউজ করুন",
    uploadedDocs: "আপলোড করা নথি",
    extractedData: "নির্যাসিত ক্লিনিকাল ডেটা",
    continueToSummary: "সারসংক্ষেপে যান",
    manualReview: "ম্যানুয়াল পর্যালোচনা প্রয়োজন",
    clinicalSummary: "ক্লিনিকাল সারসংক্ষেপ",
    continueConsent: "সম্মতিতে যান",
    consentTitle: "রোগীর সম্মতি",
    agreeBtn: "আমি রাজি",
    doctorReview: "ডাক্তার পর্যালোচনা",
    sentToDoctor: "তথ্য ডাক্তারকে পাঠানো হয়েছে",
    settingsTitle: "সেটিংস",
    saveChanges: "পরিবর্তন সংরক্ষণ",
    completionTitle: "নিবন্ধন সম্পন্ন!",
    completionSubtitle: "আপনার স্বাস্থ্য রেকর্ড জমা দেওয়া হয়েছে",
    returnStart: "শুরুতে ফিরুন",
  },
  mr: {
    stepLabel: "पायरी 1 / 10 — स्वागत",
    headline1: "तुमचा आरोग्य प्रवास",
    headline2: "इथून सुरू होतो",
    hindiSub: "तुमचा आरोग्य प्रवास येथून सुरू होतो",
    welcomeSubtitle: "6 मिनिटांत आरोग्य माहिती भरा. ABDM-एकात्मिक.",
    feat1title: "AI-चालित",
    feat1sub: "स्मार्ट लक्षण नोंद",
    feat2title: "ABDM तयार",
    feat2sub: "आधार आरोग्य ID",
    feat3title: "8 भाषा",
    feat3sub: "मराठी, हिंदी आणि अधिक",
    continueBtn: "पुढे जा",
    voiceBtn: "आवाज सहाय्यक",
    voiceListening: "ऐकत आहे…",
    voiceHint: "पुढे जाण्यासाठी 'पुढे' म्हणा",
    disclaimer: "🔐 तुमचा डेटा एन्क्रिप्टेड आहे · ABDM",
    abdmLinked: "ABDM जोडलेले",
    online: "ऑनलाइन",
    copyright: "© 2026 MediKiosk · ABDM · v3.2.1",
    privacy: "गोपनीयता धोरण",
    help: "मदत",
    emergency: "आपत्कालीन: 112",
    nextWords: ["next", "continue", "पुढे", "जा"],
    prevWords: ["back", "previous", "मागे"],
    firstPageMsg: "हे पहिले पान आहे",
    langHeading: "तुमची भाषा निवडा",
    langSubtitle: "पुढे जाण्यासाठी तुमची पसंतीची भाषा निवडा.",
    langStep: "पायरी 2 / 10",
    langContinue: "पुढे जा",
    langMore: "+ अधिक भाषा",
    langTagline: "उत्तम संवाद\nउत्तम काळजीसाठी",
    authTitle: "रुग्ण लॉगिन",
    authSubtitle: "सुरक्षित, जलद, कागदरहित",
    tabReturning: "जुना रुग्ण",
    tabNew: "पहिली भेट",
    tabAbha: "ABHA ID लॉगिन",
    patientId: "रुग्ण ID",
    patientIdPh: "उदा. MK-2024-XXXXXX",
    pin: "4-अंकी PIN",
    pinPh: "तुमचा PIN टाका",
    forgotPin: "PIN विसरलात?",
    loginBtn: "लॉग इन करा",
    voiceCmdBtn: "आवाज कमांड",
    tapToStop: "थांबवण्यासाठी टॅप करा",
    fullName: "पूर्ण नाव",
    namePh: "तुमचे पूर्ण नाव टाका",
    phone: "फोन नंबर",
    phonePh: "+91 XXXXX XXXXX",
    age: "वय / जन्मतारीख",
    agePh: "25 किंवा 01/01/1999",
    gender: "लिंग",
    dept: "विभाग",
    createBtn: "प्रोफाइल तयार करा आणि पुढे जा",
    scanQR: "ABHA QR कोड स्कॅन करा",
    abhaId: "ABHA ID",
    abhaPh: "14-अंकी ABHA क्रमांक",
    verifyBtn: "सत्यापित करा आणि पुढे जा",
    voiceDescReturning: "स्वागत आहे! रुग्ण ID आणि PIN टाका.",
    voiceDescNew: "स्वागत आहे! नाव, फोन, वय, लिंग आणि विभाग भरा.",
    voiceDescAbha: "QR स्कॅन करा किंवा ABHA ID टाका.",
    dashTitle: "तुमचे सल्ला वर्कफ्लो",
    dashSubtitle: "डॉक्टरांना भेटण्यापूर्वी सर्व पायऱ्या पूर्ण करा",
    inProgress: "सुरू आहे",
    overallProgress: "एकूण प्रगती",
    complete: "पूर्ण",
    stage1: "आवाज इतिहास रेकॉर्डिंग",
    stage2: "मार्गदर्शित प्रश्न",
    stage3: "दस्तऐवज स्कॅनिंग",
    stage4: "पुनरावलोकन आणि पुष्टी",
    stage1icon: "📢 आवाज संभाषण",
    stage2icon: "✋ प्रश्नांची उत्तरे द्या",
    stage3icon: "📄 दस्तऐवज अपलोड करा",
    stage4icon: "✅ सारांश पुनरावलोकन",
    continueRec: "रेकॉर्डिंग सुरू ठेवा",
    recSession: "रेकॉर्डिंग सत्र",
    remaining: "शिल्लक",
    s1hint: "तुमच्या भाषेत आरोग्य समस्या सांगा",
    s2hint: "संरचित प्रश्नांसह इतिहास पहा",
    s2count: "0 / 15 प्रश्न पूर्ण",
    s3hint: "प्रिस्क्रिप्शन, लॅब रिपोर्ट अपलोड करा",
    s3docs: "5 दस्तऐवज अपलोड",
    s4hint: "डॉक्टरांद्वारे संपूर्ण इतिहास पुनरावलोकित",
    s4eta: "अंदाजे: 2 मिनिटांनी",
    upcoming: "आगामी सल्लामसलत",
    startsIn: "⏰ 15 मिनिटांत सुरू",
    room: "📍 खोली 402, इमारत A",
    age45: "45 वर्षे",
    lastVisit: "3 महिन्यांपूर्वी",
    allergies: "ऍलर्जी",
    medications: "औषधे",
    surgeries: "शस्त्रक्रिया",
    doctor: "डॉक्टर",
    medActive: "5 सक्रिय",
    surgCount: "1 शस्त्रक्रिया",
    editProfile: "प्रोफाइल संपादित करा",
    viewHistory: "संपूर्ण इतिहास पहा",
    dashLabel: "डॅशबोर्ड",
    liveTranscript: "थेट उतारा",
    pauseReturn: "← थांबा आणि परत जा",
    nextDocScan: "पुढे: दस्तऐवज स्कॅन",
    startRec: "सुरू",
    stopRec: "थांबा",
    questionOf: "प्रश्न",
    prevBtn: "← मागील",
    skipBtn: "वगळा",
    nextBtn: "पुढे →",
    finishBtn: "संपवा",
    autoSave: "स्वयंचलित जतन...",
    yesBtn: "✓ होय",
    noBtn: "✗ नाही",
    uploadTitle: "वैद्यकीय दस्तऐवज अपलोड",
    captureNow: "आत्ता कॅप्चर",
    uploadFiles: "फाइल अपलोड",
    photoGallery: "फोटो गॅलरी",
    dragDocs: "येथे दस्तऐवज ड्रॅग करा",
    tapBrowse: "किंवा ब्राउझ करा",
    uploadedDocs: "अपलोड केलेले दस्तऐवज",
    extractedData: "काढलेला क्लिनिकल डेटा",
    continueToSummary: "सारांशाकडे चालू ठेवा",
    manualReview: "मॅन्युअल समीक्षा आवश्यक",
    clinicalSummary: "क्लिनिकल सारांश",
    continueConsent: "संमतीकडे जा",
    consentTitle: "रुग्ण संमती",
    agreeBtn: "मी सहमत आहे",
    doctorReview: "डॉक्टरांची समीक्षा",
    sentToDoctor: "माहिती डॉक्टरांना पाठवली",
    settingsTitle: "सेटिंग्ज",
    saveChanges: "बदल जतन करा",
    completionTitle: "नोंदणी पूर्ण!",
    completionSubtitle: "आपला आरोग्य रेकॉर्ड सफलतापूर्वक सबमिट",
    returnStart: "सुरुवातीला परत जा",
  },
  gu: {
    stepLabel: "પગલું 1 / 10 — સ્વાગત",
    headline1: "તમારી સ્વાસ્થ્ય યાત્રા",
    headline2: "અહીંથી શરૂ થાય છે",
    hindiSub: "તમારી આરોગ્ય યાત્રા અહીંથી શરૂ થાય છે",
    welcomeSubtitle: "6 મિનિટ કરતાં ઓછા સમયમાં આરોગ્ય માહિતી ભરો. ABDM-સંકલિત.",
    feat1title: "AI-સંચાલિત",
    feat1sub: "સ્માર્ટ લક્ષણ રેકોર્ડ",
    feat2title: "ABDM તૈયાર",
    feat2sub: "આધાર આરોગ્ય ID",
    feat3title: "8 ભાષાઓ",
    feat3sub: "ગુજરાતી, હિન્દી અને વધુ",
    continueBtn: "આગળ વધો",
    voiceBtn: "વૉઇસ સહાયક",
    voiceListening: "સાંભળી રહ્યો છું…",
    voiceHint: "આગળ જવા 'next' કહો",
    disclaimer: "🔐 તમારો ડેટા એન્ક્રિપ્ટેડ છે · ABDM",
    abdmLinked: "ABDM જોડાયેલ",
    online: "ઓનલાઇન",
    copyright: "© 2026 MediKiosk · ABDM · v3.2.1",
    privacy: "ગોપનીયતા નીતિ",
    help: "મદદ",
    emergency: "કટોકટી: 112",
    nextWords: ["next", "continue", "આગળ"],
    prevWords: ["back", "previous", "પાછળ"],
    firstPageMsg: "આ પ્રથમ પૃષ્ઠ છે",
    langHeading: "તમારી ભાષા પસંદ કરો",
    langSubtitle: "ચાલુ રાખવા માટે ભાષા પસંદ કરો.",
    langStep: "પગલું 2 / 10",
    langContinue: "આગળ વધો",
    langMore: "+ વધુ ભાષાઓ",
    langTagline: "વધુ સારી વાતચીત\nવધુ સારી સંભાળ",
    authTitle: "દર્દી લૉગિન",
    authSubtitle: "સુરક્ષિત, ઝડપી, કાગળ-રહિત",
    tabReturning: "જૂના દર્દી",
    tabNew: "પ્રથમ મુલાકાત",
    tabAbha: "ABHA ID લૉગિન",
    patientId: "દર્દી ID",
    patientIdPh: "જેમ કે MK-2024-XXXXXX",
    pin: "4-અંકી PIN",
    pinPh: "PIN દાખલ કરો",
    forgotPin: "PIN ભૂલ્યા?",
    loginBtn: "લૉગ ઇન કરો",
    voiceCmdBtn: "વૉઇસ કમાન્ડ",
    tapToStop: "રોકવા ટૅપ કરો",
    fullName: "પૂરું નામ",
    namePh: "પૂરું નામ દાખલ કરો",
    phone: "ફોન નંબર",
    phonePh: "+91 XXXXX XXXXX",
    age: "ઉંમર / જન્મ તારીખ",
    agePh: "25 અથવા 01/01/1999",
    gender: "લિંગ",
    dept: "વિભાગ",
    createBtn: "પ્રોફાઇલ બનાવો",
    scanQR: "ABHA QR સ્કૅન",
    abhaId: "ABHA ID",
    abhaPh: "14-અંકી ABHA",
    verifyBtn: "ચકાસો",
    voiceDescReturning: "સ્વાગત છે! દર્દી ID અને PIN ભરો.",
    voiceDescNew: "સ્વાગત છે! નામ, ફોન, ઉંમર, લિંગ ભરો.",
    voiceDescAbha: "QR સ્કૅન કરો અથવા ABHA ID ભરો.",
    dashTitle: "તમારો સલાહ વર્કફ્લો",
    dashSubtitle: "ડૉક્ટરને મળ્યા પહેલા તમામ પગલાં પૂર્ણ કરો",
    inProgress: "ચાલુ છે",
    overallProgress: "કુલ પ્રગતિ",
    complete: "પૂર્ણ",
    stage1: "વૉઇસ ઇતિહાસ",
    stage2: "માર્ગદર્શિત પ્રશ્નો",
    stage3: "દસ્તાવેજ સ્કેનિંગ",
    stage4: "સમીક્ષા",
    stage1icon: "📢 વૉઇસ",
    stage2icon: "✋ પ્રશ્નો",
    stage3icon: "📄 દસ્તાવેજ",
    stage4icon: "✅ સારાંશ",
    continueRec: "રેકોર્ડ ચાલુ",
    recSession: "સત્ર",
    remaining: "બાકી",
    s1hint: "ભાષામાં સ્વાસ્થ્ય ચિંતાઓ",
    s2hint: "ઇતિહાસ જુઓ",
    s2count: "0 / 15 પ્રશ્ન",
    s3hint: "ફાઇલ અપલોડ",
    s3docs: "5 ફાઇલ",
    s4hint: "ડૉક્ટર સમીક્ષા",
    s4eta: "2 મિનિટ",
    upcoming: "આગામી સલાહ",
    startsIn: "⏰ 15 મિ.",
    room: "📍 રૂ. 402",
    age45: "45 વ.",
    lastVisit: "3 મ. પ.",
    allergies: "એ",
    medications: "દ.",
    surgeries: "શ.",
    doctor: "ડૉ.",
    medActive: "5",
    surgCount: "1",
    editProfile: "સંપાદિત",
    viewHistory: "ઇતિહાસ",
    dashLabel: "ડૅશબોર્ડ",
    liveTranscript: "લાઇવ ટ્રાન્સક્રિપ્શન",
    pauseReturn: "← રોકો અને પાછા જાઓ",
    nextDocScan: "આગળ: દસ્તાવેજ સ્કેન",
    startRec: "શરૂ",
    stopRec: "રોકો",
    questionOf: "પ્રશ્ન",
    prevBtn: "← પાછળ",
    skipBtn: "છોડો",
    nextBtn: "આગળ →",
    finishBtn: "સમાપ્ત",
    autoSave: "ઑટો-સેવ...",
    yesBtn: "✓ હા",
    noBtn: "✗ ના",
    uploadTitle: "વૈદ્યકીય દસ્તાવેજ અપલોડ",
    captureNow: "હમણાં કૅપ્ચર",
    uploadFiles: "ફાઇલ અપલોડ",
    photoGallery: "ફોટો ગૅલેરી",
    dragDocs: "અહીં દસ્તાવેજ ખેંચો",
    tapBrowse: "અથવા ફાઇલ બ્રાઉઝ",
    uploadedDocs: "અપલોડ થયેલ દસ્તાવેજ",
    extractedData: "‌‌ਐਕਸਟ੍ਰੈਕਟਡ ডেটা",
    continueToSummary: "સારાંશ પર ચાલુ",
    manualReview: "મૅન્યુઅલ સમીક્ષા",
    clinicalSummary: "‌‌ক্লিনিক্যাল ডেটা",
    continueConsent: "સહમતી પર",
    consentTitle: "દર્દી સહમતી",
    agreeBtn: "હું સહમત છું",
    doctorReview: "‌ ‌ ‌ ‌ ‌ ‌",
    sentToDoctor: "‌ডাক্তারকে পাঠানো হয়েছে",
    settingsTitle: "સેટિંગ્સ",
    saveChanges: "‌ ‌ ‌",
    completionTitle: "‌ ‌ ‌",
    completionSubtitle: "‌ ‌ ‌",
    returnStart: "‌ ‌ ‌",
  },
  kn: {
    stepLabel: "ಹಂತ 1 / 10 — ಸ್ವಾಗತ",
    headline1: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಯಾಣ",
    headline2: "ಇಲ್ಲಿ ಆರಂಭ",
    hindiSub: "ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಯಾಣ ಇಲ್ಲಿಂದ ಪ್ರಾರಂಭ",
    welcomeSubtitle: "6 ನಿಮಿಷಗಳಲ್ಲಿ ಆರೋಗ್ಯ ಮಾಹಿತಿ ನಮೂದಿಸಿ. ABDM-ಸಂಯೋಜಿತ.",
    feat1title: "AI-ಚಾಲಿತ",
    feat1sub: "ಸ್ಮಾರ್ಟ್ ಲಕ್ಷಣ",
    feat2title: "ABDM ಸಿದ್ಧ",
    feat2sub: "ಆಧಾರ್ ID",
    feat3title: "8 ಭಾಷೆ",
    feat3sub: "ಕನ್ನಡ, ಹಿಂದಿ",
    continueBtn: "ಮುಂದುವರಿಯಿರಿ",
    voiceBtn: "ಧ್ವನಿ ಸಹಾಯ",
    voiceListening: "ಕೇಳುತ್ತಿದ್ದೇನೆ…",
    voiceHint: "'next' ಹೇಳಿ",
    disclaimer: "🔐 ಡೇಟಾ ಎನ್‌ಕ್ರಿಪ್ಟ್ · ABDM",
    abdmLinked: "ABDM ಸಂಪರ್ಕ",
    online: "ಆನ್‌ಲೈನ್",
    copyright: "© 2026 MediKiosk · v3.2.1",
    privacy: "ಗೌಪ್ಯತೆ",
    help: "ಸಹಾಯ",
    emergency: "ತುರ್ತು: 112",
    nextWords: ["next", "continue", "ಮುಂದೆ"],
    prevWords: ["back", "previous", "ಹಿಂದೆ"],
    firstPageMsg: "ಮೊದಲ ಪುಟ",
    langHeading: "ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ",
    langSubtitle: "ಮುಂದುವರಿಯಲು ಭಾಷೆ ಆಯ್ಕೆ ಮಾಡಿ.",
    langStep: "ಹಂತ 2 / 10",
    langContinue: "ಮುಂದುವರಿಯಿರಿ",
    langMore: "+ ಹೆಚ್ಚು ಭಾಷೆ",
    langTagline: "ಉತ್ತಮ ಸಂಭಾಷಣೆ\nಉತ್ತಮ ಆರೈಕೆ",
    authTitle: "ರೋಗಿ ಲಾಗಿನ್",
    authSubtitle: "ಸುರಕ್ಷಿತ, ವೇಗ",
    tabReturning: "ಮರಳಿ ಬಂದ ರೋಗಿ",
    tabNew: "ಮೊದಲ ಭೇಟಿ",
    tabAbha: "ABHA ID",
    patientId: "ರೋಗಿ ID",
    patientIdPh: "MK-2024-XXXXXX",
    pin: "4-ಅಂಕಿ PIN",
    pinPh: "PIN ನಮೂದಿಸಿ",
    forgotPin: "PIN ಮರೆತಿರಾ?",
    loginBtn: "ಲಾಗ್ ಇನ್",
    voiceCmdBtn: "ಧ್ವನಿ",
    tapToStop: "ನಿಲ್ಲಿಸಿ",
    fullName: "ಹೆಸರು",
    namePh: "ಹೆಸರು ನಮೂದಿಸಿ",
    phone: "ಫೋನ್",
    phonePh: "+91 XXXXX XXXXX",
    age: "ವಯಸ್ಸು",
    agePh: "25",
    gender: "ಲಿಂಗ",
    dept: "ವಿಭಾಗ",
    createBtn: "ಪ್ರೊಫೈಲ್ ರಚಿಸಿ",
    scanQR: "QR ಸ್ಕ್ಯಾನ್",
    abhaId: "ABHA ID",
    abhaPh: "14-ಅಂಕಿ",
    verifyBtn: "ಪರಿಶೀಲಿಸಿ",
    voiceDescReturning: "ಸ್ವಾಗತ! ID ಮತ್ತು PIN ನಮೂದಿಸಿ.",
    voiceDescNew: "ಸ್ವಾಗತ! ಹೆಸರು, ಫೋನ್, ವಯಸ್ಸು ನಮೂದಿಸಿ.",
    voiceDescAbha: "QR ಸ್ಕ್ಯಾನ್ ಅಥವಾ ABHA ID.",
    dashTitle: "ಸಮಾಲೋಚನೆ ವರ್ಕ್‌ಫ್ಲೋ",
    dashSubtitle: "ಎಲ್ಲಾ ಹಂತ ಪೂರ್ಣ ಮಾಡಿ",
    inProgress: "ನಡೆಯುತ್ತಿದೆ",
    overallProgress: "ಪ್ರಗತಿ",
    complete: "ಪೂರ್ಣ",
    stage1: "ಧ್ವನಿ ರೆಕಾರ್ಡಿಂಗ್",
    stage2: "ಪ್ರಶ್ನೆಗಳು",
    stage3: "ಡಾಕ್ಯೂಮೆಂಟ್",
    stage4: "ಪರಿಶೀಲನೆ",
    stage1icon: "📢 ಧ್ವನಿ",
    stage2icon: "✋ ಉತ್ತರ",
    stage3icon: "📄 ಅಪ್‌ಲೋಡ್",
    stage4icon: "✅ ಸಾರಾಂಶ",
    continueRec: "ರೆಕಾರ್ಡ್ ಮುಂದುವರಿಸಿ",
    recSession: "ಸೆಷನ್",
    remaining: "ಉಳಿದಿದೆ",
    s1hint: "ಆರೋಗ್ಯ ಕಾಳಜಿ ಹೇಳಿ",
    s2hint: "ಇತಿಹಾಸ ಪರಿಶೀಲಿಸಿ",
    s2count: "0 / 15",
    s3hint: "ಫೈಲ್ ಅಪ್‌ಲೋಡ್",
    s3docs: "5 ಡಾಕ್ಯೂಮೆಂಟ್",
    s4hint: "ಡಾಕ್ಟರ್ ಪರಿಶೀಲನೆ",
    s4eta: "2 ನಿ.",
    upcoming: "ಮುಂಬರುವ ಸಮಾಲೋಚನೆ",
    startsIn: "⏰ 15 ನಿ.",
    room: "📍 ಕೊಠಡಿ 402",
    age45: "45 ವ.",
    lastVisit: "3 ತಿ.",
    allergies: "ಅಲರ್ಜಿ",
    medications: "ಔಷಧ",
    surgeries: "ಶಸ್ತ್ರ",
    doctor: "ವೈದ್ಯ",
    medActive: "5",
    surgCount: "1",
    editProfile: "ಸಂಪಾದಿಸಿ",
    viewHistory: "ಇತಿಹಾಸ",
    dashLabel: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    liveTranscript: "ನೇರ ಲಿಪ್ಯಂತರ",
    pauseReturn: "← ವಿರಾಮಗೊಳಿಸಿ ಹಿಂತಿರುಗಿ",
    nextDocScan: "ಮುಂದೆ: ದಾಖಲೆ ಸ್ಕ್ಯಾನ್",
    startRec: "ಪ್ರಾರಂಭ",
    stopRec: "ನಿಲ್ಲಿಸಿ",
    questionOf: "ಪ್ರಶ್ನೆ",
    prevBtn: "← ಹಿಂದಿನ",
    skipBtn: "ಸ್ಕಿಪ್",
    nextBtn: "ಮುಂದೆ →",
    finishBtn: "ಮುಗಿಸಿ",
    autoSave: "ಸ್ವಯಂ ಉಳಿತಾಯ...",
    yesBtn: "✓ ಹೌದು",
    noBtn: "✗ ಇಲ್ಲ",
    uploadTitle: "ವೈದ್ಯಕೀಯ ದಾಖಲೆ ಅಪ್‌ಲೋಡ್",
    captureNow: "ಈಗ ಕ್ಯಾಪ್ಚರ್",
    uploadFiles: "ಫೈಲ್ ಅಪ್‌ಲೋಡ್",
    photoGallery: "ಫೋಟೋ ಗ್ಯಾಲರಿ",
    dragDocs: "ಇಲ್ಲಿ ದಾಖಲೆ ಎಳೆಯಿರಿ",
    tapBrowse: "ಅಥವಾ ಬ್ರೌಸ್ ಮಾಡಿ",
    uploadedDocs: "ಅಪ್‌ಲೋಡ್ ಆದ ದಾಖಲೆ",
    extractedData: "ಹೊರತೆಗೆದ ಡೇಟಾ",
    continueToSummary: "ಸಾರಾಂಶಕ್ಕೆ ಮುಂದುವರಿಯಿರಿ",
    manualReview: "ಕೈಯಾರೆ ಪರಿಶೀಲನೆ",
    clinicalSummary: "‌‌ক্লিনিক্যাল ডেটা",
    continueConsent: "ಸಮ್ಮತಿಗೆ",
    consentTitle: "ರೋಗಿ ಸಮ್ಮತಿ",
    agreeBtn: "ನಾನು ಒಪ್ಪುತ್ತೇನೆ",
    doctorReview: "‌ ‌ ‌ ‌ ‌ ‌",
    sentToDoctor: "‌ডাক্তারকে পাঠানো হয়েছে",
    settingsTitle: "‌ ‌ ‌ ‌ ‌ ‌",
    saveChanges: "‌ ‌ ‌",
    completionTitle: "‌ ‌ ‌",
    completionSubtitle: "‌ ‌ ‌",
    returnStart: "‌ ‌ ‌",
  },
  te: {
    stepLabel: "దశ 1 / 10 — స్వాగతం",
    headline1: "మీ ఆరోగ్య ప్రయాణం",
    headline2: "ఇక్కడ మొదలవుతుంది",
    hindiSub: "మీ ఆరోగ్య ప్రయాణం ఇక్కడి నుండి మొదలవుతుంది",
    welcomeSubtitle: "6 నిమిషాల్లో ఆరోగ్య సమాచారం నమోదు చేయండి. ABDM-అనుసంధానం.",
    feat1title: "AI-ఆధారిత",
    feat1sub: "స్మార్ట్ లక్షణం",
    feat2title: "ABDM సిద్ధం",
    feat2sub: "ఆధార్ ID",
    feat3title: "8 భాషలు",
    feat3sub: "తెలుగు, హిందీ",
    continueBtn: "కొనసాగించు",
    voiceBtn: "వాయిస్ అసిస్టెంట్",
    voiceListening: "వింటున్నాను…",
    voiceHint: "'next' చెప్పండి",
    disclaimer: "🔐 డేటా గుప్తీకరణ · ABDM",
    abdmLinked: "ABDM అనుసంధానం",
    online: "ఆన్‌లైన్",
    copyright: "© 2026 MediKiosk · v3.2.1",
    privacy: "గోప్యత",
    help: "సహాయం",
    emergency: "అత్యవసరం: 112",
    nextWords: ["next", "continue", "ముందుకు"],
    prevWords: ["back", "previous", "వెనక్కి"],
    firstPageMsg: "మొదటి పేజీ",
    langHeading: "భాష ఎంచుకోండి",
    langSubtitle: "కొనసాగించడానికి భాష ఎంచుకోండి.",
    langStep: "దశ 2 / 10",
    langContinue: "కొనసాగించు",
    langMore: "+ మరిన్ని",
    langTagline: "మెరుగైన సంభాషణలు\nమెరుగైన సంరక్షణ",
    authTitle: "రోగి లాగిన్",
    authSubtitle: "సురక్షిత, వేగవంతమైన",
    tabReturning: "తిరిగి వచ్చిన రోగి",
    tabNew: "మొదటి సందర్శన",
    tabAbha: "ABHA ID",
    patientId: "రోగి ID",
    patientIdPh: "MK-2024-XXXXXX",
    pin: "4-అంకె PIN",
    pinPh: "PIN నమోదు",
    forgotPin: "PIN మర్చిపోయారా?",
    loginBtn: "లాగ్ ఇన్",
    voiceCmdBtn: "వాయిస్",
    tapToStop: "ఆపండి",
    fullName: "పేరు",
    namePh: "పూర్తి పేరు",
    phone: "ఫోన్",
    phonePh: "+91 XXXXX XXXXX",
    age: "వయసు",
    agePh: "25",
    gender: "లింగం",
    dept: "విభాగం",
    createBtn: "ప్రొఫైల్ తయారు",
    scanQR: "QR స్కాన్",
    abhaId: "ABHA ID",
    abhaPh: "14-అంకె",
    verifyBtn: "ధృవీకరించు",
    voiceDescReturning: "స్వాగతం! ID మరియు PIN నమోదు చేయండి.",
    voiceDescNew: "స్వాగతం! పేరు, ఫోన్ నమోదు చేయండి.",
    voiceDescAbha: "QR స్కాన్ లేదా ABHA ID.",
    dashTitle: "సంప్రదింపు వర్క్‌ఫ్లో",
    dashSubtitle: "డాక్టర్‌ను కలవడానికి ముందు పూర్తి చేయండి",
    inProgress: "కొనసాగుతోంది",
    overallProgress: "పురోగతి",
    complete: "పూర్తి",
    stage1: "వాయిస్ రికార్డింగ్",
    stage2: "ప్రశ్నలు",
    stage3: "పత్రాలు",
    stage4: "సమీక్ష",
    stage1icon: "📢 వాయిస్",
    stage2icon: "✋ సమాధానం",
    stage3icon: "📄 అప్‌లోడ్",
    stage4icon: "✅ సారాంశం",
    continueRec: "కొనసాగించు",
    recSession: "సెషన్",
    remaining: "మిగిలి ఉంది",
    s1hint: "ఆరోగ్య సమస్యలు చెప్పండి",
    s2hint: "చరిత్ర సమీక్ష",
    s2count: "0 / 15",
    s3hint: "ఫైళ్ళు అప్‌లోడ్",
    s3docs: "5 పత్రాలు",
    s4hint: "డాక్టర్ సమీక్ష",
    s4eta: "2 నిమి.",
    upcoming: "రాబోయే సంప్రదింపు",
    startsIn: "⏰ 15 నిమి.",
    room: "📍 గది 402",
    age45: "45 స.",
    lastVisit: "3 నె.",
    allergies: "అలెర్జీ",
    medications: "మందులు",
    surgeries: "శస్త్ర",
    doctor: "డాక్టర్",
    medActive: "5",
    surgCount: "1",
    editProfile: "సవరించు",
    viewHistory: "చరిత్ర",
    dashLabel: "డాష్‌బోర్డ్",
    liveTranscript: "లైవ్ లిప్యంతరీకరణ",
    pauseReturn: "← ఆపి తిరిగి వెళ్ళు",
    nextDocScan: "తదుపరి: పత్రం స్కాన్",
    startRec: "ప్రారంభ",
    stopRec: "ఆపు",
    questionOf: "ప్రశ్న",
    prevBtn: "← మునుపటి",
    skipBtn: "దాటు",
    nextBtn: "తదుపరి →",
    finishBtn: "ముగించు",
    autoSave: "స్వయంచాలకంగా సేవ్...",
    yesBtn: "✓ అవును",
    noBtn: "✗ కాదు",
    uploadTitle: "వైద్య పత్రాలు అప్‌లోడ్",
    captureNow: "ఇప్పుడు క్యాప్చర్",
    uploadFiles: "ఫైళ్ళు అప్‌లోడ్",
    photoGallery: "ఫోటో గ్యాలరీ",
    dragDocs: "ఇక్కడ పత్రాలు లాగండి",
    tapBrowse: "లేదా ఫైళ్ళు చూడండి",
    uploadedDocs: "అప్‌లోడ్ పత్రాలు",
    extractedData: "వెలికితీసిన డేటా",
    continueToSummary: "సారాంశానికి కొనసాగించు",
    manualReview: "మాన్యువల్ సమీక్ష",
    clinicalSummary: "క్లినికల్ సారాంశం",
    continueConsent: "అంగీకారానికి",
    consentTitle: "రోగి అంగీకారం",
    agreeBtn: "నేను అంగీకరిస్తున్నాను",
    doctorReview: "డాక్టర్ సమీక్ష",
    sentToDoctor: "సమాచారం డాక్టర్‌కు పంపబడింది",
    settingsTitle: "సెట్టింగ్‌లు",
    saveChanges: "మార్పులు సేవ్",
    completionTitle: "నమోదు పూర్తి!",
    completionSubtitle: "మీ ఆరోగ్య రికార్డ్ సమర్పించబడింది",
    returnStart: "ప్రారంభానికి తిరిగి",
  },
  ur: {
    stepLabel: "مرحلہ 1 / 10 — خوش آمدید",
    headline1: "آپ کی صحت کا سفر",
    headline2: "یہاں سے شروع ہوتا ہے",
    hindiSub: "آپ کا صحت کا سفر یہاں سے شروع ہوتا ہے",
    welcomeSubtitle: "6 منٹ میں صحت کی معلومات درج کریں۔ ABDM سے منسلک۔",
    feat1title: "AI-چالت",
    feat1sub: "ذہین علامات",
    feat2title: "ABDM تیار",
    feat2sub: "آدھار ID",
    feat3title: "8 زبانیں",
    feat3sub: "اردو، ہندی",
    continueBtn: "آگے بڑھیں",
    voiceBtn: "آواز معاون",
    voiceListening: "سن رہا ہوں…",
    voiceHint: "'next' کہیں",
    disclaimer: "🔐 ڈیٹا محفوظ · ABDM",
    abdmLinked: "ABDM منسلک",
    online: "آن لائن",
    copyright: "© 2026 MediKiosk · v3.2.1",
    privacy: "رازداری",
    help: "مدد",
    emergency: "ہنگامی: 112",
    nextWords: ["next", "continue", "آگے"],
    prevWords: ["back", "previous", "پیچھے"],
    firstPageMsg: "پہلا صفحہ",
    langHeading: "زبان منتخب کریں",
    langSubtitle: "جاری رکھنے کے لیے زبان منتخب کریں۔",
    langStep: "مرحلہ 2 / 10",
    langContinue: "جاری رکھیں",
    langMore: "+ مزید زبانیں",
    langTagline: "بہتر گفتگو\nبہتر دیکھ بھال",
    authTitle: "مریض لاگ ان",
    authSubtitle: "محفوظ، تیز",
    tabReturning: "واپس آنے والا مریض",
    tabNew: "پہلی بار",
    tabAbha: "ABHA ID لاگ ان",
    patientId: "مریض ID",
    patientIdPh: "MK-2024-XXXXXX",
    pin: "4 ہندسے PIN",
    pinPh: "PIN درج کریں",
    forgotPin: "PIN بھول گئے؟",
    loginBtn: "لاگ ان",
    voiceCmdBtn: "آواز",
    tapToStop: "روکیں",
    fullName: "نام",
    namePh: "پورا نام",
    phone: "فون",
    phonePh: "+91 XXXXX XXXXX",
    age: "عمر",
    agePh: "25",
    gender: "جنس",
    dept: "شعبہ",
    createBtn: "پروفائل بنائیں",
    scanQR: "QR اسکین",
    abhaId: "ABHA ID",
    abhaPh: "14 ہندسے",
    verifyBtn: "تصدیق کریں",
    voiceDescReturning: "خوش آمدید! مریض ID اور PIN درج کریں۔",
    voiceDescNew: "خوش آمدید! نام، فون درج کریں۔",
    voiceDescAbha: "QR اسکین کریں یا ABHA ID درج کریں۔",
    dashTitle: "مشاورتی ورک فلو",
    dashSubtitle: "تمام مراحل مکمل کریں",
    inProgress: "جاری ہے",
    overallProgress: "پیشرفت",
    complete: "مکمل",
    stage1: "آواز ریکارڈنگ",
    stage2: "سوالات",
    stage3: "دستاویزات",
    stage4: "جائزہ",
    stage1icon: "📢 آواز",
    stage2icon: "✋ جواب",
    stage3icon: "📄 اپلوڈ",
    stage4icon: "✅ خلاصہ",
    continueRec: "جاری رکھیں",
    recSession: "سیشن",
    remaining: "باقی",
    s1hint: "صحت کے خدشات بتائیں",
    s2hint: "تاریخ دیکھیں",
    s2count: "0 / 15",
    s3hint: "فائلیں اپلوڈ",
    s3docs: "5 فائلیں",
    s4hint: "ڈاکٹر جائزہ",
    s4eta: "2 منٹ",
    upcoming: "آنے والی مشاورت",
    startsIn: "⏰ 15 منٹ",
    room: "📍 کمرہ 402",
    age45: "45 سال",
    lastVisit: "3 مہینے",
    allergies: "الرجی",
    medications: "دوائیں",
    surgeries: "آپریشن",
    doctor: "ڈاکٹر",
    medActive: "5",
    surgCount: "1",
    editProfile: "ترمیم",
    viewHistory: "تاریخ",
    dashLabel: "ڈیش بورڈ",
    liveTranscript: "براہ راست نقل",
    pauseReturn: "← روکیں اور واپس",
    nextDocScan: "اگلا: دستاویز اسکین",
    startRec: "شروع",
    stopRec: "روکو",
    questionOf: "سوال",
    prevBtn: "← پہلے",
    skipBtn: "چھوڑیں",
    nextBtn: "اگلا →",
    finishBtn: "ختم",
    autoSave: "خودکار محفوظ...",
    yesBtn: "✓ ہاں",
    noBtn: "✗ نہیں",
    uploadTitle: "طبی دستاویزات اپلوڈ",
    captureNow: "ابھی کیپچر",
    uploadFiles: "فائلیں اپلوڈ",
    photoGallery: "فوٹو گیلری",
    dragDocs: "یہاں دستاویزات کھینچیں",
    tapBrowse: "یا فائل براؤز کریں",
    uploadedDocs: "اپلوڈ دستاویزات",
    extractedData: "نکالا گیا طبی ڈیٹا",
    continueToSummary: "خلاصے پر جاری",
    manualReview: "دستی جائزہ ضروری",
    clinicalSummary: "طبی خلاصہ",
    continueConsent: "رضامندی پر",
    consentTitle: "مریض کی رضامندی",
    agreeBtn: "میں متفق ہوں",
    doctorReview: "ڈاکٹر جائزہ",
    sentToDoctor: "معلومات ڈاکٹر کو بھیج دی گئی",
    settingsTitle: "ترتیبات",
    saveChanges: "تبدیلیاں محفوظ",
    completionTitle: "اندراج مکمل!",
    completionSubtitle: "آپ کا ریکارڈ جمع کر دیا گیا",
    returnStart: "شروع پر واپس",
  },
  pa: {
    stepLabel: "ਕਦਮ 1 / 10 — ਸੁਆਗਤ",
    headline1: "ਤੁਹਾਡੀ ਸਿਹਤ ਯਾਤਰਾ",
    headline2: "ਇੱਥੋਂ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ",
    hindiSub: "ਤੁਹਾਡੀ ਸਿਹਤ ਯਾਤਰਾ ਇੱਥੋਂ ਸ਼ੁਰੂ ਹੁੰਦੀ ਹੈ",
    welcomeSubtitle: "6 ਮਿੰਟਾਂ ਵਿੱਚ ਸਿਹਤ ਜਾਣਕਾਰੀ ਭਰੋ। ABDM-ਏਕੀਕ੍ਰਿਤ।",
    feat1title: "AI-ਸੰਚਾਲਿਤ",
    feat1sub: "ਸਮਾਰਟ ਲੱਛਣ",
    feat2title: "ABDM ਤਿਆਰ",
    feat2sub: "ਆਧਾਰ ID",
    feat3title: "8 ਭਾਸ਼ਾਵਾਂ",
    feat3sub: "ਪੰਜਾਬੀ, ਹਿੰਦੀ",
    continueBtn: "ਅੱਗੇ ਵਧੋ",
    voiceBtn: "ਆਵਾਜ਼ ਸਹਾਇਕ",
    voiceListening: "ਸੁਣ ਰਿਹਾ ਹਾਂ…",
    voiceHint: "'next' ਕਹੋ",
    disclaimer: "🔐 ਡੇਟਾ ਸੁਰੱਖਿਅਤ · ABDM",
    abdmLinked: "ABDM ਜੁੜਿਆ",
    online: "ਆਨਲਾਈਨ",
    copyright: "© 2026 MediKiosk · v3.2.1",
    privacy: "ਗੋਪਨੀਯਤਾ",
    help: "ਮਦਦ",
    emergency: "ਐਮਰਜੈਂਸੀ: 112",
    nextWords: ["next", "continue", "ਅੱਗੇ"],
    prevWords: ["back", "previous", "ਪਿੱਛੇ"],
    firstPageMsg: "ਪਹਿਲਾ ਪੰਨਾ",
    langHeading: "ਭਾਸ਼ਾ ਚੁਣੋ",
    langSubtitle: "ਜਾਰੀ ਰੱਖਣ ਲਈ ਭਾਸ਼ਾ ਚੁਣੋ।",
    langStep: "ਕਦਮ 2 / 10",
    langContinue: "ਜਾਰੀ ਰੱਖੋ",
    langMore: "+ ਹੋਰ ਭਾਸ਼ਾਵਾਂ",
    langTagline: "ਬਿਹਤਰ ਗੱਲਬਾਤ\nਬਿਹਤਰ ਦੇਖਭਾਲ",
    authTitle: "ਮਰੀਜ਼ ਲੌਗਿਨ",
    authSubtitle: "ਸੁਰੱਖਿਅਤ, ਤੇਜ਼",
    tabReturning: "ਵਾਪਸ ਆਇਆ ਮਰੀਜ਼",
    tabNew: "ਪਹਿਲੀ ਵਾਰ",
    tabAbha: "ABHA ID",
    patientId: "ਮਰੀਜ਼ ID",
    patientIdPh: "MK-2024-XXXXXX",
    pin: "4-ਅੰਕੀ PIN",
    pinPh: "PIN ਦਰਜ ਕਰੋ",
    forgotPin: "PIN ਭੁੱਲ ਗਏ?",
    loginBtn: "ਲੌਗ ਇਨ",
    voiceCmdBtn: "ਆਵਾਜ਼",
    tapToStop: "ਰੋਕੋ",
    fullName: "ਨਾਮ",
    namePh: "ਪੂਰਾ ਨਾਮ",
    phone: "ਫੋਨ",
    phonePh: "+91 XXXXX XXXXX",
    age: "ਉਮਰ",
    agePh: "25",
    gender: "ਲਿੰਗ",
    dept: "ਵਿਭਾਗ",
    createBtn: "ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ",
    scanQR: "QR ਸਕੈਨ",
    abhaId: "ABHA ID",
    abhaPh: "14-ਅੰਕੀ",
    verifyBtn: "ਤਸਦੀਕ",
    voiceDescReturning: "ਜੀ ਆਇਆਂ! ID ਅਤੇ PIN ਦਰਜ ਕਰੋ।",
    voiceDescNew: "ਜੀ ਆਇਆਂ! ਨਾਮ, ਫੋਨ ਦਰਜ ਕਰੋ।",
    voiceDescAbha: "QR ਸਕੈਨ ਕਰੋ ਜਾਂ ABHA ID ਦਰਜ ਕਰੋ।",
    dashTitle: "ਸਲਾਹ ਵਰਕਫਲੋ",
    dashSubtitle: "ਸਾਰੇ ਕਦਮ ਪੂਰੇ ਕਰੋ",
    inProgress: "ਜਾਰੀ ਹੈ",
    overallProgress: "ਪ੍ਰਗਤੀ",
    complete: "ਪੂਰਾ",
    stage1: "ਆਵਾਜ਼ ਰਿਕਾਰਡਿੰਗ",
    stage2: "ਸਵਾਲ",
    stage3: "ਦਸਤਾਵੇਜ਼",
    stage4: "ਸਮੀਖਿਆ",
    stage1icon: "📢 ਆਵਾਜ਼",
    stage2icon: "✋ ਜਵਾਬ",
    stage3icon: "📄 ਅਪਲੋਡ",
    stage4icon: "✅ ਸਾਰਾਂਸ਼",
    continueRec: "ਰਿਕਾਰਡਿੰਗ ਜਾਰੀ",
    recSession: "ਸੈਸ਼ਨ",
    remaining: "ਬਾਕੀ",
    s1hint: "ਸਿਹਤ ਸਮੱਸਿਆਵਾਂ ਦੱਸੋ",
    s2hint: "ਇਤਿਹਾਸ ਦੇਖੋ",
    s2count: "0 / 15",
    s3hint: "ਫਾਈਲਾਂ ਅਪਲੋਡ",
    s3docs: "5 ਦਸਤਾਵੇਜ਼",
    s4hint: "ਡਾਕਟਰ ਸਮੀਖਿਆ",
    s4eta: "2 ਮਿੰਟ",
    upcoming: "ਆਉਣ ਵਾਲੀ ਸਲਾਹ",
    startsIn: "⏰ 15 ਮਿੰਟ",
    room: "📍 ਕਮਰਾ 402",
    age45: "45 ਸਾਲ",
    lastVisit: "3 ਮਹੀਨੇ",
    allergies: "ਐਲਰਜੀ",
    medications: "ਦਵਾਈਆਂ",
    surgeries: "ਆਪਰੇਸ਼ਨ",
    doctor: "ਡਾਕਟਰ",
    medActive: "5",
    surgCount: "1",
    editProfile: "ਸੰਪਾਦਿਤ",
    viewHistory: "ਇਤਿਹਾਸ",
    dashLabel: "ਡੈਸ਼ਬੋਰਡ",
    liveTranscript: "ਲਾਈਵ ਟ੍ਰਾਂਸਕ੍ਰਿਪਸ਼ਨ",
    pauseReturn: "← ਰੋਕੋ ਅਤੇ ਵਾਪਸ",
    nextDocScan: "ਅਗਲਾ: ਦਸਤਾਵੇਜ਼ ਸਕੈਨ",
    startRec: "ਸ਼ੁਰੂ",
    stopRec: "ਰੋਕੋ",
    questionOf: "ਸਵਾਲ",
    prevBtn: "← ਪਿਛਲਾ",
    skipBtn: "ਛੱਡੋ",
    nextBtn: "ਅਗਲਾ →",
    finishBtn: "ਖਤਮ",
    autoSave: "ਆਟੋ-ਸੇਵ...",
    yesBtn: "✓ ਹਾਂ",
    noBtn: "✗ ਨਹੀਂ",
    uploadTitle: "ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ",
    captureNow: "ਹੁਣ ਕੈਪਚਰ",
    uploadFiles: "ਫਾਈਲਾਂ ਅਪਲੋਡ",
    photoGallery: "ਫੋਟੋ ਗੈਲਰੀ",
    dragDocs: "ਇੱਥੇ ਦਸਤਾਵੇਜ਼ ਖਿੱਚੋ",
    tapBrowse: "ਜਾਂ ਫਾਈਲ ਬ੍ਰਾਊਜ਼",
    uploadedDocs: "ਅਪਲੋਡ ਦਸਤਾਵੇਜ਼",
    extractedData: "ਕੱਢਿਆ ਡੇਟਾ",
    continueToSummary: "ਸਾਰਾਂਸ਼ ਤੇ ਜਾਓ",
    manualReview: "ਮੈਨੁਅਲ ਸਮੀਖਿਆ",
    clinicalSummary: "ਕਲੀਨਿਕਲ ਸਾਰਾਂਸ਼",
    continueConsent: "ਸਹਿਮਤੀ ਤੇ",
    consentTitle: "ਮਰੀਜ਼ ਸਹਿਮਤੀ",
    agreeBtn: "ਮੈਂ ਸਹਿਮਤ ਹਾਂ",
    doctorReview: "ਡਾਕਟਰ ਸਮੀਖਿਆ",
    sentToDoctor: "ਜਾਣਕਾਰੀ ਡਾਕਟਰ ਨੂੰ ਭੇਜੀ",
    settingsTitle: "‌ਸੈੱਟਿੰਗ",
    saveChanges: "‌ ‌ ‌",
    completionTitle: "‌ ‌ ‌",
    completionSubtitle: "‌ ‌ ‌",
    returnStart: "‌ ‌ ‌",
  },
  ml: {
    stepLabel: "ഘട്ടം 1 / 10 — സ്വാഗതം",
    headline1: "നിങ്ങളുടെ ആരോഗ്യ യാത്ര",
    headline2: "ഇവിടെ ആരംഭിക്കുന്നു",
    hindiSub: "നിങ്ങളുടെ ആരോഗ്യ യാത്ര ഇവിടെ നിന്ന് തുടങ്ങുന്നു",
    welcomeSubtitle: "6 മിനിറ്റിൽ ആരോഗ്യ വിവരങ്ങൾ പൂരിപ്പിക്കുക. ABDM-സംയോജിതം.",
    feat1title: "AI-പ്രവർത്തിതം",
    feat1sub: "ലക്ഷണ രേഖ",
    feat2title: "ABDM തയ്യാർ",
    feat2sub: "ആധാർ ID",
    feat3title: "8 ഭാഷകൾ",
    feat3sub: "മലയാളം, ഹിന്ദി",
    continueBtn: "തുടരുക",
    voiceBtn: "ശബ്ദ സഹായി",
    voiceListening: "കേൾക്കുന്നു…",
    voiceHint: "'next' പറയുക",
    disclaimer: "🔐 ഡേറ്റ സുരക്ഷിതം · ABDM",
    abdmLinked: "ABDM ബന്ധം",
    online: "ഓൺലൈൻ",
    copyright: "© 2026 MediKiosk · v3.2.1",
    privacy: "സ്വകാര്യത",
    help: "സഹായം",
    emergency: "അടിയന്തിരം: 112",
    nextWords: ["next", "continue", "മുന്നോട്ട്"],
    prevWords: ["back", "previous", "പിന്നോട്ട്"],
    firstPageMsg: "ആദ്യ പേജ്",
    langHeading: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    langSubtitle: "തുടരാൻ ഭാഷ തിരഞ്ഞെടുക്കുക.",
    langStep: "ഘട്ടം 2 / 10",
    langContinue: "തുടരുക",
    langMore: "+ കൂടുതൽ",
    langTagline: "മികച്ച സംഭാഷണങ്ങൾ\nമികച്ച പരിചരണം",
    authTitle: "രോഗി ലോഗിൻ",
    authSubtitle: "സുരക്ഷിതം, വേഗം",
    tabReturning: "മടങ്ങിവന്ന രോഗി",
    tabNew: "ആദ്യ സന്ദർശനം",
    tabAbha: "ABHA ID",
    patientId: "രോഗി ID",
    patientIdPh: "MK-2024-XXXXXX",
    pin: "4-അക്ക PIN",
    pinPh: "PIN നൽകുക",
    forgotPin: "PIN മറന്നോ?",
    loginBtn: "ലോഗ് ഇൻ",
    voiceCmdBtn: "ശബ്ദം",
    tapToStop: "നിർത്തുക",
    fullName: "പേര്",
    namePh: "പൂർണ്ണ പേര്",
    phone: "ഫോൺ",
    phonePh: "+91 XXXXX XXXXX",
    age: "പ്രായം",
    agePh: "25",
    gender: "ലിംഗം",
    dept: "വകുപ്പ്",
    createBtn: "പ്രൊഫൈൽ സൃഷ്ടിക്കുക",
    scanQR: "QR സ്കാൻ",
    abhaId: "ABHA ID",
    abhaPh: "14-അക്ക",
    verifyBtn: "പരിശോധിക്കുക",
    voiceDescReturning: "സ്വാഗതം! ID, PIN നൽകുക.",
    voiceDescNew: "സ്വാഗതം! പേര്, ഫോൺ നൽകുക.",
    voiceDescAbha: "QR സ്കാൻ അല്ലെങ്കിൽ ABHA ID.",
    dashTitle: "കൺസൾട്ടേഷൻ വർക്ക്ഫ്ലോ",
    dashSubtitle: "എല്ലാ ഘട്ടങ്ങളും പൂർത്തിയാക്കുക",
    inProgress: "നടക്കുന്നു",
    overallProgress: "പുരോഗതി",
    complete: "പൂർത്തി",
    stage1: "ശബ്ദ റെക്കോർഡിംഗ്",
    stage2: "ചോദ്യങ്ങൾ",
    stage3: "ഡോക്യുമെന്റ്",
    stage4: "അവലോകനം",
    stage1icon: "📢 ശബ്ദം",
    stage2icon: "✋ ഉത്തരം",
    stage3icon: "📄 അപ്‌ലോഡ്",
    stage4icon: "✅ സംഗ്രഹം",
    continueRec: "തുടരുക",
    recSession: "സെഷൻ",
    remaining: "ശേഷം",
    s1hint: "ആരോഗ്യ ആശങ്കകൾ",
    s2hint: "ചരിത്രം",
    s2count: "0 / 15",
    s3hint: "ഫയൽ അപ്‌ലോഡ്",
    s3docs: "5 ഡോക്കുമെന്റ്",
    s4hint: "ഡോക്ടർ അവലോകനം",
    s4eta: "2 മിനിറ്റ്",
    upcoming: "വരാനിരിക്കുന്ന കൺസൾട്ടേഷൻ",
    startsIn: "⏰ 15 മി.",
    room: "📍 മുറി 402",
    age45: "45 വ.",
    lastVisit: "3 മ.",
    allergies: "അലർജി",
    medications: "മരുന്ന്",
    surgeries: "ശസ്ത്ര",
    doctor: "ഡോക്ടർ",
    medActive: "5",
    surgCount: "1",
    editProfile: "എഡിറ്റ്",
    viewHistory: "ചരിത്രം",
    dashLabel: "ഡാഷ്ബോർഡ്",
    liveTranscript: "തത്സമയ ലിപ്യന്തരണം",
    pauseReturn: "← നിർത്തി തിരിക",
    nextDocScan: "അടുത്തത്: ഡോക്. സ്കാൻ",
    startRec: "ആരംഭ",
    stopRec: "നിർത്തുക",
    questionOf: "ചോദ്യം",
    prevBtn: "← മുൻ",
    skipBtn: "ഒഴിവാക്കുക",
    nextBtn: "അടുത്തത് →",
    finishBtn: "തീർ",
    autoSave: "സ്വയം സംരക്ഷിക്കുന്നു...",
    yesBtn: "✓ അതെ",
    noBtn: "✗ അല്ല",
    uploadTitle: "ആരോഗ്യ രേഖ അപ്‌ലോഡ്",
    captureNow: "ഇപ്പോൾ ക്യാപ്ചർ",
    uploadFiles: "ഫയൽ അപ്‌ലോഡ്",
    photoGallery: "ഫോട്ടോ ഗ്യാലറി",
    dragDocs: "ഇവിടെ ഡോക്. വലിക്കുക",
    tapBrowse: "അല്ലെൽ ഫയൽ ബ്രൗസ്",
    uploadedDocs: "അപ്‌ലോഡ് ഡോക്.",
    extractedData: "വേർതിരിച്ച ഡേറ്റ",
    continueToSummary: "സംഗ്രഹത്തിലേക്ക്",
    manualReview: "മാനുവൽ അവലോകനം",
    clinicalSummary: "ക്ലിനിക്കൽ സംഗ്രഹം",
    continueConsent: "സമ്മതത്തിലേക്ക്",
    consentTitle: "രോഗി സമ്മതം",
    agreeBtn: "ഞാൻ സമ്മതിക്കുന്നു",
    doctorReview: "ഡോക്ടർ അവലോകനം",
    sentToDoctor: "ഡോക്ടർക്ക് അയച്ചു",
    settingsTitle: "Settings",
    saveChanges: "Save Changes",
    completionTitle: "Registration Complete!",
    completionSubtitle: "Your health record has been submitted successfully",
    returnStart: "Return to Start",
  },
}

function useT(lang: LangCode) {
  return T[lang] ?? T.en
}

function LanguagePage({
  onNavigate,
  lang,
  onLangChange,
  light,
}: {
  onNavigate: (p: Page) => void
  lang: LangCode
  onLangChange: (c: LangCode) => void
  light: boolean
}) {
  const [selected, setSelected] = useState<LangCode>(lang)
  const [showAll, setShowAll] = useState(false)

  const visible = showAll ? ALL_LANGUAGES : ALL_LANGUAGES.slice(0, 9)

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: light
          ? "linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 50%, #EDE9FE 100%)"
          : "linear-gradient(135deg, #0D1B3E 0%, #1a2a5e 50%, #0D1B3E 100%)",
        color: light ? "#0D1B3E" : "#FFFFFF",
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute bottom-0 left-0 w-80 h-56 pointer-events-none">
        <svg
          viewBox="0 0 320 224"
          fill="none"
          className="w-full h-full opacity-30"
        >
          <ellipse cx="60" cy="180" rx="80" ry="50" fill="#BFDBFE" />
          <ellipse cx="160" cy="210" rx="60" ry="35" fill="#93C5FD" />
        </svg>
      </div>
      <div className="absolute bottom-0 right-8 w-32 h-44 pointer-events-none opacity-20">
        <svg viewBox="0 0 128 176" fill="none" className="w-full h-full">
          <path
            d="M64 10 C64 10, 90 40, 90 80 C90 120, 64 170, 64 170 C64 170, 38 120, 38 80 C38 40, 64 10, 64 10Z"
            fill="#3B82F6"
          />
          <path
            d="M64 30 C64 30, 80 55, 80 80 C80 105, 64 150, 64 150"
            stroke="#93C5FD"
            strokeWidth="2"
            fill="none"
          />
          <ellipse cx="64" cy="80" rx="12" ry="12" fill="#93C5FD" />
        </svg>
      </div>

      {/* ── Top nav ── */}
      <header className="flex items-center justify-between px-8 lg:px-12 py-5 bg-white/60 backdrop-blur-sm border-b border-white/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-[#0066CC] rounded-xl flex items-center justify-center shadow-md shadow-[#0066CC]/20 flex-shrink-0">
            <div className="w-5 h-5 text-white">
              <Icon.Stethoscope />
            </div>
          </div>
          <div>
            <p
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="font-700 text-[#0D1B3E] text-[15px] leading-none"
            >
              MediKiosk
            </p>
            <p className="text-[10px] text-gray-400 leading-none mt-0.5">
              Smart Patient Intake
            </p>
          </div>
        </div>
        <button className="flex items-center gap-2 text-[13px] font-500 text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-full hover:border-[#0066CC]/40 hover:text-[#0066CC] transition-colors shadow-sm">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          Language
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-3.5 h-3.5"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 px-8 lg:px-12 py-8 max-w-5xl w-full mx-auto">
        {/* Step pill + back */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => onNavigate("welcome")}
            className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-500 hover:border-[#0066CC]/40 hover:text-[#0066CC] transition-colors shadow-sm"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <span className="text-[13px] font-500 text-gray-500 bg-white border border-gray-200 px-3.5 py-1 rounded-full shadow-sm">
            {T[selected]?.langStep ?? T.en.langStep}
          </span>
        </div>

        {/* Heading */}
        <h1
          style={{ fontFamily: "Poppins, sans-serif" }}
          className="text-[36px] lg:text-[42px] font-800 text-[#0D1B3E] leading-tight mb-3"
        >
          {T[selected]?.langHeading ?? T.en.langHeading}
        </h1>
        <p className="text-[15px] text-gray-500 leading-relaxed mb-8 max-w-lg">
          {(T[selected]?.langSubtitle ?? T.en.langSubtitle)
            .split("\n")
            .map((l: string, i: number) => (
              <span key={i}>
                {l}
                <br />
              </span>
            ))}
        </p>

        {/* ── Language grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 mb-6">
          {visible.map((lang) => {
            const isSelected = selected === lang.code
            return (
              <button
                key={lang.code}
                onClick={() => setSelected(lang.code as LangCode)}
                className={`flex items-center gap-3 px-4 py-4 rounded-2xl border-2 bg-white transition-all duration-150 text-left group shadow-sm hover:shadow-md ${
                  isSelected
                    ? "border-[#0066CC] bg-[#EBF3FF] shadow-[#0066CC]/15"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Nation flag circle */}
                <div className="w-10 h-10 rounded-full border border-gray-200 shadow-md flex-shrink-0 overflow-hidden">
                  <img
                    src={`https://flagcdn.com/w80/${lang.country}.png`}
                    alt={lang.sub}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Name */}
                <div className="flex-1 min-w-0">
                  <p
                    style={{ fontFamily: "Poppins, sans-serif" }}
                    className={`text-[15px] font-600 leading-tight truncate ${
                      isSelected ? "text-[#0066CC]" : "text-[#0D1B3E]"
                    }`}
                  >
                    {lang.native}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    ({lang.sub})
                  </p>
                </div>

                {/* Checkmark or chevron */}
                {isSelected ? (
                  <div className="w-6 h-6 rounded-full bg-[#0066CC] flex items-center justify-center flex-shrink-0">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-3.5 h-3.5"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#9CA3AF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4 h-4 flex-shrink-0 group-hover:stroke-[#0066CC] transition-colors"
                  >
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>

        {/* More languages toggle */}
        {!showAll && (
          <button
            onClick={() => setShowAll(true)}
            className="mb-8 text-[13px] font-600 text-[#0066CC] hover:underline underline-offset-2"
          >
            {T[selected]?.langMore ?? T.en.langMore}
          </button>
        )}

        {/* ── Continue button ── */}
        <button
          onClick={() => {
            onLangChange(selected)
            onNavigate("auth")
          }}
          style={{ fontFamily: "Poppins, sans-serif" }}
          className="w-full max-w-md h-14 bg-[#1A6FE5] hover:bg-[#1558C0] text-white font-700 text-[16px] rounded-2xl flex items-center justify-center gap-3 transition-all duration-150 active:scale-[0.98] shadow-lg shadow-[#1A6FE5]/30"
        >
          {T[selected]?.langContinue ?? T.en.langContinue}
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4.5 h-4.5"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </button>
      </main>

      {/* ── Bottom tagline ── */}
      <div className="px-8 lg:px-12 pb-7 pt-2 relative z-10">
        <p
          style={{ fontFamily: "Poppins, sans-serif" }}
          className="text-[13px] text-[#1A6FE5] font-600 italic leading-snug"
        >
          {(T[selected]?.langTagline ?? T.en.langTagline)
            .split("\n")
            .map((l: string, i: number) => (
              <span key={i}>
                {l}
                {i === 0 && <br />}
              </span>
            ))}
        </p>
        <svg
          viewBox="0 0 28 24"
          fill="none"
          className="w-6 h-5 mt-1 inline-block"
        >
          <path
            d="M14 4 C8 4, 4 8, 4 12 C4 18, 14 22, 14 22 C14 22, 24 18, 24 12 C24 8, 20 4, 14 4Z"
            fill="#BFDBFE"
          />
          <polyline
            points="8 12 11 15 16 9"
            stroke="#1A6FE5"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 2: AUTHENTICATION
// ──────────────────────────────────────────────
function AuthPage({
  onNavigate,
  lang,
  light,
  loggedOut,
}: {
  onNavigate: (p: Page) => void
  lang: LangCode
  light: boolean
  loggedOut?: boolean
}) {
  const t = useT(lang)
  const [tab, setTab] = useState<"returning" | "new" | "abha" | "admin">("returning")
  const [pid, setPid] = useState("")
  const [pin, setPin] = useState("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [age, setAge] = useState("")
  const [gender, setGender] = useState("Male")
  const [dept, setDept] = useState("")
  const [newAbhaId, setNewAbhaId] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [showNewPwd, setShowNewPwd] = useState(false)
  const [showLoginPwd, setShowLoginPwd] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // ABHA QR state
  const [abhaId, setAbhaId] = useState("")
  const [qrPreview, setQrPreview] = useState<string | null>(null)
  const [qrScanning, setQrScanning] = useState(false)
  const [qrError, setQrError] = useState("")
  const qrInputRef = useRef<HTMLInputElement>(null)

  const handleQrUpload = async (file: File) => {
    setQrError("")
    setQrScanning(true)
    setQrPreview(URL.createObjectURL(file))
    try {
      const jsQR = (await import("jsqr")).default
      const img = new Image()
      img.src = URL.createObjectURL(file)
      await new Promise<void>((res) => { img.onload = () => res() })
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const result = jsQR(imageData.data, imageData.width, imageData.height)
      if (result?.data) {
        // ABHA QR typically contains JSON or a plain 14-digit number
        let extracted = result.data
        try {
          const parsed = JSON.parse(result.data)
          extracted = parsed.hidn ?? parsed.abhaNumber ?? parsed.id ?? result.data
        } catch { /* plain text ABHA number */ }
        setAbhaId(extracted)
        setQrError("")
      } else {
        setQrError("Could not read QR code. Please upload a clearer image or enter the ABHA ID manually.")
      }
    } catch {
      setQrError("Failed to process the image. Please try again.")
    } finally {
      setQrScanning(false)
    }
  }

  // Admin login state
  const [adminRole, setAdminRole] = useState<"" | "Doctor" | "Nurse" | "Pharmacist">("")
  const [adminId, setAdminId] = useState("")
  const [adminPwd, setAdminPwd] = useState("")
  const [adminShowPwd, setAdminShowPwd] = useState(false)
  const [adminError, setAdminError] = useState("")
  const [adminLoading, setAdminLoading] = useState(false)

  const handleAdminLogin = async () => {
    setAdminError("")
    if (!adminRole) { setAdminError("Please select your role."); return }
    if (!adminId.trim()) { setAdminError("Staff ID is required."); return }
    if (!adminPwd.trim()) { setAdminError("Password is required."); return }
    setAdminLoading(true)
    const email = `${adminId.trim().toLowerCase()}@medikiosk.staff`
    const { error: authErr } = await supabase.auth.signInWithPassword({ email, password: adminPwd })
    setAdminLoading(false)
    if (authErr) { setAdminError("Invalid Staff ID or password. Please try again."); return }
    onNavigate("doctor")
  }

  const toEmail = (id: string) => `${id.trim().replace(/\s/g, "")}@medikiosk.local`

  // Seed demo user on mount using supabase signUp directly.
  // mailer_autoconfirm=true on this project so the user is immediately active.
  useEffect(() => {
    const seedDemo = async () => {
      const demoEmail = toEmail("9876543210")
      // Try login first — if it works the user already exists
      const { error: loginErr } = await supabase.auth.signInWithPassword({
        email: demoEmail,
        password: "11223300",
      })
      if (!loginErr) {
        // Already exists and working — sign out immediately (we're just seeding)
        await supabase.auth.signOut()
        return
      }
      // Doesn't exist yet — create it
      const { data } = await supabase.auth.signUp({
        email: demoEmail,
        password: "11223300",
        options: {
          data: { patient_id: "9876543210", full_name: "Demo Patient", phone: "9876543210", age: "30", gender: "Male", department: "General Medicine" },
        },
      })
      if (data.user) {
        await supabase.from("patients").upsert({
          patient_id: "9876543210",
          full_name: "Demo Patient",
          phone: "9876543210",
          age: 30,
          gender: "Male",
          department: "General Medicine",
          user_id: data.user.id,
        }, { onConflict: "patient_id" })
        // Sign out after seeding
        await supabase.auth.signOut()
      }
    }
    seedDemo().catch(() => {})
  }, [])

  // Voice fill listener
  useEffect(() => {
    const handler = (e: Event) => {
      const { field, value } = (e as CustomEvent<{ field: string; value: string }>).detail
      if (field === "patient_id") { setPid(value); setPhone(value) }
      if (field === "name") setName(value)
      if (field === "age") setAge(value)
      if (field === "gender") setGender(value)
      if (field === "department") setDept(value)
      if (field === "password") { setPin(value); setNewPassword(value) }
      if (field === "abha_id") setAbhaId(value)
    }
    window.addEventListener("voice-fill", handler)
    return () => window.removeEventListener("voice-fill", handler)
  }, [])

  const handleLogin = async () => {
    setError("")
    if (!pid.trim() || !pin.trim()) {
      setError("Please enter your Patient ID (phone number) and password.")
      return
    }
    setLoading(true)
    const { error: authErr } = await supabase.auth.signInWithPassword({
      email: toEmail(pid),
      password: pin,
    })
    setLoading(false)
    if (authErr) {
      setError("Invalid credentials. Please check your Patient ID and password, or register as a new patient.")
      return
    }
    onNavigate("dashboard")
  }

  const handleRegister = async () => {
    setError("")
    setSuccessMsg("")
    if (!name.trim() || !phone.trim() || !age.trim() || !dept || !newPassword.trim()) {
      setError("Please fill in all fields including password.")
      return
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters.")
      return
    }
    setLoading(true)
    const patientId = phone.trim().replace(/\s/g, "")
    const email = toEmail(patientId)

    // Step 1: Create auth user
    // mailer_autoconfirm=true on this project — user is active immediately, no email needed
    const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
      email,
      password: newPassword,
      options: {
        data: { patient_id: patientId, full_name: name, phone: patientId, age, gender, department: dept, abha_id: newAbhaId.trim() || null },
      },
    })

    if (signUpErr) {
      setLoading(false)
      if (signUpErr.message.toLowerCase().includes("already registered") ||
          signUpErr.message.toLowerCase().includes("user already registered")) {
        setError("This phone number is already registered. Please log in instead.")
      } else {
        setError(signUpErr.message)
      }
      return
    }

    // Step 2: Save patient profile to DB
    if (signUpData.user) {
      const { error: dbErr } = await supabase.from("patients").upsert({
        patient_id: patientId,
        full_name: name,
        phone: patientId,
        age: parseInt(age),
        gender,
        department: dept,
        abha_id: newAbhaId.trim() || null,
        user_id: signUpData.user.id,
      }, { onConflict: "patient_id" })
      if (dbErr) console.warn("patients insert:", dbErr.message)
    }

    // Step 3: Sign in immediately (autoconfirm is ON so this works right away)
    const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: newPassword })
    setLoading(false)

    if (signInErr) {
      // Rare: account created but sign-in failed — show ID and redirect to login tab
      setSuccessMsg(`✅ Registered! Patient ID: ${patientId}. Please log in with your password.`)
      setPid(patientId)
      setPin(newPassword)
      setTab("returning")
      return
    }

    // Signed in — go straight to dashboard
    onNavigate("dashboard")
  }

  const tabDescriptions: Record<"returning" | "new" | "abha" | "admin", string> = {
    returning: t.voiceDescReturning,
    new: t.voiceDescNew,
    abha: t.voiceDescAbha,
    admin: "Admin and staff login portal",
  }

  // pick the right BCP-47 language tag for speech synthesis
  const speechLang: Record<LangCode, string> = {
    en: "en-IN",
    hi: "hi-IN",
    ta: "ta-IN",
    bn: "bn-IN",
    mr: "mr-IN",
    gu: "gu-IN",
    kn: "kn-IN",
    te: "te-IN",
    ur: "ur-PK",
    pa: "pa-IN",
    ml: "ml-IN",
  }

  const handleVoiceCommand = () => {
    if (!window.speechSynthesis) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    const utterance = new SpeechSynthesisUtterance(tabDescriptions[tab])
    utterance.lang = speechLang[lang] ?? "en-IN"
    utterance.rate = 0.92
    utterance.pitch = 1.05
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  useEffect(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [tab])

  const tabs = [
    { id: "returning" as const, label: t.tabReturning },
    { id: "new" as const, label: t.tabNew },
    { id: "abha" as const, label: t.tabAbha },
    { id: "admin" as const, label: "🔐 Admin" },
  ]

  // 4 icons each side, evenly spread so none cluster at centre
  const floatingIcons = [
    // ── Left side ──
    { x: "3%",  delay: "0s",   dur: "9s",   icon: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /> },
    { x: "10%", delay: "2.5s", dur: "11s",  icon: <path d="M22 12h-4l-3 9L9 3l-3 9H2" /> },
    { x: "18%", delay: "5s",   dur: "10s",  icon: <><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></> },
    { x: "26%", delay: "7s",   dur: "8.5s", icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></> },
    // ── Right side ──
    { x: "72%", delay: "1s",   dur: "10s",  icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></> },
    { x: "80%", delay: "3.5s", dur: "9s",   icon: <><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /></> },
    { x: "88%", delay: "6s",   dur: "11s",  icon: <><rect x="3" y="2" width="7" height="9" rx="1" /><rect x="14" y="2" width="7" height="5" rx="1" /><rect x="14" y="11" width="7" height="9" rx="1" /><rect x="3" y="15" width="7" height="5" rx="1" /></> },
    { x: "95%", delay: "4s",   dur: "8s",   icon: <><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" /><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" /><circle cx="20" cy="10" r="2" /></> },
  ]

  return (
    <div
      className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-6 xl:p-8"
      style={{
        background: light
          ? "linear-gradient(145deg,#EBF3FF 0%,#F0FAFA 55%,#EAF6F0 100%)"
          : "#0D1B3E",
        color: light ? "#0D1B3E" : "#FFFFFF",
      }}
    >
      {/* ── Logged-out banner ── */}
      {loggedOut && (
        <div className="w-full max-w-md mb-4 flex items-center gap-3 bg-green-50 border border-green-200 rounded-2xl px-4 py-3 animate-float-in">
          <span className="text-xl">✅</span>
          <p className="text-sm font-500 text-green-800">
            You have been logged out of the session.
          </p>
        </div>
      )}
      {/* ── Animated blobs ── */}
      <div
        className="absolute -top-24 -left-24 w-[480px] h-[480px] rounded-full pointer-events-none blur-3xl opacity-40"
        style={{
          background: "#BFDBFE",
          animation: "blob-drift-1 12s ease-in-out infinite",
        }}
      />
      <div
        className="absolute -bottom-20 -right-20 w-[400px] h-[400px] rounded-full pointer-events-none blur-3xl opacity-35"
        style={{
          background: "#A7F3D0",
          animation: "blob-drift-2 15s ease-in-out infinite",
        }}
      />
      <div
        className="absolute top-1/3 -right-16 w-[300px] h-[300px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background: "#C7D2FE",
          animation: "blob-drift-3 10s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-1/4 -left-12 w-[260px] h-[260px] rounded-full pointer-events-none blur-3xl opacity-20"
        style={{
          background: "#FDE68A",
          animation: "blob-drift-1 18s ease-in-out infinite reverse",
        }}
      />

      {/* ── Dot grid texture ── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage:
            "radial-gradient(circle, #0066CC 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* ── Floating medical icons ── */}
      {floatingIcons.map((fi, i) => (
        <div
          key={i}
          className="absolute bottom-0 pointer-events-none"
          style={{
            left: fi.x,
            animation: `icon-float-up ${fi.dur} ease-in ${fi.delay} infinite`,
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0066CC"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ width: 20, height: 20, opacity: 0.45 }}
          >
            {fi.icon}
          </svg>
        </div>
      ))}

      {/* ── Three-column row: left panel | card | right panel ── */}
      <div className="flex flex-row items-center justify-center gap-10 w-full">

      {/* ── Left info panel (xl+) ── */}
      <div
        className="hidden xl:flex flex-col gap-5 w-64 flex-shrink-0"
        style={
          {
            animation: "side-panel-in 0.7s ease-out 0.3s both",
            "--tx": "-30px",
          } as React.CSSProperties
        }
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
          <div className="w-10 h-10 bg-[#0066CC]/10 rounded-xl flex items-center justify-center mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#0066CC"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="font-700 text-[#0D1B3E] text-[22px] leading-none"
          >
            2.4M+
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Patients Served Across India
          </p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
          <div className="w-10 h-10 bg-[#10B981]/10 rounded-xl flex items-center justify-center mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10B981"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </div>
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="font-700 text-[#0D1B3E] text-[22px] leading-none"
          >
            6–8 min
          </p>
          <p className="text-xs text-gray-500 mt-1">Average Check-in Time</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
          <div className="w-10 h-10 bg-[#F97316]/10 rounded-xl flex items-center justify-center mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#F97316"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-5 h-5"
            >
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              <circle cx="12" cy="12" r="10" />
              <line x1="2" y1="12" x2="22" y2="12" />
            </svg>
          </div>
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="font-700 text-[#0D1B3E] text-[22px] leading-none"
          >
            8
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Regional Languages Supported
          </p>
        </div>
      </div>

      {/* ── Existing card — untouched ── */}
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ animation: "auth-card-in 0.6s ease-out both", flexShrink: 0 }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0066CC] to-[#00897B] px-8 py-7">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 text-white">
              <Icon.Stethoscope />
            </div>
            <span
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-white font-700 text-xl"
            >
              MediKiosk
            </span>
          </div>
          <p className="text-white/70 text-sm">Secure Patient Identification</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{ fontFamily: "Poppins, sans-serif" }}
              className={`flex-1 py-3.5 text-xs font-600 transition-colors ${
                tab === t.id
                  ? "text-[#0066CC] border-b-2 border-[#0066CC]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="px-8 py-6">
          {/* Error / success banners */}
          {error && (
            <div className="mb-3 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-500 leading-relaxed">
              ⚠️ {error}
            </div>
          )}
          {successMsg && (
            <div className="mb-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-500 leading-relaxed">
              {successMsg}
            </div>
          )}

          {tab === "returning" && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  Patient ID <span className="font-400 text-gray-400">(your phone number)</span>
                </label>
                <input
                  value={pid}
                  onChange={(e) => { setPid(e.target.value); setError(""); }}
                  placeholder="9876543210"
                  type="tel"
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10"
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    value={pin}
                    onChange={(e) => { setPin(e.target.value); setError(""); }}
                    placeholder="Enter your password"
                    type={showLoginPwd ? "text" : "password"}
                    className="w-full h-12 px-4 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showLoginPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>
              {/* Voice Command button */}
              <button
                onClick={handleVoiceCommand}
                className={`w-full h-12 rounded-xl flex items-center justify-center gap-2.5 text-sm font-600 transition-all duration-200 border-2 ${
                  speaking
                    ? "border-[#0066CC] bg-[#0066CC] text-white shadow-lg shadow-[#0066CC]/30"
                    : "border-[#0066CC]/30 bg-[#0066CC]/5 text-[#0066CC] hover:bg-[#0066CC]/10 hover:border-[#0066CC]/50"
                }`}
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                <span className="relative flex items-center justify-center">
                  {speaking && (
                    <span className="absolute w-6 h-6 rounded-full bg-white/30 animate-ping" />
                  )}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-4.5 h-4.5 relative z-10"
                  >
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                </span>
                {speaking ? t.tapToStop : t.voiceCmdBtn}
              </button>
              <PrimaryBtn
                onClick={handleLogin}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Verifying…" : t.loginBtn}
              </PrimaryBtn>
              <p
                className="text-xs text-center text-[#0066CC] cursor-pointer hover:underline"
                onClick={() => { setTab("new"); setError(""); setSuccessMsg(""); }}
              >
                New patient? Register here
              </p>
            </div>
          )}

          {tab === "new" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-600 text-gray-600 mb-1.5">
                    {t.fullName}
                  </label>
                  <input
                    value={name}
                    onChange={(e) => { setName(e.target.value); setError(""); }}
                    placeholder="Rajesh Kumar Singh"
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-600 text-gray-600 mb-1.5">
                    {t.phone} (+91)
                  </label>
                  <input
                    value={phone}
                    onChange={(e) => { setPhone(e.target.value); setError(""); }}
                    placeholder="9876543210"
                    type="tel"
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-600 text-gray-600 mb-1.5">
                    {t.age}
                  </label>
                  <input
                    value={age}
                    onChange={(e) => { setAge(e.target.value); setError(""); }}
                    placeholder={t.agePh}
                    type="number"
                    min="1"
                    max="120"
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10"
                  />
                </div>
                <div>
                  <label className="block text-xs font-600 text-gray-600 mb-1.5">
                    {t.gender}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] bg-white"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  {t.dept}
                </label>
                <select
                  value={dept}
                  onChange={(e) => { setDept(e.target.value); setError(""); }}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] bg-white"
                >
                  <option value="">Select Department</option>
                  <option>Cardiology</option>
                  <option>ENT</option>
                  <option>AYUSH</option>
                  <option>General Medicine</option>
                  <option>Orthopedics</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  ABHA ID{" "}
                  <span className="font-400 text-gray-400">(optional — Ayushman Bharat Health Account)</span>
                </label>
                <input
                  value={newAbhaId}
                  onChange={(e) => setNewAbhaId(e.target.value)}
                  placeholder="XXXX-XXXX-XXXX-XXXX"
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10 font-mono tracking-wider"
                />
              </div>
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  Set Password <span className="font-400 text-gray-400">(min. 6 characters)</span>
                </label>
                <div className="relative">
                  <input
                    value={newPassword}
                    onChange={(e) => { setNewPassword(e.target.value); setError(""); }}
                    placeholder="Create a password"
                    type={showNewPwd ? "text" : "password"}
                    className="w-full h-12 px-4 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showNewPwd ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">
                  Your Patient ID will be your phone number. Use this password to log in again.
                </p>
              </div>
              <PrimaryBtn
                onClick={handleRegister}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Registering…" : t.createBtn}
              </PrimaryBtn>
            </div>
          )}

          {tab === "abha" && (
            <div className="space-y-4">
              {/* Hidden file input */}
              <input
                ref={qrInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleQrUpload(file)
                  e.target.value = ""
                }}
              />

              {/* Drop zone / preview */}
              <div
                onClick={() => qrInputRef.current?.click()}
                className="relative h-48 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center gap-3 bg-gray-50 hover:border-[#0066CC] hover:bg-blue-50 transition-colors cursor-pointer overflow-hidden"
              >
                {qrPreview ? (
                  <>
                    <img
                      src={qrPreview}
                      alt="Uploaded QR"
                      className="absolute inset-0 w-full h-full object-contain p-2"
                    />
                    <div className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center gap-2">
                      {qrScanning ? (
                        <>
                          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                          <span className="text-white text-xs font-500">Scanning QR…</span>
                        </>
                      ) : abhaId ? (
                        <>
                          <div className="text-2xl">✅</div>
                          <span className="text-white text-xs font-600">QR decoded! Click to change</span>
                        </>
                      ) : (
                        <>
                          <div className="text-2xl">🔄</div>
                          <span className="text-white text-xs font-500">Click to upload another</span>
                        </>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    {qrScanning ? (
                      <div className="w-10 h-10 border-4 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <div className="text-4xl">📷</div>
                    )}
                    <p style={{ fontFamily: "Poppins, sans-serif" }} className="font-600 text-gray-700">
                      {qrScanning ? "Scanning…" : t.scanQR}
                    </p>
                    <p className="text-xs text-gray-400 text-center px-4">
                      Click to upload your ABHA card image from device
                    </p>
                  </>
                )}
              </div>

              {/* QR error */}
              {qrError && (
                <p className="text-xs text-red-500 text-center">{qrError}</p>
              )}

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400 font-500">OR enter manually</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <input
                value={abhaId}
                onChange={(e) => setAbhaId(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] font-mono tracking-wider"
              />
              <PrimaryBtn
                onClick={() => {
                  if (abhaId.trim()) onNavigate("dashboard")
                  else setQrError("Please upload a QR code or enter your ABHA ID manually.")
                }}
                className="w-full"
                disabled={qrScanning}
              >
                {t.verifyBtn}
              </PrimaryBtn>
            </div>
          )}

          {/* ── Admin / Staff Login tab ── */}
          {tab === "admin" && (
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center gap-3 bg-gradient-to-r from-[#0066CC]/8 to-[#00897B]/8 border border-[#0066CC]/20 rounded-2xl px-4 py-3">
                <span className="text-2xl">🏥</span>
                <div>
                  <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-sm font-700 text-gray-800">Admin / Staff Login</p>
                  <p className="text-xs text-gray-500">For authorized hospital personnel only</p>
                </div>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-2">
                  Select your role <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(["Doctor", "Nurse", "Pharmacist"] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => { setAdminRole(role); setAdminError("") }}
                      className={`py-3 rounded-xl border text-xs font-600 transition-all flex flex-col items-center gap-1 ${
                        adminRole === role
                          ? "bg-[#0066CC] border-[#0066CC] text-white shadow-md"
                          : "border-gray-200 text-gray-600 hover:border-[#0066CC] hover:text-[#0066CC] hover:bg-blue-50"
                      }`}
                    >
                      <span className="text-lg">{role === "Doctor" ? "👨‍⚕️" : role === "Nurse" ? "👩‍⚕️" : "💊"}</span>
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Staff ID */}
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  Staff ID <span className="text-red-500">*</span>
                </label>
                <input
                  value={adminId}
                  onChange={(e) => { setAdminId(e.target.value); setAdminError("") }}
                  placeholder={adminRole ? `${adminRole} ID — e.g. ${adminRole === "Doctor" ? "DR-1042" : adminRole === "Nurse" ? "NR-2081" : "PH-3045"}` : "Select your role first"}
                  disabled={!adminRole}
                  className="w-full h-12 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    value={adminPwd}
                    onChange={(e) => { setAdminPwd(e.target.value); setAdminError("") }}
                    type={adminShowPwd ? "text" : "password"}
                    placeholder="Enter staff password"
                    disabled={!adminRole}
                    className="w-full h-12 px-4 pr-11 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC] focus:ring-2 focus:ring-[#0066CC]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setAdminShowPwd((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {adminShowPwd
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4.5 h-4.5"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {adminError && (
                <p className="text-xs text-red-500 text-center">{adminError}</p>
              )}

              <PrimaryBtn onClick={handleAdminLogin} disabled={adminLoading || !adminRole} className="w-full">
                {adminLoading ? "Verifying…" : `Login as ${adminRole || "Staff"} →`}
              </PrimaryBtn>

              <p className="text-[11px] text-center text-gray-400">
                Unauthorized access attempts are logged and monitored
              </p>
            </div>
          )}

          <div className="mt-5 pt-4 border-t border-gray-100">
            <SecurityBadge />
          </div>
        </div>
      </div>
      {/* end existing card */}

      {/* ── Right security panel (xl+) ── */}
      <div
        className="hidden xl:flex flex-col gap-5 w-64 flex-shrink-0"
        style={
          {
            animation: "side-panel-in 0.7s ease-out 0.4s both",
            "--tx": "30px",
          } as React.CSSProperties
        }
      >
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="font-700 text-[#0D1B3E] text-sm mb-3"
          >
            Your Data is Safe
          </p>
          {[
            { icon: "🔒", text: "End-to-end encrypted" },
            { icon: "🏥", text: "ABDM compliant" },
            { icon: "🛡️", text: "ISO 27001 certified" },
            { icon: "🔏", text: "No data sold to 3rd parties" },
          ].map(({ icon, text }) => (
            <div
              key={text}
              className="flex items-center gap-2.5 py-2 border-b border-gray-100 last:border-0"
            >
              <span className="text-base">{icon}</span>
              <span className="text-[12px] text-gray-600 font-500">{text}</span>
            </div>
          ))}
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-5 border border-white shadow-lg">
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="font-700 text-[#0D1B3E] text-sm mb-3"
          >
            Need Help?
          </p>
          <p className="text-[12px] text-gray-500 leading-relaxed mb-3">
            Our staff can assist you with registration and login at the help
            desk.
          </p>
          <div className="flex items-center gap-2 bg-[#0066CC]/8 rounded-xl px-3 py-2.5">
            <div className="w-7 h-7 bg-[#0066CC] rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.92a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-700 text-[#0066CC]">
                Call Help Desk
              </p>
              <p className="text-[10px] text-gray-500">
                1800-XXX-XXXX (Toll free)
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-[#0066CC] to-[#00897B] rounded-2xl p-5 text-white shadow-lg">
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="font-700 text-sm mb-1"
          >
            ABDM Integrated
          </p>
          <p className="text-white/75 text-[11px] leading-relaxed">
            Your Ayushman Bharat Health Account links all your medical records
            securely.
          </p>
        </div>
      </div>

      {/* close three-column row */}
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 3: DASHBOARD
// ──────────────────────────────────────────────
function DashboardPage({
  onNavigate,
  lang,
  light,
  patient,
  completedSteps,
  onStepComplete,
  hospitalName,
  onHospitalChange,
  onDepartmentChange,
  onPatientChange,
  sessionHistory = [],
}: {
  onNavigate: (p: Page) => void
  lang: LangCode
  light: boolean
  patient: PatientData | null
  completedSteps: number[]
  onStepComplete: (step: number) => void
  hospitalName: string
  onHospitalChange: (v: string) => void
  onDepartmentChange?: (v: string) => void
  onPatientChange?: (updates: Partial<PatientData>) => void
  sessionHistory?: SessionRecord[]
}) {
  const t = useT(lang)
  const loadingUser = patient === null

  const initials = patient?.full_name
    ? patient.full_name.split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?"
  const joinedDate = patient?.created_at
    ? new Date(patient.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
    : "—"

  // Edit Profile modal state
  const [showEdit, setShowEdit] = useState(false)
  const [editName, setEditName] = useState("")
  const [editAge, setEditAge] = useState("")
  const [editCurrentPwd, setEditCurrentPwd] = useState("")
  const [editPwd, setEditPwd] = useState("")
  const [editPwdConfirm, setEditPwdConfirm] = useState("")
  const [editShowPwd, setEditShowPwd] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editMsg, setEditMsg] = useState("")
  const [editErr, setEditErr] = useState("")

  // Past History expand state
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null)

  // Hospital input state
  const [editingHospital, setEditingHospital] = useState(false)
  const [hospitalDraft, setHospitalDraft] = useState(hospitalName)

  // Department edit state
  const [editingDept, setEditingDept] = useState(false)
  const [deptDraft, setDeptDraft] = useState(patient?.department ?? "")
  const [deptLoading, setDeptLoading] = useState(false)

  const handleProfileSave = async () => {
    setEditErr("")
    setEditMsg("")

    const wantsPasswordChange = editPwd.length > 0 || editPwdConfirm.length > 0
    const wantsNameChange = editName.trim() !== "" && editName.trim() !== patient?.full_name
    const wantsAgeChange = editAge.trim() !== "" && editAge.trim() !== String(patient?.age ?? "")

    if (!wantsNameChange && !wantsPasswordChange && !wantsAgeChange) {
      setEditErr("No changes made.")
      return
    }

    if (wantsPasswordChange) {
      if (!editCurrentPwd) { setEditErr("Enter your current password to change it."); return }
      if (editPwd.length < 6) { setEditErr("New password must be at least 6 characters."); return }
      if (editPwd !== editPwdConfirm) { setEditErr("New passwords do not match."); return }
    }

    setEditLoading(true)

    // Verify current password by re-authenticating
    if (wantsPasswordChange) {
      const { data: { user } } = await supabase.auth.getUser()
      const email = user?.email ?? ""
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password: editCurrentPwd })
      if (signInErr) {
        setEditLoading(false)
        setEditErr("Current password is incorrect.")
        return
      }
      const { error: pwdErr } = await supabase.auth.updateUser({ password: editPwd })
      if (pwdErr) { setEditLoading(false); setEditErr(pwdErr.message); return }
    }

    // Update patients table
    const dbUpdates: Record<string, unknown> = {}
    if (wantsNameChange) dbUpdates.full_name = editName.trim()
    if (wantsAgeChange) {
      const parsedAge = parseInt(editAge.trim(), 10)
      if (!isNaN(parsedAge) && parsedAge > 0 && parsedAge <= 120) {
        dbUpdates.age = parsedAge
      }
    }

    if (Object.keys(dbUpdates).length > 0 && patient?.patient_id) {
      const { data: { user } } = await supabase.auth.getUser()
      const filterKey = user?.id ? "user_id" : "patient_id"
      const filterVal = user?.id ?? patient.patient_id
      const { error: dbErr } = await supabase.from("patients").update(dbUpdates).eq(filterKey, filterVal)
      if (dbErr) { setEditLoading(false); setEditErr(dbErr.message); return }
      onPatientChange?.(dbUpdates as Partial<PatientData>)
    }

    setEditLoading(false)
    setEditMsg("Profile updated successfully!")
    setEditCurrentPwd("")
    setEditPwd("")
    setEditPwdConfirm("")
    setTimeout(() => { setShowEdit(false); setEditMsg("") }, 1800)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    onNavigate("welcome")
  }

  const step1Done = completedSteps.includes(1)
  const step2Done = completedSteps.includes(2)
  const step3Done = completedSteps.includes(3)
  const progress = Math.round((completedSteps.filter((s) => s <= 4).length / 4) * 100)

  return (
    <div
      className="min-h-screen"
      style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}
    >
      <TopNav onNavigate={onNavigate} patientName={patient?.full_name} />
      <div className="pt-16 flex">
        {/* Left Panel */}
        <aside className="hidden lg:block w-72 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-16 p-5 pb-28 overflow-y-auto">
          {loadingUser ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-[#0066CC]/20 border-t-[#0066CC] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {/* Patient Card */}
              <div className="bg-gradient-to-br from-[#0066CC] to-[#00897B] rounded-2xl p-5 text-white mb-4 relative">
                {/* Pencil edit button */}
                <button
                  onClick={() => { setEditName(patient?.full_name ?? ""); setEditAge(String(patient?.age ?? "")); setEditCurrentPwd(""); setEditPwd(""); setEditPwdConfirm(""); setEditErr(""); setEditMsg(""); setShowEdit(true) }}
                  className="absolute top-3 right-3 w-7 h-7 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  title="Edit Profile"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                </button>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <span style={{ fontFamily: "Poppins, sans-serif" }} className="text-2xl font-700">
                    {initials}
                  </span>
                </div>
                <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-center font-700 text-base">
                  {patient?.full_name ?? "—"}
                </p>
                <p className="text-center text-white/70 text-xs font-mono mt-0.5">
                  ID: {patient?.patient_id ?? "—"}
                </p>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-white/60">Age</p>
                    <p className="font-600">{patient?.age ? `${patient.age} yrs` : "—"}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-white/60">Gender</p>
                    <p className="font-600">{patient?.gender ?? "—"}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-white/60">Phone</p>
                    <p className="font-600 truncate">{patient?.phone ?? "—"}</p>
                  </div>
                  <div className="bg-white/10 rounded-lg p-2">
                    <p className="text-white/60">Registered</p>
                    <p className="font-600">{joinedDate}</p>
                  </div>
                </div>
              </div>

              {/* Hospital selector */}
              <div className="mb-3 p-3 rounded-xl border bg-blue-50 border-blue-100">
                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">🏨 Hospital for Treatment</p>
                {editingHospital ? (
                  <div className="flex gap-1.5 mt-1">
                    <input
                      value={hospitalDraft}
                      onChange={(e) => setHospitalDraft(e.target.value)}
                      placeholder="Enter hospital name"
                      className="flex-1 h-8 px-2 text-xs border border-blue-200 rounded-lg focus:outline-none focus:border-[#0066CC]"
                      autoFocus
                    />
                    <button onClick={() => { onHospitalChange(hospitalDraft); setEditingHospital(false) }} className="px-2 h-8 bg-[#0066CC] text-white text-xs rounded-lg font-600">Save</button>
                    <button onClick={() => { setHospitalDraft(hospitalName); setEditingHospital(false) }} className="px-2 h-8 border border-gray-200 text-gray-500 text-xs rounded-lg">✕</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs font-600 text-[#0066CC] truncate max-w-[140px]">{hospitalName || "Not selected"}</span>
                    <button onClick={() => { setHospitalDraft(hospitalName); setEditingHospital(true) }} className="text-[10px] text-[#0066CC] underline font-600">Edit</button>
                  </div>
                )}
              </div>

              {/* Department & Quick Info */}
              <div className="space-y-2 mb-4">
                <div className="p-3 rounded-xl border bg-gray-50 border-gray-100">
                  <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">🏥 Department</p>
                  {editingDept ? (
                    <div className="flex gap-1.5 mt-1">
                      <select
                        value={deptDraft}
                        onChange={(e) => setDeptDraft(e.target.value)}
                        className="flex-1 h-8 px-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-[#0066CC] bg-white"
                        autoFocus
                        disabled={deptLoading}
                      >
                        <option value="">Select Department</option>
                        <option>Cardiology</option>
                        <option>ENT</option>
                        <option>AYUSH</option>
                        <option>General Medicine</option>
                        <option>Orthopedics</option>
                      </select>
                      <button
                        onClick={async () => {
                          setDeptLoading(true)
                          await onDepartmentChange?.(deptDraft.trim())
                          setDeptLoading(false)
                          setEditingDept(false)
                        }}
                        disabled={deptLoading}
                        className="px-2 h-8 bg-[#0066CC] text-white text-xs rounded-lg font-600 disabled:opacity-50"
                      >
                        {deptLoading ? "…" : "Save"}
                      </button>
                      <button
                        onClick={() => { setDeptDraft(patient?.department ?? ""); setEditingDept(false) }}
                        className="px-2 h-8 border border-gray-200 text-gray-500 text-xs rounded-lg"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between mt-0.5">
                      <span className="text-xs font-600 text-[#0066CC] truncate max-w-[140px]">{patient?.department || "Not set"}</span>
                      <button
                        onClick={() => { setDeptDraft(patient?.department ?? ""); setEditingDept(true) }}
                        className="text-[10px] text-[#0066CC] underline font-600"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                {(() => {
                  const latest = sessionHistory[0]
                  const meds = latest
                    ? [...new Set([...(latest.session.voiceEntities?.medications ?? []), ...latest.session.docData.medications])].filter(Boolean)
                    : []
                  return (
                    <div className="p-3 rounded-xl border bg-gray-50 border-gray-100">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">💊 {t.medications}</span>
                        <span className="text-xs font-600 text-[#0066CC]">
                          {meds.length > 0 ? `${meds.length} active` : "None recorded"}
                        </span>
                      </div>
                      {meds.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {meds.map((m) => (
                            <span key={m} className="bg-emerald-100 text-emerald-800 text-[10px] rounded-full px-2 py-0.5">{m}</span>
                          ))}
                        </div>
                      )}
                      {!latest && <p className="text-[10px] text-gray-400 mt-0.5">Complete intake to see medications</p>}
                    </div>
                  )
                })()}
              </div>

              {/* Upcoming appointment */}
              <div className="bg-[#0066CC]/5 rounded-2xl p-4 border border-[#0066CC]/10 mb-4">
                <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-[#0066CC] mb-2 uppercase tracking-wide">
                  {t.upcoming}
                </p>
                <p className="font-600 text-gray-800 text-sm">Assigned Doctor</p>
                <p className="text-xs text-gray-500">{patient?.department ?? "General"} Department</p>
                <p className="text-xs text-[#F97316] font-600 mt-1.5">{t.startsIn}</p>
                <p className="text-xs text-gray-400">{t.room}</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={handleSignOut}
                  className="w-full h-10 border border-red-200 text-red-500 text-sm font-600 rounded-xl hover:bg-red-50 transition-colors"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </aside>

        {/* Main */}
        <main className="ml-0 lg:ml-72 flex-1 p-4 sm:p-6 pb-28">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 style={{ fontFamily: "Poppins, sans-serif" }} className="text-xl font-700 text-gray-900">
                  {loadingUser ? t.dashTitle : `Welcome, ${patient?.full_name?.split(" ")[0] ?? "Patient"}!`}
                </h2>
                <p className="text-sm text-gray-500">{t.dashSubtitle}</p>
              </div>
              <div className="flex items-center gap-2 bg-[#10B981]/10 px-4 py-2 rounded-full">
                <div className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse"></div>
                <span className="text-xs font-600 text-[#10B981]">{t.inProgress}</span>
              </div>
            </div>

            {/* Patient info summary card */}
            {!loadingUser && patient && (
              <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Patient ID</p>
                  <p className="text-sm font-700 text-[#0066CC] font-mono">{patient.patient_id}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Department</p>
                  <p className="text-sm font-600 text-gray-800">{patient.department}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Age / Gender</p>
                  <p className="text-sm font-600 text-gray-800">{patient.age ? `${patient.age} yrs` : "—"} · {patient.gender}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                  <p className="text-sm font-600 text-gray-800">{patient.phone}</p>
                </div>
              </div>
            )}

            {/* Hospital name (main area — mobile visible) */}
            <div className="lg:hidden bg-white rounded-2xl p-4 mb-4 border border-blue-100 shadow-sm">
              <p className="text-xs font-600 text-gray-600 mb-2">🏨 Hospital for Treatment</p>
              <div className="flex gap-2">
                <input
                  value={hospitalName}
                  onChange={(e) => onHospitalChange(e.target.value)}
                  placeholder="Enter hospital name…"
                  className="flex-1 h-9 px-3 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#0066CC]"
                />
              </div>
            </div>

            {/* Progress */}
            <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-600 text-gray-600">{t.overallProgress}</span>
                <span className="text-xs font-700 text-[#0066CC]">{progress}% {t.complete}</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#0066CC] to-[#00897B] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              <StageCard
                number={1} title={t.stage1} icon={t.stage1icon}
                status={step1Done ? "Completed" : t.inProgress}
                active={!step1Done} completed={step1Done}
                onClick={() => onNavigate("voice")}
              >
                <p className="text-xs text-gray-500 mt-2">{t.s1hint}</p>
                <button onClick={(e) => { e.stopPropagation(); onNavigate("voice") }} style={{ fontFamily: "Poppins, sans-serif" }} className="mt-3 text-xs font-600 text-[#0066CC] hover:underline flex items-center gap-1">
                  {step1Done ? "Review Recording" : t.continueRec} <div className="w-3 h-3"><Icon.ChevronRight /></div>
                </button>
              </StageCard>

              <StageCard
                number={2} title={t.stage2} icon={t.stage2icon}
                status={step2Done ? "Completed" : step1Done ? "Ready" : "Locked"}
                active={step1Done && !step2Done} completed={step2Done} locked={!step1Done}
                onClick={step1Done ? () => { onStepComplete(2); onNavigate("questions") } : undefined}
              >
                <p className="text-xs text-gray-500 mt-2">{t.s2hint}</p>
                {!step1Done && <p className="text-xs text-amber-500 mt-1 font-500">⚠ Complete Voice Recording first</p>}
              </StageCard>

              <StageCard
                number={3} title={t.stage3} icon={t.stage3icon}
                status={step3Done ? "Completed" : step2Done ? "Ready" : "Locked"}
                active={step2Done && !step3Done} completed={step3Done} locked={!step2Done}
                onClick={step2Done ? () => { onStepComplete(3); onNavigate("documents") } : undefined}
              >
                <p className="text-xs text-gray-500 mt-2">{t.s3hint}</p>
                {!step2Done && <p className="text-xs text-amber-500 mt-1 font-500">⚠ Complete Guided Questions first</p>}
              </StageCard>

              <StageCard
                number={4} title={t.stage4} icon={t.stage4icon}
                status={step3Done ? "Ready" : "Locked"}
                active={step3Done} locked={!step3Done}
                onClick={step3Done ? () => { onStepComplete(4); onNavigate("summary") } : undefined}
              >
                <p className="text-xs text-gray-500 mt-2">{t.s4hint}</p>
                {!step3Done && <p className="text-xs text-amber-500 mt-1 font-500">⚠ Complete Document Upload first</p>}
              </StageCard>
            </div>

            {/* ── Past History ── */}
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 style={{ fontFamily: "Poppins, sans-serif" }} className="text-base font-700 text-gray-800">
                  Past History
                </h3>
                {sessionHistory.length > 0 && (
                  <span className="text-xs text-gray-400 bg-gray-100 rounded-full px-2.5 py-0.5">
                    {sessionHistory.length} session{sessionHistory.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {sessionHistory.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl p-6 text-center shadow-sm">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
                      <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 font-500">No past sessions yet</p>
                  <p className="text-xs text-gray-400 mt-1">Complete the intake flow to see your clinical history here.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {sessionHistory.map((rec) => {
                    const isOpen = expandedRecord === rec.id
                    const s = rec.session
                    const ve = s.voiceEntities
                    const dd = s.docData
                    const dt = new Date(rec.timestamp)
                    const dateStr = dt.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" })
                    const timeStr = dt.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })

                    return (
                      <div key={rec.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                        {/* Header row */}
                        <button
                          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                          onClick={() => setExpandedRecord(isOpen ? null : rec.id)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                              <svg viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <div>
                              <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-sm font-700 text-gray-800">
                                {dateStr} · {timeStr}
                              </p>
                              <p className="text-xs text-gray-400">
                                {ve?.chiefComplaint ? ve.chiefComplaint.slice(0, 60) + (ve.chiefComplaint.length > 60 ? "…" : "") : "No chief complaint recorded"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <div className="flex gap-1.5">
                              {s.voiceEntities && <span className="text-[10px] bg-blue-50 text-blue-600 rounded-full px-2 py-0.5 font-600">Voice</span>}
                              {s.questionsAnswered > 0 && <span className="text-[10px] bg-purple-50 text-purple-600 rounded-full px-2 py-0.5 font-600">Q&A</span>}
                              {dd.docCount > 0 && <span className="text-[10px] bg-emerald-50 text-emerald-600 rounded-full px-2 py-0.5 font-600">Docs</span>}
                            </div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`}>
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </div>
                        </button>

                        {/* Expanded clinical report */}
                        {isOpen && (
                          <div className="border-t border-gray-100 p-4">
                            <ClinicalReportInline
                              intakeSession={rec.session}
                              patientName={rec.patientName}
                              patientId={rec.patientId}
                              hospitalName={rec.hospitalName}
                              generatedAt={rec.timestamp}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Panel */}
        <aside className="hidden xl:block w-60 bg-white border-l border-gray-100 fixed right-0 top-16 min-h-screen p-5 space-y-4 overflow-y-auto">
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
            <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-amber-700 mb-2">💡 Tips</p>
            <ul className="space-y-1.5 text-xs text-amber-800">
              <li>• Be as detailed as possible</li>
              <li>• Mention medication names clearly</li>
              <li>• Describe when symptoms started</li>
            </ul>
          </div>

          <div>
            <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-gray-500 uppercase tracking-wide mb-2">
              Account Info
            </p>
            {loadingUser ? (
              <div className="h-16 bg-gray-50 rounded-xl animate-pulse" />
            ) : (
              <div className="space-y-1.5">
                <div className="py-2 border-b border-gray-50">
                  <p className="text-xs text-gray-400">Name</p>
                  <p className="text-xs font-600 text-gray-700">{patient?.full_name ?? "—"}</p>
                </div>
                <div className="py-2 border-b border-gray-50">
                  <p className="text-xs text-gray-400">Patient ID</p>
                  <p className="text-xs font-600 text-[#0066CC] font-mono">{patient?.patient_id ?? "—"}</p>
                </div>
                <div className="py-2">
                  <p className="text-xs text-gray-400">Registered</p>
                  <p className="text-xs font-600 text-gray-700">{joinedDate}</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-2xl p-4">
            <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-gray-600 mb-3">Need Help?</p>
            <button className="w-full h-9 bg-[#0066CC] text-white text-xs font-600 rounded-lg flex items-center justify-center gap-1.5">
              📞 Call Staff
            </button>
            <button className="w-full h-9 mt-2 border border-gray-200 text-gray-600 text-xs font-600 rounded-lg flex items-center justify-center gap-1.5">
              💬 Live Chat
            </button>
          </div>
        </aside>
      </div>

      {/* ── Edit Profile Modal ── */}
      {showEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setShowEdit(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-base font-700 text-gray-900">{t.editProfile}</p>
                <p className="text-xs text-gray-400 mt-0.5">Update your profile information</p>
              </div>
              <button onClick={() => setShowEdit(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200">✕</button>
            </div>

            {/* Read-only identifiers */}
            <div className="bg-gray-50 rounded-2xl p-3 mb-4 flex gap-4 text-xs">
              <div>
                <p className="text-gray-400">Patient ID</p>
                <p className="font-600 text-[#0066CC] font-mono">{patient?.patient_id ?? "—"}</p>
              </div>
              <div>
                <p className="text-gray-400">Phone</p>
                <p className="font-600 text-gray-700">{patient?.phone ?? "—"}</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Full Name</label>
                <input
                  value={editName}
                  onChange={(e) => { setEditName(e.target.value); setEditErr("") }}
                  placeholder="Your full name"
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC]"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-600 text-gray-600 mb-1.5">Age</label>
                <input
                  value={editAge}
                  onChange={(e) => { setEditAge(e.target.value.replace(/\D/g, "")); setEditErr("") }}
                  placeholder="Your age"
                  type="number"
                  min={1}
                  max={120}
                  className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC]"
                />
              </div>

              {/* Divider */}
              <div className="border-t border-gray-100 pt-1">
                <p className="text-xs font-700 text-gray-500 mb-3">Change Password <span className="text-gray-400 font-400">(optional)</span></p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-600 text-gray-600 mb-1.5">Current Password</label>
                    <input
                      value={editCurrentPwd}
                      onChange={(e) => { setEditCurrentPwd(e.target.value); setEditErr("") }}
                      type="password"
                      placeholder="Required to change password"
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-gray-600 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        value={editPwd}
                        onChange={(e) => { setEditPwd(e.target.value); setEditErr("") }}
                        type={editShowPwd ? "text" : "password"}
                        placeholder="Min. 6 characters"
                        className="w-full h-11 px-4 pr-10 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC]"
                      />
                      <button type="button" onClick={() => setEditShowPwd((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" tabIndex={-1}>
                        {editShowPwd
                          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-600 text-gray-600 mb-1.5">Confirm New Password</label>
                    <input
                      value={editPwdConfirm}
                      onChange={(e) => { setEditPwdConfirm(e.target.value); setEditErr("") }}
                      type="password"
                      placeholder="Re-enter new password"
                      className="w-full h-11 px-4 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#0066CC]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {editErr && <p className="text-xs text-red-500 mt-3 text-center">{editErr}</p>}
            {editMsg && <p className="text-xs text-[#10B981] mt-3 text-center font-600">{editMsg}</p>}

            <PrimaryBtn onClick={handleProfileSave} disabled={editLoading} className="w-full mt-4">
              {editLoading ? "Saving…" : "Save Changes"}
            </PrimaryBtn>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 4: VOICE RECORDING
// ──────────────────────────────────────────────
// ── Clinical NLP helpers ──────────────────────────────────────────────────
type MedEntities = {
  chiefComplaint: string
  symptoms: string[]
  duration: string
  severity: string
  medications: string[]
  allergies: string[]
  familyHistory: string[]
  vitals: string[]
}

function extractMedicalEntities(text: string): MedEntities {
  const l = text.toLowerCase()
  const symptomWords = ["pain","ache","fever","cough","cold","breathlessness","nausea","vomiting","dizziness","headache","fatigue","weakness","swelling","rash","bleeding","palpitation","chest","abdomen","back","knee","joint","throat","eye","ear","stomach","heart","pressure","sugar","diabetes","bp","hypertension","shortness of breath","diarrhea","constipation","burning","itching","anxiety","depression","insomnia","weight loss","weight gain","loss of appetite"]
  const durRx = /(?:for|since|last|past|over)\s+(\d+\s+(?:day|week|month|year|hour)s?)/gi
  const sevRx = /(?:pain|severity|level|score)\s+(?:is|of|about)?\s*(\d{1,2}(?:\s*out\s*of\s*10)?|mild|moderate|severe|sharp|dull|throbbing|burning|stabbing)/gi
  const medRx = /(?:taking|prescribed|on|using)\s+([A-Za-z]+(?:mab|olol|pril|artan|stat|pine|zole|mycin|cillin|formin|xaban)?)/gi
  const allergyRx = /(?:allergic|allergy)\s+to\s+([A-Za-z\s,]+?)(?:\.|,|and|$)/gi
  const familyRx = /(?:family|father|mother|brother|sister|parent|sibling)\s+(?:has|had|suffering|history of)\s+([A-Za-z\s]+?)(?:\.|,|$)/gi
  const vitalRx = /(?:bp|blood pressure|sugar|glucose|temperature|temp|pulse|spo2|oxygen)\s*(?:is|was|of|:)?\s*([\d\/\.]+\s*(?:mg\/dl|mmhg|°c|°f|bpm|%)?)/gi

  const symptoms = symptomWords.filter((s) => l.includes(s))
  const durations: string[] = []
  let m: RegExpExecArray | null
  while ((m = durRx.exec(text)) !== null) durations.push(m[1])
  const severities: string[] = []
  while ((m = sevRx.exec(text)) !== null) severities.push(m[1])
  const meds: string[] = []
  while ((m = medRx.exec(text)) !== null) meds.push(m[1])
  const allergies: string[] = []
  while ((m = allergyRx.exec(text)) !== null) allergies.push(m[1].trim())
  const family: string[] = []
  while ((m = familyRx.exec(text)) !== null) family.push(m[1].trim())
  const vitals: string[] = []
  while ((m = vitalRx.exec(text)) !== null) vitals.push(m[0].trim())

  const firstSentence = text.split(/[.!?]/)[0]?.trim() ?? text.slice(0, 80)
  return {
    chiefComplaint: firstSentence,
    symptoms: [...new Set(symptoms)].slice(0, 8),
    duration: durations[0] ?? "Not specified",
    severity: severities[0] ?? "Not mentioned",
    medications: [...new Set(meds)].slice(0, 5),
    allergies: [...new Set(allergies)].slice(0, 3),
    familyHistory: [...new Set(family)].slice(0, 3),
    vitals: [...new Set(vitals)].slice(0, 4),
  }
}

function generateClinicalSummary(entities: MedEntities, patientName: string, patientId: string): string {
  const now = new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
  const lines = [
    `CLINICAL HISTORY SUMMARY — AI Generated`,
    `Patient: ${patientName}  |  ID: ${patientId}  |  ${now}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Chief Complaint: ${entities.chiefComplaint}`,
    `Duration: ${entities.duration}`,
    `Severity: ${entities.severity}`,
    entities.symptoms.length ? `Symptoms: ${entities.symptoms.join(", ")}` : "",
    entities.medications.length ? `Current Medications: ${entities.medications.join(", ")}` : "",
    entities.allergies.length ? `Allergies: ${entities.allergies.join(", ")}` : "",
    entities.familyHistory.length ? `Family History: ${entities.familyHistory.join("; ")}` : "",
    entities.vitals.length ? `Vitals Mentioned: ${entities.vitals.join(", ")}` : "",
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `ASR Engine: Web Speech API (Bhashini-compatible) · Language: Active session`,
    `Transcription Quality: AI-assisted NLP extraction`,
  ].filter(Boolean)
  return lines.join("\n")
}

// SOCRATES follow-up questions
const SOCRATES_QUESTIONS = [
  { key: "site", q: "Where exactly is the main area of discomfort or pain?" },
  { key: "onset", q: "When did it start? Was the onset sudden or gradual?" },
  { key: "character", q: "How would you describe it — sharp, dull, burning, throbbing?" },
  { key: "radiation", q: "Does it spread or radiate to any other part of your body?" },
  { key: "association", q: "Are there any other symptoms like nausea, fever, or breathlessness?" },
  { key: "time", q: "Is it constant or does it come and go? How long does each episode last?" },
  { key: "exacerbating", q: "What makes it worse or better — rest, movement, food, medication?" },
  { key: "severity", q: "On a scale of 1 to 10, how would you rate the severity right now?" },
]

const SOCRATES_HI: Record<string, string> = {
  site: "दर्द या तकलीफ कहाँ है? कौन सा हिस्सा?",
  onset: "यह कब शुरू हुआ? अचानक या धीरे-धीरे?",
  character: "दर्द कैसा है — तेज, हल्का, जलन, धड़कन जैसा?",
  radiation: "क्या यह शरीर के किसी और हिस्से में फैलता है?",
  association: "क्या साथ में मतली, बुखार या सांस लेने में तकलीफ है?",
  time: "क्या यह हमेशा रहता है या आता-जाता है?",
  exacerbating: "क्या इसे बढ़ाता या घटाता है?",
  severity: "1 से 10 के पैमाने पर तकलीफ कितनी है?",
}

function VoicePage({ onNavigate, lang, light, patient, onVoiceComplete }: { onNavigate: (p: Page) => void; lang: LangCode; light: boolean; patient: PatientData | null; onVoiceComplete?: (entities: MedEntities, summary: string, confidence: number, duration: string) => void }) {
  const t = useT(lang)
  type Msg = { speaker: "AI" | "Patient"; text: string; ts: number }

  const firstName = patient?.full_name?.split(" ")[0] ?? "there"
  const greeting = lang === "hi"
    ? `नमस्ते ${firstName}! मैं आपका MediKiosk AI सहायक हूँ। कृपया अपनी स्वास्थ्य समस्या बताएं।`
    : `Namaste ${firstName}! I'm your MediKiosk AI assistant. Please describe your health concern today.`

  const [recording, setRecording] = useState(false)
  const [time, setTime] = useState(0)
  const [msgs, setMsgs] = useState<Msg[]>([{ speaker: "AI", text: greeting, ts: Date.now() }])
  const [liveText, setLiveText] = useState("")
  const [bars, setBars] = useState<number[]>(Array(24).fill(0.3))
  const [socratesIdx, setSocratesIdx] = useState(0)
  const [analyzing, setAnalyzing] = useState(false)
  const [entities, setEntities] = useState<MedEntities | null>(null)
  const [summary, setSummary] = useState("")
  const [showSummary, setShowSummary] = useState(false)
  const [micError, setMicError] = useState("")
  const [confidence, setConfidence] = useState(0)
  const [totalText, setTotalText] = useState("")

  const recRef = useRef<any>(null)
  const recActiveRef = useRef(false)
  const transcriptEndRef = useRef<HTMLDivElement>(null)

  const langMap: Record<LangCode, string> = {
    en: "en-IN", hi: "hi-IN", ta: "ta-IN", bn: "bn-IN",
    mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", te: "te-IN",
    ml: "ml-IN", pa: "pa-IN", ur: "ur-PK",
  }

  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`

  // Timer
  useEffect(() => {
    let t: ReturnType<typeof setInterval>
    if (recording) t = setInterval(() => setTime((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  // Waveform animation
  useEffect(() => {
    let a: ReturnType<typeof setInterval>
    if (recording) {
      a = setInterval(() => setBars(Array(24).fill(0).map(() => 0.15 + Math.random() * 0.85)), 100)
    } else {
      setBars(Array(24).fill(0.3))
    }
    return () => clearInterval(a)
  }, [recording])

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [msgs, liveText])

  // Add AI follow-up after each patient message
  const addAiFollowUp = (patientSpeech: string) => {
    const idx = socratesIdx
    if (idx >= SOCRATES_QUESTIONS.length) return
    const q = SOCRATES_QUESTIONS[idx]
    const aiText = lang === "hi" ? (SOCRATES_HI[q.key] ?? q.q) : q.q
    setTimeout(() => {
      setMsgs((prev) => [...prev, { speaker: "AI", text: aiText, ts: Date.now() }])
      setSocratesIdx((i) => Math.min(i + 1, SOCRATES_QUESTIONS.length))
    }, 800)
  }

  const stopRecognition = () => {
    recActiveRef.current = false
    recRef.current?.stop()
    recRef.current?.abort()
  }

  const startRecording = async () => {
    setMicError("")
    // Request mic permission first
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        stream.getTracks().forEach((t) => t.stop())
      }
    } catch (err: any) {
      setMicError(err?.name === "NotAllowedError" ? "Microphone access denied. Please allow in browser settings." : "Microphone unavailable.")
      return
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) { setMicError("Speech recognition not supported in this browser. Try Chrome."); return }

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.lang = langMap[lang] ?? "en-IN"

    rec.onresult = (e: any) => {
      let interim = ""
      let final = ""
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) {
          final += res[0].transcript
          setConfidence(Math.round(res[0].confidence * 100))
        } else {
          interim += res[0].transcript
        }
      }
      if (interim) setLiveText(interim)
      if (final.trim()) {
        const text = final.trim()
        setLiveText("")
        setTotalText((prev) => prev + " " + text)
        setMsgs((prev) => [...prev, { speaker: "Patient", text, ts: Date.now() }])
        addAiFollowUp(text)
      }
    }

    rec.onerror = (e: any) => {
      if (e.error === "no-speech" || e.error === "aborted") return
      setMicError(e.error === "not-allowed" ? "Microphone access denied." : `Error: ${e.error}`)
      stopAndFinish()
    }

    rec.onend = () => {
      if (recActiveRef.current) {
        try { rec.start() } catch (_) {}
      }
    }

    recRef.current = rec
    recActiveRef.current = true
    setRecording(true)
    rec.start()
  }

  const stopAndFinish = () => {
    stopRecognition()
    setRecording(false)
    setLiveText("")
  }

  const handleMicClick = async () => {
    if (recording) {
      stopAndFinish()
    } else {
      await startRecording()
    }
  }

  const handleAnalyze = async () => {
    stopAndFinish()
    setAnalyzing(true)
    await new Promise((r) => setTimeout(r, 1800))
    const fullText = totalText + " " + msgs.filter((m) => m.speaker === "Patient").map((m) => m.text).join(" ")
    const ent = extractMedicalEntities(fullText)
    const sum = generateClinicalSummary(ent, patient?.full_name ?? "Patient", patient?.patient_id ?? "—")
    setEntities(ent)
    setSummary(sum)
    setAnalyzing(false)
    setShowSummary(true)
    setMsgs((prev) => [...prev, { speaker: "AI", text: "Thank you. I've analyzed your responses. Your clinical summary has been generated below.", ts: Date.now() }])
  }

  const patientMsgCount = msgs.filter((m) => m.speaker === "Patient").length
  const currentSocratesQ = SOCRATES_QUESTIONS[socratesIdx]

  return (
    <div className="min-h-screen" style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}>
      <TopNav onNavigate={onNavigate} patientName={patient?.full_name} />
      <div className="pt-16 pb-28 max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Breadcrumb + timer */}
        <div className="flex items-center gap-2 text-xs text-gray-400 mb-5 flex-wrap">
          <button onClick={() => onNavigate("dashboard")} className="hover:text-[#0066CC]">{t.dashLabel}</button>
          <div className="w-3 h-3"><Icon.ChevronRight /></div>
          <span className="text-gray-700 font-500">{t.stage1}</span>
          {patient && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border border-gray-100 rounded-full px-3 py-1">
              <span className="w-5 h-5 bg-[#0066CC] rounded-full text-white flex items-center justify-center text-[9px] font-700">
                {patient.full_name.split(" ").map((w: string) => w[0]).slice(0,2).join("").toUpperCase()}
              </span>
              <span className="font-500">{patient.full_name}</span>
              <span className="text-gray-300">·</span>
              <span className="text-[#0066CC]">{patient.department}</span>
            </div>
          )}
          {recording && (
            <div className="ml-auto flex items-center gap-2 bg-red-50 border border-red-100 rounded-full px-4 py-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-600 font-700 font-mono text-sm">{fmt(time)}</span>
              <span className="text-red-500 text-xs">REC</span>
            </div>
          )}
        </div>

        {/* Engine badge */}
        <div className="flex items-center gap-2 mb-4">
          <div className="flex items-center gap-1.5 bg-gradient-to-r from-[#0066CC]/10 to-[#00897B]/10 border border-[#0066CC]/20 rounded-full px-3 py-1">
            <span className="text-[10px] font-700 text-[#0066CC] uppercase tracking-wide">Bhashini ASR</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
            <span className="text-[10px] text-[#10B981] font-600">Active</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
            <span className="text-[10px] font-600 text-gray-500">SOCRATES Protocol</span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1">
            <span className="text-[10px] font-600 text-gray-500">Clinical NLP</span>
          </div>
          {confidence > 0 && (
            <div className="ml-auto text-[10px] font-600 text-[#10B981]">{confidence}% confidence</div>
          )}
        </div>

        {/* AI Avatar + Waveform */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-4">
          <div className="flex flex-col items-center">
            <div className={`w-28 h-28 rounded-full flex items-center justify-center mb-4 relative ${recording ? "pulse-green" : ""}`}
              style={{ background: "linear-gradient(135deg,#0066CC20,#00897B20)", border: recording ? "3px solid #10B981" : "3px solid #e5e7eb" }}>
              <div className="w-16 h-16 bg-gradient-to-br from-[#0066CC] to-[#00897B] rounded-full flex items-center justify-center">
                <div className="w-10 h-10 text-white"><Icon.Stethoscope /></div>
              </div>
              {recording && (
                <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#10B981] rounded-full flex items-center justify-center border-2 border-white">
                  <div className="w-3.5 h-3.5 text-white"><Icon.Mic active /></div>
                </div>
              )}
            </div>

            {/* Current AI question */}
            {!showSummary && (
              <div className="text-center mb-5 max-w-md w-full">
                <div className="bg-[#00897B]/5 border border-[#00897B]/20 rounded-2xl p-4">
                  <p className="text-[10px] font-700 text-[#00897B] uppercase tracking-wide mb-1">
                    AI Question {Math.min(socratesIdx + 1, SOCRATES_QUESTIONS.length)} of {SOCRATES_QUESTIONS.length} — SOCRATES
                  </p>
                  <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-sm font-600 text-gray-800">
                    {lang === "hi" ? (SOCRATES_HI[currentSocratesQ?.key ?? "site"] ?? currentSocratesQ?.q) : currentSocratesQ?.q ?? "Please tell me about your health concern."}
                  </p>
                </div>
              </div>
            )}

            {/* Waveform */}
            <div className="w-full flex items-end justify-center gap-0.5 h-14 mb-4">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 rounded-sm transition-all duration-100"
                  style={{ height: `${h * 52}px`, background: recording ? `hsl(${140 + i * 3},65%,${40 + h * 20}%)` : "#e5e7eb" }} />
              ))}
            </div>

            {/* Mic error */}
            {micError && (
              <div className="w-full mb-3 bg-red-50 border border-red-200 rounded-xl px-4 py-2 text-xs text-red-600 text-center">{micError}</div>
            )}

            {/* Live interim text */}
            {liveText && (
              <div className="w-full mb-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2 text-xs text-gray-600 italic">
                <span className="text-[#0066CC] font-600 not-italic">Transcribing: </span>{liveText}
                <span className="inline-block w-1 h-3 bg-[#0066CC] ml-1 animate-pulse" />
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => { stopAndFinish(); setTime(0); setMsgs([{ speaker: "AI", text: greeting, ts: Date.now() }]); setTotalText(""); setSocratesIdx(0); setShowSummary(false); setSummary(""); setEntities(null) }}
                className="w-11 h-11 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:border-red-200 hover:text-red-500 transition-colors"
                title="Reset session"
              >
                <span className="text-base">🔄</span>
              </button>

              <button
                onClick={handleMicClick}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center transition-all duration-200 shadow-lg active:scale-95 ${
                  recording ? "bg-red-500 hover:bg-red-600 text-white" : "bg-[#0066CC] hover:bg-[#0055aa] text-white"
                }`}
              >
                <div className="w-8 h-8"><Icon.Mic active={recording} /></div>
                <span className="text-[9px] font-600 mt-0.5">{recording ? t.stopRec : t.startRec}</span>
              </button>

              <button
                onClick={handleAnalyze}
                disabled={patientMsgCount === 0 || analyzing}
                className="w-11 h-11 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:border-[#10B981] hover:text-[#10B981] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Analyze & generate summary"
              >
                {analyzing ? <div className="w-4 h-4 border-2 border-[#10B981] border-t-transparent rounded-full animate-spin" /> : <span className="text-base">✨</span>}
              </button>
            </div>

            <p className="text-[10px] text-gray-400 mt-3 text-center">
              {recording ? "Speak naturally — AI is transcribing in real-time" : patientMsgCount > 0 ? "Tap ✨ to generate clinical summary, or continue recording" : "Tap mic to begin voice history recording"}
            </p>
          </div>
        </div>

        {/* Live Transcript */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-gray-500 uppercase tracking-wide">
              {t.liveTranscript}
            </p>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0066CC]" />Patient
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] ml-2" />AI
            </div>
          </div>
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {msgs.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.speaker === "AI" ? "" : "flex-row-reverse"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-700 flex-shrink-0 ${msg.speaker === "AI" ? "bg-[#0066CC] text-white" : "bg-[#10B981] text-white"}`}>
                  {msg.speaker === "AI" ? "AI" : "P"}
                </div>
                <div className={`max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.speaker === "AI" ? "bg-blue-50 text-gray-700" : "bg-emerald-50 text-gray-700"}`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {liveText && (
              <div className="flex gap-2.5 flex-row-reverse">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-700 flex-shrink-0 bg-[#10B981]/40 text-white">P</div>
                <div className="max-w-xs px-3 py-2 rounded-xl text-xs leading-relaxed bg-emerald-50/50 text-gray-500 italic">{liveText}…</div>
              </div>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>

        {/* Analyzing state */}
        {analyzing && (
          <div className="bg-white rounded-2xl border border-[#0066CC]/20 shadow-sm p-6 mb-4 flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#0066CC] border-t-transparent rounded-full animate-spin" />
            <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-sm font-600 text-gray-700">Analyzing medical conversation…</p>
            <p className="text-xs text-gray-400">Bhashini NLP · Clinical entity extraction · SOCRATES mapping</p>
          </div>
        )}

        {/* Clinical Summary */}
        {showSummary && entities && (
          <div className="bg-white rounded-2xl border border-[#10B981]/30 shadow-sm overflow-hidden mb-4">
            <div className="bg-gradient-to-r from-[#0066CC] to-[#00897B] px-5 py-3 flex items-center justify-between">
              <div>
                <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-white">AI-Generated Clinical Summary</p>
                <p className="text-[10px] text-white/70">Bhashini ASR · Clinical NLP · SOCRATES Protocol</p>
              </div>
              <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-2.5 py-1">
                <div className="w-1.5 h-1.5 bg-[#10B981] rounded-full" />
                <span className="text-[10px] text-white font-600">Ready</span>
              </div>
            </div>
            <div className="p-5 space-y-3">
              {[
                { label: "Chief Complaint", value: entities.chiefComplaint, icon: "🩺" },
                { label: "Duration", value: entities.duration, icon: "⏱" },
                { label: "Severity", value: entities.severity, icon: "📊" },
                ...(entities.symptoms.length ? [{ label: "Symptoms Detected", value: entities.symptoms.join(" · "), icon: "🔍" }] : []),
                ...(entities.medications.length ? [{ label: "Medications Mentioned", value: entities.medications.join(", "), icon: "💊" }] : []),
                ...(entities.allergies.length ? [{ label: "Allergies", value: entities.allergies.join(", "), icon: "⚠️" }] : []),
                ...(entities.familyHistory.length ? [{ label: "Family History", value: entities.familyHistory.join("; "), icon: "👨‍👩‍👧" }] : []),
                ...(entities.vitals.length ? [{ label: "Vitals Mentioned", value: entities.vitals.join(", "), icon: "❤️" }] : []),
              ].map((row) => (
                <div key={row.label} className="flex gap-3 text-xs">
                  <span className="w-5 flex-shrink-0 mt-0.5">{row.icon}</span>
                  <div>
                    <span className="font-700 text-gray-600">{row.label}: </span>
                    <span className="text-gray-700">{row.value}</span>
                  </div>
                </div>
              ))}
              <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-[10px] text-gray-400">
                  🔐 Encrypted · ABDM compliant · AI-assisted, not a substitute for clinical diagnosis
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => onNavigate("dashboard")} className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
            {t.pauseReturn}
          </button>
          <div className="flex items-center gap-3">
            {micError && (
              <button
                onClick={() => onNavigate("questions")}
                className="flex items-center gap-1.5 h-10 px-4 rounded-xl border border-amber-300 bg-amber-50 text-amber-700 text-sm font-600 hover:bg-amber-100 transition-colors"
              >
                <span>⚠</span> Skip — Mic unavailable
                <div className="w-3.5 h-3.5"><Icon.ChevronRight /></div>
              </button>
            )}
            <PrimaryBtn
              onClick={() => {
                if (entities) {
                  const mins = Math.floor(time / 60)
                  const secs = String(time % 60).padStart(2, "0")
                  onVoiceComplete?.(entities, summary, confidence, `${mins}:${secs}`)
                }
                onNavigate("questions")
              }}
              disabled={!showSummary && patientMsgCount === 0 && !micError}
            >
              {t.nextDocScan}{" "}
              <div className="w-4 h-4"><Icon.ChevronRight /></div>
            </PrimaryBtn>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 5: GUIDED QUESTIONS
// ──────────────────────────────────────────────
const QUESTIONS = [
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

function QuestionsPage({ onNavigate, lang, light, patient, onQuestionsComplete }: { onNavigate: (p: Page) => void; lang: LangCode; light: boolean; patient: PatientData | null; onQuestionsComplete?: (answers: Record<number, string | number | string[]>, count: number) => void }) {
  const t = useT(lang)
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] =
    useState<Record<number, string | number | string[]>>({})
  const [slider, setSlider] = useState(5)
  const [numVal, setNumVal] = useState(3)
  const q = QUESTIONS[qIdx]
  const progress = ((qIdx + 1) / QUESTIONS.length) * 100

  const [speaking, setSpeaking] = useState(false)

  const langVoiceMap: Record<LangCode, string> = {
    en: "en-IN", hi: "hi-IN", ta: "ta-IN", bn: "bn-IN",
    mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", te: "te-IN",
    ml: "ml-IN", pa: "pa-IN", ur: "ur-PK",
  }

  const speakQuestion = () => {
    if (!window.speechSynthesis) return
    if (speaking) {
      window.speechSynthesis.cancel()
      setSpeaking(false)
      return
    }
    // Use subtitle (Hindi) for hi, otherwise English text
    const text = lang === "hi" && q.subtitle ? q.subtitle : q.text
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = langVoiceMap[lang] ?? "en-IN"
    utterance.rate = 0.9
    utterance.onstart = () => setSpeaking(true)
    utterance.onend = () => setSpeaking(false)
    utterance.onerror = () => setSpeaking(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  }

  // Stop TTS when question changes
  useEffect(() => {
    window.speechSynthesis?.cancel()
    setSpeaking(false)
  }, [qIdx])

  const handleNext = () => {
    // Persist current slider/number into answers before advancing
    let merged = { ...answers }
    if (q.type === "slider") merged = { ...merged, [q.id]: slider }
    if (q.type === "number") merged = { ...merged, [q.id]: numVal }
    setAnswers(merged)

    if (qIdx < QUESTIONS.length - 1) {
      setQIdx(qIdx + 1)
    } else {
      onQuestionsComplete?.(merged, Object.keys(merged).length)
      onNavigate("documents")
    }
  }

  const toggleMulti = (opt: string) => {
    const curr = answers[q.id] as string[] || []
    const updated = curr.includes(opt)
      ? curr.filter((o) => o !== opt)
      : [...curr, opt]
    setAnswers({ ...answers, [q.id]: updated })
  }

  // Voice fill: answer current question by option text or slider value
  useEffect(() => {
    const handler = (e: Event) => {
      const { field, value } = (e as CustomEvent<{ field: string; value: string }>).detail
      if (field === "answer") {
        const qNow = QUESTIONS[qIdx]
        if (qNow.type === "slider") {
          const num = parseInt(value)
          if (!isNaN(num)) setSlider(Math.max(0, Math.min(10, num)))
        } else if (qNow.type === "number") {
          const num = parseInt(value)
          if (!isNaN(num)) setNumVal(num)
        } else if (qNow.type === "single" && qNow.options) {
          const match = qNow.options.find((o) => o.toLowerCase().includes(value.toLowerCase()))
          if (match) setAnswers((prev) => ({ ...prev, [qNow.id]: match }))
        } else if (qNow.type === "multi" && qNow.options) {
          const match = qNow.options.find((o) => o.toLowerCase().includes(value.toLowerCase()))
          if (match) toggleMulti(match)
        }
      }
    }
    window.addEventListener("voice-fill", handler)
    return () => window.removeEventListener("voice-fill", handler)
  }, [qIdx])

  return (
    <div
      className="min-h-screen"
      style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}
    >
      <TopNav onNavigate={onNavigate} patientName={patient?.full_name} />
      <div className="pt-16 pb-28 max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {patient && (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5 mb-4">
            <div className="w-7 h-7 bg-[#0066CC] rounded-full flex items-center justify-center text-white text-[10px] font-700 flex-shrink-0">
              {patient.full_name.split(" ").map((w: string) => w[0]).slice(0,2).join("").toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-600 text-[#0066CC]">{patient.full_name}</p>
              <p className="text-[11px] text-gray-400">ID: {patient.patient_id} · {patient.department}</p>
            </div>
          </div>
        )}
        {/* Progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <span
                style={{ fontFamily: "Poppins, sans-serif" }}
                className="text-xs font-700 text-[#0066CC] uppercase tracking-wide"
              >
                {q.category}
              </span>
              <p className="text-xs text-gray-500 mt-0.5">
                {t.questionOf} {qIdx + 1} of {QUESTIONS.length}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-600 text-gray-600">
                {Math.round(progress)}% {t.complete}
              </span>
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#0066CC] to-[#00897B] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-5 animate-float-in">
          <h2
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="text-xl font-700 text-gray-900 mb-1 leading-snug"
          >
            {q.text}
          </h2>
          <p className="text-sm text-gray-400 mb-6">{q.subtitle}</p>

          {/* YES / NO */}
          {q.type === "yesno" && (
            <div className="flex gap-4">
              {["Yes", "No"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setAnswers({ ...answers, [q.id]: opt })}
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  className={`flex-1 h-16 rounded-2xl border-2 font-700 text-lg transition-all ${
                    answers[q.id] === opt
                      ? opt === "Yes"
                        ? "border-[#10B981] bg-[#10B981] text-white"
                        : "border-gray-300 bg-gray-100 text-gray-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {opt === "Yes" ? t.yesBtn : t.noBtn}
                </button>
              ))}
            </div>
          )}

          {/* MULTI */}
          {q.type === "multi" && q.options && (
            <div className="space-y-2">
              {q.options.map((opt) => {
                const sel = (answers[q.id] as string[] || []).includes(opt)
                return (
                  <button
                    key={opt}
                    onClick={() => toggleMulti(opt)}
                    className={`w-full h-12 px-4 rounded-xl border-2 text-left text-sm font-500 transition-all flex items-center gap-3 ${
                      sel
                        ? "border-[#00897B] bg-[#00897B]/5 text-[#00897B]"
                        : "border-gray-200 text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                        sel
                          ? "bg-[#00897B] border-[#00897B]"
                          : "border-gray-300"
                      }`}
                    >
                      {sel && (
                        <div className="w-3 h-3 text-white">
                          <Icon.Check />
                        </div>
                      )}
                    </div>
                    {opt}
                  </button>
                )
              })}
            </div>
          )}

          {/* SLIDER */}
          {q.type === "slider" && (
            <div className="py-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-[#10B981] font-600">
                  1 - Minimal
                </span>
                <div
                  className="text-4xl font-700 text-[#0066CC]"
                  style={{ fontFamily: "Poppins, sans-serif" }}
                >
                  {slider}
                </div>
                <span className="text-xs text-red-500 font-600">
                  10 - Severe
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={slider}
                onChange={(e) => setSlider(Number(e.target.value))}
                className="w-full accent-[#0066CC]"
              />
              <div className="flex justify-between mt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <span
                    key={n}
                    className={`text-xs font-600 ${
                      n === slider ? "text-[#0066CC]" : "text-gray-300"
                    }`}
                  >
                    {n}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* NUMBER */}
          {q.type === "number" && (
            <div className="flex items-center gap-4 justify-center py-4">
              <button
                onClick={() => setNumVal(Math.max(0, numVal - 1))}
                className="w-12 h-12 rounded-full border-2 border-gray-200 text-xl font-700 hover:border-[#0066CC] hover:text-[#0066CC] transition-colors"
              >
                −
              </button>
              <span
                className="text-5xl font-700 text-[#0066CC] w-20 text-center"
                style={{ fontFamily: "Poppins, sans-serif" }}
              >
                {numVal}
              </span>
              <button
                onClick={() => setNumVal(Math.min(25, numVal + 1))}
                className="w-12 h-12 rounded-full border-2 border-gray-200 text-xl font-700 hover:border-[#0066CC] hover:text-[#0066CC] transition-colors"
              >
                +
              </button>
              <span className="text-gray-500 text-sm">{t.medications}</span>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <button
              onClick={speakQuestion}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${speaking ? "bg-[#0066CC] animate-pulse shadow-md" : "bg-gray-100 hover:bg-blue-50 hover:text-[#0066CC]"}`}
              title={speaking ? "Stop reading" : "Read question aloud"}
            >
              {speaking ? "🔇" : "🔊"}
            </button>
            <button
              className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm"
              title="Voice answer"
            >
              🎤
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <SecondaryBtn
            onClick={() => setQIdx(Math.max(0, qIdx - 1))}
            className={qIdx === 0 ? "opacity-30 pointer-events-none" : ""}
          >
            {t.prevBtn}
          </SecondaryBtn>
          <SecondaryBtn onClick={handleNext} className="text-gray-400">
            {t.skipBtn}
          </SecondaryBtn>
          <PrimaryBtn onClick={handleNext}>
            {qIdx === QUESTIONS.length - 1 ? t.finishBtn : t.nextBtn}
          </PrimaryBtn>
        </div>

        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
          <span className="text-[#10B981]">●</span> {t.autoSave}
        </p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 6: DOCUMENT SCANNING
// ──────────────────────────────────────────────
// DOCS demo data removed — DocumentsPage uses real upload + AI OCR state

interface UploadedDoc {
  id: string
  name: string
  ext: string
  size: string
  url: string
  isImage: boolean
  uploadedAt: string
}

type ProcessingStatus = "idle" | "scanning" | "extracting" | "organizing" | "done" | "error"

interface DocState {
  status: ProcessingStatus
  stage?: string
  result?: MedicalProcessingResult
  error?: string
  // editable confirmed copy of extracted data
  confirmed?: MedicalExtractedData
  editMode?: boolean
}

const STAGE_LABELS: Record<ProcessingStatus, string> = {
  idle: "",
  scanning: "Scanning document…",
  extracting: "Extracting medical information…",
  organizing: "Organizing clinical data…",
  done: "Done",
  error: "Error",
}

function SpinnerIcon() {
  return (
    <svg className="animate-spin w-3 h-3 text-[#0066CC]" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
    </svg>
  )
}

function DocumentsPage({ onNavigate, lang, light, patient, onDocsComplete }: { onNavigate: (p: Page) => void; lang: LangCode; light: boolean; patient: PatientData | null; onDocsComplete?: (data: IntakeSession["docData"]) => void }) {
  const t = useT(lang)
  const [dragging, setDragging] = useState(false)
  const [docs, setDocs] = useState<UploadedDoc[]>([])
  const [docStates, setDocStates] = useState<Record<string, DocState>>({})
  const [previewDoc, setPreviewDoc] = useState<UploadedDoc | null>(null)
  const [expanded, setExpanded] = useState<string[]>(["labs", "medications", "allergies", "prescriptions"])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)

  const fmtSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const fmtTime = (d: Date) =>
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })

  const setDocState = (id: string, patch: Partial<DocState>) =>
    setDocStates((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }))

  const runOCRPipeline = async (docId: string, file: File) => {
    // Stage 1
    setDocState(docId, { status: "scanning", stage: STAGE_LABELS.scanning })
    await new Promise((r) => setTimeout(r, 600))

    // Stage 2
    setDocState(docId, { status: "extracting", stage: STAGE_LABELS.extracting })

    let result: MedicalProcessingResult
    try {
      result = await processMedicalDocument(file)
    } catch {
      setDocState(docId, {
        status: "error",
        error: "AI service unavailable. Please ensure the backend is running.",
      })
      return
    }

    // Stage 3
    setDocState(docId, { status: "organizing", stage: STAGE_LABELS.organizing })
    await new Promise((r) => setTimeout(r, 400))

    if (!result.success) {
      setDocState(docId, {
        status: "error",
        error: result.message ?? "Processing failed. Please try again.",
        result,
      })
      return
    }

    setDocState(docId, {
      status: "done",
      result,
      confirmed: result.extractedData ? { ...result.extractedData } : undefined,
    })
  }

  const processFiles = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const ext = file.name.split(".").pop()?.toUpperCase() ?? "FILE"
      const isImage = file.type.startsWith("image/")
      const url = URL.createObjectURL(file)
      const doc: UploadedDoc = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        ext,
        size: fmtSize(file.size),
        url,
        isImage,
        uploadedAt: fmtTime(new Date()),
      }
      setDocs((prev) => [doc, ...prev])
      setDocStates((prev) => ({ ...prev, [doc.id]: { status: "idle" } }))
      void runOCRPipeline(doc.id, file)
    })
  }

  const retryDoc = (doc: UploadedDoc) => {
    // Re-fetch the file from its object URL as a Blob to retry
    fetch(doc.url)
      .then((r) => r.blob())
      .then((blob) => {
        const file = new File([blob], doc.name, { type: blob.type })
        void runOCRPipeline(doc.id, file)
      })
      .catch(() => {
        setDocState(doc.id, { status: "error", error: "Could not re-read file for retry." })
      })
  }

  const removeDoc = (id: string) => {
    setDocs((prev) => {
      const doc = prev.find((d) => d.id === id)
      if (doc) URL.revokeObjectURL(doc.url)
      return prev.filter((d) => d.id !== id)
    })
    setDocStates((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const toggleSection = (s: string) =>
    setExpanded((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s])

  // Aggregate extracted data from all done docs
  const allDone = docs.map((d) => docStates[d.id]).filter((s) => s?.status === "done" && s.confirmed)

  const labTests = allDone.flatMap((s) => s.confirmed?.tests ?? [])
  const medications = [...new Set(allDone.flatMap((s) => s.confirmed?.medications ?? []))]
  const allergies = [...new Set(allDone.flatMap((s) => s.confirmed?.allergies ?? []))]
  const prescriptions = allDone
    .filter((s) => s.result?.documentType === "prescription")
    .map((_, i) => {
      const d = docs[i]
      return d?.name ?? "Prescription"
    })

  const anyProcessing = docs.some((d) => {
    const s = docStates[d.id]?.status
    return s === "scanning" || s === "extracting" || s === "organizing"
  })

  const clinicalSections = [
    {
      id: "labs",
      label: "🧪 Lab Reports",
      color: "orange" as const,
      empty: "No lab values found in uploaded documents.",
      content: labTests.length > 0 ? (
        <div className="space-y-1.5">
          {labTests.map((test, i) => (
            <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-2.5 py-1.5">
              <span className="font-600 text-gray-700 flex-1 truncate">{test.name}</span>
              <span className="text-gray-500 ml-2 shrink-0">
                {[test.value, test.unit].filter(Boolean).join(" ")}
                {test.referenceRange ? <span className="text-gray-400 ml-1">({test.referenceRange})</span> : null}
              </span>
            </div>
          ))}
        </div>
      ) : null,
    },
    {
      id: "medications",
      label: "💊 Medications",
      color: "teal" as const,
      empty: "No medications found in uploaded documents.",
      content: medications.length > 0 ? (
        <div className="space-y-1">
          {medications.map((med) => (
            <p key={med} className="text-xs pl-2 border-l-2 border-teal-200 text-gray-700">{med}</p>
          ))}
        </div>
      ) : null,
    },
    {
      id: "allergies",
      label: "⚠️ Allergies",
      color: "orange" as const,
      empty: "No allergies found in uploaded documents.",
      content: allergies.length > 0 ? (
        <div className="space-y-1">
          {allergies.map((allergy) => (
            <p key={allergy} className="text-xs pl-2 border-l-2 border-orange-200 text-orange-700">{allergy}</p>
          ))}
        </div>
      ) : null,
    },
    {
      id: "prescriptions",
      label: "📋 Prescriptions",
      color: "blue" as const,
      empty: "No prescriptions identified in uploaded documents.",
      content: prescriptions.length > 0 ? (
        <div className="space-y-1">
          {prescriptions.map((rx) => (
            <p key={rx} className="text-xs pl-2 border-l-2 border-blue-200 text-gray-700">{rx}</p>
          ))}
        </div>
      ) : null,
    },
  ]

  return (
    <div
      className="min-h-screen"
      style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}
    >
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.docx,.doc" className="hidden" onChange={(e) => e.target.files && processFiles(e.target.files)} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => e.target.files && processFiles(e.target.files)} />
      <input ref={galleryInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => e.target.files && processFiles(e.target.files)} />

      <TopNav onNavigate={onNavigate} patientName={patient?.full_name} />
      <div className="pt-16 flex flex-col lg:flex-row gap-0">
        {/* Left */}
        <div className="flex-1 p-4 sm:p-6 border-b lg:border-b-0 lg:border-r border-gray-100">
          <div className="max-w-lg mx-auto">
            <h2 style={{ fontFamily: "Poppins, sans-serif" }} className="text-xl font-700 text-gray-900 mb-1">
              {t.uploadTitle}
            </h2>
            {patient && (
              <p className="text-sm text-gray-500 mt-1">
                Patient: <span className="font-600 text-gray-700">{patient.full_name}</span> · ID: <span className="font-mono text-[#0066CC]">{patient.patient_id}</span>
              </p>
            )}
            <p className="text-sm text-gray-500 mb-5">
              चिकित्सा दस्तावेज़ अपलोड करें — prescriptions, lab reports, discharge summaries
            </p>

            {/* Upload Buttons */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: "📷", id: "capture", label: t.captureNow, sub: "Use camera", color: "from-[#00897B] to-[#0066CC]", primary: true, onClick: () => cameraInputRef.current?.click() },
                { icon: "📁", id: "upload", label: t.uploadFiles, sub: "Browse storage", color: "from-gray-100 to-gray-50", primary: false, onClick: () => fileInputRef.current?.click() },
                { icon: "🖼️", id: "gallery", label: t.photoGallery, sub: "Select image", color: "from-gray-100 to-gray-50", primary: false, onClick: () => galleryInputRef.current?.click() },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={btn.onClick}
                  className={`aspect-square rounded-2xl bg-gradient-to-br ${btn.color} flex flex-col items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 border ${btn.primary ? "border-transparent" : "border-gray-200"}`}
                >
                  <span className="text-3xl">{btn.icon}</span>
                  <span style={{ fontFamily: "Poppins, sans-serif" }} className={`font-600 text-sm ${btn.primary ? "text-white" : "text-gray-700"}`}>{btn.label}</span>
                  <span className={`text-xs ${btn.primary ? "text-white/70" : "text-gray-400"}`}>{btn.sub}</span>
                </button>
              ))}
            </div>

            {/* Drag Zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); if (e.dataTransfer.files.length) processFiles(e.dataTransfer.files) }}
              onClick={() => fileInputRef.current?.click()}
              className={`h-44 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer mb-5 ${
                dragging ? "border-[#0066CC] bg-blue-50 scale-[1.01]" : "border-gray-200 hover:border-[#0066CC] bg-gray-50 hover:bg-blue-50/30"
              }`}
            >
              <div className="flex gap-2 text-3xl">📄 📸 📋</div>
              <p style={{ fontFamily: "Poppins, sans-serif" }} className="font-600 text-gray-600">{t.dragDocs}</p>
              <p className="text-xs text-gray-400">{dragging ? "Release to upload" : t.tapBrowse}</p>
              <Badge text="PDF · JPG · PNG · DOCX" color="gray" />
            </div>

            {/* Tips */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-amber-700 mb-2">💡 Tips for Best Results</p>
              <ul className="space-y-1 text-xs text-amber-800">
                {["Flat, well-lit documents", "Face document straight to camera", "No glare or shadows", "Entire document visible in frame"].map((tip) => (
                  <li key={tip} className="flex items-center gap-2"><span className="text-[#10B981]">✓</span>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Right panel */}
        <div className="w-full lg:w-96 bg-white p-4 sm:p-6 pb-28 lg:overflow-y-auto lg:sticky lg:top-16 lg:max-h-[calc(100vh-64px)]">

          {/* Uploaded Docs */}
          <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-gray-500 uppercase tracking-wide mb-3">
            {t.uploadedDocs} ({docs.length})
          </p>

          {docs.length === 0 ? (
            <div className="border-2 border-dashed border-gray-100 rounded-xl p-6 flex flex-col items-center gap-2 mb-5 text-center">
              <span className="text-3xl">📂</span>
              <p className="text-xs text-gray-400">No documents uploaded yet.<br />Use the buttons or drag & drop.</p>
            </div>
          ) : (
            <div className="space-y-2 mb-5">
              {docs.map((doc) => {
                const ds = docStates[doc.id] ?? { status: "idle" }
                const isProcessing = ds.status === "scanning" || ds.status === "extracting" || ds.status === "organizing"
                return (
                  <div key={doc.id} className={`border rounded-xl p-3 transition-colors ${ds.status === "error" ? "border-red-100 bg-red-50/30" : "border-gray-100 hover:border-gray-200"}`}>
                    <div className="flex items-start gap-3">
                      {doc.isImage ? (
                        <img src={doc.url} alt={doc.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0 border border-gray-100" />
                      ) : (
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xs font-700 flex-shrink-0 ${doc.ext === "PDF" ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}>
                          {doc.ext.slice(0, 4)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-600 text-gray-800 truncate">{doc.name}</p>
                        <p className="text-xs text-gray-400">{doc.uploadedAt} · {doc.size}</p>
                        {isProcessing && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <SpinnerIcon />
                            <span className="text-[10px] text-[#0066CC]">{ds.stage}</span>
                          </div>
                        )}
                        {ds.status === "done" && <Badge text="AI Extracted" color="green" />}
                        {ds.status === "error" && (
                          <div className="mt-1">
                            <span className="text-[10px] text-red-500">{ds.error?.slice(0, 60)}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {ds.status === "error" && (
                          <button
                            onClick={() => retryDoc(doc)}
                            className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs hover:bg-amber-100 transition-colors"
                            title="Retry"
                          >↺</button>
                        )}
                        <button onClick={() => setPreviewDoc(doc)} className="w-7 h-7 rounded-lg bg-blue-50 text-[#0066CC] flex items-center justify-center text-xs hover:bg-blue-100 transition-colors" title="Preview">👁</button>
                        <button onClick={() => removeDoc(doc.id)} className="w-7 h-7 rounded-lg bg-red-50 text-red-500 flex items-center justify-center text-xs hover:bg-red-100 transition-colors" title="Remove">✕</button>
                      </div>
                    </div>
                    {/* Warnings */}
                    {ds.status === "done" && ds.result?.warnings && ds.result.warnings.length > 0 && (
                      <div className="mt-2 px-2 py-1.5 bg-amber-50 rounded-lg">
                        {ds.result.warnings.map((w, i) => (
                          <p key={i} className="text-[10px] text-amber-700">⚠ {w}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* AI service unavailable notice */}
          {docs.some((d) => {
            const err = docStates[d.id]?.error ?? ""
            const msg = docStates[d.id]?.result?.message ?? ""
            return err || msg.includes("502") || msg.includes("503") || msg.includes("backend") || msg.includes("network")
          }) && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
              <p className="text-xs font-600 text-red-700 mb-0.5">⚠ AI Service Unavailable</p>
              <p className="text-[10px] text-red-600 leading-4">
                The OCR backend is not running.<br />
                Open a terminal and run:<br />
                <span className="font-mono bg-red-100 px-1 rounded">cd backend && bash start.sh</span>
              </p>
            </div>
          )}

          {/* Extracted Clinical Data */}
          <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-gray-500 uppercase tracking-wide mb-3">
            {t.extractedData}
          </p>

          {anyProcessing && (
            <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-blue-50 rounded-xl border border-blue-100">
              <SpinnerIcon />
              <span className="text-xs text-[#0066CC]">AI is reading your documents…</span>
            </div>
          )}

          {clinicalSections.map((section) => {
            const hasData = section.content !== null
            return (
              <div key={section.id} className="border border-gray-100 rounded-xl mb-2 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-xs font-600 text-gray-700">{section.label}</span>
                  <div className="flex items-center gap-2">
                    {hasData && (
                      <Badge
                        text={
                          section.id === "labs" ? String(labTests.length) :
                          section.id === "medications" ? String(medications.length) :
                          section.id === "allergies" ? String(allergies.length) :
                          String(prescriptions.length)
                        }
                        color={section.color}
                      />
                    )}
                    <div className={`w-3 h-3 text-gray-400 transition-transform ${expanded.includes(section.id) ? "rotate-180" : ""}`}>
                      <Icon.ChevronDown />
                    </div>
                  </div>
                </button>
                {expanded.includes(section.id) && (
                  <div className="px-3 pb-3">
                    {hasData ? section.content : (
                      <p className="text-[10px] text-gray-400 italic">{section.empty}</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}

          {docs.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mt-3">
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                ✅ {docs.length} document{docs.length > 1 ? "s" : ""} saved this session
              </span>
            </div>
          )}

          <PrimaryBtn
            onClick={() => {
              const doneStates = docs.map((d) => docStates[d.id]).filter((s) => s?.status === "done" && s.confirmed)
              const avgConf = doneStates.length
                ? doneStates.reduce((acc, s) => acc + (s.result?.confidence ?? 0), 0) / doneStates.length
                : 0
              onDocsComplete?.({
                labTests: doneStates.flatMap((s) => s.confirmed?.tests ?? []),
                medications: [...new Set(doneStates.flatMap((s) => s.confirmed?.medications ?? []))],
                allergies: [...new Set(doneStates.flatMap((s) => s.confirmed?.allergies ?? []))],
                prescriptions: doneStates.filter((s) => s.result?.documentType === "prescription").map((_, i) => docs[i]?.name ?? "Prescription"),
                docCount: docs.length,
                processedCount: doneStates.length,
                avgConfidence: Math.round(avgConf * 100),
              })
              onNavigate("summary")
            }}
            className="w-full mt-4"
          >
            {t.continueToSummary}{" "}
            <div className="w-4 h-4"><Icon.ChevronRight /></div>
          </PrimaryBtn>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setPreviewDoc(null)}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div>
                <p style={{ fontFamily: "Poppins, sans-serif" }} className="font-700 text-gray-900 text-sm truncate max-w-xs">{previewDoc.name}</p>
                <p className="text-xs text-gray-400">{previewDoc.size} · Uploaded at {previewDoc.uploadedAt}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 text-sm">✕</button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-50 p-4">
              {previewDoc.isImage ? (
                <img src={previewDoc.url} alt={previewDoc.name} className="max-w-full max-h-[70vh] rounded-xl object-contain shadow" />
              ) : (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center text-2xl font-700 text-red-600">{previewDoc.ext}</div>
                  <p className="text-sm text-gray-600 text-center">Preview not available for this file type.</p>
                  <a href={previewDoc.url} download={previewDoc.name} className="text-xs text-[#0066CC] underline">Download file</a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 7: CLINICAL SUMMARY
// ──────────────────────────────────────────────
function SummaryPage({ onNavigate, lang, light, patient, hospitalName, intakeSession }: {
  onNavigate: (p: Page) => void
  lang: LangCode
  light: boolean
  patient: PatientData | null
  hospitalName?: string
  intakeSession?: IntakeSession
}) {
  const t = useT(lang)
  const session = intakeSession ?? EMPTY_SESSION
  const { voiceEntities: ve, voiceDuration, voiceConfidence, questionAnswers: qa, docData: dd } = session

  const sessionTime = useRef(new Date())
  const fmtDate = (d: Date) =>
    d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
  const generatedLabel = fmtDate(sessionTime.current)

  // ── Derived data from voice ──
  const chiefComplaint = ve?.chiefComplaint || null
  const symptoms = ve?.symptoms ?? []
  const voiceMeds = ve?.medications ?? []
  const voiceAllergies = ve?.allergies ?? []
  const familyHistory = ve?.familyHistory ?? []
  const vitals = ve?.vitals ?? []
  const duration = ve?.duration && ve.duration !== "Not specified" ? ve.duration : null
  const severity = ve?.severity && ve.severity !== "Not mentioned" ? ve.severity : null

  // ── Q answers mapped to readable strings ──
  const q1 = qa[1] as string | undefined   // yesno: diabetes/BP
  const q2 = qa[2] as string[] | undefined  // multi: conditions
  const q3 = qa[3] as number | undefined    // slider: pain 1-10
  const q4 = qa[4] as number | undefined    // number: medication count
  const q5 = qa[5] as string | undefined    // yesno: family heart disease

  // ── Merged medications & allergies (voice + doc) ──
  const allMeds = [...new Set([...voiceMeds, ...dd.medications])].filter(Boolean)
  const allAllergies = [...new Set([...voiceAllergies, ...dd.allergies])].filter(Boolean)

  // ── Past medical history from Q2 ──
  const diagnosedConditions = (q2 ?? []).filter((c) => c !== "None of these")

  // ── Completeness score ──
  const scores = [
    chiefComplaint ? 25 : 0,
    symptoms.length ? 20 : 0,
    diagnosedConditions.length > 0 || q1 ? 20 : 0,
    allMeds.length || q4 ? 15 : 0,
    dd.labTests.length ? 20 : 0,
  ]
  const completeness = scores.reduce((a, b) => a + b, 0)

  // ── Red flags (computed from actual data) ──
  const redFlags: string[] = []
  if (severity && parseInt(severity) >= 7) redFlags.push(`Reported pain level ${severity}/10 — requires clinical review`)
  if (q1 === "Yes") redFlags.push("Patient has diagnosed diabetes or hypertension — verify current control")
  if (q5 === "Yes") redFlags.push("Family history of heart disease — assess cardiovascular risk")
  if (symptoms.some((s) => ["chest", "palpitation", "breathlessness", "shortness of breath"].includes(s)))
    redFlags.push("Chest/cardiac symptoms reported — priority clinical correlation advised")
  if (dd.labTests.some((t) => t.value && /high|above|elevated|\*/i.test(String(t.value))))
    redFlags.push("Abnormal lab values detected in uploaded reports — review required")

  const hasAnyData = chiefComplaint || symptoms.length || diagnosedConditions.length || allMeds.length || dd.labTests.length

  return (
    <div
      className="min-h-screen"
      style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}
    >
      <TopNav onNavigate={onNavigate} patientName={patient?.full_name} />
      <div className="pt-16 pb-28 max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#10B981] rounded-full animate-pulse" />
            <Badge text={hasAnyData ? "Summary Ready" : "Incomplete"} color={hasAnyData ? "green" : "orange"} />
            <span className="text-xs text-gray-400">Generated {generatedLabel}</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SecondaryBtn onClick={() => {}} className="text-xs h-9 px-4">
              <div className="w-3.5 h-3.5"><Icon.Download /></div> PDF
            </SecondaryBtn>
            <SecondaryBtn onClick={() => {}} className="text-xs h-9 px-4">
              <div className="w-3.5 h-3.5"><Icon.Share /></div> ABHA
            </SecondaryBtn>
            <button
              onClick={() => onNavigate("consent")}
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="h-9 px-4 bg-[#F97316] hover:bg-orange-600 text-white text-xs font-600 rounded-xl transition-colors"
            >
              Review Consent →
            </button>
          </div>
        </div>

        {!hasAnyData && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <span className="text-xl">💡</span>
            <div>
              <p className="text-sm font-600 text-amber-800">No intake data recorded yet</p>
              <p className="text-xs text-amber-700 mt-0.5">
                Go back and complete the Voice session, answer the Questions, and upload Documents — this report will populate with your real health information.
              </p>
            </div>
          </div>
        )}

        {/* Document Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">

          {/* Header band */}
          <div className="bg-[#0066CC] text-white px-6 sm:px-8 py-5">
            <p className="text-center font-mono text-xs tracking-widest text-white/60 mb-1">
              CLINICAL HISTORY SUMMARY — PATIENT GENERATED
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 font-mono text-xs text-white/80 border-t border-white/20 pt-3 mt-3">
              <span>Patient ID: {patient?.patient_id ?? "—"}</span>
              <span>Name: {patient?.full_name ?? "—"}</span>
              <span>Age: {patient?.age ?? "—"}</span>
              <span>Gender: {patient?.gender ?? "—"}</span>
              <span>Generated: {generatedLabel}</span>
              {voiceDuration && <span>Voice Duration: {voiceDuration}</span>}
              {hospitalName && <span className="col-span-2">Hospital: {hospitalName}</span>}
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-6">

            {/* Data quality tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                {
                  label: "Voice Session",
                  value: voiceDuration || (ve ? "Done" : "—"),
                  sub: ve ? `${Math.round(voiceConfidence * 100) || "~90"}% confidence` : "Not recorded",
                  ok: !!ve,
                },
                {
                  label: "Questions",
                  value: session.questionsAnswered > 0 ? `${session.questionsAnswered}/${QUESTIONS.length}` : "—",
                  sub: session.questionsAnswered === QUESTIONS.length ? "All answered" : session.questionsAnswered > 0 ? "Partial" : "Not answered",
                  ok: session.questionsAnswered > 0,
                },
                {
                  label: "Documents",
                  value: dd.docCount > 0 ? `${dd.processedCount}/${dd.docCount}` : "—",
                  sub: dd.docCount > 0 ? `${dd.avgConfidence || "—"}% avg OCR` : "No uploads",
                  ok: dd.docCount > 0,
                },
                {
                  label: "Completeness",
                  value: `${completeness}/100`,
                  sub: completeness >= 80 ? "Excellent" : completeness >= 50 ? "Good" : completeness > 0 ? "Partial" : "Incomplete",
                  ok: completeness >= 50,
                },
              ].map((m) => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-400 mb-0.5">{m.label}</p>
                  <p style={{ fontFamily: "Poppins, sans-serif" }} className={`text-lg font-700 ${m.ok ? "text-[#0066CC]" : "text-gray-300"}`}>
                    {m.value}
                  </p>
                  <p className={`text-xs font-500 ${m.ok ? "text-[#10B981]" : "text-gray-400"}`}>{m.sub}</p>
                </div>
              ))}
            </div>

            {/* ── Section 1: Chief Complaint ── */}
            <SummarySection number="1" title="Chief Complaint" titleHi="मुख्य शिकायत">
              <div className="space-y-2">
                <p className="text-sm text-gray-800">
                  {chiefComplaint ?? <span className="text-gray-400 italic">No data — complete the Voice session to capture chief complaint.</span>}
                </p>
                <div className="flex gap-2 text-xs">
                  <span className="font-600 text-gray-500 w-20 flex-shrink-0">Duration:</span>
                  <span className="text-gray-700">{duration ?? <span className="text-gray-400">No data</span>}</span>
                </div>
                <div className="flex gap-2 text-xs">
                  <span className="font-600 text-gray-500 w-20 flex-shrink-0">Symptoms:</span>
                  {symptoms.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {symptoms.map((s) => (
                        <span key={s} className="px-2 py-0.5 bg-blue-50 text-[#0066CC] rounded-full border border-blue-100 capitalize">{s}</span>
                      ))}
                    </div>
                  ) : <span className="text-gray-400">No data</span>}
                </div>
              </div>
            </SummarySection>

            {/* ── Section 2: History of Present Illness (SOCRATES) ── */}
            <SummarySection number="2" title="History of Present Illness" titleHi="वर्तमान बीमारी का इतिहास">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {([
                  ["Chief Complaint", chiefComplaint || null],
                  ["Onset / Duration", duration || null],
                  ["Severity", severity ? `${severity}/10` : q3 != null ? `${q3}/10 (pain scale)` : null],
                  ["Associated Symptoms", symptoms.length ? symptoms.slice(0, 4).join(", ") : null],
                  ["Radiation", null],
                  ["Timing / Pattern", null],
                  ["Exacerbating Factors", null],
                  ["Relieving Factors", null],
                  ["Medications Mentioned", voiceMeds.length ? voiceMeds.join(", ") : null],
                  ["Vitals Reported", vitals.length ? vitals.join("; ") : null],
                  ["Family History", familyHistory.length ? familyHistory.join("; ") : q5 === "Yes" ? "Heart disease in immediate family" : null],
                  ["Allergies Noted", voiceAllergies.length ? voiceAllergies.join(", ") : null],
                ] as [string, string | null][]).map(([k, v]) => (
                  <div key={k} className="flex gap-2">
                    <span className="font-600 text-gray-500 w-36 flex-shrink-0 text-xs">{k}:</span>
                    <span className={`text-xs ${v ? "text-gray-800" : "text-gray-400"}`}>{v ?? "No data"}</span>
                  </div>
                ))}
              </div>
            </SummarySection>

            {/* ── Section 3: Past Medical History ── */}
            <SummarySection number="3" title="Past Medical History" titleHi="पिछली चिकित्सा इतिहास">
              {(diagnosedConditions.length > 0 || q1 === "Yes") ? (
                <ul className="space-y-1.5">
                  {q1 === "Yes" && (
                    <li className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0066CC] mt-0.5">●</span>
                      Diabetes or Hypertension (patient confirmed)
                    </li>
                  )}
                  {diagnosedConditions.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-[#0066CC] mt-0.5">●</span>
                      {c}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-400">No data — answer the clinical questions to capture past medical history.</p>
              )}
            </SummarySection>

            {/* ── Section 4: Medications & Allergies ── */}
            <SummarySection number="4" title="Medications & Allergies" titleHi="दवाएं और एलर्जी">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <p className="text-xs font-700 text-gray-500 mb-2 uppercase tracking-wide">Current Medications</p>
                  {allMeds.length > 0 ? (
                    <ul className="space-y-1">
                      {allMeds.map((med) => (
                        <li key={med} className="flex items-center gap-2 text-sm text-gray-700">
                          <div className="w-3.5 h-3.5 text-[#10B981]"><Icon.Pill /></div>
                          {med}
                        </li>
                      ))}
                    </ul>
                  ) : q4 != null ? (
                    <p className="text-sm text-gray-600">
                      Patient takes <span className="font-700 text-[#0066CC]">{q4}</span> medication{q4 !== 1 ? "s" : ""}.
                      <br /><span className="text-xs text-gray-400">Names not captured — ask during consultation.</span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">No data</p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-700 text-gray-500 mb-2 uppercase tracking-wide">Allergies</p>
                  {allAllergies.length > 0 ? (
                    <div className="space-y-1.5">
                      {allAllergies.map((a) => (
                        <div key={a} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                          <span className="text-red-500">🔴</span>
                          <span className="text-sm font-600 text-red-700 uppercase">{a}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">No data</p>
                  )}
                </div>
              </div>
            </SummarySection>

            {/* ── Section 5: Prior Investigations ── */}
            <SummarySection number="5" title="Prior Investigations" titleHi="पिछली जांचें">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {["Date", "Test", "Result", "Status", "Reference Range"].map((h) => (
                        <th key={h} className="text-left py-2 px-3 text-gray-500 font-600">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dd.labTests.length > 0 ? dd.labTests.map((row, i) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                        <td className="py-2 px-3 font-mono text-gray-500">—</td>
                        <td className="py-2 px-3 font-600 text-gray-800">{row.name}</td>
                        <td className="py-2 px-3 font-mono font-600 text-gray-700">{row.value ?? "—"}</td>
                        <td className="py-2 px-3">
                          <Badge text="OCR" color="blue" />
                        </td>
                        <td className="py-2 px-3 text-gray-400 font-mono">{row.referenceRange ?? "—"}</td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan={5} className="py-4 px-3 text-center text-gray-400">
                          No data — upload lab reports on the Documents step to populate this table.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {dd.docCount > 0 && dd.labTests.length > 0 && (
                  <p className="text-[10px] text-gray-400 mt-2 pl-3">
                    Extracted from {dd.processedCount} of {dd.docCount} uploaded document{dd.docCount > 1 ? "s" : ""} via AI OCR.
                  </p>
                )}
              </div>
            </SummarySection>

            {/* ── Physician Attention Required — always visible ── */}
            <div className={`rounded-2xl p-4 border ${redFlags.length > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}>
              <div style={{ fontFamily: "Poppins, sans-serif" }} className={`text-sm font-700 flex items-center gap-2 mb-2 ${redFlags.length > 0 ? "text-red-700" : "text-gray-500"}`}>
                <div className="w-4 h-4"><Icon.Alert /></div>
                Physician Attention Required
              </div>
              {redFlags.length > 0 ? (
                <ul className="space-y-1">
                  {redFlags.map((flag) => (
                    <li key={flag} className="text-xs text-red-600">⚠️ {flag}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">No data — flags will appear automatically based on reported symptoms, lab values, and medical history.</p>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-xl p-3">
              <p className="text-[10px] text-gray-400 text-center">
                🔐 Encrypted · ABDM compliant · AI-assisted summary — not a substitute for clinical diagnosis
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <SecondaryBtn onClick={() => onNavigate("documents")}>
            ← Back & Edit
          </SecondaryBtn>
          <PrimaryBtn onClick={() => onNavigate("consent")}>
            {t.continueConsent} →
          </PrimaryBtn>
        </div>
      </div>
    </div>
  )
}

function SummarySection({
  number,
  title,
  titleHi,
  children,
}: {
  number: string
  title: string
  titleHi: string
  children: React.ReactNode
}) {
  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <span
          style={{ fontFamily: "Poppins, sans-serif" }}
          className="text-xs font-700 text-gray-400 w-5"
        >
          {number}.
        </span>
        <h3
          style={{ fontFamily: "Poppins, sans-serif" }}
          className="font-700 text-gray-900"
        >
          {title}
        </h3>
        <span className="text-xs text-gray-400">| {titleHi}</span>
      </div>
      <div className="pl-8">{children}</div>
    </div>
  )
}

// ──────────────────────────────────────────────
// CLINICAL REPORT — reusable inline card
// Used by SummaryPage and Past History cards
// ──────────────────────────────────────────────
function ClinicalReportInline({
  intakeSession,
  patientName,
  patientId,
  patientAge,
  patientGender,
  hospitalName,
  generatedAt,
}: {
  intakeSession: IntakeSession
  patientName?: string | null
  patientId?: string | null
  patientAge?: number | null
  patientGender?: string | null
  hospitalName?: string
  generatedAt?: string
}) {
  const s = intakeSession
  const ve = s.voiceEntities
  const dd = s.docData
  const qa = s.questionAnswers

  const chiefComplaint = ve?.chiefComplaint || null
  const symptoms = ve?.symptoms ?? []
  const voiceMeds = ve?.medications ?? []
  const voiceAllergies = ve?.allergies ?? []
  const familyHistory = ve?.familyHistory ?? []
  const vitals = ve?.vitals ?? []
  const duration = ve?.duration && ve.duration !== "Not specified" ? ve.duration : null
  const severity = ve?.severity && ve.severity !== "Not mentioned" ? ve.severity : null

  const q1 = qa[1] as string | undefined
  const q2 = qa[2] as string[] | undefined
  const q3 = qa[3] as number | undefined
  const q4 = qa[4] as number | undefined
  const q5 = qa[5] as string | undefined

  const allMeds = [...new Set([...voiceMeds, ...dd.medications])].filter(Boolean)
  const allAllergies = [...new Set([...voiceAllergies, ...dd.allergies])].filter(Boolean)
  const diagnosedConditions = (q2 ?? []).filter((c) => c !== "None of these")

  const scores = [
    chiefComplaint ? 25 : 0,
    symptoms.length ? 20 : 0,
    diagnosedConditions.length > 0 || q1 ? 20 : 0,
    allMeds.length || q4 ? 15 : 0,
    dd.labTests.length ? 20 : 0,
  ]
  const completeness = scores.reduce((a, b) => a + b, 0)

  const redFlags: string[] = []
  if (severity && parseInt(severity) >= 7) redFlags.push(`Reported pain level ${severity}/10 — requires clinical review`)
  if (q1 === "Yes") redFlags.push("Patient has diagnosed diabetes or hypertension — verify current control")
  if (q5 === "Yes") redFlags.push("Family history of heart disease — assess cardiovascular risk")
  if (symptoms.some((sym) => ["chest", "palpitation", "breathlessness", "shortness of breath"].includes(sym)))
    redFlags.push("Chest/cardiac symptoms reported — priority clinical correlation advised")
  if (dd.labTests.some((t) => t.value && /high|above|elevated|\*/i.test(String(t.value))))
    redFlags.push("Abnormal lab values detected in uploaded reports — review required")

  const dateLabel = generatedAt
    ? new Date(generatedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })
    : new Date().toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true })

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden text-sm">
      {/* Header band */}
      <div className="bg-[#0066CC] text-white px-5 py-4">
        <p className="text-center font-mono text-[10px] tracking-widest text-white/60 mb-2 uppercase">
          Clinical History Summary — Patient Generated
        </p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 font-mono text-[11px] text-white/80 border-t border-white/20 pt-3">
          <span>Patient ID: {patientId ?? "—"}</span>
          <span>Name: {patientName ?? "—"}</span>
          <span>Age: {patientAge ?? "—"}</span>
          <span>Gender: {patientGender ?? "—"}</span>
          <span className="col-span-2">Generated: {dateLabel}</span>
          {s.voiceDuration && <span className="col-span-2">Voice Duration: {s.voiceDuration}</span>}
          {hospitalName && <span className="col-span-2">Hospital: {hospitalName}</span>}
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Data quality tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Voice Session", value: s.voiceDuration || (ve ? "Done" : "—"), sub: ve ? `${Math.round(s.voiceConfidence * 100) || "~90"}% confidence` : "Not recorded", ok: !!ve },
            { label: "Questions", value: s.questionsAnswered > 0 ? `${s.questionsAnswered}/${QUESTIONS.length}` : "—", sub: s.questionsAnswered === QUESTIONS.length ? "All answered" : s.questionsAnswered > 0 ? "Partial" : "Not answered", ok: s.questionsAnswered > 0 },
            { label: "Documents", value: dd.docCount > 0 ? `${dd.processedCount}/${dd.docCount}` : "—", sub: dd.docCount > 0 ? `${dd.avgConfidence || "—"}% avg OCR` : "No uploads", ok: dd.docCount > 0 },
            { label: "Completeness", value: `${completeness}/100`, sub: completeness >= 80 ? "Excellent" : completeness >= 50 ? "Good" : completeness > 0 ? "Partial" : "Incomplete", ok: completeness >= 50 },
          ].map((m) => (
            <div key={m.label} className="bg-gray-50 rounded-xl p-2.5 text-center">
              <p className="text-[10px] text-gray-400 mb-0.5">{m.label}</p>
              <p style={{ fontFamily: "Poppins, sans-serif" }} className={`text-base font-700 ${m.ok ? "text-[#0066CC]" : "text-gray-300"}`}>{m.value}</p>
              <p className={`text-[10px] font-500 ${m.ok ? "text-[#10B981]" : "text-gray-400"}`}>{m.sub}</p>
            </div>
          ))}
        </div>

        {/* Section 1: Chief Complaint */}
        <SummarySection number="1" title="Chief Complaint" titleHi="मुख्य शिकायत">
          <div className="space-y-1.5">
            <p className="text-xs text-gray-800">{chiefComplaint ?? <span className="text-gray-400 italic">No data</span>}</p>
            <div className="flex gap-2 text-xs">
              <span className="font-600 text-gray-500 w-20 flex-shrink-0">Duration:</span>
              <span className="text-gray-700">{duration ?? <span className="text-gray-400">No data</span>}</span>
            </div>
            <div className="flex gap-2 text-xs">
              <span className="font-600 text-gray-500 w-20 flex-shrink-0">Symptoms:</span>
              {symptoms.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {symptoms.map((sym) => (
                    <span key={sym} className="px-2 py-0.5 bg-blue-50 text-[#0066CC] rounded-full border border-blue-100 capitalize text-[10px]">{sym}</span>
                  ))}
                </div>
              ) : <span className="text-gray-400 text-xs">No data</span>}
            </div>
          </div>
        </SummarySection>

        {/* Section 2: SOCRATES */}
        <SummarySection number="2" title="History of Present Illness" titleHi="वर्तमान बीमारी का इतिहास">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {([
              ["Chief Complaint", chiefComplaint],
              ["Onset / Duration", duration],
              ["Severity", severity ? `${severity}/10` : q3 != null ? `${q3}/10 (pain scale)` : null],
              ["Associated Symptoms", symptoms.length ? symptoms.slice(0, 4).join(", ") : null],
              ["Radiation", null],
              ["Timing / Pattern", null],
              ["Exacerbating Factors", null],
              ["Relieving Factors", null],
              ["Medications Mentioned", voiceMeds.length ? voiceMeds.join(", ") : null],
              ["Vitals Reported", vitals.length ? vitals.join("; ") : null],
              ["Family History", familyHistory.length ? familyHistory.join("; ") : q5 === "Yes" ? "Heart disease in immediate family" : null],
              ["Allergies Noted", voiceAllergies.length ? voiceAllergies.join(", ") : null],
            ] as [string, string | null][]).map(([k, v]) => (
              <div key={k} className="flex gap-2">
                <span className="font-600 text-gray-500 w-36 flex-shrink-0 text-[11px]">{k}:</span>
                <span className={`text-[11px] ${v ? "text-gray-800" : "text-gray-400"}`}>{v ?? "No data"}</span>
              </div>
            ))}
          </div>
        </SummarySection>

        {/* Section 3: Past Medical History */}
        <SummarySection number="3" title="Past Medical History" titleHi="पिछली चिकित्सा इतिहास">
          {(diagnosedConditions.length > 0 || q1 === "Yes") ? (
            <ul className="space-y-1">
              {q1 === "Yes" && (
                <li className="flex items-start gap-2 text-xs text-gray-700"><span className="text-[#0066CC]">●</span>Diabetes or Hypertension (patient confirmed)</li>
              )}
              {diagnosedConditions.map((c) => (
                <li key={c} className="flex items-start gap-2 text-xs text-gray-700"><span className="text-[#0066CC]">●</span>{c}</li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No data</p>
          )}
        </SummarySection>

        {/* Section 4: Medications & Allergies */}
        <SummarySection number="4" title="Medications & Allergies" titleHi="दवाएं और एलर्जी">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-700 text-gray-500 mb-1.5 uppercase tracking-wide">Current Medications</p>
              {allMeds.length > 0 ? (
                <ul className="space-y-1">
                  {allMeds.map((med) => (
                    <li key={med} className="flex items-center gap-2 text-xs text-gray-700">
                      <div className="w-3 h-3 text-[#10B981]"><Icon.Pill /></div>{med}
                    </li>
                  ))}
                </ul>
              ) : q4 != null ? (
                <p className="text-xs text-gray-600">{q4} medication{q4 !== 1 ? "s" : ""} — names not captured.</p>
              ) : (
                <p className="text-xs text-gray-400">No data</p>
              )}
            </div>
            <div>
              <p className="text-[10px] font-700 text-gray-500 mb-1.5 uppercase tracking-wide">Allergies</p>
              {allAllergies.length > 0 ? (
                <div className="space-y-1">
                  {allAllergies.map((a) => (
                    <div key={a} className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-lg px-2.5 py-1">
                      <span className="text-red-500 text-[10px]">🔴</span>
                      <span className="text-xs font-600 text-red-700 uppercase">{a}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No data</p>
              )}
            </div>
          </div>
        </SummarySection>

        {/* Section 5: Lab Tests */}
        <SummarySection number="5" title="Prior Investigations" titleHi="पिछली जांचें">
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Test", "Result", "Unit", "Reference Range"].map((h) => (
                    <th key={h} className="text-left py-1.5 px-2 text-gray-500 font-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dd.labTests.length > 0 ? dd.labTests.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-1.5 px-2 font-600 text-gray-800">{row.name}</td>
                    <td className="py-1.5 px-2 font-mono text-gray-700">{row.value ?? "—"}</td>
                    <td className="py-1.5 px-2 text-gray-500">{row.unit ?? "—"}</td>
                    <td className="py-1.5 px-2 text-gray-400 font-mono">{row.referenceRange ?? "—"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan={4} className="py-3 px-2 text-center text-gray-400">No lab data</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </SummarySection>

        {/* Physician Attention */}
        <div className={`rounded-xl p-3 border ${redFlags.length > 0 ? "bg-red-50 border-red-200" : "bg-gray-50 border-gray-100"}`}>
          <div style={{ fontFamily: "Poppins, sans-serif" }} className={`text-xs font-700 flex items-center gap-2 mb-1.5 ${redFlags.length > 0 ? "text-red-700" : "text-gray-500"}`}>
            <div className="w-3.5 h-3.5"><Icon.Alert /></div>
            Physician Attention Required
          </div>
          {redFlags.length > 0 ? (
            <ul className="space-y-0.5">
              {redFlags.map((flag) => (
                <li key={flag} className="text-[11px] text-red-600">⚠️ {flag}</li>
              ))}
            </ul>
          ) : (
            <p className="text-[11px] text-gray-400">No flags — data looks within normal parameters.</p>
          )}
        </div>

        <p className="text-[10px] text-gray-400 text-center">
          🔐 Encrypted · ABDM compliant · AI-assisted — not a substitute for clinical diagnosis
        </p>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 8: CONSENT
// ──────────────────────────────────────────────
function ConsentPage({ onNavigate, lang, light, patient }: { onNavigate: (p: Page) => void; lang: LangCode; light: boolean; patient: PatientData | null }) {
  const t = useT(lang)
  const [consents, setConsents] = useState({
    collection: true,
    emr: true,
    abha: false,
    research: false,
  })

  const toggle = (key: keyof typeof consents) =>
    setConsents((c) => ({ ...c, [key]: !c[key] }))

  useEffect(() => {
    const handler = (e: Event) => {
      const { field, value } = (e as CustomEvent<{ field: string; value: string }>).detail
      if (field === "consent") {
        if (value === "agree") setConsents({ collection: true, emr: true, abha: true, research: true })
        if (value === "disagree") setConsents({ collection: false, emr: false, abha: false, research: false })
      }
    }
    window.addEventListener("voice-fill", handler)
    return () => window.removeEventListener("voice-fill", handler)
  }, [])

  return (
    <div
      className="min-h-screen flex items-start sm:items-center justify-center p-4 sm:p-6 pt-20 pb-28"
      style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}
    >
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-[#00897B] to-[#0066CC] px-8 py-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-7 h-7 text-white">
              <Icon.Lock />
            </div>
            <h2
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xl font-700 text-white"
            >
              {t.consentTitle}
            </h2>
          </div>
          {patient && (
            <p className="text-white/80 text-sm mt-1">
              Patient: {patient.full_name} · ID: {patient.patient_id}
            </p>
          )}
          <p className="text-white/70 text-sm">
            एन्क्रिप्ट किया गया और सुरक्षित — Review your data sharing preferences
          </p>
        </div>

        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          {[
            {
              key: "collection" as const,
              title: "Data Collection Consent ✓",
              required: true,
              desc: "I consent to recording my voice and medical history for creating this clinical summary.",
              details: [
                "Voice transcribed and processed securely",
                "Data encrypted and stored safely",
                "Used only for this consultation",
                "Withdrawable at any time",
              ],
            },
            {
              key: "emr" as const,
              title: "Hospital EMR/HIS Integration ✓",
              required: false,
              desc: "I consent to share my clinical summary with the hospital information system.",
              details: [
                "Only authorized staff can view",
                `Linked to patient ID ${patient?.patient_id ?? "—"}`,
                "Data access reports available anytime",
              ],
            },
            {
              key: "abha" as const,
              title: "ABHA Personal Health Record",
              required: true,
              desc: "Link my clinical summary to Ayushman Bharat Digital Mission.",
              details: [
                "Multiple providers can access records",
                "Better continuity of care",
                "Accessible anytime via ABHA app",
              ],
              warning:
                "Once shared to ABHA, data becomes visible to other authorized providers.",
            },
            {
              key: "research" as const,
              title: "Research & Analytics (Optional)",
              required: false,
              desc: "Anonymized use of data for improving MediKiosk AI algorithms.",
              details: [
                "Name and ID removed",
                "Only clinical patterns used",
                "Opt-out anytime",
              ],
            },
          ].map((section) => (
            <div
              key={section.key}
              className={`border rounded-2xl p-4 transition-colors ${
                consents[section.key]
                  ? "border-[#00897B]/30 bg-[#00897B]/3"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  onClick={() => toggle(section.key)}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    consents[section.key]
                      ? "bg-[#00897B] border-[#00897B]"
                      : section.required && !consents[section.key]
                        ? "border-red-400 bg-red-50"
                        : "border-gray-300"
                  }`}
                >
                  {consents[section.key] && (
                    <div className="w-3 h-3 text-white">
                      <Icon.Check />
                    </div>
                  )}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <p
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      className="text-sm font-600 text-gray-800"
                    >
                      {section.title}
                    </p>
                    {section.required && section.key !== "collection" && (
                      <span className={`text-[10px] font-700 px-1.5 py-0.5 rounded-full ${consents[section.key] ? "bg-[#00897B]/15 text-[#00897B]" : "bg-red-100 text-red-600"}`}>
                        {consents[section.key] ? "✓ Required" : "Required"}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{section.desc}</p>
                  {consents[section.key] && (
                    <ul className="space-y-0.5">
                      {section.details.map((d) => (
                        <li
                          key={d}
                          className="text-xs text-gray-500 flex items-center gap-1.5"
                        >
                          <span className="text-[#10B981]">✓</span>
                          {d}
                        </li>
                      ))}
                    </ul>
                  )}
                  {section.warning && consents[section.key] && (
                    <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2">
                      <p className="text-xs text-amber-700">
                        ⚠️ {section.warning}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Security */}
          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-4">
            <div
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xs font-700 text-[#10B981] mb-2 flex items-center gap-1.5"
            >
              <div className="w-3.5 h-3.5">
                <Icon.Lock />
              </div>{" "}
              Your Privacy is Protected
            </div>
            <div className="grid grid-cols-2 gap-1">
              {[
                "256-bit AES encryption",
                "DPDP Act 2023 compliant",
                "No third-party data sharing",
                "Security audit: Aug 2026",
              ].map((s) => (
                <p
                  key={s}
                  className="text-xs text-gray-600 flex items-center gap-1"
                >
                  <span className="text-[#10B981]">✓</span>
                  {s}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 pt-2 border-t border-gray-100 mt-2">
          <PrimaryBtn
            onClick={() => onNavigate("completion")}
            disabled={!consents.collection || !consents.abha}
            className="w-full"
          >
            <div className="w-4 h-4">
              <Icon.Check />
            </div>
            {t.agreeBtn}
          </PrimaryBtn>
          {!consents.abha && (
            <p className="text-center text-xs text-red-500 mt-2 font-500">
              Please tick "ABHA Personal Health Record" above to proceed
            </p>
          )}
          {consents.abha && (
            <p className="text-center text-xs text-gray-400 mt-2">
              Proceeding confirms your consent selections above
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 9: DOCTOR INTERFACE
// ──────────────────────────────────────────────
function DoctorPage({ onNavigate, lang, light, patient }: { onNavigate: (p: Page) => void; lang: LangCode; light: boolean; patient: PatientData | null }) {
  const t = useT(lang)
  const [status, setStatus] = useState("accurate")
  const [notes, setNotes] = useState("")

  return (
    <div
      className="min-h-screen"
      style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}
    >
      <nav className="h-16 bg-[#0066CC] flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 text-white">
            <Icon.Stethoscope />
          </div>
          <span
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="text-white font-700 text-lg"
          >
            MediKiosk
          </span>
          <Badge text="Physician Mode" color="orange" />
        </div>
        <div className="flex items-center gap-2 text-white/80 text-sm">
          Dr. Rajesh Sharma · Cardiology
          <button
            onClick={() => onNavigate("dashboard")}
            className="ml-4 text-white/60 hover:text-white text-xs border border-white/30 rounded-lg px-3 py-1"
          >
            Exit Physician Mode
          </button>
        </div>
      </nav>

      <div className="pt-16 flex flex-col lg:flex-row">
        {/* Summary */}
        <div className="flex-1 bg-white border-b lg:border-b-0 lg:border-r border-gray-100 p-4 sm:p-6 pb-28 lg:overflow-y-auto lg:max-h-[calc(100vh-64px)]">
          <p
            style={{ fontFamily: "Poppins, sans-serif" }}
            className="text-xs font-700 text-gray-400 uppercase tracking-wide mb-4"
          >
            {t.clinicalSummary} (Read-Only)
          </p>
          <div className="space-y-4 text-sm text-gray-700">
            {[
              {
                title: "Chief Complaint",
                content:
                  "Chest pain for 3 days, associated with mild dyspnea on exertion and diaphoresis.",
              },
              {
                title: "Present Illness",
                content:
                  "Sudden onset crushing central chest pressure while at work, radiating to left arm and jaw. Occurs 2-3 times daily, worst in the morning. Severity 7/10. Associated shortness of breath and sweating. Partially relieved by rest and antacids.",
              },
              {
                title: "Past Medical History",
                content:
                  "Type 2 DM (2018), Hypertension (2015), Hyperlipidemia (2020), Hypothyroidism (2010)",
              },
              {
                title: "Medications",
                content:
                  "Metformin 500mg BD, Enalapril 10mg OD, Atorvastatin 20mg OD, Levothyroxine 75mcg OD, Aspirin 75mg OD",
              },
              {
                title: "Allergies",
                content: "🔴 PENICILLIN (Rash) — Critical",
              },
              {
                title: "Family History",
                content:
                  "Father: Deceased age 68 (CAD). Mother: Hypertension. Siblings: No known illness.",
              },
              {
                title: "Social History",
                content:
                  "Software engineer, high stress. Non-smoker. Occasional alcohol. Sedentary lifestyle. High salt diet.",
              },
            ].map((s) => (
              <div
                key={s.title}
                className="border-l-4 border-[#0066CC]/20 pl-4"
              >
                <p
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  className="text-xs font-700 text-[#0066CC] mb-1"
                >
                  {s.title}
                </p>
                <p>{s.content}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Physician Controls */}
        <div className="w-full lg:w-96 bg-white p-4 sm:p-5 pb-28 lg:overflow-y-auto lg:max-h-[calc(100vh-64px)]">
          {/* Patient Verification */}
          <div className="bg-[#10B981]/5 border border-[#10B981]/20 rounded-2xl p-4 mb-4">
            <p
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xs font-700 text-[#10B981] mb-2"
            >
              ✓ Patient Verified
            </p>
            <p className="text-sm font-600 text-gray-800">{patient?.full_name ?? "—"}</p>
            <p className="text-xs text-gray-500">
              {patient?.age ? `Age ${patient.age}` : "—"} · ID: {patient?.patient_id ?? "—"}
            </p>
            <p className="text-xs text-gray-500">
              Appointment: {patient?.department ?? "—"}, Dr. Sharma
            </p>
          </div>

          {/* Risk Flags */}
          <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4">
            <p
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xs font-700 text-gray-600 mb-2 uppercase tracking-wide"
            >
              Clinical Risk Flags
            </p>
            {[
              {
                color: "bg-red-500",
                text: "Acute chest pain (3 days) — URGENT",
              },
              { color: "bg-orange-400", text: "Uncontrolled lipids (LDL 145)" },
              {
                color: "bg-orange-400",
                text: "Suboptimal glycemic control (HbA1c 7.8%)",
              },
              { color: "bg-[#10B981]", text: "Allergy documented: Penicillin" },
            ].map((flag) => (
              <div key={flag.text} className="flex items-center gap-2 mb-1.5">
                <div
                  className={`w-2 h-2 rounded-full ${flag.color} flex-shrink-0`}
                ></div>
                <p className="text-xs text-gray-700">{flag.text}</p>
              </div>
            ))}
            <div className="mt-3 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              <p className="text-xs font-700 text-red-600">
                Clinical Priority: HIGH
              </p>
              <p className="text-xs text-red-500">
                Recommend: Immediate ECG + troponin
              </p>
            </div>
          </div>

          {/* Summary Assessment */}
          <div className="border border-gray-200 rounded-2xl p-4 mb-4">
            <p
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xs font-700 text-gray-600 mb-3 uppercase tracking-wide"
            >
              Summary Assessment
            </p>
            <div className="space-y-2">
              {[
                { id: "accurate", label: "✓ Accurate as provided — sign off" },
                { id: "corrections", label: "⚠️ Needs minor corrections" },
                { id: "re-entry", label: "❌ Requires substantial re-entry" },
                { id: "callback", label: "📞 Need to call patient back" },
              ].map((opt) => (
                <label
                  key={opt.id}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div
                    className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                      status === opt.id
                        ? "border-[#0066CC] bg-[#0066CC]"
                        : "border-gray-300"
                    }`}
                  >
                    {status === opt.id && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <input
                    type="radio"
                    className="sr-only"
                    checked={status === opt.id}
                    onChange={() => setStatus(opt.id)}
                  />
                  <span className="text-xs text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Physician Notes */}
          <div className="border border-gray-200 rounded-2xl p-4 mb-4">
            <p
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xs font-700 text-gray-600 mb-2 uppercase tracking-wide"
            >
              Physician Notes
            </p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional clinical observations not captured by patient..."
              className="w-full text-sm border border-gray-200 rounded-xl p-3 h-24 resize-none focus:outline-none focus:border-[#0066CC] text-gray-700"
            />
            <p className="text-xs text-gray-400 text-right mt-1">
              {notes.length}/2000
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-2">
            <PrimaryBtn
              onClick={() => onNavigate("completion")}
              className="w-full bg-[#10B981] hover:bg-emerald-600"
            >
              ✓ Save to EMR
            </PrimaryBtn>
            <div className="grid grid-cols-2 gap-2">
              <SecondaryBtn className="text-xs">+ Add Rx</SecondaryBtn>
              <SecondaryBtn className="text-xs">+ Order Tests</SecondaryBtn>
              <SecondaryBtn className="text-xs">🖨 Print</SecondaryBtn>
              <SecondaryBtn className="text-xs text-[#00897B] border-[#00897B]/30">
                Share ABHA
              </SecondaryBtn>
            </div>
          </div>

          {/* Signature */}
          <div className="mt-4 bg-gray-50 rounded-xl p-3">
            <p className="text-xs font-600 text-gray-500 mb-1">
              Digital Signature
            </p>
            <p className="text-xs text-gray-700">
              Dr. Rajesh Sharma · License #MCI-12345
            </p>
            <p className="text-xs text-gray-400 font-mono">31-Aug-2026 14:52</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 10: SETTINGS
// ──────────────────────────────────────────────
const SETTINGS_SECTIONS = [
  {
    id: "account",
    icon: "👤",
    label: "Account Settings",
    subs: ["Profile & Demographics", "Credentials", "Two-Factor Auth"],
  },
  {
    id: "privacy",
    icon: "🔒",
    label: "Privacy & Security",
    subs: ["Data Sharing", "ABHA Integration", "Session Security"],
  },
  {
    id: "language",
    icon: "🌐",
    label: "Language & Accessibility",
    subs: [
      "Language",
      "Audio Settings",
      "Visual Accessibility",
      "Input Methods",
    ],
  },
  {
    id: "device",
    icon: "📱",
    label: "Device Settings",
    subs: ["Camera", "Microphone", "Connection"],
  },
  {
    id: "support",
    icon: "ℹ️",
    label: "Support & Feedback",
    subs: ["Help & Docs", "Contact Support", "Feedback", "About"],
  },
]

function SettingsPage({ onNavigate, lang, light, patient }: { onNavigate: (p: Page) => void; lang: LangCode; light: boolean; patient: PatientData | null }) {
  const t = useT(lang)
  const [active, setActive] = useState("language")
  const [highContrast, setHighContrast] = useState(false)
  const [largeText, setLargeText] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [reduceMotion, setReduceMotion] = useState(false)
  const [selectedLang, setSelectedLang] = useState("hi")

  return (
    <div
      className="min-h-screen"
      style={{ background: light ? "#F8FAFC" : "#0D1B3E", color: light ? "#0D1B3E" : "#FFFFFF" }}
    >
      <TopNav onNavigate={onNavigate} patientName={patient?.full_name} />
      <div className="pt-16 flex">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 bg-white border-r border-gray-100 min-h-screen fixed left-0 top-16 pb-28 overflow-y-auto">
          <div className="p-4">
            <p
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xs font-700 text-gray-400 uppercase tracking-wide mb-3"
            >
              {t.settingsTitle}
            </p>
            <div className="space-y-1">
              {SETTINGS_SECTIONS.map((s) => (
                <div key={s.id}>
                  <button
                    onClick={() => setActive(s.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-500 transition-colors text-left ${
                      active === s.id
                        ? "bg-[#0066CC]/5 text-[#0066CC]"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <span>{s.icon}</span>
                    <span
                      style={{ fontFamily: "Poppins, sans-serif" }}
                      className="font-600"
                    >
                      {s.label}
                    </span>
                  </button>
                  {active === s.id && (
                    <div className="ml-7 mt-1 space-y-0.5">
                      {s.subs.map((sub) => (
                        <button
                          key={sub}
                          className="w-full text-left text-xs text-gray-500 hover:text-[#0066CC] py-1 px-2 rounded transition-colors"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Content */}
        <main className="ml-0 lg:ml-64 flex-1 p-4 sm:p-6 pb-28 max-w-2xl">
          {active === "language" && (
            <div className="space-y-6">
              <div>
                <h2
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  className="text-xl font-700 text-gray-900 mb-4"
                >
                  Language & Accessibility
                </h2>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <p
                    style={{ fontFamily: "Poppins, sans-serif" }}
                    className="text-sm font-700 text-gray-700 mb-3"
                  >
                    Current Language:{" "}
                    <span className="text-[#0066CC]">हिंदी (Hindi)</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {LANGUAGES.slice(0, 7).map((lang) => (
                      <label
                        key={lang.code}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedLang === lang.code
                              ? "border-[#0066CC] bg-[#0066CC]"
                              : "border-gray-300"
                          }`}
                          onClick={() => setSelectedLang(lang.code)}
                        >
                          {selectedLang === lang.code && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm text-gray-700">
                          {lang.native} ({lang.name})
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  className="text-sm font-700 text-gray-700 mb-3"
                >
                  🎤 Voice & Audio
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Microphone Sensitivity", value: "Medium" },
                    { label: "Speaker Volume", value: "70%" },
                    { label: "Speech Rate", value: "1.0x" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">{s.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full w-3/5 bg-[#0066CC] rounded-full"></div>
                        </div>
                        <span className="text-xs text-gray-400 w-12">
                          {s.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <p
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  className="text-sm font-700 text-gray-700 mb-3"
                >
                  👁 Visual Accessibility
                </p>
                <div className="space-y-3">
                  {[
                    {
                      label: "High Contrast Mode",
                      key: "highContrast" as const,
                      state: highContrast,
                      setter: setHighContrast,
                    },
                    {
                      label: "Large Text (18px)",
                      key: "largeText" as const,
                      state: largeText,
                      setter: setLargeText,
                    },
                    {
                      label: "Dark Mode",
                      key: "darkMode" as const,
                      state: darkMode,
                      setter: setDarkMode,
                    },
                    {
                      label: "Reduce Animation",
                      key: "reduceMotion" as const,
                      state: reduceMotion,
                      setter: setReduceMotion,
                    },
                  ].map((opt) => (
                    <div
                      key={opt.label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-700">{opt.label}</span>
                      <button
                        onClick={() => opt.setter(!opt.state)}
                        className={`w-10 h-5.5 rounded-full transition-colors relative ${
                          opt.state ? "bg-[#0066CC]" : "bg-gray-200"
                        }`}
                      >
                        <div
                          className={`w-4 h-4 bg-white rounded-full absolute top-0.75 transition-transform shadow-sm ${
                            opt.state ? "translate-x-5" : "translate-x-0.75"
                          }`}
                        ></div>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active !== "language" && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <div className="text-center">
                <div className="text-4xl mb-3">
                  {SETTINGS_SECTIONS.find((s) => s.id === active)?.icon}
                </div>
                <p
                  style={{ fontFamily: "Poppins, sans-serif" }}
                  className="font-600"
                >
                  {SETTINGS_SECTIONS.find((s) => s.id === active)?.label}
                </p>
                <p className="text-sm mt-1">Settings panel coming soon</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// PAGE 11: COMPLETION
// ──────────────────────────────────────────────
function CompletionPage({ onNavigate, lang, light, patient, onLogout, hospitalName, intakeSession }: { onNavigate: (p: Page) => void; lang: LangCode; light: boolean; patient: PatientData | null; onLogout: () => void; hospitalName?: string; intakeSession?: IntakeSession }) {
  const t = useT(lang)
  const session = intakeSession

  const confetti = Array.from({ length: 18 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    color: ["#0066CC", "#10B981", "#F97316", "#00897B", "#8B5CF6"][i % 5],
    delay: `${Math.random() * 1}s`,
    size: `${6 + Math.random() * 8}px`,
  }))

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-8 relative overflow-hidden"
      style={{
        background: light ? "linear-gradient(135deg, #f0f9ff 0%, #ffffff 50%, #f0fdf4 100%)" : "#0D1B3E",
        color: light ? "#0D1B3E" : "#FFFFFF",
      }}
    >
      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute pointer-events-none rounded-sm"
          style={{
            left: c.left,
            top: "-20px",
            width: c.size,
            height: c.size,
            background: c.color,
            animation: `confetti-fall 2.5s ease-in ${c.delay} infinite`,
            opacity: 0.7,
          }}
        />
      ))}

      {/* Main card */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full border border-gray-100 relative overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-[#10B981] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-200">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10">
              <polyline points="20 6 9 17 4 12" strokeDasharray="100" strokeDashoffset="0" />
            </svg>
          </div>
          <h1 style={{ fontFamily: "Poppins, sans-serif" }} className="text-2xl font-800 text-gray-900 mb-1">{t.completionTitle}</h1>
          <p className="text-[#00897B] text-sm font-600 mb-2">{t.completionSubtitle}</p>
          <p className="text-base text-gray-600 mb-2">
            {patient?.full_name ? `${patient.full_name}, your` : "Your"} health record has been submitted successfully.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2 mb-1">
            {patient?.patient_id && (
              <span className="text-xs font-mono text-[#0066CC] bg-blue-50 rounded-full px-3 py-1">
                ID: {patient.patient_id}
              </span>
            )}
            {hospitalName && (
              <span className="text-xs text-[#00897B] bg-emerald-50 rounded-full px-3 py-1">
                {hospitalName}
              </span>
            )}
            <span className="text-xs text-gray-400 bg-gray-50 rounded-full px-3 py-1">
              {new Date().toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" })} · {new Date().toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>

        {/* Session Stats */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            {
              icon: "🎙️",
              label: "Voice Session",
              value: session?.voiceDuration && session.voiceDuration !== "0:00" ? session.voiceDuration : (session?.voiceEntities ? "Done" : "Skipped"),
              sub: session?.voiceConfidence ? `${Math.round(session.voiceConfidence * 100)}% confidence` : "",
            },
            {
              icon: "📋",
              label: "Questions",
              value: `${session?.questionsAnswered ?? 0}/5`,
              sub: "answered",
            },
            {
              icon: "📄",
              label: "Documents",
              value: session?.docData?.docCount ? `${session.docData.docCount} file${session.docData.docCount !== 1 ? "s" : ""}` : "None",
              sub: session?.docData?.processedCount ? `${session.docData.processedCount} processed` : "",
            },
          ].map((s) => (
            <div key={s.label} className="bg-gray-50 rounded-2xl p-3 text-center">
              <div className="text-xl mb-1">{s.icon}</div>
              <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-base font-800 text-[#0066CC]">{s.value}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
              {s.sub && <p className="text-xs text-gray-400 mt-0.5">{s.sub}</p>}
            </div>
          ))}
        </div>

        {/* Extracted Clinical Data */}
        {(() => {
          const dd = session?.docData
          const ve = session?.voiceEntities
          const allMeds = Array.from(new Set([...(ve?.medications ?? []), ...(dd?.medications ?? [])]))
          const allAllergies = Array.from(new Set([...(ve?.allergies ?? []), ...(dd?.allergies ?? [])]))
          const labs = dd?.labTests ?? []
          const prescriptions = dd?.prescriptions ?? []
          const hasAny = allMeds.length > 0 || allAllergies.length > 0 || labs.length > 0 || prescriptions.length > 0

          return (
            <div className="mb-5">
              <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-sm font-700 text-gray-700 mb-3">Extracted Clinical Data</p>
              {!hasAny ? (
                <p className="text-xs text-gray-400 text-center py-3 bg-gray-50 rounded-xl">No clinical data extracted — no documents uploaded or voice data captured.</p>
              ) : (
                <div className="space-y-3">
                  {/* Lab Tests */}
                  <div className="bg-blue-50 rounded-xl p-3">
                    <p className="text-xs font-700 text-[#0066CC] mb-2">Lab Reports</p>
                    {labs.length === 0 ? (
                      <p className="text-xs text-gray-400">No data</p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                          <thead>
                            <tr className="text-gray-400 border-b border-blue-100">
                              <th className="text-left pb-1 font-600">Test</th>
                              <th className="text-left pb-1 font-600">Value</th>
                              <th className="text-left pb-1 font-600">Unit</th>
                              <th className="text-left pb-1 font-600">Range</th>
                            </tr>
                          </thead>
                          <tbody>
                            {labs.map((lab, i) => (
                              <tr key={i} className="border-b border-blue-50 last:border-0">
                                <td className="py-1 font-500 text-gray-700">{lab.name}</td>
                                <td className="py-1 text-gray-600">{lab.value ?? "—"}</td>
                                <td className="py-1 text-gray-500">{lab.unit ?? "—"}</td>
                                <td className="py-1 text-gray-400">{lab.referenceRange ?? "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Medications */}
                  <div className="bg-emerald-50 rounded-xl p-3">
                    <p className="text-xs font-700 text-[#00897B] mb-2">Medications</p>
                    {allMeds.length === 0 ? (
                      <p className="text-xs text-gray-400">No data</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {allMeds.map((m, i) => (
                          <span key={i} className="bg-emerald-100 text-emerald-800 text-xs rounded-full px-2.5 py-0.5">{m}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Allergies */}
                  <div className="bg-orange-50 rounded-xl p-3">
                    <p className="text-xs font-700 text-orange-600 mb-2">Allergies</p>
                    {allAllergies.length === 0 ? (
                      <p className="text-xs text-gray-400">No data</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {allAllergies.map((a, i) => (
                          <span key={i} className="bg-orange-100 text-orange-800 text-xs rounded-full px-2.5 py-0.5">{a}</span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Prescriptions */}
                  {prescriptions.length > 0 && (
                    <div className="bg-purple-50 rounded-xl p-3">
                      <p className="text-xs font-700 text-purple-600 mb-2">Prescriptions</p>
                      <div className="flex flex-wrap gap-1.5">
                        {prescriptions.map((p, i) => (
                          <span key={i} className="bg-purple-100 text-purple-800 text-xs rounded-full px-2.5 py-0.5">{p}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })()}

        {/* Voice Summary */}
        {session?.voiceSummary && (
          <div className="bg-gray-50 rounded-xl p-3 mb-5">
            <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-xs font-700 text-gray-600 mb-1">Chief Complaint (Voice)</p>
            <p className="text-xs text-gray-600 leading-relaxed">{session.voiceSummary}</p>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-blue-50 rounded-2xl p-4 mb-5">
          <p style={{ fontFamily: "Poppins, sans-serif" }} className="text-sm font-700 text-[#0066CC] mb-3">What Happens Next</p>
          <ol className="space-y-2">
            {[
              "Your clinical summary has been submitted to the care team",
              "You will be called to the consultation room shortly",
              "The doctor has your complete history ready",
              "Bring original documents for reference if needed",
            ].map((step, i) => (
              <li key={step} className="flex items-start gap-2 text-sm text-gray-700">
                <span style={{ fontFamily: "Poppins, sans-serif" }} className="w-5 h-5 bg-[#0066CC] text-white rounded-full text-xs font-700 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <button
            onClick={() => onNavigate("summary")}
            className="h-11 border border-gray-200 rounded-xl text-sm font-600 text-gray-700 hover:border-[#0066CC] hover:text-[#0066CC] transition-colors flex items-center justify-center gap-1.5"
          >
            📋 View Full Report
          </button>
          <button className="h-11 border border-gray-200 rounded-xl text-sm font-600 text-gray-700 hover:border-red-200 hover:text-red-500 transition-colors flex items-center justify-center gap-1.5">
            🏥 Cancel Appointment
          </button>
          <button className="h-11 border border-gray-200 rounded-xl text-sm font-600 text-gray-700 transition-colors flex items-center justify-center gap-1.5">
            📞 Call Staff
          </button>
          <button className="h-11 border border-gray-200 rounded-xl text-sm font-600 text-gray-700 transition-colors flex items-center justify-center gap-1.5">
            💬 Live Chat
          </button>
        </div>

        {/* Terminate Session */}
        <div className="flex justify-center">
          <button
            onClick={onLogout}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-600 hover:bg-red-50 transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Terminate Session
          </button>
        </div>
      </div>
    </div>
  )
}

// ──────────────────────────────────────────────
// GLOBAL VOICE PILL OVERLAY
// ──────────────────────────────────────────────
function VoicePill({
  active,
  label,
  onToggle,
  light,
}: {
  active: boolean
  label: string
  onToggle: () => void
  light: boolean
}) {
  return (
    <button
      onClick={onToggle}
      title={active ? "Stop voice assistant" : "Start voice assistant"}
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full shadow-2xl transition-all duration-300 active:scale-95 focus:outline-none"
      style={{
        height: 52,
        paddingLeft: active ? 18 : 16,
        paddingRight: active ? 18 : 16,
        background: active
          ? "linear-gradient(135deg,#1A6FE5,#0EA5E9)"
          : light
            ? "rgba(255,255,255,0.95)"
            : "rgba(30,45,78,0.95)",
        border: active ? "none" : `1.5px solid ${light ? "rgba(0,102,204,0.25)" : "rgba(255,255,255,0.12)"}`,
        boxShadow: active
          ? "0 0 0 6px rgba(26,111,229,0.18), 0 8px 32px rgba(26,111,229,0.35)"
          : light
            ? "0 4px 20px rgba(0,0,0,0.14)"
            : "0 4px 20px rgba(0,0,0,0.4)",
      }}
    >
      {/* Ping rings when active */}
      {active && (
        <>
          <span className="absolute inset-0 rounded-full border border-blue-300 opacity-50 animate-ping" style={{ animationDuration: "1.2s" }} />
          <span className="absolute inset-0 rounded-full border border-blue-200 opacity-25 animate-ping" style={{ animationDuration: "1.8s", animationDelay: "0.3s" }} />
        </>
      )}

      {/* Mic icon */}
      <svg viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : light ? "#1A6FE5" : "#60A5FA"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 relative z-10 flex-shrink-0">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>

      {/* Label */}
      <div className="flex flex-col items-start relative z-10 max-w-[180px]">
        <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "Poppins, sans-serif", color: active ? "#fff" : light ? "#0D1B3E" : "#E2E8F8" }}>
          {active ? "Listening…" : "Voice Assistant"}
        </span>
        {label && (
          <span className="truncate" style={{ fontSize: 10, color: active ? "rgba(255,255,255,0.8)" : light ? "#6B7280" : "#6478A4" }}>
            {label}
          </span>
        )}
      </div>
    </button>
  )
}

// ──────────────────────────────────────────────
// SESSION DATA — lifted from each intake step
// ──────────────────────────────────────────────
interface IntakeSession {
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

interface SessionRecord {
  id: string
  timestamp: string
  session: IntakeSession
  patientName: string | null
  patientId: string | null
  hospitalName: string
}

const EMPTY_SESSION: IntakeSession = {
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

// ──────────────────────────────────────────────
// ROOT APP
// ──────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState<Page>("welcome")
  const [lang, setLang] = useState<LangCode>("en")
  const [light, setLight] = useState(true)
  const [patient, setPatient] = useState<PatientData | null>(null)
  const [loggedOut, setLoggedOut] = useState(false)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [hospitalName, setHospitalName] = useState("")
  const [intakeSession, setIntakeSession] = useState<IntakeSession>(EMPTY_SESSION)

  const handleDepartmentChange = async (dept: string) => {
    if (!patient) return
    setPatient((p) => p ? { ...p, department: dept } : p)
    await supabase.from("patients").update({ department: dept }).eq("patient_id", patient.patient_id)
  }

  const handlePatientChange = (updates: Partial<PatientData>) => {
    setPatient((p) => p ? { ...p, ...updates } : p)
  }
  const [sessionHistory, setSessionHistory] = useState<SessionRecord[]>([])

  const saveVoiceData = (entities: MedEntities, summary: string, confidence: number, duration: string) =>
    setIntakeSession((s) => ({ ...s, voiceEntities: entities, voiceSummary: summary, voiceConfidence: confidence, voiceDuration: duration }))

  const saveQuestionAnswers = (answers: Record<number, string | number | string[]>, count: number) =>
    setIntakeSession((s) => ({ ...s, questionAnswers: answers, questionsAnswered: count }))

  const saveDocData = (data: IntakeSession["docData"]) =>
    setIntakeSession((s) => ({ ...s, docData: data }))

  // ── Global voice state ──
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceLabel, setVoiceLabel] = useState("")
  const recognitionRef = useRef<any>(null)
  const voiceActiveRef = useRef(false)
  const pageRef = useRef<Page>("welcome")
  const patientRef = useRef<PatientData | null>(null)
  useEffect(() => { pageRef.current = page }, [page])
  useEffect(() => { patientRef.current = patient }, [patient])

  const PAGE_FLOW: Page[] = ["welcome","language","auth","dashboard","voice","questions","documents","summary","consent","doctor","settings","completion"]
  const navRef = useRef<(p: Page) => void>(() => {})

  const stopVoice = () => {
    voiceActiveRef.current = false
    recognitionRef.current?.stop()
    setVoiceActive(false)
    setVoiceLabel("")
  }

  const dispatchFill = (field: string, value: string) => {
    window.dispatchEvent(new CustomEvent("voice-fill", { detail: { field, value } }))
    setVoiceLabel(`${field}: ${value}`)
  }

  const handleVoiceCommand = (heard: string) => {
    const l = heard.toLowerCase().trim()

    // Pages that require a logged-in patient — voice cannot cross this barrier
    const PROTECTED: Page[] = ["dashboard", "voice", "questions", "documents", "summary", "consent", "doctor", "settings", "completion"]
    const isLoggedIn = () => patientRef.current !== null

    // Helper: move exactly ONE step forward/back, respecting auth barrier
    const voiceNav = (target: Page, label: string) => {
      if (PROTECTED.includes(target) && !isLoggedIn()) {
        setVoiceLabel("Please log in first")
        return
      }
      setVoiceLabel(label)
      navRef.current(target)
    }

    // ── Navigation: NEXT — exactly one page forward ──
    // Only "next" / "अगला" / "aagla" trigger this — no broader synonyms
    if (/^(next|अगला|agla|aagla|अगले|nextt)$/.test(l) ||
        /^(next\s+page|अगला\s+पेज|अगले\s+पर\s+जाओ?)$/.test(l)) {
      const idx = PAGE_FLOW.indexOf(pageRef.current)
      if (idx >= 0 && idx < PAGE_FLOW.length - 1) {
        voiceNav(PAGE_FLOW[idx + 1], "Next page →")
      } else {
        setVoiceLabel("Already on last page")
      }
      return
    }

    // ── Navigation: PREVIOUS — exactly one page back ──
    if (/^(back|previous|वापस|pichla|wapas|पिछला|पीछे)$/.test(l) ||
        /^(go\s+back|wapas\s+jao?|पीछे\s+जाओ?)$/.test(l)) {
      const idx = PAGE_FLOW.indexOf(pageRef.current)
      if (idx > 0) {
        // Never go back past auth into protected area without login
        const prev = PAGE_FLOW[idx - 1]
        voiceNav(prev, "← Previous page")
      } else {
        setVoiceLabel("Already on first page")
      }
      return
    }

    // ── Navigation: named pages (auth-gated) ──
    if (/\b(dashboard|home|होम|मुख्य)\b/.test(l)) { voiceNav("dashboard", "→ Dashboard"); return }
    if (/\b(welcome|शुरुआत)\b/.test(l)) { navRef.current("welcome"); setVoiceLabel("→ Welcome"); return }
    if (/\b(settings|सेटिंग)\b/.test(l)) { voiceNav("settings", "→ Settings"); return }

    // ── Form fill: Patient ID / Phone / Login ID ──
    // "patient id mein 9876543210 dal de" / "patient id 9876543210" / "enter id 9876543210"
    const idRx = /(?:patient\s*id|patient\s*i\.?d\.?|login\s*id|phone\s*(?:number)?|mobile\s*(?:number)?|फोन|मोबाइल|patient)(?:\s+(?:mein|में|me|ko|number))?\s+([0-9][0-9 ]+[0-9])/i
    const idM = l.match(idRx)
    if (idM) {
      const val = idM[1].replace(/\s/g, "")
      dispatchFill("patient_id", val)
      return
    }
    // "dal de 9876543210 patient id mein" — number first variant
    const idRx2 = /([0-9]{7,12})(?:\s+(?:patient\s*id|patient\s*i\.?d\.?|id|phone|mobile))?/
    const idM2 = l.match(idRx2)
    if (idM2 && /(?:patient|id|phone|mobile|number|dal|daal|enter|डाल|नंबर)/.test(l)) {
      const val = idM2[1].replace(/\s/g, "")
      dispatchFill("patient_id", val)
      return
    }

    // ── Form fill: Name ──
    const nameRx = /(?:(?:my\s+)?name\s+is|naam\s+(?:hai|he|is)?|mera\s+naam|enter\s+name|नाम)\s+([a-zA-Zऀ-ॿ][a-zA-Zऀ-ॿ\s]{1,40})/i
    const nameM = l.match(nameRx)
    if (nameM) {
      dispatchFill("name", nameM[1].trim())
      return
    }

    // ── Form fill: Age ──
    const ageRx = /(?:age|umar|umra|aayu|उम्र|आयु)\s+(?:is\s+|hai\s+)?([0-9]{1,3})/i
    const ageM = l.match(ageRx)
    if (ageM) { dispatchFill("age", ageM[1]); return }

    // ── Form fill: Gender ──
    if (/\b(male|पुरुष|man)\b/.test(l)) { dispatchFill("gender", "Male"); return }
    if (/\b(female|महिला|woman|lady)\b/.test(l)) { dispatchFill("gender", "Female"); return }
    if (/\b(other|अन्य)\b/.test(l)) { dispatchFill("gender", "Other"); return }

    // ── Form fill: Department ──
    const deptMap: [RegExp, string][] = [
      [/\b(cardio|heart|हृदय)\b/, "Cardiology"],
      [/\b(ent|ear|nose|throat|कान)\b/, "ENT"],
      [/\b(general|medicine|सामान्य)\b/, "General Medicine"],
      [/\b(orthop|bone|हड्डी|joints)\b/, "Orthopedics"],
      [/\b(ayush|ayurveda|आयुष)\b/, "AYUSH"],
    ]
    for (const [rx, dept] of deptMap) {
      if (rx.test(l)) { dispatchFill("department", dept); return }
    }

    // ── Form fill: Password ──
    const pwRx = /(?:password|passcode|पासवर्ड|pin)\s+(?:is\s+|set\s+|dal\s+de\s+)?([a-zA-Z0-9@#!]{4,30})/i
    const pwM = l.match(pwRx)
    if (pwM) { dispatchFill("password", pwM[1]); return }

    // ── Form fill: ABHA ID ──
    const abhaRx = /(?:abha|abdm|health\s*id|आभा)\s+(?:id\s+)?([0-9][0-9\- ]{10,20}[0-9])/i
    const abhaM = l.match(abhaRx)
    if (abhaM) { dispatchFill("abha_id", abhaM[1].trim()); return }

    // ── Consent: agree / disagree ──
    if (/\b(agree|consent|हाँ|yes|maan|manzoor)\b/.test(l)) { dispatchFill("consent", "agree"); return }
    if (/\b(disagree|no|नहीं|nahi|refuse)\b/.test(l)) { dispatchFill("consent", "disagree"); return }

    // Unrecognised — just show what was heard
    setVoiceLabel(`"${heard.slice(0, 32)}"`)
  }

  const startVoice = async () => {
    if (voiceActiveRef.current) { stopVoice(); return }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setVoiceLabel("Speech not supported in this browser")
      return
    }

    // Show requesting state immediately so user knows something is happening
    setVoiceLabel("Requesting microphone…")

    // Explicitly request mic permission via getUserMedia first.
    // This triggers the browser's native permission dialog and grants the
    // permission context that SpeechRecognition needs. Without this step,
    // SpeechRecognition silently fails with "not-allowed" inside iframes.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        // Stop the tracks immediately — we only needed the permission grant
        stream.getTracks().forEach((t) => t.stop())
      }
    } catch (err: any) {
      const isDenied = err?.name === "NotAllowedError" || err?.name === "PermissionDeniedError"
      setVoiceLabel(isDenied ? "Allow microphone access in browser settings" : "Microphone unavailable")
      setVoiceActive(false)
      voiceActiveRef.current = false
      return
    }

    const langMap: Record<string, string> = {
      en: "en-IN", hi: "hi-IN", ta: "ta-IN", bn: "bn-IN",
      mr: "mr-IN", gu: "gu-IN", kn: "kn-IN", te: "te-IN",
      ml: "ml-IN", pa: "pa-IN", ur: "ur-PK",
    }

    const rec = new SR()
    rec.continuous = true
    rec.interimResults = false
    rec.maxAlternatives = 3
    rec.lang = langMap[lang] ?? "en-IN"

    rec.onstart = () => {
      voiceActiveRef.current = true
      setVoiceActive(true)
      setVoiceLabel("Say 'Next', 'Back', or fill a field…")
    }

    rec.onresult = (e: any) => {
      const heard = Array.from(e.results)
        .slice(e.resultIndex)
        .flatMap((r: any) => Array.from({ length: r.length }, (_: any, i: number) => r[i].transcript))
        .join(" ")
        .trim()
      handleVoiceCommand(heard)
    }

    rec.onerror = (e: any) => {
      if (e.error === "aborted" || e.error === "no-speech") return
      if (e.error === "not-allowed") {
        setVoiceLabel("Allow microphone in browser settings")
      } else if (e.error === "network") {
        setVoiceLabel("Network error — check connection")
      } else if (e.error === "audio-capture") {
        setVoiceLabel("No microphone detected")
      } else {
        setVoiceLabel("Voice error — tap to retry")
      }
      setVoiceActive(false)
      voiceActiveRef.current = false
    }

    rec.onend = () => {
      if (voiceActiveRef.current) {
        try { rec.start() } catch (_) {}
      }
    }

    recognitionRef.current = rec
    try {
      rec.start()
    } catch (_) {
      setVoiceLabel("Could not start — tap to retry")
    }
  }

  // Cleanup on unmount
  useEffect(() => () => stopVoice(), [])

  useEffect(() => {
    document.documentElement.classList.toggle("dark-mode", !light)
  }, [light])

  // Fetch patient whenever page changes to a post-login page
  useEffect(() => {
    const postLoginPages = ["dashboard","voice","questions","documents","summary","consent","doctor","settings","completion"]
    if (!postLoginPages.includes(page)) return
    const loadPatient = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: row } = await supabase.from("patients").select("*").eq("user_id", user.id).maybeSingle()
      if (row) { setPatient(row); return }
      const m = user.user_metadata ?? {}
      setPatient({
        full_name: m.full_name ?? user.email?.split("@")[0] ?? "Patient",
        patient_id: m.patient_id ?? user.email?.split("@")[0] ?? "—",
        age: m.age ? parseInt(m.age) : null,
        gender: m.gender ?? "—",
        department: m.department ?? "—",
        phone: m.phone ?? "—",
        created_at: user.created_at ?? "",
      })
    }
    loadPatient()
  }, [page])

  const nav = (p: Page) => {
    if (p === "completion") {
      setSessionHistory((prev) => {
        const record: SessionRecord = {
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
          session: { ...intakeSession },
          patientName: patient?.full_name ?? null,
          patientId: patient?.patient_id ?? null,
          hospitalName,
        }
        return [record, ...prev].slice(0, 5)
      })
    }
    // Reset intake progress when entering dashboard from auth (fresh login)
    if (p === "dashboard" && (page === "auth" || page === "welcome" || page === "language")) {
      setCompletedSteps([])
      setIntakeSession(EMPTY_SESSION)
    }
    setPage(p)
  }
  navRef.current = nav

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setPatient(null)
    setLoggedOut(true)
    setCompletedSteps([])
    setIntakeSession(EMPTY_SESSION)
    setPage("auth")
  }

  const voiceProps = { voiceActive, voiceLabel, onVoiceToggle: startVoice }

  return (
    <div className="size-full">
      {page === "welcome" && <WelcomePage onNavigate={nav} lang={lang} light={light} onLightToggle={() => setLight((l) => !l)} {...voiceProps} />}
      {page === "language" && (
        <LanguagePage onNavigate={nav} lang={lang} onLangChange={setLang} light={light} />
      )}
      {page === "auth" && <AuthPage onNavigate={(p) => { setLoggedOut(false); nav(p) }} lang={lang} light={light} loggedOut={loggedOut} />}
      {page === "dashboard" && <DashboardPage onNavigate={nav} lang={lang} light={light} patient={patient} completedSteps={completedSteps} onStepComplete={(s) => setCompletedSteps((p) => p.includes(s) ? p : [...p, s])} hospitalName={hospitalName} onHospitalChange={setHospitalName} onDepartmentChange={handleDepartmentChange} onPatientChange={handlePatientChange} sessionHistory={sessionHistory} />}
      {page === "voice" && <VoicePage onNavigate={(p) => { setCompletedSteps((prev) => prev.includes(1) ? prev : [...prev, 1]); nav(p) }} lang={lang} light={light} patient={patient} onVoiceComplete={saveVoiceData} />}
      {page === "questions" && <QuestionsPage onNavigate={nav} lang={lang} light={light} patient={patient} onQuestionsComplete={saveQuestionAnswers} />}
      {page === "documents" && <DocumentsPage onNavigate={nav} lang={lang} light={light} patient={patient} onDocsComplete={saveDocData} />}
      {page === "summary" && <SummaryPage onNavigate={nav} lang={lang} light={light} patient={patient} hospitalName={hospitalName} intakeSession={intakeSession} />}
      {page === "consent" && <ConsentPage onNavigate={nav} lang={lang} light={light} patient={patient} />}
      {page === "doctor" && <DoctorPage onNavigate={nav} lang={lang} light={light} patient={patient} />}
      {page === "settings" && <SettingsPage onNavigate={nav} lang={lang} light={light} patient={patient} />}
      {page === "completion" && <CompletionPage onNavigate={nav} lang={lang} light={light} patient={patient} onLogout={handleLogout} hospitalName={hospitalName} intakeSession={intakeSession} />}
      {page === "error" && (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white rounded-3xl shadow-lg p-10 max-w-md">
            <div className="text-5xl mb-4">⚠️</div>
            <h2
              style={{ fontFamily: "Poppins, sans-serif" }}
              className="text-xl font-700 text-gray-900 mb-2"
            >
              Something went wrong
            </h2>
            <p className="text-sm text-gray-500 mb-5">
              Please check your connection or contact hospital staff.
            </p>
            <PrimaryBtn onClick={() => nav("dashboard")} className="mx-auto">
              Return to Dashboard
            </PrimaryBtn>
          </div>
        </div>
      )}

      {/* Global floating voice pill — shown on all pages */}
      {page !== "welcome" && (
        <VoicePill active={voiceActive} label={voiceLabel} onToggle={startVoice} light={light} />
      )}
    </div>
  )
}
