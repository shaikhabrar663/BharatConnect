# BharatConnectAI — Enterprise Vernacular AI Intelligence Suite
**Developed by Orion Technologies**  
**Lead Solutions Architect & Chief Engineer:** Shaikh M. Abrar (`shaikhabrar663@gmail.com`)

---

## 📌 Executive Summary

**BharatConnectAI** is a multi-domain AI platform engineered for high-accuracy domain consultations, document analysis, voice interaction, and vernacular Indian language support. Built with a **Zero-Cloud-Leakage** philosophy, all user registrations, customer inquiries, and system audit logs are written directly to local hard-drive disk storage (`data/*.json` and `data/*.csv`), guaranteeing complete data privacy, offline resilience, and zero third-party database quota limits.

---

## 🔐 Administrator Controls & Credentials

The application implements dual-layer protection across both the client-side UI and backend REST endpoints. Standard end users cannot access or view the administrative panels.

### Admin Passcodes & Keys

| Control Item | Value | Description |
| :--- | :--- | :--- |
| **Primary Admin Passcode** | `orion@2026` | Default administrator passcode entered on the Admin Console gate |
| **Master Developer Key** | `abrar@orion` | Master bypass passcode for Shaikh M. Abrar |
| **Internal Session Token** | `orion_admin_token_2026` | Token issued upon successful passcode verification, sent via `x-admin-key` |
| **Environment Variable** | `ADMIN_PASSCODE` | Custom override set in `.env` (optional, falls back to `orion@2026`) |
| **Default User Attribution**| `shaikhabrar663@gmail.com` | Primary developer and administrative contact |

### How to Access the Admin Console

1. Navigate to the top navigation bar and click **Admin Console 🔒** (labeled with a protected badge).
2. Enter either `orion@2026` or `abrar@orion`.
3. Upon authentication, you gain full access to:
   - **Registered Users Directory**: View all real-time user profiles, organizations, and query counts.
   - **Excel CSV Exports**: 1-click download of `data/users.csv` and `data/inquiries.csv`.
   - **Inquiry Audit Stream**: Inspect full prompt and response summaries, model engine traces, and submission timestamps.
   - **Hard Drive Telemetry**: View live disk usage and record volume.
   - **Lock Console**: Instantly revoke the session token and return the console to a locked state.

### Protected Admin Endpoints (`requireAdminAuth`)

All administrative routes require the `x-admin-key` HTTP header or `?admin_key=` query parameter containing a valid key (`orion_admin_token_2026`, `orion@2026`, or `abrar@orion`). Unauthorized requests are rejected with **HTTP 401 Unauthorized**.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/admin/verify` | Validates passcode and issues the session token |
| `GET` | `/api/admin/users` | Retrieves all registered user accounts from disk |
| `GET` | `/api/admin/export-users-csv` | Streams `data/users.csv` directly as an Excel-compatible download |
| `GET` | `/api/admin/inquiries` | Retrieves logged consultations with storage statistics |
| `GET` | `/api/admin/export-csv` | Streams `data/inquiries.csv` directly as an Excel-compatible download |
| `POST` | `/api/admin/clear` | Rotates and resets inquiry logs on disk |

---

## 👥 User Roles & Access Isolation

To ensure privacy and professional operational boundaries:

### Standard Users / Visitors
- **Allowed:**
  - Complete the 30-second user registration to establish their profile.
  - Ask multi-domain questions (Medical, Legal, Coding, Agriculture, Business, Education, General).
  - Upload documents (PDF, DOCX, TXT, CSV, JSON) for context-aware analysis.
  - Use voice input (Speech-to-Text) and audio playback (Text-to-Speech).
  - Switch between English, Hindi (हिन्दी), Marathi (मराठी), Tamil (தமிழ்), Telugu (తెలుగు), Bengali (বাংলা), Gujarati (ગુજરાતી), and Kannada (ಕನ್ನಡ).
  - Access personal chat history stored locally in their encrypted browser vault.
- **Forbidden:**
  - Accessing the Admin Console without the administrator passcode.
  - Viewing other users' profiles, inquiries, or phone numbers.
  - Executing administrative exports or database resets.

### Administrators
- Full access to all standard user capabilities plus the **Admin Console** dashboard, user analytics, disk inspection, and CSV data extraction.

---

## 📂 Storage Architecture (Local Machine Disk)

All records are written in real-time to the `./data` directory in the project root:

```
data/
├── inquiries.csv    # Live Excel/Sheets compatible CSV stream of all consultations
├── inquiries.json   # Structured JSON array of consultations with audit metadata
├── users.csv        # Live Excel/Sheets compatible CSV stream of registered users
└── users.json       # Structured JSON array of user records and activity metrics
```

### Real-Time User Data Collection Flow
1. When a user submits their profile via the **User Registration** modal, `POST /api/auth/signup` writes their record immediately to `data/users.json` and `data/users.csv`.
2. When the user asks a question, `POST /api/chat` receives their `userId`, `userName`, and `userEmail`.
3. The inquiry is logged in `data/inquiries.json` and `data/inquiries.csv`, while the user's `queriesRun` counter and `lastActive` timestamp are updated in real-time.

---

## 🚀 Quickstart & Smooth Run Instructions

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **bun**

### 2. Environment Configuration
Create a `.env` file in the project root:
```bash
cp .env.example .env
```

Edit `.env` and configure your keys:
```env
# Google Gemini API Key for Online AI Intelligence
GEMINI_API_KEY=your_gemini_api_key_here

# Administrator Passcode (Optional - defaults to orion@2026 if omitted)
ADMIN_PASSCODE=orion@2026
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### 5. Production Build & Start
```bash
# Build Vite client and bundle Express server with esbuild
npm run build

# Launch the production CommonJS server
npm start
```

---

## 🛠️ Offline Intelligence & Resilience

BharatConnectAI includes an **Offline Local Intelligence Kernel**. If the network disconnects, the Gemini API key is unset, or upstream quotas are reached:
- The system automatically activates the offline fallback engine.
- Generates structured, professional clinical/legal/technical advice without markdown hashtags (`#`, `##`, `###`).
- Keeps the consultation running smoothly without crashing or presenting raw network error codes to end users.

---

## 📞 Support & Maintenance

For custom enterprise configurations, domain additions, or support:
- **Lead Engineer:** Shaikh M. Abrar
- **Organization:** Orion Technologies
- **Email:** `shaikhabrar663@gmail.com`
