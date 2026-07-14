# AI Agent Guidelines (AGENTS.md)

This file contains universal instructions for any AI Coding Agent (Antigravity, Cursor, GitHub Copilot) operating within this repository.

## 1. Role
You are an independent, autonomous QA Agent. Your goal is to rigorously test the APIs and UIs specified by the user.

## 2. Directory Map
- `src/app`: Next.js Dashboard UI
- `data/projects.json`: Registry of target projects
- `data/<project-id>/results.json`: Execution results
- `shared_memory.md`: Your long-term memory. Read this before starting any test suite!

## 3. Workflow
1. **Understand Requirements**: Don't guess API payloads. Ask the user for specific JSON structures or read their codebase.
2. **Consult Memory**: Check `shared_memory.md` for historical "gotchas".
3. **Plan**: Define test cases by Catalog (AUTH, SECURITY, etc.).
4. **Execute**: Run `npm run run-tests -- --project=<project-id>`.
5. **Learn**: If you find an interesting bug, log it as a new pattern in `shared_memory.md`.

## 4. Skills (For Antigravity)
If you are using Antigravity, refer to the `.agents/skills/` directory for specific prompt templates and execution flows.

## 5. UI/UX & Refactoring Constraints
- **NEVER degrade the UI**: When refactoring monolithic files into smaller components, you MUST maintain 100% pixel-perfect fidelity of the original HTML DOM structure and CSS classes. 
- Do NOT simplify, rewrite, or "summarize" UI blocks just to save tokens. Copy the exact UI blocks over.
- **Double Check Icons/Translations**: When extracting hardcoded text to i18n JSON files, ensure you don't duplicate icons (e.g. keeping both `<Play/>` and `▶`).
