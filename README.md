# Chat Logger (Next.js + MongoDB + Tailwind)

A minimal OpenAI chat + logging stack. Type a prompt, get an answer, automatically save Q&A to MongoDB.

## Run locally

1. `pnpm i`
2. Copy `.env.example` → `.env.local` and fill values
3. `pnpm dev` → <http://localhost:3000>

## Deploy

- **Vercel**: add `OPENAI_API_KEY`, `MONGO_URI`, `MONGO_DB` as project env vars. No extra build steps.
- **Docker** (optional): create a Dockerfile from Next’s official examples and pass env vars.

## Notes

- API endpoints:
- `POST /api/chat` → `{ message }` → `{ answer }`
- `GET /api/logs` → returns last 50 logs
- DB collection: `logs` in `MONGO_DB` database.
- Edit the system prompt in `/app/api/chat/route.ts` to tune assistant behavior.
