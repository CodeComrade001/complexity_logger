Here’s a professional, clear README tailored to your **Log Complexity** project based on the files and instructions you’ve provided:

---

# Log Complexity

**Log Complexity** is a full-stack TypeScript application designed to analyze code complexity across multiple programming languages using LLMs and compiler analysis. It provides developers with real-time insights into their codebase complexity through a clean, dark-first UI.

---

## Table of Contents

* [Features](#features)
* [Tech Stack](#tech-stack)
* [Project Structure](#project-structure)
* [Installation & Development](#installation--development)
* [Usage](#usage)
* [Adding New Compilers or Endpoints](#adding-new-compilers-or-endpoints)
* [Known Constraints](#known-constraints)
* [License](#license)

---

## Features

* Multi-language complexity analysis (TypeScript, JavaScript, C++, Java, Rust)
* Real-time frontend dashboard with code complexity charts
* File upload API with LLM-powered AST analysis
* Dark-first, industrial, professional UI built with TailwindCSS
* Structured modular backend with dependency injection

---

## Tech Stack

**Frontend:** React 19, Vite, TailwindCSS, Recharts, Radix UI
**Backend:** Fastify 5, TypeScript (ES2022), ts-morph, node-llama-cpp, Mongoose
**Build & Dev:** pnpm, ts-node-dev
**Optional:** Docker for containerized builds

---

## Project Structure

```
client/                  # Frontend React/Vite app
  src/
    components/
      dashboard/          # Complexity charts & code editor
      ui/                 # Radix/shadcn UI components
    context/              # React Context for state management
    hooks/                # Custom hooks
    pages/                # Full page layouts (login, dashboard, etc.)
    utils/                # API client (axios) and helpers

server/                  # Backend Fastify API
  src/
    app/
      AppBootstrap.ts     # Fastify app & DI container setup
    compliers/            # Language-specific compiler modules
    core/di/              # Dependency Injection container
    module/
      routes/             # API endpoints
      usecases/           # Business logic handlers
      adapters/           # External interfaces
    infra/db/             # Optional database connections
```

---

## Installation & Development

### Frontend

```bash
cd client
pnpm install
pnpm run dev    # Starts Vite dev server at http://localhost:5173
pnpm run build  # Build production bundle
pnpm run lint   # Run ESLint checks
```

### Backend

```bash
cd server
pnpm install
pnpm run dev          # Starts backend with ts-node-dev
pnpm run build        # Compile TypeScript to dist/
pnpm run prisma:dev   # Database migrations (if configured)
```

### Docker (Optional)

```bash
docker-build          # Builds server image
docker-run: release   # Runs compiled server image
docker-run: debug     # Runs with DEBUG=* in development
```

---

## Usage

 # Log Complexity

Log Complexity — full‑stack TypeScript application that analyzes code complexity across TypeScript/JavaScript, C++, Java, and Rust using compiler plugins and LLM‑assisted analysis.

Core highlights
- Modular Fastify backend with dependency injection and language‑specific compiler plugins.
- AST‑based analysis integrated with `node-llama-cpp` to generate actionable complexity scores and reports.
- React + Vite frontend with an interactive dashboard, code editor, and visual complexity charts.

Tech stack
- Frontend: React 19, Vite, TailwindCSS, Recharts
- Backend: Fastify 5, TypeScript (ES2022), ts-morph, node-llama-cpp
- Tooling: pnpm, ts-node-dev, Docker (optional)

Quick start (dev)
1) Frontend:
```bash
cd client
pnpm install
pnpm run dev
```
2) Backend:
```bash
cd server
pnpm install
pnpm run dev
```

Key locations
- Backend bootstrap & DI: server/src/app/AppBootstrap.ts
- Compiler plugins: server/src/compliers/
- API routes: server/src/module/routes/
- Frontend entry: client/src/main.tsx and client/src/App.tsx

Operational notes
- Upload API: `POST /api/file/repos/analyze` (multi‑language file analysis).
- Backend enforces file/volume limits and uses Node16 module resolution requiring `.js` extensions on relative imports.

Next steps
- I can produce a one‑line resume summary, create a condensed `README_RESUME.md`, run linting, or commit this change—tell me which you'd prefer.




