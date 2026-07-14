# 🔍 Black-box QA Agent Dashboard

> **Open-Source AI Agentic QA Tool** — Automates black-box testing with AI Coding Agents (Antigravity, Cursor, Claude Code).  
> Built with **Next.js 15**, **TypeScript**, and **Tailwind CSS**.

[![npm version](https://img.shields.io/npm/v/black-box-qa.svg?style=flat)](https://www.npmjs.com/package/black-box-qa)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**🌐 Language / Ngôn ngữ:** [English](./README.en.md) · [Tiếng Việt](./README.md)

---

## ✨ Features

- 🤖 **AI-Native**: Ready to be used with AI coding agents (Antigravity, Cursor, Claude).
- 📊 **QA Dashboard**: View test results per run, organized by Catalog (AUTH, SECURITY, RATE_LIMIT...).
- 🧠 **Agent Memory**: Shared Memory — AI retains error patterns and working rules across sessions.
- 💡 **Prompt Extractor**: One-click copy of optimized prompts for AI to extract API specs or generate test cases.
- ⚡ **Auto Polling**: Dashboard auto-refreshes results every 3 seconds.

---

## 🚀 Quick Start

### 1. Initialize Project

You can start using Black-box QA by cloning this repository:

```bash
git clone https://github.com/archi-ai-labs/black-box-qa.git
cd black-box-qa
npm run setup
```

*(Note: In the future, you can use `npx black-box-qa init`)*

### 2. Configure Environment

The `setup` script will automatically create a `.env` file. You can edit it to add your specific API keys or configurations.

### 3. Run the Dashboard

```bash
npm run dev
```

Open your browser at [http://localhost:3080](http://localhost:3080)

---

## 🤖 Using with AI Agents

This repository is designed to be a workspace for your AI coding agents.

### 🟣 Cursor AI
1. Open this repository in Cursor.
2. Open the AI Chat (Cmd/Ctrl + L).
3. Type: *"Write test cases for my project at [URL] and run them."*
4. Cursor will automatically read `.cursor/rules/qa-agent.mdc` and know exactly how to structure and run tests for this dashboard.

### 🔵 Google Antigravity
1. Open this workspace in Antigravity IDE.
2. The agent will automatically detect the skills in `.agents/skills/`.
3. Give it a prompt: *"Please extract the QA context for my API."*
4. It will use the built-in skills to generate requirements and execute tests.

### 🟠 Claude Code
1. Navigate to this directory in your terminal.
2. Run `claude`.
3. Claude will read the `CLAUDE.md` file and understand the project structure and testing commands.

---

## 📁 Adding a New Project Manually

1. Add an entry to `data/projects.json`:
```json
{
  "id": "project-myapp",
  "name": "My App API",
  "description": "Short description of the project",
  "targetUrl": "http://localhost:8080/health",
  "type": "api"
}
```
2. Create the results directory: `mkdir -p data/project-myapp`
3. AI Agent writes results to `data/project-myapp/results.json`

---

## 🤝 Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for details on how to get started.

## 📄 License

MIT © [archi-ai-labs](https://github.com/archi-ai-labs)

