# 🔍 Black-box QA Agent Dashboard

> **Agentic QA Tool** — Automates black-box testing with AI Agent support (Antigravity).  
> Built with **Next.js 15**, **TypeScript**, and integrated **Antigravity Agent Skills**.

**🌐 Language / Ngôn ngữ:** [English](./README.md) · [Tiếng Việt](./README.vi.md)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📊 **QA Dashboard** | View test results per run, organized by Catalog (AUTH, SECURITY, RATE_LIMIT...) |
| 🧠 **Agent Memory** | Shared Memory — AI retains error patterns and working rules across sessions |
| 💡 **Prompt Extractor** | One-click copy of optimized prompts for AI to extract API specs or generate test cases |
| 🖼️ **UI Test Screenshots** | View step-by-step screenshots from UI test runs (Playwright/Puppeteer) |
| ⚡ **Auto Polling** | Dashboard auto-refreshes results every 3 seconds |
| 🤖 **Antigravity Skills** | 2 built-in AI skills for QA context extraction and test requirement generation |

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/archi-ai-labs/black-box-qa.git
cd black-box-qa
npm install
```

### 2. Configure Environment (if needed)

```bash
cp .env.example .env
# Edit .env with your project's API key or credentials
```

### 3. Run the Dashboard

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000)

---

## 📁 Adding a New Project

### 1. Add an entry to `data/projects.json`

```json
{
  "id": "project-myapp",
  "name": "My App API",
  "description": "Short description of the project",
  "targetUrl": "http://localhost:8080/health",
  "type": "api"
}
```

`type` can be `"api"` or `"ui-test"`.

### 2. Create the results directory

```bash
mkdir -p data/project-myapp
```

### 3. AI Agent writes results to `data/project-myapp/results.json`

See [`data/project-demo/results.json`](./data/project-demo/results.json) for the expected format.

---

## 🗂️ Data Format (`results.json`)

```json
{
  "lastUpdated": "2026-07-14T12:00:00.000Z",
  "summary": { "total": 10, "passed": 9, "failed": 1 },
  "mockServerStatus": "running",
  "runs": [
    {
      "id": "run_<timestamp>",
      "timestamp": "2026-07-14T12:00:00.000Z",
      "status": "completed",
      "summary": { "total": 10, "passed": 9, "failed": 1 },
      "testCases": [
        {
          "name": "TC_AUTH_001: Successful login",
          "catalog": "AUTH",
          "status": "PASS",
          "statusCode": 200,
          "durationMs": 124,
          "request": { "method": "POST", "url": "/api/login", "body": {} },
          "response": { "status": 200, "body": {} },
          "passCondition": "Status 200 and response contains accessToken"
        }
      ]
    }
  ]
}
```

**Supported Catalogs:** `AUTH` · `API_KEY` · `ENERGY` · `TRANSACTION` · `SECURITY` · `RATE_LIMIT` · `CONCURRENCY` · `CLEANUP` · `HEALTH` · `GENERAL`

---

## 🤖 Antigravity Agent Skills

The `.agents/skills/` directory contains 2 skills for use with [Antigravity AI](https://antigravity.dev):

### `extract-qa-context`
Sends an optimized prompt to the AI to **extract system specifications** from a codebase (API endpoints, auth flows, request/response formats).

### `extract-test-requirements`
Sends an optimized prompt to the AI to **automatically generate test cases** grouped by Catalog, each with a defined Pass Condition.

> Use the **💡 Extract Prompt** tab on the Dashboard to copy the prompt and paste it into Antigravity IDE.

---

## 📂 Project Structure

```
black-box-qa/
├── src/
│   └── app/
│       ├── page.tsx              # Main dashboard UI
│       ├── globals.css           # Design system
│       └── api/
│           ├── projects/         # GET project list
│           ├── status/           # GET test results
│           ├── run-tests/        # POST trigger test run
│           └── shared-memory/    # GET/POST agent memory
├── data/
│   ├── projects.json             # Project registry
│   ├── project-demo/             # Sample data (mock server)
│   ├── project-ecommerce/        # Showcase: E-Commerce API
│   ├── project-fintech/          # Showcase: Payment Gateway
│   ├── project-saas/             # Showcase: SaaS Access Control
│   └── project-tronsave/         # Showcase: UI Test (Testnet)
├── .agents/
│   └── skills/                   # Antigravity QA Skills
│       ├── extract-qa-context/
│       └── extract-test-requirements/
├── .env.example                  # Environment template
└── README.md
```

---

## 🛠️ API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/projects` | Get project list (with lastUpdated) |
| `GET` | `/api/status?projectId=<id>` | Get test results for a project |
| `POST` | `/api/run-tests` | Trigger a test run (`{ projectId }`) |
| `GET` | `/api/shared-memory` | Get agent memory content |

---

## 📄 License

MIT © [archi-ai-labs](https://github.com/archi-ai-labs)
