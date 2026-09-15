# BharatConnectAI — Project Instructions & Agent Directives

## 1. Project Identity & Key Stakeholders
- **Project Name:** BharatConnectAI
- **Parent Organization:** Orion Technologies
- **Lead Solutions Architect & Chief Engineer:** Shaikh M. Abrar (`shaikhabrar663@gmail.com`)
- **Repository:** `shaikhabrar663/BharatConnect`
- **Application Type:** Full-Stack Express 4 + Vite React 18 SPA with TypeScript and Tailwind CSS

---

## 2. Administrator Controls, Passwords & Access Keys

Always preserve and reference these administrator access credentials:
- **Primary Administrator Passcode:** `orion@2026`
- **Lead Developer Master Key:** `abrar@orion`
- **Internal Session Token:** `orion_admin_token_2026`
- **Environment Variable Override:** `ADMIN_PASSCODE` in `.env`
- **HTTP Header for Protected APIs:** `x-admin-key: orion_admin_token_2026` (or query param `?admin_key=...`)

### Admin-Only Endpoints (Protected by `requireAdminAuth`):
1. `POST /api/admin/verify` — Validates passcode and issues the session token.
2. `GET /api/admin/users` — Returns real-time registered users.
3. `GET /api/admin/export-users-csv` — Direct Excel-compatible download of `data/users.csv`.
4. `GET /api/admin/inquiries` — Returns disk storage statistics and logged inquiries.
5. `GET /api/admin/export-csv` — Direct Excel-compatible download of `data/inquiries.csv`.
6. `POST /api/admin/clear` — Clears or resets inquiry logs.

---

## 3. Core Architecture & Storage Directives

### Local Machine Hard Drive Storage (Zero-Leakage)
- The app stores all user records and inquiries locally on disk in the `./data` directory:
  - `data/users.json` — User records JSON
  - `data/users.csv` — User records CSV (UTF-8 with BOM for Excel/Sheets)
  - `data/inquiries.json` — Consultation logs JSON
  - `data/inquiries.csv` — Consultation logs CSV (UTF-8 with BOM)
- Never replace this local file-based persistence with an unrequested remote database.
- Whenever a chat consultation occurs, `userId`, `userName`, and `userEmail` must be forwarded to `/api/chat` to update the user's `queriesRun` and `lastActive` in real-time.

---

## 4. Response Formatting & Quality Guidelines

### Anti-Hashtag Response Formatting
- AI responses **must NEVER contain raw markdown heading hashtags** (`#`, `##`, `###`).
- Section titles must always be styled with clean bold text (`**Section Title**`).
- Every numbered pointer (`1.`, `2.`, `3.`) must start on its own separate line with clear spacing.
- Responses must provide clinical, statutory, or technical clarity with actionable execution steps.

---

## 5. Build, Development & Port Specifications
- **Port:** Port `3000` (host `0.0.0.0`) is required. Do not change this port.
- **Development Script:** `npm run dev` (`tsx server.ts`)
- **Production Build Script:** `npm run build` (`vite build && esbuild server.ts --bundle --platform=node --format=cjs --packages=external --sourcemap --outfile=dist/server.cjs`)
- **Production Start:** `npm start` (`node dist/server.cjs`)
