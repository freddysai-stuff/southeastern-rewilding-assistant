#  Southeastern Rewilding Assistant

> AI-powered native habitat restoration tool for the Southeastern US — React, Express, React Native, OpenAI (planned), Puppeteer PDF (planned).

## Status: Foundation Phase

This repo currently contains the **Foundation Phase** scaffold: monorepo
structure, design system, layout shells, component library, sample Data
Docs, and stub backend endpoints — plus a first working slice of the **AI
Chat Assistant**, grounded in the Data Docs via retrieval (see
[AI Chat Assistant / RAG](#ai-chat-assistant--rag) below). PDF generation, a
real database/auth, and the seasonal/harvesting rule engines are **not yet
implemented** — see [Roadmap](#roadmap) below.

## Repo layout

```
/frontend/   React + Vite PWA (web app)
/mobile/     React Native + Expo app
/backend/    Express + TypeScript API (in-memory data, no DB/auth yet)
/data/       Data Docs — plants, soil, fertilizer, seasonal rules, propagation guides, glossary
/shared/     Shared TypeScript types & design tokens used by all three apps
/scripts/    Data Doc validation script
/docs/       Developer documentation, mockup reference
```

## Quick Start

Requires Node.js 18+.

```bash
git clone https://github.com/freddysai-stuff/southeastern-rewilding-assistant.git
cd southeastern-rewilding-assistant
npm install
npm run build --workspace=shared   # shared types must be built once first
npm run dev
```

- Frontend (web): http://localhost:3000
- Backend API: http://localhost:4000 (try http://localhost:4000/api/health)

To run the mobile app (requires the Expo Go app or a simulator):

```bash
npm run dev:mobile
```

## Development scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Runs backend + frontend together |
| `npm run dev:frontend` | Frontend only |
| `npm run dev:backend` | Backend only |
| `npm run dev:mobile` | Starts the Expo dev server |
| `npm run build` | Builds shared, backend, and frontend |
| `npm run lint` | ESLint across the repo |
| `npm run typecheck` | TypeScript project references typecheck |
| `npm run test` | Runs tests in every workspace |
| `npm run validate:data` | Validates `/data` Data Docs against their JSON Schemas |

## Design system

The color palette, typography, spacing, and breakpoints are extracted from
the project logo and mockups and live in `shared/src/design-tokens.ts`
(consumed by both `frontend/src/design-system` and
`mobile/src/design-system`).

## Data Docs

Domain knowledge (native plants, soil profiles, fertilizer recipes, seasonal
rules, propagation guides, glossary) lives in `/data` as the source of
truth, loaded by the backend's `DataDocService` at startup. See
[`data/README.md`](data/README.md) for the contributor workflow.

## AI Chat Assistant / RAG

The AI Chat Assistant module (`/ai` in the frontend, `POST /api/chat` in the
backend) uses **retrieval-augmented generation (RAG)** so its answers are
grounded in the Data Docs instead of invented:

1. `RetrievalService` flattens every Data Doc (plants, soil, fertilizer,
   seasonal rules, propagation notes, glossary terms) into searchable text
   and indexes it with a small, dependency-free TF-IDF + cosine-similarity
   scorer — no external embedding API, no cost, works fully offline.
2. `AIChatService` retrieves the top matching docs for a user's message and
   either:
   - **Extractive mode (default, zero cost)** — formats the top matches
     into a direct, cited answer. This is what runs out of the box.
   - **Generative mode** — if you configure an LLM provider in
     `backend/.env` (copy from `backend/.env.example`), the retrieved docs
     are injected into a prompt for a fully conversational answer, still
     cited to the same source docs. Supported providers: OpenAI, Anthropic,
     **OpenRouter** (free-tier `:free` models), **Groq** (free tier, fast),
     **Ollama** (fully local, no signup/cost), or any other OpenAI-compatible
     endpoint.
3. Every reply returns a `sources` list (doc id, category, title, relevance
   score) so you can see exactly which Data Docs backed the answer.
4. Optional **live web search** — if you set `TAVILY_API_KEY` in
   `backend/.env`, the assistant can search the live web (via
   [Tavily](https://app.tavily.com), free tier: 1,000 searches/month, no
   card) to fill gaps the Data Docs don't cover. It only fires when local
   retrieval looks weak or the question is clearly web-shaped (e.g. "look up
   the current price of..."), so normal Data-Doc-grounded questions never
   spend a search. Web results are clearly labeled as general web info (not
   project-curated), cited separately as `[W1]`, `[W2]`, ..., and returned as
   a `webSources` list of real, clickable links.
5. **"Update Data" button** — any reply that used live web search shows an
   "Update Data" button. Clicking it (`POST /api/chat/ingest-web`) drafts a
   new `articles/*.md` Data Doc from those web results via the LLM, writes
   it to `/data`, and hot-reloads retrieval — so the finding becomes a
   permanent, searchable part of the knowledge base immediately, no server
   restart needed. Ingested docs are clearly tagged `source: web` with a
   `sourceUrls` list and a "Web-sourced note" disclaimer in the body, since
   they're added live rather than going through manual review first.

To upgrade to generative answers without a paid key, OpenRouter or Groq are
the easiest free options:

```bash
cp backend/.env.example backend/.env
# then edit backend/.env — uncomment OPENROUTER_API_KEY (or GROQ_API_KEY)
# and paste your key from openrouter.ai/keys or console.groq.com/keys
# optionally also uncomment TAVILY_API_KEY for live web search
npm run dev:backend
```

Because retrieval only reasons over what's in `/data`, adding more/better
Data Docs (more plants, soil types, propagation notes, glossary terms) is
still the biggest lever for making the assistant "smarter" for anything
project-specific — live web search is a complement for general knowledge the
curated Data Docs will never fully cover (current prices, breaking news,
niche one-off questions), not a replacement for it.

## Roadmap

Planned in later phases (not yet built): richer AI Chat context (full
project/plot state, conversation memory across sessions, suggested quick
actions), PDF/printable generation (Puppeteer), a real Postgres database +
auth, offline-first sync, seasonal/harvesting/soil rule engines, and
calendar sync (iCal/Google).

## CI

[![CI](https://github.com/freddysai-stuff/southeastern-rewilding-assistant/actions/workflows/ci.yml/badge.svg)](https://github.com/freddysai-stuff/southeastern-rewilding-assistant/actions)

GitHub Actions runs Data Doc validation, lint, typecheck, tests, and a build
on every push and pull request.
