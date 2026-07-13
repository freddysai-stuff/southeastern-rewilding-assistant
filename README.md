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
   - **Generative mode** — if you set `OPENAI_API_KEY` or
     `ANTHROPIC_API_KEY` in `backend/.env` (copy from
     `backend/.env.example`), the retrieved docs are injected into an LLM
     prompt for a fully conversational answer, still cited to the same
     source docs.
3. Every reply returns a `sources` list (doc id, category, title, relevance
   score) so you can see exactly which Data Docs backed the answer.

To upgrade to generative answers:

```bash
cp backend/.env.example backend/.env
# then edit backend/.env and set OPENAI_API_KEY or ANTHROPIC_API_KEY
npm run dev:backend
```

Because retrieval only reasons over what's in `/data`, adding more/better
Data Docs (more plants, soil types, propagation notes, glossary terms) is
the single biggest lever for making the assistant "smarter" — it doesn't
require any code changes.

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
