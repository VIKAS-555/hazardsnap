# 🚨 HazardSnap — Hyper-Local Photo-First Civic Safety Map & Triage Queue

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Production-black?style=flat-square&logo=vercel)](https://vercel.com/)

> **Built for Hackathons**: Commuters face open manholes, dangling live wires, broken footpaths, and waterlogging. Reporting systems are typically so complicated that people don't bother, leaving risks unaddressed until an accident occurs. HazardSnap provides a photo-first way to log hazards in **5 seconds** (camera snap, GPS pin, or voice note), feeding a public safety map commuters can navigate by and a real-time severity-ranked triage queue for municipal teams with photographic fix verification.

---

## 🌟 Key Features

### 1. ⚡ Log a Hazard in Seconds (Mobile-First)
- **📸 Photo-First Camera Snap**: Instant one-tap camera capture with automatic mobile camera trigger (`capture="environment"`).
- **📍 Instant GPS Pinpoint**: Automatic HTML5 geolocation lock with OpenStreetMap reverse geocoding into human-readable street names and landmarks.
- **🎙️ Voice Note Recorder**: In-browser `MediaRecorder` audio recording with visual pulse wave, duration timer, instant playback, and auto-transcription context.
- **🏷️ Quick Hazard Pills**: Instant categorization for:
  - ⚡ **Dangling Live Wire** *(Critical — Severity 98/100)*
  - 🕳️ **Open Manhole** *(Critical — Severity 94/100)*
  - 🌊 **Severe Waterlogging** *(High — Severity 78/100)*
  - 🚧 **Broken Footpath / Paver** *(Medium — Severity 62/100)*
  - ⚠️ **Road Sinkhole / Cavity** *(Critical — Severity 95/100)*
  - 🌳 **Fallen Tree / Utility Block** *(High — Severity 72/100)*

### 2. 🗺️ Public Safety Map for Commuters
- High-contrast interactive map powered by **Leaflet** and **OpenStreetMap/CartoDB**.
- **Dynamic Pulsing Radar Rings**: Critical hazards pulse in red to draw immediate driver/pedestrian attention.
- **Live Filtering**: Filter by category (Wires, Manholes, Waterlogging) or view resolved items.
- **Community Confirmations ("I see this too")**: One-tap upvotes increase priority ranking and confirm real-time persistence of hazards.

### 3. 🏛️ Municipal Authority Severity-Ranked Triage Queue
- Auto-sorted queue ranking hazards by danger score (0–100) so crews fix life-threatening risks first.
- Crew dispatch tracking (`Reported` ➔ `Crew Dispatched` ➔ `Verified Fixed`).
- **📸 Photographic Fix Verification**: Municipal workers must upload an "After Fix" verification photograph and maintenance log before marking a ticket resolved.
- Side-by-side **Before & After comparison** for full public audit transparency.

### 4. 🤖 Smart Hybrid Severity Engine (AI Ready)
- Algorithmic baseline danger weights based on physical risk (electrocution > deep falls > traffic blockage).
- Integrated Google Gemini AI Vision endpoint for automated image hazard classification and severity scoring.
- Resilient offline/local storage fallback ensuring **100% demo uptime** even with spotty connectivity.

---

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Frontend**: React 19, Tailwind CSS, Lucide React Icons
- **Mapping**: Leaflet with dynamic client-side rendering
- **Database & Storage**: Supabase PostgreSQL with fault-tolerant local cache fallback
- **Audio API**: HTML5 `MediaRecorder` with Web Audio
- **Deployment**: Vercel CI/CD

---

## 🚀 Quickstart & Local Development

### Prerequisites
- Node.js 18+ (tested on Node v22 LTS)
- npm or bun

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Build for Production
```bash
npm run build
npm start
```

---

## 🗄️ Database Schema (`supabase-schema.sql`)

Run the contents of [`supabase-schema.sql`](./supabase-schema.sql) in your Supabase SQL Editor:
- `hazards`: Primary table storing coordinates, photos, voice notes, severity scores, and resolution photos.
- `hazard_upvotes`: Community confirmation tracking.
- Row-Level Security (RLS) policies allowing public reporting and municipal audits.

---

## 👥 Contributors & Protocol

Follow the [AGENTS.md](./AGENTS.md) deployment protocol:
1. Always work on feature branches (`feature/hazard-reporter`).
2. Push and open PRs for review.
3. Production deployments automatically build on merge via Vercel.
