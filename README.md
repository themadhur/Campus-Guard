# Campus Guard

> **Report. Track. Improve.**
> A smart campus issue reporting and facilities management platform for colleges and universities.

---

## 🚀 Features

- **Student Incident Reporting**: Quick form with photo upload, campus location (Building, Floor, Room), and issue description.
- **AI-Assisted Triage**: Multimodal AI analysis (powered by Google Gemini `gemini-3.8-flash`) automatically categorizes issues, assesses urgency, and routes them to the right department (Electrical, Plumbing, IT, Maintenance, Housekeeping, etc.).
- **Local Fallback Classifier**: Keyword and heuristic engine ensures reporting works 100% of the time, even without an AI key or network connection.
- **Complaint Tracking**: Real-time progress timeline (`Submitted` → `Under Review` → `Assigned` → `In Progress` → `Resolved`) using unique tracking IDs (`CG-2026-XXXXX`).
- **Student Authentication & Profiles**: Sign in with Email/Password, Google OAuth, or 1-Click Demo Login. View personal history in the **My Reports** tab.
- **Facilities Admin Portal**: KPI metrics, category & department workload distribution charts, live search/filtering, status transitions, and audit activity logging.
- **Resilient Dual-Persistence**: Firestore cloud database support with offline-first local storage caching.

---

## Run locally in VS Code (Windows)

1. Install [Node.js](https://nodejs.org/) (version 22 or newer), then open this project folder in VS Code.
2. Open **Terminal → New Terminal** and install the dependencies:
   ```powershell
   npm install
   ```
3. Start the local development server:
   ```powershell
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser. Press `Ctrl+C` in the terminal to stop the server.

AI issue classification uses the local fallback unless a Gemini API key is configured. To enable Gemini, copy `.env.example` to `.env` in the project folder and replace `MY_GEMINI_API_KEY` with your key. Keep `.env` private; it is excluded from Git.

To verify a production build, run:

```powershell
npm run build
```

This project includes an Express API, so GitHub Pages alone cannot host the complete application. The repository can be public on GitHub while the running app remains hosted on a server that supports Node.js.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Lucide Icons, Motion
- **Backend**: Node.js, Express, Vite middleware
- **AI**: `@google/genai` TypeScript SDK (`gemini-3.8-flash`)
- **Database & Auth**: Firebase Firestore & Firebase Authentication
- **Image Processing**: HTML5 Canvas client-side compression + Firebase Storage
