# Placement Assistant

---

An open-source, full-stack AI platform that conducts **real-time conversational mock interviews**. Upload your resume, select your desired role and difficulty, and participate in a highly dynamic voice-to-voice interview. Receive a comprehensive analytics report detailing your technical proficiency, behavioral adherence, and communication skills to help you ace your next real-world interview.

---

## 🌟 Features

### 🎙️ AI Conversational Engine
- **Voice-to-Voice Interaction** — Headless native TTS reads the AI's questions to you out loud, while you respond using your microphone.
- **Stable Audio Chunking** — Employs a custom Web Speech API architecture with non-continuous chunking to prevent browser memory buffer crashes during long-form answers.
- **Dual-Layer Transcription** — Uses the browser's Web Speech API for instant visual UI feedback, while securely streaming raw `MediaRecorder` audio blobs to the backend for flawless, professional-grade transcription via **Groq Whisper (`whisper-large-v3`)**.
- **Context-Aware Follow-Ups** — The AI acts as a human interviewer, analyzing your previous answer to ask targeted follow-up questions, point out mistakes, or acknowledge correct logic before moving on.

### 📝 Resume-Driven Questions
- **Dynamic Question Generation** — Automatically parses your uploaded PDF resume to generate tailored, hyper-specific technical and behavioral questions based on your actual experience and projects.
- **Role & Difficulty Selection** — Fully customizable interview configurations (e.g., Frontend Engineer at "Hard" difficulty).
- **Custom Interview Parameters** — Choose exactly how long the interview should last (5 to 30 minutes) and define custom target roles if the presets don't match your exact niche.

### 📊 Comprehensive Analytics
- **Holistic Scoring** — Generates a 0-100 overall score, hireability score, and a predicted role-fit percentage.
- **Granular Metrics** — Detailed breakdown of Communication (WPM, clarity, conciseness), Technical (depth of knowledge, best practices), and Behavioral (confidence, STAR method adherence) metrics.
- **Feedback per Question** — Individualized feedback for every question asked, highlighting your strongest and weakest statements, along with a suggested "perfect" answer.
- **Global Dashboard Statistics** — High-density dashboard featuring a 6-month activity heatmap, longitudinal topic mastery tracking, and historical performance metrics.
- **Resume Skill Coverage** — Cross-references your parsed resume against your target role to display a Match Rate percentage, alongside visually separated validated skills and missing requirements.
- **Practice Queue & Weak Topics** — Automatically catalogs your weak areas from past interviews into an actionable practice queue.

### 💡 Intelligent Doubt Solver
- **Context-Aware Assistance** — Dedicated doubt-solving chat interface that retains interview history and helps clarify complex topics or misunderstood questions in real time.
- **Image Support** — Upload screenshots of code or errors for the AI to analyze and provide visual-context-aware explanations.

### 🔒 Platform & Security
- **Google OAuth Integration** — Sign in effortlessly with Google.
- **Secure Cookie-Based Auth** — HttpOnly, Secure JWT cookies with cross-origin support for production deployments.
- **Session Management** — Pause an interview to resume later, or manually end the session early to trigger immediate report generation.

---

## 🏗️ System Architecture

