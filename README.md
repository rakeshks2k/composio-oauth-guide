# AI-Powered OAuth Guide Generator for Composio

A full-stack developer tool designed for [Composio](https://composio.dev/) that helps AI agent engineers determine **the easiest, lowest-friction path to getting OAuth integrations production-ready**.

It evaluates whether to use **Composio-Managed OAuth** vs. **Custom OAuth**, estimates hands-on engineering effort separately from calendar approval wait times, details provider verification hurdles (CASA, marketplace audits, scopes), and runs a live AI research pipeline with real-time streaming progress to generate actionable integration guides for any third-party app.

---

## Table of Contents

- [Visual Design & Layout](#visual-design--layout)
- [Architecture & Tech Stack](#architecture--tech-stack)
- [Key Features](#key-features)
- [Researched Guides & Source Audit](#researched-guides--source-audit)
- [Live Research Pipeline](#live-research-pipeline)
- [Environment Variables](#environment-variables)
- [Local Setup & Running](#local-setup--running)
- [Testing & Validation](#testing--validation)
- [Product Decisions & Tradeoffs](#product-decisions--tradeoffs)
- [Limitations & Future Roadmap](#limitations--future-roadmap)

---

## Visual Design & Layout

Inspired by the Composio dashboard:
- **Palette:** Dark charcoal background (`#0f1117`), secondary surfaces (`#141824`), subtle borders (`#1e2130`), and restrained teal accents (`#14b8a6`).
- **Typography:** Clean sans-serif paired with monospace font families for code symbols, scopes, and IDs.
- **Three-Part Developer Workspace:**
  1. **Left Sidebar:** Searchable Guide Library with instant filtering, quick keyboard shortcut (`/`), difficulty badges, Composio Managed indicators, New Guide CTA, and Recent Guides.
  2. **Main Workspace:** Actionable guide view (recommendation justification, 3-metric time cards, ordered checklist categorized by step type, scopes table, blockers accordion, agent capabilities matrix, sources, and caveats) or the interactive generation form with quick suggestion pills.
  3. **Right Research Panel:** Real-time event stream showing genuine pipeline progress, documentation discoveries, policy evaluations, and clickable source citations.

---

## Architecture & Tech Stack

```
┌─────────────────────────┐   ┌──────────────────────────────┐   ┌───────────────────────────┐
│      LEFT SIDEBAR       │   │        MAIN WORKSPACE        │   │       RIGHT PANEL         │
│                         │   │                              │   │                           │
│  - Brand & Context      │   │  [Actionable Guide View]     │   │  [Live Research Events]   │
│  - Search Bar (Live /)  │   │   • Recommended Path & Just. │   │   • Step status (Search)  │
│  - "Generate Guide" CTA │   │   • 3-Metric Time Estimates  │   │   • Findings (Bulb)       │
│  - Verified Guides      │   │   • Ordered Setup Checklist  │   │   • Warnings (Alert)      │
│  - Generated Guides     │   │   • Scope Sensitivity Table  │   │   • Official Sources      │
│                         │   │   • Common Blockers          │   │   • Validation Results    │
│                         │   │   • Agent Capabilities       │   │                           │
│                         │   │   • Sources & Caveats        │   │                           │
│                         │   │  OR                          │   │                           │
│                         │   │  [Guide Generator Form]      │   │                           │
│                         │   │   • App Name + Website       │   │                           │
│                         │   │   • 1-Click Suggestion Pills │   │                           │
└─────────────────────────┘   └──────────────────────────────┘   └───────────────────────────┘
                                             │
                       ┌─────────────────────┴──────────────────────┐
                       ▼                                            ▼
           /api/guides (GET/POST)                         /api/generate (POST)
             [better-sqlite3]                             [OpenAI GPT-4o Streaming]
             data/guides.db                               Real-time NDJSON Stream
```

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5 (Strict Mode)
- **Styling:** Tailwind CSS + Radix UI primitives
- **Database:** SQLite via `better-sqlite3` with WAL mode
- **AI Engine:** OpenAI GPT-4o (configurable via `OPENAI_MODEL`)
- **Icons:** Lucide React + custom inline brand SVGs
- **Export/Share:** Native clipboard API for Markdown export and stable slug URLs (`/guides/[slug]`)

---

## Key Features

### 1. Searchable Guide Library (Architected for 100+ Apps)
- Pre-seeded with 7 rigorously researched provider guides representing distinct OAuth approval archetypes (Google Drive, Slack, GitHub, HubSpot, Notion, Stripe, Zoom).
- Instant real-time fuzzy search filtering by app name, slug, scopes, summary, or difficulty.
- Keyboard shortcut: Press `/` anywhere to immediately focus the search bar.
- Empty search state offers a 1-click shortcut to generate a guide for the searched term.
- Management: Delete user-generated guides with 1 click; preset library guides remain protected.

### 2. Live Research Workflow
- Real-time streaming using `ReadableStream` and newline-delimited JSON (`NDJSON`).
- Identifies app identity, official domain, and official developer endpoints.
- Checks Composio Managed OAuth support across the 1,600+ toolkit catalog.
- Distinguishes 4 distinct stages of OAuth setup:
  - `app-registration`: Developer portal registration, redirect URIs, credentials.
  - `end-user-auth`: Consent flow, authorization code exchange, refresh tokens.
  - `provider-verification`: Domain validation, brand verification, sensitive scope audits.
  - `marketplace-review`: Public directory listing, app store certifications.
- Honest caveats: Explicitly flags assumptions and unverified claims.

### 3. Clear Time Breakdown
- **Hands-on Engineering Time:** Active development time (hours).
- **Total Elapsed Calendar Days:** Typical project duration from start to finish.
- **Approval Waiting Time:** External provider review delays, clearly separated from developer effort.

### 4. Shareable & Persistent
- Every guide is persisted in SQLite (`data/guides.db`).
- Stable share URLs: `/guides/google-drive`, `/guides/slack`, `/guides/github`, `/guides/hubspot`, `/guides/[slug]`.
- 1-Click "Share Link" (copies URL) and "Copy MD" (exports full GitHub-flavored Markdown document).

---

## Researched Guides & Source Audit

### 1. Google Drive (Archetype: Multi-Tiered Verification & Restricted Scopes)
- **Recommended Path:** Start with **Managed OAuth** for development; migrate to **Custom OAuth** for production branding or restricted scopes.
- **Difficulty:** `Hard` | **Hands-on:** 4–8h | **Elapsed:** 7–42 days | **Approval Wait:** 3–42 days.
- **Key Scopes:** `drive.file` (Non-sensitive, per-file access created by app, no verification required), `drive.readonly` (Sensitive, requires Google OAuth verification, 3–5 days), `drive` (Restricted, full drive access, mandates annual Cloud Application Security Assessment - CASA Tier 2 audit by an authorized lab, 4–6 weeks).
- **Blockers:** 100-user cap on unverified testing apps; Google Search Console domain verification requirement; CASA assessment audit cost and review latency.
- **Sources Verified:**
  - [Google Drive API Specific Auth](https://developers.google.com/drive/api/guides/api-specific-auth)
  - [Google Cloud OAuth App Verification](https://support.google.com/cloud/answer/9110914)
  - [Google Workspace CASA Assessment Guide](https://developers.google.com/workspace/guides/app-compliance)

### 2. Slack (Archetype: 10-Workspace Rule & Enhanced Security Reviews)
- **Recommended Path:** **Managed OAuth** for internal/custom bots; **Custom OAuth** required for Slack App Directory listing.
- **Difficulty:** `Medium` | **Hands-on:** 2–4h | **Elapsed:** 14–60 days | **Approval Wait:** 14–60 days.
- **Key Scopes:** `chat:write` (Bot scope, low friction), `channels:read` (Basic public channel info), `channels:history` (Sensitive, triggers Slack Enhanced Security Review regarding data retention and encryption).
- **Blockers:** The strict **10-workspace prerequisite** (app must be installed and active in 10 real production workspaces in the past 28 days before marketplace submission is unlocked); manual installation testing by Slack review team.
- **Sources Verified:**
  - [Slack OAuth v2 Docs](https://api.slack.com/authentication/oauth-v2)
  - [Slack App Distribution Guidelines](https://api.slack.com/start/distributing/guidelines)
  - [Slack API Scopes Reference](https://api.slack.com/scopes)

### 3. GitHub (Archetype: Instant Self-Service OAuth Apps)
- **Recommended Path:** **Managed OAuth** works out of the box; **Custom OAuth** only needed for white-labeled consent screen or dedicated API rate limit pools.
- **Difficulty:** `Easy` | **Hands-on:** 0.5–1h | **Elapsed:** 0–1 days | **Approval Wait:** None.
- **Key Scopes:** `repo` (Full read/write to public and private repos), `public_repo` (Narrower scope for public repos only), `user:email`, `read:org`.
- **Blockers:** Shared rate limits on Composio's default client ID when traffic surges; `repo` scope granularity is very broad (consider GitHub Apps with granular permissions for enterprise).
- **Sources Verified:**
  - [GitHub Creating an OAuth App](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/creating-an-oauth-app)
  - [GitHub Scopes for OAuth Apps](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/scopes-for-oauth-apps)

### 4. HubSpot (Archetype: High Barrier Marketplace Certification)
- **Recommended Path:** **Custom OAuth** recommended for public distribution; **Managed OAuth** for internal CRM tooling.
- **Difficulty:** `Very Hard` | **Hands-on:** 6–12h | **Elapsed:** 30–90 days | **Approval Wait:** 14–30 days.
- **Key Scopes:** `oauth` (Mandatory base scope), `crm.objects.contacts.read/write`, `crm.objects.deals.read/write`.
- **Blockers:** Must reach **60 active unique production installs** before submitting for Marketplace certification; API key auth is sunsetted for public apps (OAuth mandatory); strict HTTPS redirect URI enforcement (no IP addresses).
- **Sources Verified:**
  - [HubSpot OAuth Overview](https://developers.hubspot.com/docs/api/oauth/oauth-overview)
  - [HubSpot Marketplace Certification Checklist](https://developers.hubspot.com/docs/marketplace/certification-checklist)
  - [HubSpot Working with OAuth](https://developers.hubspot.com/docs/api/working-with-oauth)

### 5. Notion (Archetype: Capability-Based Scopes & Multi-Workspace Review)
- **Recommended Path:** **Managed OAuth** for single-workspace internal tools; **Custom OAuth** for public multi-workspace distribution.
- **Difficulty:** `Medium` | **Hands-on:** 1–3h | **Elapsed:** 1–21 days | **Approval Wait:** 5–21 days.
- **Key Scopes:** `read_content` (Read pages & databases shared with integration), `update_content`, `insert_content`, `read_user_information`.
- **Blockers:** Explicit per-page/database sharing required (integrations cannot access workspace pages automatically until a member manually shares them); Internal vs. Public integration separation.
- **Sources Verified:**
  - [Notion API Authorization Guide](https://developers.notion.com/docs/authorization)
  - [Notion Integration Capabilities Reference](https://developers.notion.com/reference/capabilities)
  - [Notion Getting Started](https://developers.notion.com/docs/getting-started)

### 6. Stripe (Archetype: Financial Platform Live Mode Activation)
- **Recommended Path:** **Custom OAuth** (Stripe Connect platform account); **Managed OAuth** for single-account API calls.
- **Difficulty:** `Medium` | **Hands-on:** 2–5h | **Elapsed:** 1–14 days | **Approval Wait:** 1–7 days.
- **Key Scopes:** `read_only` (Read account balance, charges, customers), `read_write` (Full access to process payments and create invoices).
- **Blockers:** Test mode works instantly but switching to Live mode requires platform verification and compliance activation (1–7 business days); choosing between Standard vs Express vs Custom accounts.
- **Sources Verified:**
  - [Stripe Connect OAuth Reference](https://docs.stripe.com/connect/oauth-reference)
  - [Stripe Connect Platform Overview](https://docs.stripe.com/connect/overview)
  - [Stripe Connect Account Types](https://docs.stripe.com/connect/accounts)

### 7. Zoom (Archetype: Meeting & Media Permissions with Marketplace Review)
- **Recommended Path:** **Managed OAuth** for standard meeting tools; **Custom OAuth** for Zoom App Marketplace distribution.
- **Difficulty:** `Medium` | **Hands-on:** 2–4h | **Elapsed:** 14–45 days | **Approval Wait:** 7–30 days.
- **Key Scopes:** `meeting:read`, `meeting:write`, `recording:read` (Sensitive, cloud recording downloads), `user:read`.
- **Blockers:** 100-user installation cap on unpublished applications; mandatory security questionnaire and data handling audit before Marketplace submission; 90-day refresh token expiration.
- **Sources Verified:**
  - [Zoom OAuth Integration Guide](https://developers.zoom.us/docs/integrations/oauth/)
  - [Zoom Marketplace Publishing Guidelines](https://developers.zoom.us/docs/distribute/publish/)
  - [Zoom OAuth Scopes Reference](https://developers.zoom.us/docs/integrations/scopes/)

---

## Live Research Pipeline

When an app name is submitted to `/api/generate`:

```
POST /api/generate { appName, appWebsite? }
  │
  ├─► [1] Resolve identity & official documentation URL
  │
  ├─► [2] Query Composio Managed Auth Catalog
  │
  ├─► [3] Extract OAuth 2.0 grant types, redirect constraints, and scopes
  │
  ├─► [4] Analyze review hurdles (CASA, Marketplace, App Defense Alliance)
  │
  ├─► [5] Synthesize structured JSON matching Guide TypeScript schema
  │
  ├─► [6] Stream progress events via NDJSON to ResearchPanel UI
  │
  └─► [7] Insert into SQLite database & return finalized Guide ID
```

### Demo Mode vs. Live API Key Mode
- **With `OPENAI_API_KEY` configured:** Calls OpenAI GPT-4o with temperature 0.2 and structured JSON mode. Streams genuine live research events for each phase.
- **Without `OPENAI_API_KEY` (Demo Mode):** Emits a clear `warning` event explaining that demo mode is active. Generates a fully formed, calibrated OAuth guide with realistic scopes, setup steps, blockers, and sources, explicitly marked with demo disclaimers in `assumptions` and `unverifiedClaims`. This allows full evaluation of all UI workflows without mandatory API keys.

---

## Environment Variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `OPENAI_API_KEY` | Optional | `""` | OpenAI API key for live GPT-4o research. If omitted, app enters Demo Mode. |
| `OPENAI_MODEL` | Optional | `"gpt-4o"` | Model to use for generation (e.g. `gpt-4o`, `gpt-4o-mini`). |
| `NEXT_PUBLIC_APP_URL` | Optional | `"http://localhost:3000"` | Base URL used when copying share links to clipboard. |
| `DATABASE_PATH` | Optional | `"./data/guides.db"` | Filepath for the SQLite database. |

---

## Local Setup & Running

### Prerequisites
- Node.js 18.17+ or 20+
- npm 9+

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Production Build & Start
```bash
npm run build
npm run start
```

---

## Testing & Validation

The application has been tested across all primary user journeys:
1. **Guide Navigation:** Verified switching between Google Drive, Slack, GitHub, and HubSpot.
2. **Library Search:** Tested filtering across app names, slugs, difficulty levels, and scopes. Tested keyboard shortcut `/`.
3. **Live Generation Endpoint:** Tested `/api/generate` with unfamiliar applications (e.g., Linear, Notion, Zoom, Spotify) and verified NDJSON chunked streaming.
4. **Data Persistence:** Verified that generated guides are stored in SQLite (`data/guides.db`) and survive server restarts.
5. **Direct Share URLs:** Tested `GET /guides/[slug]` (e.g. `/guides/google-drive`, `/guides/linear`) returning 200 OK with server-rendered metadata.
6. **Markdown Export:** Verified `Copy MD` copies formatted GitHub-flavored Markdown including checklists, scope tables, and blockers.
7. **Type Checks & Build:** Verified with `next build` passing with 0 errors and 0 warnings.

---

## Product Decisions & Tradeoffs

1. **Separating Hands-on Engineering Time from External Waiting Time:**
   - *Decision:* Many developer tools show a single "2 weeks" estimate. For OAuth, building the client code takes 2 hours, but waiting for Google CASA or Slack review takes 4 weeks. Showing these as distinct metrics prevents false expectations and helps teams plan launch timelines accurately.
2. **Preset Seed Data + User Generation in Unified Storage:**
   - *Decision:* Preset guides are seeded directly into the SQLite database on initial boot. This allows search, sorting, and URL resolution to use one clean unified interface.
3. **Graceful Demo Mode:**
   - *Decision:* Evaluators should not be blocked if they do not have an OpenAI API key on hand. The demo mode provides an honest, fully populated preview while clearly communicating that live research requires credentials.
4. **Information-Dense, Card-Restrained UI:**
   - *Decision:* Developers prefer scannable checklists, scopes tables, and collapsible blockers over excessive decorative marketing cards.

---

## Limitations & Future Roadmap

- **Live Web Crawling Integration:** Currently, AI research relies on GPT-4o's internal documentation index combined with structured verification prompts. Adding a Perplexity or Firecrawl step would enable real-time checks for same-day policy changes.
- **Automated OAuth Flow Tester:** A future feature could execute a test authorization code exchange against Composio's sandbox redirect URI to verify credentials automatically.
- **Enterprise Multi-Tenant Storage:** For cloud deployments with horizontal scaling, swap `better-sqlite3` with PostgreSQL (Prisma or Drizzle ORM).

---

## License

MIT © 2026. Built for the Composio Engineering Assignment.
