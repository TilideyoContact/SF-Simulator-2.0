# Overview

ChatFT SimuManager is a French-language conversational training tool for managers. It provides a guided, multi-step chatbot experience where managers choose a scenario from a persistent DSFR sidebar, then go through profiling, persona configuration, a simulated managerial conversation (e.g., giving feedback, announcing difficult decisions), AI-powered analysis of their performance, and a feedback collection phase. The user journey is presented as a chat interface with 23 sequential steps organized into 6 phases. Scenario selection happens outside the chat, via dedicated routes per scenario.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript, bundled via Vite
- **Routing**: Wouter (lightweight client-side router) — `/ → LandingPage`, `/scenario/:slug → ScenarioPage` (wraps ChatPage with pre-injected scenario)
- **State Management**: Zustand (`client/src/lib/store.ts`) — a single `useParcoursStore` manages the entire multi-step user journey state including profile data, scenario selection, persona configuration, simulation messages, analysis results, and feedback
- **UI Components**: shadcn/ui (new-york style) with Radix UI primitives, styled with Tailwind CSS and CSS variables for theming (light/dark mode support)
- **Data Fetching**: TanStack React Query with a custom `apiRequest` helper for API calls
- **Design System**: French government (DSFR) inspired — Marianne font, blue/red semantic colors, clean borders
- **Component Structure**:
  - `client/src/components/steps/` — Phase-organized step components (Phase1 through Phase7), each phase containing multiple steps
  - `client/src/components/` — Reusable chat UI components (ChatBubble, ChatCard, ProgressBar)
  - `client/src/components/ui/` — shadcn/ui component library
  - `client/src/lib/helpers.ts` — Label/display helper functions for the various enums (DISC profiles, scenarios, etc.)

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript, executed via tsx in development
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Request Validation**: Zod schemas validate all POST request bodies
- **Key Endpoints** (from routes.ts):
  - `POST /api/simulation/start` — Initiates a simulation conversation with a generated first message from the virtual collaborator
  - `POST /api/simulation/respond` — Handles user messages during simulation and returns collaborator responses
  - `POST /api/simulation/analyze` — Analyzes the simulation conversation and returns scores
  - `POST /api/session/save` — Creates or updates session data
- **Simulation Engine**: Server-side OpenAI integration (`server/openai.ts`) generates contextual responses via ChatGPT (gpt-4o-mini), with rich system prompts encoding the DISC persona, scenario, relationship, and emotional state. Falls back to deterministic templates if OpenAI is unavailable.
  - `POST /api/speech/transcribe` — Transcribes audio via OpenAI Whisper (speech-to-text)
  - `POST /api/speech/synthesize` — Generates audio via OpenAI TTS (text-to-speech)
- **Dependencies**: `openai` (OpenAI SDK), `multer` (file upload handling for audio)

### Development Setup
- **Dev mode**: Vite dev server with HMR is served through Express middleware (`server/vite.ts`)
- **Production**: Static files served from `dist/public/` with SPA fallback (`server/static.ts`)
- **Path Aliases**: `@/` → `client/src/`, `@shared/` → `shared/`, `@assets/` → `attached_assets/`

### Data Model
Single `sessions` table in PostgreSQL tracking the full user journey:
- **Profile fields**: mode, profil, barometre (JSONB), experience, objectifs (JSONB string array), difficulte, typeCollab, complement
- **Scenario/Persona fields**: scenarioChoisi, personaDisc, personaRelation, personaEtatEsprit, niveauDifficulte
- **Simulation data**: messages (JSONB array of `{role, content, timestamp}`)
- **Analysis scores**: clarte, ecoute, assertivite, global (real/float), pointsForts (JSONB), axesProgression (JSONB), conseilCle
- **Feedback fields**: nps, facilite, pertinence, realisme (integers), ameliorations (JSONB), commentaire
- **Metadata**: id (UUID, auto-generated), createdAt (timestamp)

### Database
- **ORM**: Drizzle ORM with PostgreSQL dialect
- **Schema**: Defined in `shared/schema.ts` using Drizzle's pgTable, shared between client and server
- **Validation**: drizzle-zod generates Zod schemas from the Drizzle table definitions; Zod schemas also validate API request bodies
- **Migrations**: Managed via `drizzle-kit push` (schema push approach, not migration files)
- **Connection**: node-postgres (pg) pool in `server/db.ts`, configured via `DATABASE_URL` environment variable

### Multi-Step Flow Architecture
The app implements a 25-step guided flow organized into 7 phases. Scenario selection happens via persistent DSFR SideMenu with dedicated routes (`/scenario/feedback-recadrage`, `/scenario/feedback-positif`, `/scenario/decision-difficile`). Steps 3, 4, 6, 8, 9, 10 are removed from the active flow.

1. **Profilage** (Steps 1, 2, 7, 5, 6, 8): Mode selection, role, collaborator type (agent/manager/pairs), objectives, most delicate step (multi-select), complementary info (text + file upload)
2. **Persona** (Steps 11-14): DISC personality (redesigned with visual cards + "En savoir plus" modal), relationship quality (1-5 slider), emotional state, recap
3. **Pre-Simulation** (Step 15-16): Optional theory review, intro message, then simulation start
4. **Simulation** (Steps 16-18): Live role-play conversation with collaborator, end of simulation
5. **Analyse** (Steps 19-21): AI-generated performance scores, feedback, and resources
6. **Feedback** (Steps 22-25): NPS, ratings, improvement suggestions, closing

**Step order**: Step 7 (TypeCollab) → Step 5 (Objectifs) → Step 6 (Étape délicate) → Step 8 (Complément) in both modes
**Avancé sequence**: `[1, 2, 7, 5, 6, 11, 12, 8, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]`
**Mode rapide**: `[1, 2, 7, 5, 6, 8, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25]` — skips DISC persona config (11, 12, 13), uses defaults (Stable + 3/Neutre + Neutre)
**TypeCollab options**: agent, manager, pairs (3 choices)
**Relation**: numeric 1-5 scale (1=Tendue, 3=Neutre, 5=Excellente)
**SKIPPABLE_STEPS**: [5, 6, 8, 11, 12, 13, 24]

## External Dependencies

- **PostgreSQL**: Primary database, connected via `DATABASE_URL` environment variable. Required for the app to function.
- **Google Fonts**: Loaded client-side for typography
- **OpenAI API**: Used for ChatGPT (simulation responses + analysis), Whisper (speech-to-text), and TTS (text-to-speech). Requires `OPENAI_API_KEY` environment secret.
