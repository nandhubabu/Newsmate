# 📰 NewsMate 2.1 — Global Intelligence Chronicle

> An advanced editorial news intelligence platform delivering real-time global dispatches, in-app full article readability extraction, in-memory caching, AI executive summaries, and hands-free text-to-speech listening.

[![CI / Build Verification](https://github.com/nandhubabu/Newsmate/actions/workflows/ci.yml/badge.svg)](https://github.com/nandhubabu/Newsmate/actions/workflows/ci.yml)
[![Version Control & Release](https://github.com/nandhubabu/Newsmate/actions/workflows/version-release.yml/badge.svg)](https://github.com/nandhubabu/Newsmate/actions/workflows/version-release.yml)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D14.0.0-339933?style=flat-square&logo=node.js)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express)](https://expressjs.com)
[![Status](https://img.shields.io/badge/Status-Active%20Production-10B981?style=flat-square)]()
[![Design](https://img.shields.io/badge/Design-Modern%20Editorial-ff4742?style=flat-square)]()

---

## 🌟 Overview

**NewsMate 2.1** transforms standard news browsing into a high-density, authoritative newsroom experience. Departing from generic purple glassmorphism, NewsMate is styled after premier broadsheets (*The Financial Times, The New York Times*) and modern intelligence terminals (*Bloomberg Terminal, Linear, Arc*).

Built with a resilient **Zero-Key Architecture** and a sub-15ms **In-Memory Cache Layer**, NewsMate guarantees 100% uptime: even without third-party API keys configured, verified direct RSS wire feeds automatically populate live global headlines.

---

## ⚡ Key Features

### 🎨 1. Modern Editorial Design System
- **Midnight Intelligence (Dark Mode - Default)**: Deep obsidian slate (`#080b12`), Signal Coral (`#ff4742`), Warm Amber (`#f59e0b`), and Cyber Teal (`#06b6d4`) with high-contrast snow typography.
- **Broadsheet Paper (Light Mode)**: Warm archival newsprint linen (`#f9f7f2`), dense printer's ink (`#12151b`), deep editorial crimson (`#c92a2a`), and navy accents.
- **Instant 1-Click Toggle**: Smooth theme transition with persisted preference in `localStorage`.
- **Prestige Typography**: `Newsreader` (editorial serif headlines) paired with `Plus Jakarta Sans` (interface) and `JetBrains Mono` (telemetry and timestamps).

### 📖 2. Full-Article In-App Readability Extractor
- Automatic real-time full prose extraction via `/api/article/extract?url=...`.
- Strips ads, scripts, navbars, and cookie popups, rendering clean, long-form journalistic prose directly inside Focus Reader Mode.
- Shows paragraph count, word count, author byline, and estimated reading time.

### ⚡ 3. High-Speed In-Memory Cache Layer
- Sub-15ms response times on repeated feed queries (`X-Cache: HIT`).
- 5-minute auto-expiring news feed cache and 2-hour extracted article cache.
- Drastically slashes network requests and prevents third-party API rate-limiting.

### 🔊 4. Web Speech Audio (TTS) Reader & Drive-Time Playlist Queue
- Listen to any headline or **full extracted article** hands-free via the browser's native **Web Speech API**.
- Fixed floating audio player bar at the bottom with real-time animated waveform indicators.
- **Continuous Drive-Time Playlist**: Add stories to an audio queue with the `+🎧` button. The player automatically advances from story to story.
- **Queue Management**: Slide-over queue drawer showing all scheduled stories with track numbers, play, remove, and clear controls.
- Full playback controls: Previous Story, Play/Pause, Next Story, Stop, and Speech Rate cycling (`1.0x`, `1.25x`, `1.5x`, `2.0x`).


### ⚡ 5. AI 3-Bullet Executive Summaries (TL;DR)
- Instant one-click takeaway drawer right inside cards and the focus reader.
- Provides a crisp 3-point breakdown:
  1. Core event (What happened)
  2. Stakeholders & context (Why it matters)
  3. Outlook & implications (What to watch next)
- Powered by **Gemini 1.5 Flash** when configured, or an intelligent **Local Extractive Heuristic Engine** as zero-dependency fallback.

### 📊 5. Live Market Telemetry & Headline Sentiment Heatmap
- **Global Financial Benchmarks**: Real-time telemetry tracking S&P 500, NASDAQ, DOW, FTSE 100, Gold, Brent Crude, Bitcoin, and Ethereum with live `▲ / ▼` percentage shifts.
- **Wire Headline Sentiment Matrix**: Tri-color visual meter displaying aggregate market/news sentiment (% Optimistic / Bullish, Neutral / Balanced, and Critical / Bearish) calculated across currently loaded dispatches.

### 🌅 6. 60-Second Daily Morning Intelligence Briefing

- Compiles current top stories across technology, markets, and world affairs into a consolidated 60-second broadcast memo.
- Integrated "Listen to Briefing" audio player and one-click copy button.

### 🔖 7. Bookmarks Knowledge Hub & Multi-Format Export
- Save stories with 1 click; stored locally in `localStorage`.
- Dedicated slide-over drawer with unread counter badges, quick removal, and reading history.
- **Export to Markdown**: Generates an Obsidian / Notion ready `.md` digest file with metadata, links, excerpts, and timestamps.
- **Export to JSON**: Creates a full portable `.json` backup of all saved reading lists for archival and programmatic analysis.
- **Print & PDF Mode**: Clean broadsheet print stylesheet (`@media print`) that strips navigation, ads, and UI chrome, producing clean PDFs.

### 🏷️ 8. Multi-Category Navigation & Full-Text Search
- Filter dispatches by sector:
  - `All Dispatches` • `Technology & AI` • `Markets & Economy` • `Science & Aerospace` • `Culture & Arts` • `Sports Wire` • `Health & Bio`
- Instant debounced client-side search across headlines, excerpts, and sources.

### 📰 9. 3 Adaptive View Modes
- **Magazine Grid**: Rich editorial cards with a lead hero spotlight.
- **Wire Feed**: Compact high-density list for rapid wire scanning.
- **Reader Cards**: Expanded view with full excerpt previews.

### 🛡️ 10. Zero-Key Resilient Architecture
- Multi-tier waterfall backend:
  1. *Tier 1*: Primary APIs (NewsAPI, The Guardian, NewsData.io)
  2. *Tier 2*: Universal Global Search APIs
  3. *Tier 3*: International Headliners
  4. *Tier 4 (Zero-Key Engine)*: Live RSS & open feeds (NPR, BBC, The Hindu, The Verge, CNBC, Hacker News, Dev.to)
- **Zero empty screens**: News always loads even with missing, expired, or rate-limited API keys.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express.js (v5), Axios, Cheerio, Dotenv, CORS
- **CI/CD**: GitHub Actions (multi-node matrix: 18.x, 20.x, 22.x)
- **Frontend**: Vanilla HTML5, Modern CSS3 (Custom Properties & Grid/Flexbox), ES6+ JavaScript
- **APIs & Feeds**: Web Speech API, RSS XML/JSON parsers, Google Gemini 1.5 Flash API
- **Fonts**: Google Fonts (`Newsreader`, `Plus Jakarta Sans`, `JetBrains Mono`)

---

## 📂 Project Structure

```
Newsmate/
├── .github/
│   └── workflows/
│       └── ci.yml         # GitHub Actions CI automated pipeline
├── public/
│   ├── index.html         # Semantic editorial layout & modal containers
│   ├── styles.css         # Modern design system (Midnight & Paper themes)
│   ├── style.css          # Stylesheet forwarder
│   └── script.js          # Client application, state management, TTS, AI UI
├── server.js              # Express server, memory cache, extractor & API endpoints
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
   git clone https://github.com/nandhubabu/Newsmate.git
   cd Newsmate
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Configure environment variables:
   ```bash
   cp .env.example .env
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
Fetches categorized news for a given country or global wire. Cached in memory for 5 minutes (`X-Cache: HIT/MISS`).
- **Query Parameters**:
  - `country` (optional, default: `'us'` or `'world'`) — e.g. `us`, `in`, `gb`, `ca`, `au`, `de`, `jp`
  - `category` (optional, default: `'general'`) — e.g. `technology`, `business`, `science`, `sports`
  - `q` (optional) — Search query keyword

### `GET /api/article/extract`
Extracts clean, full-length readable article paragraphs from an external wire URL.
- **Query Parameters**:
  - `url` (required) — Encoded HTTP/HTTPS URL
- **Response**:
  ```json
  {
    "status": "ok",
    "url": "https://...",
    "title": "Clean Headline",
    "byline": "Author Name",
    "paragraphs": ["Paragraph 1...", "Paragraph 2..."],
    "wordCount": 850,
    "readTimeMinutes": 4,
    "cached": false
  }
  ```

### `GET /api/markets`
Returns live financial telemetry across major equity indexes, commodities, and digital assets.
- **Response**:
  ```json
  {
    "status": "ok",
    "indices": [
      { "symbol": "S&P 500", "value": "5,633.09", "change": "+0.45%", "positive": true },
      { "symbol": "BTC/USD", "value": "$59,420", "change": "+2.10%", "positive": true }
    ],
    "cached": false
  }
  ```


### `POST /api/ai/summarize`
Generates a structured 3-bullet executive takeaway for an article.
- **Request Body**:
  ```json
  {
    "title": "Article Title",
    "description": "Article summary or full text"
  }
  ```

### `POST /api/ai/briefing`
Compiles an executive 60-second morning intelligence briefing from current dispatches.

### `POST /api/chat`
Interacts with the NewsMate Editorial Intelligence Copilot.

### `GET /api/health`
Returns system status, active API providers, memory cache statistics, and supported countries.

---

## 🤖 Version Control & Automation via GitHub Actions

NewsMate utilizes a dual GitHub Actions pipeline configured in `.github/workflows/`:

### 1. Continuous Integration & Quality Suite (`ci.yml`)
- **Triggers**: On every push and pull request to `main`.
- **Matrix Testing**: Node.js `18.x`, `20.x`, and `22.x` environments.
- **Syntax & Linting**: `npm run lint` validates server, scraper, and chatbot scripts.
- **Verification Suite**: `npm test` runs comprehensive automated checks against `/api/health`, `/api/markets`, in-memory cache validation (`X-Cache: HIT`), and zero-key RSS fallback dispatches.

### 2. Version Control & Automated Release Pipeline (`version-release.yml`)
- **Triggers**: On merge/push to `main` branch (and manual workflow dispatch).
- **Semantic Versioning**: Automatically checks `package.json` version against repository tags.
- **Automated Git Tagging**: Generates official `vX.Y.Z` annotated tags on release.
- **Automated Release Notes & Changelog**: Compiles git commit history between releases and publishes a formal GitHub Release via `softprops/action-gh-release`.

```bash
# Run local verification suite identically to CI
npm test

# Run syntax linting
npm run lint
```

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
