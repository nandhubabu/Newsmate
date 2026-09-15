# 📰 NewsMate 2.0 — Global Intelligence Chronicle

> An advanced editorial news intelligence platform delivering real-time global dispatches, AI executive summaries, and hands-free text-to-speech listening.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Status](https://img.shields.io/badge/Status-Active%20Production-10B981?style=flat-square)]()
[![Design](https://img.shields.io/badge/Design-Modern%20Editorial-ff4742?style=flat-square)]()

---

## 🌟 Overview

**NewsMate 2.0** transforms standard news browsing into a high-density, authoritative newsroom experience. Departing from generic purple glassmorphism, NewsMate is styled after premier broadsheets (*The Financial Times, The New York Times*) and modern intelligence terminals (*Bloomberg Terminal, Linear, Arc*).

Built with resilient **Zero-Key Architecture**, NewsMate guarantees 100% uptime: even without third-party API keys configured, verified direct RSS wire feeds automatically populate live global headlines.

---

## ⚡ Key Features

### 🎨 1. Modern Editorial Design System
- **Midnight Intelligence (Dark Mode - Default)**: Deep obsidian slate (`#080b12`), Signal Coral (`#ff4742`), Warm Amber (`#f59e0b`), and Cyber Teal (`#06b6d4`) with high-contrast snow typography.
- **Broadsheet Paper (Light Mode)**: Warm archival newsprint linen (`#f9f7f2`), dense printer's ink (`#12151b`), deep editorial crimson (`#c92a2a`), and navy accents.
- **Instant 1-Click Toggle**: Smooth theme transition with persisted preference in `localStorage`.
- **Prestige Typography**: `Newsreader` (editorial serif headlines) paired with `Plus Jakarta Sans` (interface) and `JetBrains Mono` (telemetry and timestamps).

### 🔊 2. Web Speech Audio (TTS) Reader
- Listen to any headline or full article hands-free via the browser's native **Web Speech API**.
- Fixed floating audio player bar at the bottom with real-time animated waveform indicators.
- Full playback controls: Play, Pause, Resume, Stop, and Speech Rate cycling (`1.0x`, `1.25x`, `1.5x`, `2.0x`).

### ⚡ 3. AI 3-Bullet Executive Summaries (TL;DR)
- Instant one-click takeaway drawer right inside cards and the focus reader.
- Provides a crisp 3-point breakdown:
  1. Core event (What happened)
  2. Stakeholders & context (Why it matters)
  3. Outlook & implications (What to watch next)
- Powered by **Gemini 1.5 Flash** when configured, or an intelligent **Local Extractive Heuristic Engine** as zero-dependency fallback.

### 🌅 4. 60-Second Daily Morning Intelligence Briefing
- Compiles current top stories across technology, markets, and world affairs into a consolidated 60-second broadcast memo.
- Integrated "Listen to Briefing" audio player and one-click copy button.

### 📖 5. Distraction-Free Focus Reader Mode
- Clean, focused reading modal with typography scaling controls (`A-` / `A+`).
- Automatic reading time estimator (e.g. "3 min read") and word count analytics.
- Direct external link to original publisher wires for attribution.

### 🔖 6. Bookmarks & Offline Reading List
- Save stories with 1 click; stored locally in `localStorage`.
- Dedicated slide-over drawer with unread counter badges, quick removal, and reading history.

### 🏷️ 7. Multi-Category Navigation & Full-Text Search
- Filter dispatches by sector:
  - `All Dispatches` • `Technology & AI` • `Markets & Economy` • `Science & Aerospace` • `Culture & Arts` • `Sports Wire` • `Health & Bio`
- Instant debounced client-side search across headlines, excerpts, and sources.

### 📰 8. 3 Adaptive View Modes
- **Magazine Grid**: Rich editorial cards with a lead hero spotlight.
- **Wire Feed**: Compact high-density list for rapid wire scanning.
- **Reader Cards**: Expanded view with full excerpt previews.

### 🛡️ 9. Zero-Key Resilient Architecture
- Multi-tier waterfall backend:
  1. *Tier 1*: Primary APIs (NewsAPI, The Guardian, NewsData.io)
  2. *Tier 2*: Universal Global Search APIs
  3. *Tier 3*: International Headliners
  4. *Tier 4 (Zero-Key Engine)*: Live RSS & open feeds (NPR, BBC, The Hindu, The Verge, CNBC, Hacker News, Dev.to)
- **Zero empty screens**: News always loads even with missing, expired, or rate-limited API keys.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (v5), Axios, Cheerio, Dotenv, CORS
- **Frontend**: Vanilla HTML5, Modern CSS3 (Custom Properties & Grid/Flexbox), ES6+ JavaScript
- **APIs & Feeds**: Web Speech API, RSS XML/JSON parsers, Google Gemini 1.5 Flash API
- **Fonts**: Google Fonts (`Newsreader`, `Plus Jakarta Sans`, `JetBrains Mono`)

---

## 📂 Project Structure

```
Newsmate/
├── public/
│   ├── index.html         # Semantic editorial layout & modal containers
│   ├── styles.css         # Modern design system (Midnight & Paper themes)
│   ├── style.css          # Stylesheet forwarder
│   └── script.js          # Client application, state management, TTS, AI UI
├── server.js              # Express server, multi-tier fallback & API endpoints
├── chatbot.js             # AI Copilot & 3-bullet summarization engine
├── simple-scraper.js      # Zero-Key RSS and open wire feed engine
├── scraper.js             # Cheerio web scraper routines
├── package.json           # Project manifest and scripts
├── .env.example           # Sample environment variables
├── .gitignore             # Git ignore configuration
└── README.md              # Documentation
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v14.0.0 or higher
- **NPM**: v6.0.0 or higher

### Installation

1. Clone the repository or navigate to the project directory:
   ```bash
   cd d:/Nandhu/Projects/Newsmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   ```bash
   copy .env.example .env
   ```
   Add your API keys if you have them:
   ```env
   PORT=3000
   NEWS_API_KEY=your_key
   GUARDIAN_API_KEY=your_key
   NEWSDATA_API_KEY=your_key
   GEMINI_API_KEY=your_key
   ```
   > **Note**: If no keys are provided, the built-in Zero-Key RSS engine activates automatically with 100% functionality!

### Running the Server

- **Production Mode**:
  ```bash
  npm start
  ```

- **Development Mode** (auto-restart on changes):
  ```bash
  npm run dev
  ```

Open your browser and visit:
```
http://localhost:3000
```

---

## 📡 API Reference

### `GET /api/news`
Fetches categorized news for a given country or global wire.
- **Query Parameters**:
  - `country` (optional, default: `'us'` or `'world'`) — e.g. `us`, `in`, `gb`, `ca`, `au`, `de`, `jp`
  - `category` (optional, default: `'general'`) — e.g. `technology`, `business`, `science`, `sports`
  - `q` (optional) — Search query keyword

### `POST /api/ai/summarize`
Generates a structured 3-bullet executive takeaway for an article.
- **Request Body**:
  ```json
  {
    "title": "Article Title",
    "description": "Article summary or full text"
  }
  ```
- **Response**:
  ```json
  {
    "status": "ok",
    "summary": {
      "headline": "...",
      "takeaways": ["Point 1", "Point 2", "Point 3"],
      "sentiment": "Optimistic | Critical | Developing | Neutral",
      "readTimeMinutes": 2
    }
  }
  ```

### `POST /api/ai/briefing`
Compiles an executive 60-second morning intelligence briefing.
- **Request Body**:
  ```json
  {
    "articles": [ ... ]
  }
  ```

### `POST /api/chat`
Interacts with the NewsMate Editorial Intelligence Copilot.
- **Request Body**:
  ```json
  {
    "message": "Explain how quantitative easing impacts bond yields"
  }
  ```

### `GET /api/health`
Returns system status, active API providers, and supported countries.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `/` | Focus the live headline search input |
| `Esc` | Close any active modal (Reader, Briefing, Drawers) |

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
Author: **Nandhu**
