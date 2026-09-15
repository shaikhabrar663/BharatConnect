# BharatConnectAI — Project Control, Master Credentials & Operations Manual

This document is the authoritative operations reference and administrative runbook for **BharatConnectAI**. It contains the master project details, administrative credentials, access endpoints, storage schemas, and developer run commands required for future maintenance, auditing, and smooth operations.

---

## 1. Project Identity & Key Stakeholders

- **Project Name:** BharatConnectAI
- **Version:** 2.6.0 Enterprise Production
- **Parent Organization:** Orion Technologies
- **Lead Solutions Architect & Chief Engineer:** Shaikh M. Abrar
- **Official Contact Email:** `shaikhabrar663@gmail.com`
- **GitHub Repository:** `shaikhabrar663/BharatConnect`
- **Architecture:** Full-Stack Node.js / Express 4 + Vite React 18 SPA + TypeScript + Tailwind CSS
- **AI Core:** Google GenAI SDK (`@google/genai`) with resilient multi-model cascade and offline fallback

---

## 2. Administrator Controls, Passwords & Access Keys

The administrative layer is secured with dual-tier authentication on both the frontend UI and the backend REST API.

### 🔑 Master Access Credentials

| Credential Type | Key / Passcode | Purpose & Scope |
| :--- | :--- | :--- |
| **Primary Administrator Passcode** | `orion@2026` | Standard admin access on the UI Admin Console gate |
| **Master Lead Developer Key** | `abrar@orion` | Master override passcode for Shaikh M. Abrar |
| **Internal Session Token** | `orion_admin_token_2026` | Token issued on verification, passed in API requests |
| **Administrative Email** | `shaikhabrar663@gmail.com` | Primary administrator and support email |
| **Environment Variable** | `ADMIN_PASSCODE` | Custom override set in `.env` (defaults to `orion@2026`) |
| **HTTP Authorization Header** | `x-admin-key: orion_admin_token_2026` | Required header on all protected `/api/admin/*` endpoints |
| **Query Parameter Fallback** | `?admin_key=orion_admin_token_2026` | Accepted fallback for browser direct CSV downloads |

---

## 3. Administrative REST Endpoints & API Reference

All routes under `/api/admin/*` are strictly guarded by the `requireAdminAuth` middleware. Requests without a valid key receive an immediate `HTTP 401 Unauthorized`.

### 1. Verify Passcode & Obtain Token
- **Method & Route:** `POST /api/admin/verify`
- **Headers:** `Content-Type: application/json`
- **Request Body:**
  ```json
  { "passcode": "orion@2026" }
  ```
- **Response:**
  ```json
  { "success": true, "token": "orion_admin_token_2026" }
  ```

### 2. View Registered Users Directory
- **Method & Route:** `GET /api/admin/users`
- **Headers:** `x-admin-key: orion_admin_token_2026`
- **Response:** Array of user profiles stored on the local disk.

### 3. Download Users CSV (Excel Compatible)
- **Method & Route:** `GET /api/admin/export-users-csv`
- **Authentication:** `x-admin-key: orion_admin_token_2026` or `?admin_key=orion_admin_token_2026`
- **Output:** Streams `data/users.csv` with UTF-8 BOM encoding and standard comma separation.

### 4. View Consultation Audit Stream & Storage Telemetry
- **Method & Route:** `GET /api/admin/inquiries`
- **Headers:** `x-admin-key: orion_admin_token_2026`
- **Response:** Returns logged inquiries, disk storage paths, file sizes, and record count.

### 5. Download Inquiries CSV (Excel Compatible)
- **Method & Route:** `GET /api/admin/export-csv`
- **Authentication:** `x-admin-key: orion_admin_token_2026` or `?admin_key=orion_admin_token_2026`
- **Output:** Streams `data/inquiries.csv` with UTF-8 BOM encoding.

### 6. Rotate / Reset Inquiries Disk Log
- **Method & Route:** `POST /api/admin/clear`
- **Headers:** `x-admin-key: orion_admin_token_2026`
- **Response:** Confirms log rotation and resets inquiry files.

---

## 4. Local Hard-Drive Storage Architecture (Zero-Cloud-Leakage)

All persistent data is stored directly in the local project `./data` directory on disk. No external third-party cloud databases (Firebase, Supabase, or AWS RDS) are used for user data, guaranteeing zero cloud leakage and zero API quota costs.

```
./data/
├── users.json          <-- Real-time user profiles (JSON format)
├── users.csv           <-- Excel/Sheets compatible user export (UTF-8 BOM)
├── inquiries.json      <-- Consultation log stream (JSON format)
└── inquiries.csv       <-- Excel/Sheets compatible consultation export (UTF-8 BOM)
```

### Registered User Record Schema (`data/users.json`):
```json
{
  "id": "usr_seed_104",
  "registrationDate": "2026-09-14T08:10:00.000Z",
  "fullName": "Shaikh M. Abrar",
  "email": "shaikhabrar663@gmail.com",
  "organization": "Orion Technologies",
  "profession": "Chief Systems Architect & Lead Engineer",
  "primaryDomain": "coding",
  "language": "en",
  "phone": "+91 98900 12345",
  "purpose": "BharatConnectAI Core Platform Engineering & Protocol Deployment",
  "status": "Enterprise Trial",
  "queriesRun": 112,
  "lastActive": "2026-09-14T13:45:00.000Z"
}
```

---

## 5. Development, Build & Server Operations

| Task | Command | Description |
| :--- | :--- | :--- |
| **Start Development Server** | `npm run dev` | Runs backend Express server via `tsx server.ts` with Vite middleware on port 3000 |
| **Production Build** | `npm run build` | Compiles Vite frontend to `dist/` and bundles server to `dist/server.cjs` via `esbuild` |
| **Start Production Server** | `npm start` | Launches compiled `node dist/server.cjs` |
| **Run Linter** | `npm run lint` | Runs TypeScript and ESLint checks |

> **Port Mandate:** The container port is strictly `3000` (binding to `0.0.0.0`). Do not change the port.

---

## 6. Software Engineering & AI Code Output Standards

1. **Pure Working Code Only:**
   - Code blocks (` ```language ... ``` `) must contain exclusively executable code.
   - Zero conversational text, markdown asterisks (`*` or `**`), bullet points, or unwanted phrases inside code fences.
2. **Copying Behavior:**
   - The UI "Copy code" action extracts only the pure, cleaned executable code to clipboard.
3. **No Raw Markdown Hashtags in Prose:**
   - Headings are styled with clean bold text (`**Section Title**`), while programming language comments (`#` in Python/Bash/YAML, `//` in JS/TS/Go, `--` in SQL) are preserved inside code blocks.