```text
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Setup   │→ │ Live     │→ │ Analytics│  │ History │  │
│  │  Page    │  │ Interview│  │ Report   │  │ Page    │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
│       ↓              ↓             ↓            ↓       │
│  ┌──────────────────────────────────────────────────┐   │
│  │           Web Speech API (TTS & STT)             │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP REST / Audio Blobs
┌─────────────────────────┴───────────────────────────────┐
│                   Express Backend                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐  │
│  │  Routes  │→ │Controllers│→│ Services │→ │ Models  │  │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘  │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │           External AI Services (Groq)            │   │
│  │  ┌─────────────────┐       ┌──────────────────┐  │   │
│  │  │ LLaMA 3.3 70B   │       │ Whisper-Large-V3 │  │   │
│  │  │ (Logic & Chat)  │       │ (High-Fi Audio)  │  │   │
│  │  └─────────────────┘       └──────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                      ↓                                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │              MongoDB Atlas                       │   │
│  │  ┌──────┐  ┌───────────┐  ┌──────────┐           │   │
│  │  │Users │  │Interviews │  │ Analytics│           │   │
│  │  └──────┘  └───────────┘  └──────────┘           │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

---

## 💻 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI framework |
| React Router v7 | Client-side routing |
| Vite 8 | Build tool & dev server |
| TailwindCSS | Utility-first CSS framework |
| Web Speech API | Client-side dictation & Speech Synthesis (TTS) |
| MediaRecorder API | High-fidelity raw audio capture |
| Google Identity Services | OAuth 2.0 sign-in |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js + Express | REST API server |
| MongoDB + Mongoose | Database & ODM |
| JWT (jsonwebtoken) | Cookie-based authentication |
| Multer | Audio & PDF file upload handling |
| pdfjs-dist | Resume PDF text extraction |
| Groq API (LLaMA 3.3 70B) | Real-time AI interviewer & analytics engine |
| Groq API (Whisper) | Backend raw audio transcription |
| google-auth-library | Google OAuth verification |

---

## 📂 Project Structure

```
PlacementAssistant/
├── client/                          # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ConversationalMic/   # Core audio capture & stable chunking logic
│   │   │   ├── NativeAudioPlayer/   # Headless TTS playback component
│   │   │   ├── Analytics/           # Post-interview feedback report UI
│   │   │   └── ...                  # Other UI components (Navbar, Login, etc.)
│   │   ├── pages/
│   │   │   ├── Dashboard/           # Interview setup & resume upload
│   │   │   ├── LiveInterview/       # The active voice-to-voice interview room
│   │   │   └── History/             # Past interview reports
│   │   ├── services/                # API client (Axios)
│   │   └── index.css                # Global design system & tokens
│   └── index.html                   # HTML entry
│
├── server/                          # Backend (Express + MongoDB)
│   ├── controllers/
│   │   ├── auth.controller.js       # Auth logic
│   │   ├── interview.controller.js  # Interview lifecycle & audio upload endpoints
│   │   └── resume.controller.js     # Resume PDF parsing
│   ├── middleware/
│   │   └── auth.middleware.js       # JWT cookie verification
│   ├── models/
│   │   ├── User.model.js            # User schema
│   │   └── Interview.model.js       # Interview session & analytics schema
│   ├── routes/
│   ├── services/
│   │   ├── groq.service.js          # Groq integration (LLaMA & Whisper)
│   │   └── interview.service.js     # Core AI prompt management & logic
│   ├── constants/
│   │   └── prompts.js               # System prompts for the AI interviewer
│   └── index.js                     # Express app entry point
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free tier)
- **Groq API Key** — Get a free key at [console.groq.com](https://console.groq.com)
- **Google OAuth Client ID** — From [Google Cloud Console](https://console.cloud.google.com/apis/credentials)

### 1. Clone the Repository
```bash
git clone https://github.com/YourUsername/placement-assistant.git
cd placement-assistant
```

### 2. Setup the Backend
```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory:
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GROQ_API_KEY=your_groq_api_key
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

Start the backend server:
```bash
npm run dev
```

### 3. Setup the Frontend
```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_API_BASE_URL=http://localhost:5000/api
```

Start the frontend dev server:
```bash
npm run dev
```

### 4. Open the App
Visit **[http://localhost:5173](http://localhost:5173)** in your browser and start your first mock interview!

---

## 🔐 API Reference (Core Endpoints)

### Interview Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/interview/start` | Initialize interview & generate questions |
| POST | `/api/interview/transcribe` | Upload raw audio for Whisper transcription |
| POST | `/api/interview/:id/answer` | Submit text answer & get AI follow-up |
| POST | `/api/interview/:id/end` | Terminate session early & trigger grading |
| GET | `/api/interview/:id/feedback` | Fetch finalized analytics report |

### Doubt Solver
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/doubt` | Submit a text doubt with an optional image attachment |
| GET | `/api/doubt` | Retrieve full doubt chat history |
| GET | `/api/doubt/:id` | Fetch a specific doubt thread |

---

## 🤝 Contributing
Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 🙏 Acknowledgements
- [Groq](https://groq.com) — Ultra-fast AI inference (LLaMA 3.3 70B & Whisper-Large-V3)
- [Mozilla PDF.js](https://mozilla.github.io/pdf.js/) — PDF parsing library
- [Google Identity Services](https://developers.google.com/identity) — OAuth 2.0 authentication

---

## 📄 License
This project is open source and available under the [MIT License](LICENSE).