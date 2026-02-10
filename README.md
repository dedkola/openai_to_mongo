<p align="center">
  <h1 align="center">Chat Logger</h1>
  <p align="center">
    A lightweight chat interface with built-in conversation logging to MongoDB.
    <br />
    Supports OpenAI and local LLM providers out of the box.
  </p>
</p>

<p align="center">
  <a href="https://github.com/dedkola/openai_to_mongo/issues"><img src="https://img.shields.io/github/issues/dedkola/openai_to_mongo?style=flat-square" alt="Issues" /></a>
  <a href="https://github.com/dedkola/openai_to_mongo/pulls"><img src="https://img.shields.io/github/issues-pr/dedkola/openai_to_mongo?style=flat-square" alt="Pull Requests" /></a>
  <a href="https://github.com/dedkola/openai_to_mongo/commits"><img src="https://img.shields.io/github/last-commit/dedkola/openai_to_mongo?style=flat-square" alt="Last Commit" /></a>
  <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" alt="License" />
</p>

---

## Overview

Chat Logger is a self-hostable chat application that connects to OpenAI or any OpenAI-compatible local LLM (such as LM Studio) and persists every conversation to MongoDB. It is designed for developers and teams who want a simple way to interact with LLMs while maintaining a searchable log of all exchanges.


## Key Features

| Feature | Description |
|---|---|
| **Browser-based setup** | Settings modal auto-opens on first visit. Enter your API key and MongoDB URI directly in the UI. |
| **Live performance metrics** | Status bar displays connection health, tokens/sec, LLM latency, DB write time, and token usage after each request. |
| **History & search** | Sidebar with tabbed navigation — browse recent conversations or search across all logged questions and answers. |
| **Dual LLM support** | Switch between OpenAI API and LM Studio (or any `/v1/chat/completions`-compatible server) from the settings panel. |
| **Persistent logging** | Every Q&A pair is stored in MongoDB with session grouping, model info, and timestamps. |
| **System instructions** | Configurable system prompt applied to all conversations. |

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19, Tailwind CSS |
| Language | TypeScript |
| Database | MongoDB (official Node.js driver) |
| LLM Integration | OpenAI Node SDK / OpenAI-compatible HTTP API |

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm (or npm / yarn)
- MongoDB instance (local or [Atlas](https://www.mongodb.com/atlas))
- OpenAI API key *or* a running LM Studio server

### Installation

```bash
git clone https://github.com/dedkola/openai_to_mongo.git
cd openai_to_mongo
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The settings modal will appear automatically.

### Configuration

**Option A — Browser UI (recommended for local development)**

1. Click the **Settings** icon (or wait for the auto-prompt on first visit).
2. **LLM Connections** tab: enter your OpenAI API key or LM Studio endpoint.
3. **Database** tab: enter your MongoDB connection string, then click **Test connection**.
4. Click **Save Settings**.

Settings are stored in `localStorage` and sent to the backend with each request.

**Option B — Environment variables (recommended for production)**

```bash
cp .env.example .env.local
```

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENAI_API_KEY` | Yes* | — | OpenAI API key |
| `MONGO_URI` | Yes* | — | MongoDB connection string |
| `MONGO_DB` | No | `chat_logs` | Database name |

\* Not required if configured via the browser UI.

> Browser UI settings take priority over environment variables.

## Architecture

```
app/
├── api/
│   ├── chat/route.ts       # LLM proxy + MongoDB logging + performance stats
│   ├── logs/route.ts        # History retrieval + full-text search
│   └── test-db/route.ts     # MongoDB connectivity check
├── page.tsx                 # Main SPA (client component)
├── layout.tsx               # Root layout with Inter font
└── globals.css              # Tailwind base + custom scrollbar

components/
├── StatusBar.tsx            # Performance metrics bar (tok/s, latency, DB status)
├── Sidebar.tsx              # History/Search tabs with mini status bar
├── SettingsModal.tsx         # LLM + Database configuration
└── ChatMessage.tsx          # Message bubble renderer

lib/
└── mongo.ts                 # MongoDB client helper (env-var based)
```

## API Reference

<details>
<summary><code>POST /api/chat</code> — Send a message to the LLM</summary>

Proxies the message to the configured provider, logs the exchange to MongoDB (best-effort), and returns performance metrics.

**Request:**
```json
{
  "message": "Hello!",
  "sessionId": "optional-uuid",
  "settings": {
    "systemInstruction": "You are a helpful assistant.",
    "llm": {
      "provider": "openai",
      "openai": { "apiKey": "sk-...", "model": "gpt-3.5-turbo" }
    },
    "database": {
      "mongoUri": "mongodb://localhost:27017",
      "mongoDb": "chat_logs"
    }
  }
}
```

**Response:**
```json
{
  "answer": "Hi there!",
  "logged": true,
  "stats": {
    "provider": "openai",
    "model": "gpt-3.5-turbo",
    "llmMs": 820,
    "dbMs": 45,
    "promptTokens": 25,
    "completionTokens": 12,
    "totalTokens": 37,
    "tokensPerSecond": 14.6
  }
}
```
</details>

<details>
<summary><code>POST /api/logs</code> — Retrieve or search conversation history</summary>

Returns the 50 most recent logs. Pass an optional `search` string to filter by question or answer content (case-insensitive regex).

**Request:**
```json
{
  "settings": { "database": { "mongoUri": "...", "mongoDb": "..." } },
  "search": "optional search term"
}
```

**Response:**
```json
{
  "logs": [
    {
      "sessionId": "uuid-or-null",
      "question": "Prompt text",
      "answer": "Model answer",
      "model": "gpt-3.5-turbo",
      "createdAt": "2026-02-10T12:34:56.789Z"
    }
  ]
}
```
</details>

<details>
<summary><code>GET /api/logs</code> — Retrieve history (env-var config only)</summary>

Same as `POST` but reads MongoDB config from environment variables. Returns an empty array if `MONGO_URI` is not set.
</details>

<details>
<summary><code>POST /api/test-db</code> — Test MongoDB connectivity</summary>

**Request:**
```json
{ "mongoUri": "mongodb://localhost:27017", "mongoDb": "chat_logs" }
```

**Response:** `{ "ok": true }` or `{ "ok": false, "error": "..." }`
</details>

## Data Model

All entries are stored in the `logs` collection:

| Field | Type | Description |
|---|---|---|
| `sessionId` | `string \| null` | Groups messages from the same conversation |
| `question` | `string` | User prompt |
| `answer` | `string` | LLM response |
| `model` | `string` | Model identifier used for the response |
| `createdAt` | `Date` | Timestamp of the exchange |

## Deployment

### Vercel

1. Import this repository.
2. Set `OPENAI_API_KEY`, `MONGO_URI`, and `MONGO_DB` in the project environment variables.
3. Deploy — no additional build configuration needed.

### Docker / Self-hosted

Deploy as any standard Next.js application. Pass the environment variables listed above.

## Contributing

Contributions are welcome. Before opening a PR:

1. Check [existing issues](https://github.com/dedkola/openai_to_mongo/issues) and PRs for duplicates.
2. Keep changes focused — one feature or fix per PR.
3. Include manual verification steps or tests where applicable.

### Issue Labels

| Label | Purpose |
|---|---|
| `bug` | Unexpected behavior or broken functionality |
| `enhancement` | Feature requests or UX improvements |
| `documentation` | README or docs improvements |
| `good first issue` | Small, well-scoped tasks for newcomers |

## License

This project is available under the [MIT License](LICENSE).
