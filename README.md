# Maya AI Coding Studio

> Next-Generation Autonomous AI Development Platform & Cloud IDE

Maya AI Coding Studio is a browser-based, full-stack software development environment and AI agent workspace. Designed with a monochrome palette (`#080808`), it unites a code editor powered by Monaco, an isolated live application preview sandbox, autonomous multi-agent engineering workflows powered by Google Gemini, Cloud SQL PostgreSQL persistence, and developer toolchain integrations.

---

## 🌟 Key Features

### 1. Universal Dual Workspace System (Full Screen & Split Screen)
- **Instant Workspace Switcher**: Switch instantly between **Full Screen Mode** (`Maximize2`) and **Split Screen Mode** (`Columns2`) with persistent controls in Navbar, Editor tab bar, Preview toolbar, and Mobile bottom rail.
- **Dedicated Full Screen Modes**: Full-width/full-height Editor or Preview with zero reload and 100% state preservation (active file, open tabs, cursor position, scroll, and preview runtime).
- **Mobile Vertical Split Mode**: Code Editor on top, Live Preview on bottom with draggable divider, presets (`50/50`, `60/40`, `40/60`), and one-tap panel swap.
- **Landscape & Desktop Horizontal Split**: Code Editor on left, Live Preview on right with draggable divider, orientation toggles (`Horizontal` vs `Vertical`), and responsive container queries.
- **Monaco Code Editor**: Syntax highlighting, intelligent autocomplete, responsive font scaling, line numbers, word-wrap toggles, and automatic `ResizeObserver` layout calculation.
- **Live Connected Preview Sandbox**: Real-time evaluation of React 19, TypeScript, JSX, Tailwind CSS, and HTML/CSS/JS with console forwarding, error boundary protection, and device viewport simulation (Desktop, Tablet, Mobile).

### 2. Universal Responsive Architecture
- **Dedicated Mobile Workspace**: Optimized for Android smartphones and iPhones with zero control clipping, full-width editor/preview views, and an accessible bottom navigation rail (`Files`, `Editor`, `Preview`, `Terminal`, `Agents`).
- **Tablet & Desktop Multi-Panel**: Resizable multi-column panes with drag handles and layout memory stored in `localStorage`.

### 3. Eight Specialized Autonomous AI Agents
- **Architect Agent**: System design, high-level module decomposition, schema modeling, and task sequencing.
- **Coding Agent**: Full-stack TypeScript/React feature implementation, modular refactoring, and clean code generation.
- **Debugging Agent**: Root-cause exception analysis, syntax bug diagnosis, and patch resolution.
- **Code Review Agent**: Quality evaluation, SOLID principle adherence, maintainability grading, and automated scoring.
- **UI/UX Agent**: Accessibility compliance, responsive design audits, and design system alignment.
- **Testing Agent**: Unit test creation, edge case identification, and test fixture scaffolding.
- **Security Agent**: Vulnerability auditing, injection sanitization, token handling, and security hardening.
- **Performance Agent**: Memory optimization, bundle reduction, and algorithmic efficiency analysis.
- **Google Search Grounding**: Live web search integration for modern documentation, libraries, and best practices.

### 4. Autonomous AI Code Repair & Checkpoints
- **Mode A (Assisted Interactive)**: AI proposes diffs and explanations; user reviews and applies.
- **Mode B (Semi-Autonomous)**: AI tests and proposes fixes with safety checkpoints.
- **Mode C (Full Autonomous)**: Automated diagnosis, remediation, and live validation.
- **Instant Rollback**: Every AI repair creates an immutable snapshot for one-click rollback.

### 5. Cloud SQL PostgreSQL & Persistence
- **Cloud SQL Developer Edition**: Connected in `asia-southeast1` (`ai-studio-b2276002`) with connection pooling.
- **Drizzle ORM**: Type-safe relational schema across `users`, `projects`, `project_history`, `agent_tasks`, and `api_configurations`.
- **Version Control & Git**: Local commit snapshots, diff tracking, and branch history.

### 6. Integrations & Tooling
- **Interactive Terminal**: Virtual shell with support for `npm test`, `git status`, `git commit`, `ls`, and Cloud SQL SQL query console.
- **ZIP Import & Export**: Traversal-protected archive packing and unpacking using JSZip.
- **Google Workspace**: Google Drive export, Google Docs export, Google Forms survey generation.
- **Multi-Provider AI Registry**: Management for Google Gemini (`gemini-3.8-flash`, `gemini-4-argon`, `gemini-3.1-flash-lite`), OpenAI, Anthropic, and Groq keys.

---

## 🚀 Quickstart

### Prerequisites
- Node.js 20+ or 22+
- npm or bun

### Local Development
```bash
# Clone repository
git clone https://github.com/maya-ai/maya-coding-studio.git
cd maya-coding-studio

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:3000` in your browser.

---

## 🧪 Testing

```bash
# Run unit test suite (file system, preview sandbox, zip service)
npx tsx --test src/utils/*.test.ts
```

---

## 🛡️ License
Apache-2.0 License. Built for Maya AI Studio.
