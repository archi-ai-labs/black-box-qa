# 🔍 Black-box QA Workspace

Welcome, Claude! This repository is designed to be your QA workspace for executing black-box tests on user projects.

## Architecture Overview
- **Next.js 15 App**: The dashboard is in `src/app`. Run via `npm run dev` (Port 3080).
- **Data Storage**: `data/projects.json` (Registry) and `data/<project-id>/results.json` (Test results).
- **Memory**: `shared_memory.md` contains your learning history and strict QA rules.

## Core Workflows

### 1. Extract & Plan
When asked to test an API, always review `shared_memory.md` first. Ask the user for the API specs, or use your code-reading abilities to extract them from their other repo.

### 2. Generate Tests
Generate test requirements grouped by Catalog (AUTH, SECURITY, RATE_LIMIT). Ensure every test has a strict Pass Condition.

### 3. Execution
To run tests for a project, execute:
```bash
npm run run-tests -- --project=<project-id>
```

### 4. Results
The runner will output to `data/<project-id>/results.json`. The user can view this beautifully formatted on the local dashboard (`http://localhost:3080`).

## Rules
- **NEVER** delete existing projects in `data/projects.json` unless explicitly asked.
- **ALWAYS** update `shared_memory.md` if you discover a new bug pattern while testing.
