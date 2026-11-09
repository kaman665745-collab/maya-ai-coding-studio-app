# Maya AI Coding Studio — System Architecture

## 1. High-Level Architecture Overview

Maya AI Coding Studio is architected as a full-stack, cloud-native development environment pairing a React 19 frontend with a Node.js Express server, Google Gemini multi-agent AI infrastructure, and Google Cloud SQL PostgreSQL.

```
+-------------------------------------------------------------------------------+
|                                CLIENT LAYER                                   |
|  +-------------------------------------------------------------------------+  |
|  | Navbar: Model Selector | Run Preview | AI Repair | Workspace Tools      |  |
|  +-------------------------------------------------------------------------+  |
|  | Sidebar | File Explorer | Monaco Code Editor | Live Preview Sandbox     |  |
|  | (Icons) | (Resizable)   | (TypeScript/JSX)   | (React 18 / Tailwind)    |  |
|  +-------------------------------------------------------------------------+  |
|  | Secondary Drawers: 8-Agent Squad | AI Chat | DB Console | Git History    |  |
|  +-------------------------------------------------------------------------+  |
|  | Terminal Panel: Shell Commands | Cloud SQL Console | Problems Panel     |  |
+-------------------------------------------------------------------------------+
                                      |
                                      v [HTTP REST / API Endpoints]
+-------------------------------------------------------------------------------+
|                                BACKEND LAYER                                  |
|  +-------------------------------------------------------------------------+  |
|  | server.ts (Express 4 + Vite Middlewares in Dev / Static SPA in Prod)    |  |
|  +-------------------------------------------------------------------------+  |
|  | /api/auth/*     - Firebase token verification & user profile sync       |  |
|  | /api/projects/* - Project metadata, code tree CRUD, and zip packing     |  |
|  | /api/agent/*    - Multi-agent orchestration, Google Search Grounding    |  |
|  | /api/terminal/* - Virtual command execution engine                      |  |
|  | /api/db/*       - SQL query execution on Cloud SQL PostgreSQL           |  |
+-------------------------------------------------------------------------------+
                         |                                 |
                         v                                 v
+----------------------------------+    +---------------------------------------+
|          DATABASE LAYER          |    |               AI ENGINE               |
| Cloud SQL PostgreSQL Developer   |    | @google/genai TypeScript SDK          |
| Region: asia-southeast1          |    | - gemini-3.8-flash (Search Grounded)  |
| Drizzle ORM Schema & Pooling     |    | - gemini-4-argon (Deep Reasoning)     |
| (users, projects, history, etc.) |    | - gemini-3.1-flash-lite (Low-Latency) |
+----------------------------------+    +---------------------------------------+
```

---

## 2. Frontend Component Breakdown

1. **`src/App.tsx`**: Central state coordinator managing active project, virtual filesystem, active tabs, dirty state, breakpoints (`isMobile`, `isTablet`), explorer sizing, and modal states.
2. **`src/components/Navbar.tsx`**: Top header with project title editing, model selector, Run Preview trigger, AI Repair launch, save state indicator, and export/import actions.
3. **`src/components/FileExplorer.tsx`**: Tree hierarchy, file/folder creation, inline renaming, deletion, duplication, and drag-handle width adjustment.
4. **`src/components/CodeEditor.tsx`**: Monaco Editor wrapper configured with automatic layout observer (`ResizeObserver`), dark VS theme (`vs-dark`), font size controls, word wrap toggles, and minimap settings.
5. **`src/components/LivePreview.tsx`**: Sandboxed `<iframe>` mounting generated HTML documents with isolated execution, bidirectional console message forwarding via `postMessage`, and device dimension presets.
6. **`src/components/AgentTeamPanel.tsx`**: Autonomous 8-agent squad console supporting prompt instructions, Search Grounding, and 1-click code application.
7. **`src/components/AutonomousRepairModal.tsx`**: 3-mode autonomous AI bug repair workflow with diff visualization, checkpoint creation, and instant rollback.
8. **`src/components/TerminalPanel.tsx`**: Multi-tab terminal with interactive shell, problems linter list, and Cloud SQL query console.

---

## 3. Database Schema (Drizzle ORM)

Located in `src/db/schema.ts`:
- **`users`**: User records with Google OAuth UID, email, displayName, and photoUrl.
- **`projects`**: Project workspace entities with JSON `files` tree, current active file, and timestamps.
- **`project_history`**: Commit history with commit messages, parent commit references, and snapshot diffs.
- **`agent_tasks`**: Audit log of all autonomous agent operations, prompt inputs, model names, tokens, and execution times.
- **`api_configurations`**: Per-user encrypted/masked provider keys for custom LLM routing.

---

## 4. Multi-Agent Orchestration

The Gemini backend orchestrator (`src/lib/gemini.ts`) defines specialized system prompts for each agent role:
- **`architect`**: Focuses on boundary design, domain separation, and modular scalability.
- **`coding`**: Generates clean, type-safe TypeScript/React code without extraneous chatter.
- **`debugging`**: Analyzes call stacks, undefined variables, and broken syntax.
- **`review`**: Assesses algorithmic complexity, security vulnerabilities, and adherence to clean code standards.
- **`uiux`**: Focuses on accessibility, contrast ratios, and responsive spacing.
- **`testing`**: Designs test cases, edge cases, and unit testing mocks.
- **`security`**: Audits XSS vectors, injection attacks, and authentication authorization flaws.
- **`performance`**: Identifies bundle size regressions, unmemoized rerenders, and query optimization.
