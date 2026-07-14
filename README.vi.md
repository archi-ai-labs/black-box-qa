# 🔍 Black-box QA Agent Dashboard

> **Công cụ QA tự động** — Tự động hóa kiểm thử hộp đen (Black-box Testing) với sự hỗ trợ của AI Agent (Antigravity).  
> Xây dựng với **Next.js 15**, **TypeScript**, và tích hợp **Antigravity Agent Skills**.

**🌐 Language / Ngôn ngữ:** [English](./README.md) · [Tiếng Việt](./README.vi.md)

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Tính Năng Nổi Bật

| Tính năng | Mô tả |
|---|---|
| 📊 **QA Dashboard** | Xem kết quả test theo phiên chạy, phân loại theo Catalog (AUTH, SECURITY, RATE_LIMIT...) |
| 🧠 **Agent Memory** | Shared Memory — AI ghi nhớ patterns lỗi, quy tắc làm việc giữa các phiên |
| 💡 **Prompt Extractor** | Copy ngay prompt tối ưu để gửi cho AI trích xuất đặc tả API hoặc sinh test cases |
| 🖼️ **UI Test Screenshots** | Xem ảnh chụp từng bước khi chạy test giao diện (Playwright/Puppeteer) |
| ⚡ **Auto Polling** | Dashboard tự động cập nhật kết quả mỗi 3 giây |
| 🤖 **Antigravity Skills** | Tích hợp sẵn 2 skill AI để trích xuất context QA và sinh test requirements |

---

## 🚀 Quick Start

### 1. Clone & Cài đặt

```bash
git clone https://github.com/archi-ai-labs/black-box-qa.git
cd black-box-qa
npm install
```

### 2. Cấu hình môi trường (nếu cần)

```bash
cp .env.example .env
# Chỉnh sửa .env với API key của project bạn muốn test
```

### 3. Chạy Dashboard

```bash
npm run dev
```

Mở trình duyệt tại [http://localhost:3000](http://localhost:3000)

---

## 📁 Cách Thêm Project Mới

### 1. Thêm vào `data/projects.json`

```json
{
  "id": "project-myapp",
  "name": "My App API",
  "description": "Mô tả ngắn về project",
  "targetUrl": "http://localhost:8080/health",
  "type": "api"
}
```

`type` có thể là `"api"` hoặc `"ui-test"`.

### 2. Tạo thư mục kết quả

```bash
mkdir -p data/project-myapp
```

### 3. AI Agent ghi kết quả vào `data/project-myapp/results.json`

Xem file [`data/project-demo/results.json`](./data/project-demo/results.json) để biết format chuẩn.

---

## 🗂️ Cấu Trúc Dữ Liệu (`results.json`)

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
          "name": "TC_AUTH_001: Đăng nhập thành công",
          "catalog": "AUTH",
          "status": "PASS",
          "statusCode": 200,
          "durationMs": 124,
          "request": { "method": "POST", "url": "/api/login", "body": {} },
          "response": { "status": 200, "body": {} },
          "passCondition": "Status 200 và response chứa accessToken"
        }
      ]
    }
  ]
}
```

**Catalog hỗ trợ:** `AUTH` · `API_KEY` · `ENERGY` · `TRANSACTION` · `SECURITY` · `RATE_LIMIT` · `CONCURRENCY` · `CLEANUP` · `HEALTH` · `GENERAL`

---

## 🤖 Antigravity Agent Skills

Thư mục `.agents/skills/` chứa 2 skill tích hợp với [Antigravity AI](https://antigravity.dev):

### `extract-qa-context`
Gửi prompt tối ưu cho AI để **trích xuất đặc tả hệ thống** từ codebase (API endpoints, auth flows, request/response format).

### `extract-test-requirements`
Gửi prompt tối ưu cho AI để **tự động sinh danh sách test cases** phân nhóm theo Catalog, kèm điều kiện Pass.

> Sử dụng tab **💡 Trích xuất Prompt** trên Dashboard để copy prompt và paste vào Antigravity IDE.

---

## 📂 Cấu Trúc Project

```
black-box-qa/
├── src/
│   └── app/
│       ├── page.tsx              # Dashboard UI chính
│       ├── globals.css           # Design system
│       └── api/
│           ├── projects/         # GET danh sách projects
│           ├── status/           # GET kết quả test
│           ├── run-tests/        # POST trigger chạy test
│           └── shared-memory/    # GET/POST bộ nhớ agent
├── data/
│   ├── projects.json             # Danh sách projects
│   ├── project-demo/             # Dữ liệu mẫu (mock server)
│   ├── project-ecommerce/        # Showcase: E-Commerce API
│   ├── project-fintech/          # Showcase: Payment Gateway
│   ├── project-saas/             # Showcase: SaaS Access Control
│   └── project-tronsave/         # Showcase: UI Test (Testnet)
├── .agents/
│   └── skills/                   # Antigravity QA Skills
│       ├── extract-qa-context/
│       └── extract-test-requirements/
├── .env.example                  # Template cấu hình môi trường
└── README.md
```

---

## 🛠️ API Endpoints

| Method | Path | Mô tả |
|---|---|---|
| `GET` | `/api/projects` | Lấy danh sách projects (kèm lastUpdated) |
| `GET` | `/api/status?projectId=<id>` | Lấy kết quả test của project |
| `POST` | `/api/run-tests` | Trigger chạy test (`{ projectId }`) |
| `GET` | `/api/shared-memory` | Lấy nội dung bộ nhớ agent |

---

## 📄 License

MIT © [archi-ai-labs](https://github.com/archi-ai-labs)
