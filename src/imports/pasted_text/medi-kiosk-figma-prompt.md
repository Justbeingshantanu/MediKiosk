Perfect! I've successfully extracted the PDF. This is a MediKiosk - an AI-powered Clinical History Software Platform for Indian hospitals. Let me now create a comprehensive, upgraded Figma prompt based on this software's actual requirements.

COMPREHENSIVE FIGMA UI/UX DESIGN PROMPT: MediKiosk

AI-Powered Clinical History Software Platform - Complete Design Brief

EXECUTIVE SUMMARY

Design a sophisticated, multilingual, accessibility-first healthcare software platform called MediKiosk that enables patients in Indian hospitals (both allopathic and AYUSH settings) to independently record comprehensive medical histories through voice and touchscreen interaction, digitize existing medical documents via OCR, and generate structured physician-ready clinical summaries integrated with hospital systems and ABDM (Ayushman Bharat Digital Mission). The interface must support high-throughput patient flow, handle 2-5 minute user interactions, support multiple Indian languages, and comply with Digital Personal Data Protection Act 2023.

CORE DESIGN PRINCIPLES
Primary Brand Aesthetic
App Name: MediKiosk (Logo: Stethoscope + Kiosk + AI spark)
Color System: Clinical Blue (
#0066CC) for trust, Health Green (
#10B981) for wellness, Deep Teal (
#00897B) for AYUSH integration, Warm Orange (
#F97316) for interactive elements, Neutral Gray (
#6B7280) for secondary info
Typography: Inter (primary body), Poppins (headers, 28-36px bold), Monospace (medical terms/values)
Visual Style: Minimalist healthcare UI, high contrast for accessibility (WCAG AAA compliance), gesture-responsive touchscreen design (large tap targets 48-56px), voice-first visual feedback
Tone: Clear, trustworthy, non-intimidating, respectful of patient concerns
PAGE 1: LANGUAGE & ACCESSIBILITY WELCOME SCREEN (Entry Point)

Full-Screen Welcome Page (100vh)

Top Section (40%):

Large centered MediKiosk logo (medical + tech symbolism)
Headline: "आपका स्वास्थ्य इतिहास रिकॉर्ड करें | Record Your Health History | உங்கள் சுகாதார வரலாற்றை பதிவு செய்யவும்" (Multi-script support)
Subheadline: "Quick. Secure. Easy. भारतीय भाषाओं में समर्थित"

Middle Section (35%):

Language Selection Grid (4x2, large square buttons):
English with UK flag icon
हिंदी with Indian flag icon
தமிழ் (Tamil)
తెలుగు (Telugu)
ಕನ್ನಡ (Kannada)
ગુજરાતી (Gujarati)
বাংলা (Bengali)
Accessibility Options (wheelchair icon) → leads to accessibility settings

Language Button Specifications:

120px × 120px minimum, rounded 12px
Language name in native script (bold, 18px)
Country/region flag (40px)
Hover state: Gradient overlay + subtle scale (1.05x)
Selected state: Clinical Blue border (4px) + checkmark

Bottom Section (25%):

Accessibility Quick Links (Row of icon buttons):
🔊 "Audio-First Mode" → narrates all content
🔤 "Large Text & High Contrast" → WCAG AAA mode
🤟 "Sign Language Avatar" → animated sign-language guide (stretch goal)
♿ "Accessibility Settings" → detailed options

Action Button:

"Continue" (Large, gradient Clinical Blue to Teal, 60px height, 300px width)
Animated arrow icon (→) with pulse effect on load
PAGE 2: AUTHENTICATION & PATIENT IDENTITY VERIFICATION

Layout: Centered modal (500px width) on blurred hospital background

Section A: Login/New Patient Toggle Tabs
Tab 1: "Returning Patient" (default)
Tab 2: "First Time Visit"
Tab 3: "ABHA ID Login" (ABDM integration)
Returning Patient Tab:
Patient ID Input (12-digit hospital ID)
Label: "अपना मरीज ID दर्ज करें | Enter your Patient ID"
Input field: 12px padding, clinical blue focus state, placeholder: "XXX-XXX-XXX-XXX"
"Not remembering your ID?" → lookup by phone/name
Password/PIN Input (4-digit or password)
Label: "आपका PIN दर्ज करें | Enter 4-digit PIN"
Masked input with voice confirmation option
Voice unlock button: 🎤 "Verify via Voice"
Biometric Options Row (3 buttons):
👆 Fingerprint (if device supports)
👁️ Face Recognition
👂 Voice Biometric (Indian-language voice model)
Login Button: "Log In" (56px, full width, gradient)
Forgot PIN Link: Opens PIN recovery flow (SMS/email verification)
First Time Visit Tab:
Basic Demographics (4 fields):
Full Name (text input, 40px)
Phone Number (tel input with country code +91, 40px)
Age/DOB (number or date picker, 40px)
Gender (radio buttons: M/F/Other, 40px)
Appointment Details:
Department selector (dropdown): "Select Department - e.g., Cardiology, ENT, AYUSH, General"
Token/Appointment number (if applicable)
"Do you have an appointment?" toggle
Emergency Contact (Optional):
Name & phone (collapsible section)
Proceed Button: "Create Profile & Continue" (56px, clinical blue gradient)
ABHA ID Tab:
ABHA QR Scanner:
"Scan your ABHA QR code" with camera icon
Alternative: "Enter ABHA ID manually" (text input with validation)
Auto-populates demographics from ABHA registry

Security & Privacy Footer (every tab):

Lock icon + "Your data is encrypted and secure | डेटा एन्क्रिप्ट है"
"Privacy Policy" link (opens modal)
"Terms & Conditions" link
PAGE 3: PATIENT DASHBOARD (Home/Hub after login)

Layout: Full-screen dashboard with top nav bar + left sidebar + main content area

Top Navigation Bar (64px, fixed)

Left Section:

MediKiosk logo (32px)
Patient name displayed: "Welcome, राज कुमार | Raj Kumar"
Time remaining indicator (if timed consultation)

Center Section:

"Consultation in Progress" badge (if applicable) with green dot
Current status: "Providing History... | इतिहास प्रदान कर रहे हैं"

Right Section:

Help icon (?) with tooltip: "Need assistance? Ask a staff member"
Settings icon (⚙️) → patient settings (language, accessibility, volume)
Emergency flag icon (🚨) → alert staff
Logout button (⏻)
Main Content Area (3-Column Layout)
Left Panel: Patient Summary Card (280px, fixed)

White card with subtle shadow:

Patient Photo (120px circle, placeholder: initials in gradient)
Name: Large bold text (18px)
Patient ID: Gray text (12px)
Age/DOB: "Age: 45 | DOB: 15-Jun-1979"
Registered Since: "Member since 2 years"
Quick Info Grid (2 columns):
⚠️ Allergies: "Penicillin" (red badge if critical)
💊 Active Medications: "5 medications"
📋 Past Surgeries: "1 major surgery"
📊 Last Visit: "3 months ago"

Action Buttons (stacked):

"Edit Profile" (secondary, 40px)
"View Full History" (secondary, 40px)
Center Panel: Main Workflow (Dynamic, expandable)

Workflow Stage Cards (4 sequential stages with progress indicator):

Stage 1: Voice History Recording (Primary Card - Highlighted)

Header: "📢 Voice Conversation | वॉयस बातचीत" (Icon + bilingual label)
Status: "In Progress... 2 min remaining" (green progress bar, 85% filled)
Instructions: "Speak naturally. Tell us about your health concerns. | अपने स्वास्थ्य समस्याओं के बारे में बताएं"
Microphone Visualization:
Large circular animated microphone icon (animated sound waves pulsing)
Real-time waveform visualization (green/teal bars responding to speech)
Transcription display (scrollable): "I have had chest pain for 3 days... गत 3 दिनों से..."
Control Buttons:
⏸️ Pause (40px icon button)
🎤 Start/Stop Recording (56px large central button, pulsing animation)
🔄 Restart (40px icon button)
Response Area:
AI follow-up question displayed: "What was the character of the pain? Sudden or gradual?" (Subtitle: SOCRATES follow-up)
Animated avatar speaking (optional facial animation, accessibility: text + audio)
Response options below: "Sudden" | "Gradual" | "Both"

Visual Feedback During Recording:

Green pulsing border around card when active
Waveform animation synced to audio
Transcription updates in real-time
Confidence score indicator (speech recognition confidence: "95% confident")

Stage 2: Guided Touchscreen History (Secondary Card - Collapsed initially)

Header: "✋ Answer Questions | प्रश्नों के उत्तर दें" (Disabled state until Stage 1 complete)
Status: "Pending - Complete voice history first"
Brief Description: "Review and confirm your medical history with guided questions"
Progress: "0 / 15 questions completed"

Stage 3: Document Scanning & OCR (Secondary Card)

Header: "📄 Upload Medical Documents | चिकित्सा दस्तावेज़ अपलोड करें"
Status: "Ready"
Description: "Upload prescriptions, lab reports, discharge summaries, X-rays"
Upload Zone:
Drag-drop area (dashed border, 200px height)
Icon: 📸 + 📄 (camera + document)
Text: "Drag files or tap to select | फ़ाइलों को खींचें या टैप करें"
Supported formats badge: "PDF, JPG, PNG, DOCX"
Uploaded Files Counter: "5 documents uploaded"
Quick Scan Button: "📸 Use Camera Now" (60px height, clinical blue)

Stage 4: Summary Review (Tertiary Card)

Header: "✅ Review & Confirm | समीक्षा करें"
Status: "Pending - Waiting for history completion"
Description: "Doctor will review your complete medical history"
Estimated Time: "Summary ready in 2 min"
Right Panel: Additional Info & Resources (240px, scrollable)

Useful Tips Card:

💡 "Tips for Better History":
Be as detailed as possible
Mention medications names clearly
Describe when symptoms started
"Tap for more tips" → expandable

Upcoming Consultation Card:

👨‍⚕️ "Dr. Rajesh Sharma"
🏥 "Cardiology Department"
⏰ "Consultation starts in 15 min"
📍 "Room 402, Building A"

Recent Records Card:

Last 3 visits listed (expandable):
"Routine Checkup - 3 months ago"
"Medication Adjustment - 6 months ago"
"Annual Physical - 1 year ago"

Support Card:

📞 Staff Contact: "Tap to call staff member"
💬 Chat with support: "Live chat available"
PAGE 4: VOICE HISTORY RECORDING DETAIL PAGE (Full-Screen Interactive)

Immersive Voice Interface (when Stage 1 card clicked for full interaction)

Layout Structure:

Top Section (20%):

Breadcrumb: "Dashboard > Voice History" (small gray text, 12px)
Timer: "Consultation Time: 3:45 remaining" (dynamic countdown, color changes at 1 min to orange)
Back button (← icon) + "Pause & Return to Dashboard"

Main Center Section (70%):

AI Avatar Area (animated, 200x200px circle, center)
Avatar Character (animated):
Medical professional illustration (stethoscope, caring expression)
Eyes follow speech pattern (blinking, eye contact simulation)
Mouth animates with speech (phoneme-sync if possible)
Glowing border (teal/cyan) indicating active listening
Accessibility: Can be turned off in settings
Question Display (below avatar, 300px wide)
Current Question (20px bold): "I heard you mentioned chest pain. Let me ask a few more details."
Clinical Framework Display (12px gray): "Using SOCRATES Protocol"
Sub-question (16px, teal color): "When did the pain start? Was it sudden or gradual?"
Transcription Display (scrollable panel, 400px height, below)
Background: Light gray (
#F3F4F6)
Rounded border (8px)
Live transcription stream (updates in real-time)
Example:
  You: "I have chest pain that started 3 days ago..."
  AI: "Thank you. Was the onset sudden or gradual?"
  You: "It was sudden, happened while I was working..."
Text language: Patient's selected language + optional English translation (toggleable)
Confidence score per sentence: "🟢 95% confident" (green/yellow/red indicator)
Waveform Visualization (animated, 400px width, 100px height)
Real-time audio waveform (green bars, 20 bars minimum)
Peak indicator line
Synced to microphone input
Color changes: Green (normal) → Yellow (loud) → Red (too loud)
Bottom Section (10%): Control Panel

Primary Control Button:

Large circular microphone (100px diameter)
Pulsing red ring while recording (animation intensity varies with volume)
Text above: "🎤 RECORDING" (red, bold, 18px)
Text below: "Tap to stop"
Tap to toggle record on/off

Secondary Control Row (below, 3 buttons, 56px each):

⏸️ Pause: Stops recording temporarily, retains conversation
🔄 Restart: Clears current conversation, starts over
🔊 Volume: Adjusts speaker volume (slider in popup)

Help Section (bottom left):

"?" Icon → Tooltip: "Not understanding? Try speaking more slowly or clearly"
🎧 "Audio Settings" → Adjust microphone sensitivity, language

Skip/Next Button (bottom right, initially disabled):

"Next: Document Scan" (becomes active after minimum 2 minutes of conversation or certain completeness threshold)
Gray when disabled, blue when enabled
PAGE 5: GUIDED TOUCHSCREEN QUESTIONS PAGE

Full-screen, question-by-question guided interaction

Layout:

Top Progress Bar (120px)

Visual progress: "Question 5 of 15" with circular progress indicator (animated)
Category label: "📋 Past Medical History | पिछली चिकित्सा इतिहास" (current section)
Skip section button (small, optional)

Main Question Area (80vh, centered vertical scroll)

Question Card (600px width, centered):

Question Header (bold, 24px, teal):
"Have you been diagnosed with diabetes or high blood pressure? क्या आपको मधुमेह या उच्च रक्तचाप का निदान हुआ है?"
Bilingual Question (subtext, 14px gray):
English on top, Hindi/local language below, can be toggled

Answer Options (depends on question type):

Type 1: Yes/No Buttons:

[YES - Green]  [NO - Gray]
120px × 60px buttons, rounded 8px
Selected state: Solid green + checkmark
Unselected: Gray outline

Type 2: Multiple Choice (Single select):

🔘 High Blood Pressure (Hypertension)
🔘 Diabetes Type 1
🔘 Diabetes Type 2
🔘 Pre-diabetes
🔘 None of these
Radio buttons (circular, 24px)
Full-width option buttons (60px height, left-aligned)
Hover: Light blue background
Selected: Blue radio button filled + blue background
Font: 16px

Type 3: Multiple Selection (Checkboxes):

☐ Asthma
☐ COPD
☐ Tuberculosis (past)
☐ Pneumonia
☐ None of these
Checkbox buttons (square, 24px)
Multiple can be selected
Selected: Teal checkmark + teal background

Type 4: Conditional/Follow-up (Dropdown + Input):

"If yes, please specify duration: [Select years] [Dropdown] / [Input field]"
Becomes visible only if "Yes" selected
Smooth slide-in animation (300ms)

Type 5: Numeric Input (for values):

"How many medications are you taking? [Input: 0-9] medications"
Input box: 80px width, 40px height
Increment/Decrement buttons (+/-) on sides
Validation: Must be 0-25

Type 6: Date Selection:

"When was your last surgery? [Date Picker]"
Calendar popup or date input (YYYY-MM-DD)
Default to estimated if exact date unknown

Type 7: Slider Input (for severity/pain):

"Rate your current pain level: [Slider 1-10]"
Animated slider, 300px width
Numbers 1-10 displayed
Color gradient: Green (low) → Yellow (medium) → Red (high)
Voice option: "Say the number aloud"

Type 8: Text Input (for descriptions):

"Please describe your symptoms in detail:"
Textarea: 400px width, 120px height
Placeholder: "उदाहरण: दर्द तीव्र है, सीने में..."
Voice-to-text button: 🎤 "Speak instead"
Character counter: "0/500 characters"

Action Buttons (below question, 60px height):

Previous (secondary gray): Returns to prior question
Skip (secondary): Optional questions can be skipped
Next (primary clinical blue): Proceeds to next question, validates required fields

Audio Assistance:

🔊 "Read aloud" button: Re-reads question in spoken language
Volume control slider (popup)

Skip Logic Handler:

If answer changes question flow, smooth transition
Example: If "No surgeries" → Surgery date questions skip automatically
Animation: Fade out + fade in next question (200ms)

Progress Persistence:

Auto-saves answer every 5 seconds (visual indicator: small save icon, "Saving...")
If session interrupted: "Resume from Question 5" prompt on re-entry
PAGE 6: DOCUMENT SCANNING & OCR PAGE

Two-Column Layout (50/50 split) or Responsive Stacked

Left Column: Upload/Capture Area (500px)

Section 1: Upload Options (3 button grid):

Button 1: Camera Capture

📷 CAPTURE NOW
Scan with device camera
150px × 150px square button, rounded
Teal gradient background
Opens camera interface with document detection overlay
Live preview: Shows camera feed in real-time
Auto-crop: Detects document edges and crops automatically
Multiple page support: After capture, "Add another page" option

Button 2: File Upload

📁 UPLOAD FILES
Select from device storage
Gray button, similar styling
Opens file picker: Filters to PDF, JPG, PNG, DOCX
Supports multiple file selection
Drag-and-drop also enabled

Button 3: Take Photo

📸 PHOTO GALLERY
Select existing photos
Gray button
Opens gallery/photos app
Filter to healthcare-related images

Section 2: Drag-Drop Zone (below, 300px height)

┌─────────────────────────────────────┐
│  Drag medical documents here        │
│                                     │
│         📄 📸 📋                     │
│                                     │
│   Or tap to browse files            │
│                                     │
│   Accepted: PDF, JPG, PNG, DOCX    │
└─────────────────────────────────────┘
Dashed border (clinical blue, 2px)
Hover state: Solid border, light blue background
Active drag: Highlighted with animation

Section 3: Document Info Tips (collapsible card)

"Tips for Best Results":
✅ Flat, well-lit documents
✅ Face document straight to camera
✅ No glare or shadows
✅ Entire document visible in frame
"Show examples" → image carousel

Section 4: Progress Indicator (if uploading)

Uploading: Lab Report_2024.pdf    [████████░░] 85%
Stacked file upload bars
File name, file size, progress bar
Success/error icons
"Upload more files" or "Continue to next" button
Right Column: Uploaded Documents & Preview (500px, scrollable)

Section 1: Uploaded Files List (200px height, scrollable)

Document Card (for each uploaded file):

┌─────────────────────────────────────┐
│ [PDF ICON]  Lab Report              │
│             Uploaded 2 min ago      │
│ ✅ OCR Complete                     │
│ Entities Extracted: 15              │
│                                     │
│ [⋯] [👁️ Preview]  [✓] [×]          │
└─────────────────────────────────────┘
Document thumbnail (60px, colored by type)
File name (bold, 14px)
Timestamp (gray, 12px)
Status badge: "✅ OCR Complete" / "⏳ Processing" / "❌ Error"
Extracted entities count: "15 medical entities found"
Action buttons:
Preview icon (👁️): Opens full document viewer in modal
Checkmark (✓): Confirms document is correct
X: Deletes document, prompts confirmation

Document Preview Modal (overlaid, 700px wide):

Full-page document viewer
Zoom controls (-, +, fit-to-width)
Page navigation (1/5)
Highlighted entities (in teal boxes):
Medications: "Metformin 500mg"
Diagnoses: "Type 2 Diabetes"
Lab values: "FBS: 156 mg/dL ⚠️ HIGH"
Annotations panel: User can add notes

Section 2: Extracted Data Summary (scrollable, 250px height)

Collapsible Category Cards:

📋 DIAGNOSES (3 found)  ▼
├─ Type 2 Diabetes (Since 2018)
├─ Hypertension (Since 2015)
└─ Hyperlipidemia (Since 2020)

💊 MEDICATIONS (7 found)  ▼
├─ Metformin 500mg twice daily
├─ Enalapril 10mg once daily
├─ Atorvastatin 20mg once daily
└─ [+4 more]

🧪 LAB VALUES (12 found)  ▼
├─ FBS: 156 mg/dL ⚠️ (High)
├─ HbA1c: 7.8% ⚠️ (High)
├─ LDL: 145 mg/dL ⚠️ (High)
└─ [+9 more]

🏥 SURGERIES (1 found)  ▼
└─ Appendectomy - June 2015
Each category is a collapsible card
Icons for category type
Count badge (number found)
Expand arrow (▼/▲)
Abnormal values highlighted (orange or red background)
Edit button per item: "Edit this entry" (pencil icon)
Confidence scores: "95% confident" (small green badge)

Section 3: Quality Assurance (callout box)

⚠️ Manual Review Needed
2 lab values couldn't be extracted with confidence.
Please confirm manually.

[Lab Value 1: ______] [Lab Value 2: ______]
Shows extraction uncertainties (< 80% confidence)
Input fields for manual correction
Confirmation button
PAGE 7: CLINICAL SUMMARY GENERATION & REVIEW PAGE

Full-width, professional medical document layout

Top Section: Summary Status & Controls (100px)

Status Badge (left):

🟢 "Summary Ready" OR ⏳ "Generating Summary..."
Real-time progress: "Analyzing 8 data sources... 75% complete"

Action Buttons (right):

🔄 Regenerate (if unsatisfied with summary)
📄 Download as PDF (for patient copy)
🔗 Share with ABHA (push to health records)
← Back & Edit (return to prior stages)
Main Content: Physician-Ready Clinical Summary (formatted as standard medical note)

Document Header (clinical document style):

════════════════════════════════════════════════════════════
                    CLINICAL HISTORY SUMMARY
                         (Patient-Generated)
════════════════════════════════════════════════════════════
Patient ID: MK-2024-0089457    |  Name: Rajesh Kumar Singh
DOB: 15-Jun-1979 (Age 45)      |  Gender: Male
Generated: 31-Aug-2026 14:32   |  Duration: 6 min 45 sec
────────────────────────────────────────────────────────────

1. CHIEF COMPLAINT | मुख्य शिकायत

Chest pain for 3 days, associated with mild dyspnea on exertion
Font: 14px, bold
Bilingual (English + local language in smaller text below)

2. HISTORY OF PRESENT ILLNESS | वर्तमान बीमारी का इतिहास

Structured using SOCRATES framework:

Symptom: Chest pain
Onset: 3 days ago, sudden onset while working
Character: Crushing, central chest pressure
Radiation: To left arm and jaw
Associated symptoms: Shortness of breath, mild sweating
Timing: Occurs 2-3 times daily, worse in morning
Exacerbating factors: Physical exertion, stress
Relieving factors: Rest, antacids provide partial relief
Severity (1-10): 7/10

Additional history captured:
- Recent stress at work
- Sleep disturbance for past week
- No significant fever or cough
Bulleted format, clear hierarchy
Color coding: Risk factors in red, protective factors in green
Extracted directly from voice + guided questions

3. PAST MEDICAL HISTORY | पिछली चिकित्सा इतिहास

- Type 2 Diabetes Mellitus (Since 2018, on treatment)
- Hypertension (Since 2015, controlled)
- Hyperlipidemia (Since 2020, on statin therapy)
- Hypothyroidism (Since 2010, on levothyroxine)
List format with onset dates
Treatment status noted
Icons for each condition (pill icon, blood pressure cuff icon, etc.)

4. MEDICATIONS & ALLERGIES | दवाएं और एलर्जी

Current Medications:                  ALLERGIES:
- Metformin 500mg BID                🔴 PENICILLIN (Rash)
- Enalapril 10mg OD                  🟡 Sulfonamides (GI upset)
- Atorvastatin 20mg OD               ✓ NKDA (No Known others)
- Levothyroxine 75mcg OD
- Aspirin 75mg OD
Medication with dosage/frequency
Allergy severity color-coded (red = critical, yellow = moderate)
Clear medication list for verification

5. FAMILY HISTORY | पारिवारिक इतिहास

- Father: Deceased, age 68 (Coronary artery disease)
- Mother: Age 70, Hypertension
- Siblings: 2 brothers, no known illness
- No family history of diabetes or malignancy reported
Bullet points with relationships
Risk factors highlighted

6. SOCIAL HISTORY | सामाजिक इतिहास

Occupation: Software Engineer, high-stress job
Alcohol: Occasional (2-3 units/week)
Tobacco: Non-smoker
Exercise: Sedentary lifestyle, minimal activity
Diet: Mixed, high salt intake acknowledged

7. REVIEW OF SYSTEMS | सिस्टम की समीक्षा

✓ Cardiovascular: Chest pain (primary concern), palpitations denied
✓ Respiratory: Mild dyspnea on exertion, no cough
✓ GI: Appetite normal, no nausea/vomiting
✓ CNS: No headaches, no focal neurological symptoms
✓ Endocrine: Polyuria/polydipsia well-controlled
✓ Other systems: Reviewed and unremarkable
Checkbox format with key findings
Organized by body system
Green checkmarks indicate reviewed systems

8. PRIOR INVESTIGATIONS (Last 6 months) | पिछली जांचें

Date         Test                Result        Status    Reference Range
─────────────────────────────────────────────────────────────────────────
15-Aug-2026  FBS (Fasting)       156 mg/dL     ⚠️ HIGH   70-100 mg/dL
15-Aug-2026  HbA1c              7.8%          ⚠️ HIGH   <5.7%
15-Aug-2026  LDL Cholesterol    145 mg/dL     ⚠️ HIGH   <100 mg/dL
15-Aug-2026  HDL Cholesterol    38 mg/dL      ⚠️ LOW    >40 mg/dL
15-Aug-2026  Triglycerides      198 mg/dL     ⚠️ HIGH   <150 mg/dL
10-Aug-2026  TSH                1.8 mIU/L     ✓ Normal  0.4-4.0 mIU/L
Table format with columns: Date, Test, Result, Status, Reference
Abnormal values highlighted (orange for borderline, red for critical)
Status icons: ✓ (normal), ⚠️ (abnormal)
Sortable/filterable by test or date

9. IMAGING/PROCEDURES (if available)

- None reported in past 6 months
- Patient notes: "Chest X-ray done 2 years ago, was normal"

10. DATA QUALITY INDICATORS (Metadata)

Voice Conversation: 6 min 45 sec | 95% transcription confidence
Guided Questions: 15/15 completed
Documents Uploaded: 8 documents (OCR confidence 92% average)
Data Completeness Score: 96/100

Issues flagged for physician review:
⚠️ Patient reports symptoms concerning for cardiac event - 
   recommend immediate clinical correlation
⚠️ HbA1c and lipid profile not optimally controlled
Confidence scores provided
Completeness metrics
Red flags highlighted for physician attention
Bottom Section: Physician Interaction Area (150px)

Review Status Toggle:

Radio buttons: "✓ Confirmed as accurate" | "⚠️ Needs clarification" | "❌ Incorrect - needs re-entry"

Physician Comments Box (if in doctor mode):

Textarea: "Physician notes / corrections"
300px width, 80px height
"Save changes" button

Next Action Buttons:

For Patient Mode: "Show Summary to Doctor" (large, clinical blue, 60px)
For Doctor Mode: "Save to EMR" (large green) | "Request Clarification" (orange)
PAGE 8: CONSENT & PRIVACY VERIFICATION PAGE

Modal overlay (600px width) with scroll

Header
🔒 PRIVACY & CONSENT VERIFICATION
एन्क्रिप्ट किया गया और सुरक्षित
Bold, 24px, teal color
Subtitle: "Please review and confirm your data sharing preferences"
Consent Sections (collapsible accordion)

Section 1: Data Collection Consent ✓ (default checked)

☑️ I consent to recording my voice and medical history for 
   creating this clinical summary.

   I understand that:
   ✓ My voice will be transcribed and processed
   ✓ This data is encrypted and stored securely
   ✓ This information will be used only for this consultation
   ✓ I can withdraw this consent at any time
   
   [Learn more about data handling] →
Checkbox (initially checked)
Plain language explanation
Nested bullet points
Link to detailed privacy policy

Section 2: Hospital EMR/HIS Integration ✓ (default checked)

☑️ I consent to share my clinical summary with the hospital
   information system (EMR) for this consultation.

   ✓ Only hospital staff with access permissions can view
   ✓ Data is linked to my patient ID: MK-2024-0089457
   ✓ I can request data access reports anytime
   
   [View hospital privacy policy] →

Section 3: ABHA Integration ☐ (default unchecked)

☐ I consent to link my clinical summary to my ABHA Personal 
   Health Record (Ayushman Bharat Digital Mission).

   This will allow:
   • Multiple healthcare providers to access my records
   • Better continuity of care across hospitals
   • My own access to health records anytime
   
   ABHA ID: XXXX-XXXX-XXXX-XXXX
   [Verify ABHA ID] →
   
   ⚠️ Important: Once shared to ABHA, data becomes visible to 
   other authorized providers. You can revoke access anytime.
Checkbox (opt-in, not checked by default)
Warning callout (yellow background)
ABHA ID displayed and verifiable

Section 4: Research & Analytics ☐ (default unchecked)

☐ I consent to anonymized use of my data for improving 
   MediKiosk AI algorithms (optional).

   ✓ Your name and ID will be removed
   ✓ Only clinical patterns will be used
   ✓ No identifiable information shared
   ✓ You can opt-out anytime
   
   [Review research ethics policy] →

Section 5: Data Retention (info only, no checkbox)

ℹ️ Data Retention Policy:

Your data will be retained as follows:
- Hospital records: 7 years (per hospital policy)
- ABHA records: Indefinitely (under your control)
- Backup: 30 days
- You can request deletion anytime (except statutory retention)

[Full data retention policy] →
Privacy Summary Box (info callout)
🔐 Your Privacy is Protected

- 256-bit AES encryption
- HIPAA-equivalent security (Digital Personal Data 
  Protection Act 2023 compliant)
- No third-party ads or data selling
- Security audit: Last reviewed 15-Aug-2026
Green background, lock icon
Clear security assurances
Action Buttons (bottom, stacked)

Primary Button:

[✓ I Agree & Continue]  (56px, full width, green gradient)
Enabled only if Section 1 is checked
Disabled state: Gray, with tooltip "Please review all sections"

Secondary Option:

[❓ Need Clarification] (40px, secondary)
Opens consent help modal with FAQs

Cancel/Exit:

[← Back to Summary] (small, tertiary)
PAGE 9: DOCTOR/PHYSICIAN INTERFACE - SUMMARY REVIEW & ENTRY

Split-screen layout (65% left | 35% right)

Left Panel: Patient Summary (Read-Only Display)

(Same as Page 7 but in compact format, 14px font)

Displays the patient-generated summary
Color-coded sections
Scrollable, with section anchors (navigation sidebar)
Right Panel: Physician Control Panel (Fixed, 400px width)

Section 1: Patient Verification (top, 100px)

┌─────────────────────────────────────┐
│ Patient Verified ✓                  │
│ Name: Rajesh Kumar Singh            │
│ Age: 45 | ID: MK-2024-0089457      │
│ Appointment: Cardiology, Dr. Sharma │
│                                     │
│ [View Full Record] [Patient Photo]  │
└─────────────────────────────────────┘
Green checkmark indicating patient identified
Quick patient info snapshot
Links to full medical record, recent visits

Section 2: Quick Assessment (120px)

Key Risk Flags:
🔴 Acute chest pain (3 days)
🟠 Uncontrolled lipids (LDL 145)
🟠 Suboptimal glycemic control (HbA1c 7.8)
🟢 Allergy documented (Penicillin)

Clinical Priority: HIGH
Recommend: Immediate ECG + troponin
Color-coded risk assessment
Quick clinical decision support
Recommendation engine output

Section 3: Summary Actions (280px, scrollable)

Radio Group: Summary Confirmation

○ ✓ Accurate as provided - sign off
○ ⚠️ Needs minor corrections
○ ❌ Requires substantial re-entry
○ 📞 Need to call patient back

If "Needs Corrections" selected → Appears:

Correction Interface:

Which sections need editing?
☐ Chief Complaint
☑️ Past Medical History
☐ Medications
☑️ Lab Values
☐ Family History
☐ Social History
☐ Other

[Edit Selected Sections]
Checkboxes for each section
Opens inline edit mode for selected sections
Changes tracked with physician initials + timestamp

Physician Notes Section:

Add clinical notes for this patient:

[Textarea - 300px width, 100px height]

Additional observations not captured:
_________________________________

__________________________________

Recommended follow-up: __________ weeks
Freetext entry (with voice-to-text option for busy physicians)
Character limit: 2000 chars
Auto-save every 30 seconds

Section 4: Next Steps (120px)

Action Selection:

[✓ Save to EMR]  (green, 56px)
[+ Add Prescription]  (blue, 56px)
[+ Order Tests]  (blue, 56px)
[Print Summary]  (gray, 40px)
[Share via ABHA]  (teal, 56px)

Signature Block (if required):

Physician Name: Dr. Rajesh Sharma
Signature: [Digital signature pad / e-signature]
Timestamp: 31-Aug-2026 14:52
License ID: [displayed, verified ✓]
PAGE 10: SETTINGS & ACCESSIBILITY PAGE

Two-column layout (40% settings nav | 60% content)

Left Sidebar: Settings Categories
👤 Account Settings
  ├─ Profile & Demographics
  ├─ Credentials (if physician)
  └─ Two-Factor Authentication

🔒 Privacy & Security
  ├─ Data Sharing Preferences
  ├─ ABHA Integration
  └─ Session Security

🌐 Language & Accessibility
  ├─ Language Preference
  ├─ Audio Settings
  ├─ Visual Accessibility
  └─ Input Methods

📱 Device Settings
  ├─ Camera Settings
  ├─ Microphone Calibration
  └─ Connection Preferences

ℹ️ Support & Feedback
  ├─ Help & Documentation
  ├─ Contact Support
  ├─ Provide Feedback
  └─ About MediKiosk
Sidebar menu (280px fixed)
Current selection highlighted (blue background)
Expandable subcategories
Right Content Area: Settings Details (Scrollable, 700px)
Language & Accessibility Page Example:

Current Language Selection:

Current Language: हिंदी (Hindi)

Available Languages:
○ English (International)
○ हिंदी (Hindi)
●  தமிழ் (Tamil)
○ తెలుగు (Telugu)
○ ಕನ್ನಡ (Kannada)
○ [+5 more languages]

[Detailed Language Settings]

Voice & Audio Settings:

🎤 Microphone Settings:
   • Sensitivity: ━━━━●━━━ (Medium)
   • Noise cancellation: ☑️ Enabled
   • Test microphone: [🎤 Start Test] (records 3 sec)

🔊 Speaker Settings:
   • Volume: ━━━━●━━━ (Medium)
   • Speed: 1.0x (options: 0.75x, 1.0x, 1.25x, 1.5x)
   • Test audio: [▶ Play Sample]
   
🎧 Headphones Auto-Detection: ☑️ On

ASR Language: हिंदी (Hindi)
⚠️ Other languages may have lower accuracy. 
   Consider using guided questions for backup.

Visual Accessibility:

Display Settings:
☑️ High Contrast Mode (improves readability for low vision)
☑️ Large Text (18px instead of 14px)
☐ Dark Mode (enables at 9 PM - 6 AM)
☐ Reduce Animation (minimizes motion)

Font Selection:
○ Sans Serif (Default)
●  Serif (easier to read for some)
○ Dyslexia-friendly font

Color Blindness Mode:
○ None (Default)
○ Protanopia (Red-Blind)
○ Deuteranopia (Green-Blind)
○ Tritanopia (Blue-Yellow Blind)

Text Size: ━━●━━ (14px) [+ text increases]

[Preview Mode] → Shows entire app with accessibility settings applied

Input Method Preferences:

Preferred Input:
○ Voice (Primary) - with touchscreen backup
● Voice + Touchscreen (Recommended)
○ Touchscreen only

Tap Target Size: 48px (currently)
Options: 40px, 48px, 56px, 64px

Gesture Sensitivity: Medium
Options: Low, Medium, High

[Customize Gesture Controls] → Reassign swipes/taps

Screen Reader Compatibility:

☑️ Screen Reader Support (ARIA labels enabled)
☑️ Announce button states on focus
☑️ Pause animations for screen reader navigation

Compatible readers: JAWS, NVDA, VoiceOver (iOS)

[Test with Screen Reader] → Starts narration of entire screen
PAGE 11: COMPLETION & HANDOFF PAGE

Full-screen success page (celebration themed, but professional)

Top Section (40%): Success Confirmation
✅ MEDICAL HISTORY SUCCESSFULLY RECORDED
आपका चिकित्सा इतिहास सफलतापूर्वक दर्ज हुआ
Large green checkmark (animated, appears on load)
Confident, professional tone
Bilingual messaging
Summary Stats (3-column grid)
┌─────────────┬──────────────┬──────────────┐
│  📢 Voice   │  📄 Docs     │  ✅ Summary  │
│             │              │              │
│  6:45       │  8 files     │  96/100      │
│  duration   │  processed   │  complete    │
└─────────────┴──────────────┴──────────────┘
Large icons
Key metrics displayed
Professional color scheme
Middle Section (30%): What Happens Next
➡️ NEXT STEPS

1. Your clinical summary has been sent to Dr. Sharma
2. You will be called to the consultation room in approx. 2 minutes
3. The doctor has your complete medical history ready
4. Bring your original documents for reference if needed

⏱️ Wait Time: Approximately 2 minutes
📍 Location: Room 402, Building A, 2nd Floor
👨‍⚕️ Your Doctor: Dr. Rajesh Sharma, Cardiologist
Numbered steps
Clear instructions
Realistic timelines
Contact information
Bottom Section (30%): Quick Actions
[📋 View Your Summary] [🏥 Cancel Appointment]
[📞 Call Staff]        [💬 Chat Support]
Utility buttons
Return to dashboard option
Support contact readily available
Background Elements:
Subtle celebration animation (confetti particles, very minimal)
Light gradient background (hospital-appropriate, not too festive)
Accessibility: Confetti can be disabled in accessibility settings
PAGE 12: ERROR HANDLING & OFFLINE MODES
Error Pages (various error conditions)

1. Microphone Permission Denied

🎤❌ MICROPHONE ACCESS DENIED

We need your microphone to record your medical history.

Actions:
[Allow Microphone] → Opens settings
[Use Text/Touchscreen Instead] → Skips to Page 5 (guided questions)
[Call for Staff Assistance] → Alerts staff

2. Document Upload Failed

❌ UPLOAD FAILED

File: Lab_Report_2024.pdf (4.2 MB)
Reason: File exceeds maximum size (2 MB)

Actions:
[Retry with Smaller File]
[Try Different Format]
[Skip Document Upload]
[Contact Support]

3. OCR Processing Error

⚠️ DOCUMENT CLARITY ISSUE

We couldn't read this document clearly. This might be due to:
- Poor image quality
- Handwritten text (testing handwriting support)
- Multiple languages in one document

Actions:
[Re-scan Document]
[Manual Entry of Key Data]
[Skip This Document]

4. No Internet Connection

📡 No Internet Connection

Your data has been saved locally. When connection is restored:
✓ All your responses will be uploaded automatically
✓ Your session will resume where you left off

[Retry Connection]
[Continue Offline] (limited functionality)

5. Session Timeout

⏱️ SESSION EXPIRED

Your session has timed out after 30 minutes of inactivity.

Your progress was saved:
✓ Voice history: Saved up to Q12
✓ Documents: 5 files uploaded & processed
✓ Guided questions: 7 of 15 completed

[Resume Session] [Start Fresh]
COMPONENT LIBRARY SPECIFICATIONS
Buttons
Primary: 56px height, full-width (mobile) / fixed width (desktop), clinical blue gradient, white text, rounded 8px
Secondary: 48px height, gray outline, dark text, rounded 8px
Tertiary: 40px height, text-only, teal color
Disabled State: Gray background, no hover effect
Loading State: Animated dots, text changes to "Loading..."
Input Fields
Text Input: 40px height, 8px padding, 1px border (light gray), blue focus state (2px)
Textarea: Min 100px height, same styling as text
Dropdown: Same height as inputs, down arrow icon
Date Picker: Calendar popup, validation for realistic dates
Cards
Standard: White background, 8px rounded, subtle shadow (0.5px blur, 8% opacity)
Alert Card: Color-coded background (red/yellow/green) with left border accent
Collapsible: Arrow icon (▼/▲) with smooth 300ms animation
Icons
Icon Set: Medical-themed (stethoscope, pill, heart, etc.) + standard UI icons
Size Variations: 24px (small), 32px (medium), 48px (large), 64px (extra large)
Color: Inherit from context (blue, green, red, gray)
Badges & Labels
Status Badge: 24px height, rounded pill, colored text + background
Tag/Chip: 28px height, rounded, removable (X icon)
Alert Badge: Triangle icon + color (red/yellow)
Modals
Backdrop: Semi-transparent black (rgba(0,0,0,0.5))
Content: White, 500-700px width (responsive), rounded 12px, shadows
Close Button: Top-right corner, X icon
Animations: Fade-in 300ms, centered with scale transition
RESPONSIVE DESIGN BREAKPOINTS
Desktop (1200px+)
Full layout with all panels visible
Sidebar always visible (280px)
3-column layouts enabled
Tablet (768px - 1199px)
Hamburger menu for sidebar
Stack main content and right panel
Touch-optimized buttons (56px minimum)
Modal dialogs replace some panels
Mobile (under 768px)
Single column layout
Full-screen panels with back navigation
Touch-only interaction
Larger touch targets (64px)
Simplified forms (fewer fields per page)
Bottom navigation bar (50px, fixed)
ACCESSIBILITY COMPLIANCE
WCAG 2.1 AAA compliance target
Color Contrast: Minimum 7:1 for text, 4.5:1 for UI
Focus Indicators: Visible 2px blue outline on all interactive elements
Keyboard Navigation: Tab through all elements logically, Enter to activate
Screen Reader: Proper ARIA labels, semantic HTML
Motion: Respect prefers-reduced-motion setting (disable animations)
Language: Multilingual support for 8+ Indian languages
Text Alternatives: Alt text for all images, captions for audio
INTERACTION DESIGN & MICRO-INTERACTIONS
Button Feedback: 100ms scale (1.05x) + color shift on click
Page Transitions: 200ms fade-in + slide-up animation
Loading States: Animated skeleton loaders, spinning icons
Toast Notifications: Auto-dismiss 4 seconds, stacked if multiple
Voice Feedback: Subtle beep on successful action, error tone on failure
Progress Indicators: Smooth animation as % increases, circular or linear
Hover Effects: 10% darker shade, slight shadow lift (3px)
SECURITY & COMPLIANCE VISUAL INDICATORS
Lock Icon in header (always visible): Green when secure, red if unsecured
Encryption Badge: "🔐 End-to-End Encrypted" (persistent display)
Compliance Indicators: "HIPAA-equivalent", "DPDP 2023 compliant" (footer)
Session Status: "Secure session active" (timer if applicable)
Trust Badges: Verified hospital, security certificates (if applicable)
PERFORMANCE TARGETS
Page Load Time: < 2 seconds (LTE network)
Interaction Latency: < 100ms (button feedback)
Animation Frame Rate: Smooth 60fps
Voice Processing Latency: < 1 second (ASR response)
Document Upload: Optimized for high-latency networks (progress feedback)
DELIVERABLES FOR FIGMA
✅ Component Library (300+ components):
Buttons (all states)
Input fields & forms
Cards & modals
Icons (60+ medical/UI icons)
Status badges & alerts
Navigation components
✅ Complete Page Mockups (All 12 pages):
Desktop (1920px)
Tablet (768px)
Mobile (375px)
✅ Interactive Prototypes:
Voice recording interaction (simulated waveform)
Document upload flow
Conditional question branching
Consent toggle interactions
Physician edit interface
✅ Design System:
Color palette (with accessibility contrast ratios)
Typography scales (5 font sizes)
Spacing/grid system (8px base)
Shadow system (3 levels)
Motion/timing specifications
✅ Accessibility Annotations:
ARIA labels per component
Focus order documentation
Color contrast verification
Keyboard shortcut list
✅ Language Variants:
English
हिंदी (Hindi)
All major Indian language layouts
✅ Handoff Documentation:
Component usage guide
Spacing & sizing specifications
Export assets (SVGs, PNGs)
Developer implementation notes
SUCCESS METRICS FOR PHYSICIAN & PATIENT UX
Patient Engagement: 95%+ completion rate before consultation
Time Reduction: Average 6-8 minute history recording (vs. 15+ minutes manual)
Accuracy: 98%+ structural data accuracy (from OCR + AI)
Satisfaction: 4.5+/5.0 rating from both patients and doctors
Document Processing: 95%+ successful OCR with entity extraction
Accessibility: Zero accessibility violations in automated audits