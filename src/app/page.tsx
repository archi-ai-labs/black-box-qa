"use client";

import { useEffect, useState } from 'react';

interface Project {
  id: string;
  name: string;
  description: string;
  targetUrl?: string;
  type?: 'api' | 'ui-test';
  lastUpdated?: string;
}

interface TestCase {
  name: string;
  catalog?: string;
  status: 'PASS' | 'FAIL';
  statusCode: number;
  durationMs: number;
  request: {
    method: string;
    url: string;
    body: any;
  };
  response: {
    status: number;
    body: any;
  };
  errorMsg?: string;
  passCondition?: string;
  screenshot?: string;
  logs?: string[];
}

interface TestRun {
  id: string;
  timestamp: string;
  status?: 'running' | 'completed' | 'pending';
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  performance?: {
    avgResponseTimeMs: number;
    maxResponseTimeMs: number;
    p95ResponseTimeMs: number;
    slowestEndpoint: string;
  };
  autoFixReport?: {
    status: 'healed' | 'failed' | 'skipped';
    title: string;
    details: string;
    modifiedFiles: string[];
  };
  testCases: TestCase[];
}

interface StatusData {
  lastUpdated: string;
  summary: {
    total: number;
    passed: number;
    failed: number;
  };
  mockServerStatus: 'running' | 'stopped';
  isApiOnline?: boolean;
  targetUrl?: string;
  runs: TestRun[];
}

const CATALOG_META: Record<string, { label: string; icon: string }> = {
  AUTH: { label: 'Xác thực & Tài khoản', icon: '🔒' },
  API_KEY: { label: 'Quản lý API Key', icon: '🔑' },
  ENERGY: { label: 'Năng lượng & Đơn hàng', icon: '⚡' },
  TRANSACTION: { label: 'Thanh toán & Giao dịch', icon: '💸' },
  SECURITY: { label: 'Bảo mật hệ thống', icon: '🛡️' },
  RATE_LIMIT: { label: 'Giới hạn tần suất', icon: '⏳' },
  CONCURRENCY: { label: 'Xử lý đồng thời (Race Condition)', icon: '🔄' },
  CLEANUP: { label: 'Dọn dẹp dữ liệu hậu kiểm', icon: '🧹' },
  HEALTH: { label: 'Trạng thái hệ thống', icon: '🏥' },
  GENERAL: { label: 'Tổng hợp / Khác', icon: '📁' },
};

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [data, setData] = useState<StatusData | null>(null);
  const [sharedMemory, setSharedMemory] = useState<string>('');
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);
  const [expandedTests, setExpandedTests] = useState<Set<string>>(new Set());
  const [autoExpand, setAutoExpand] = useState<boolean>(false);
  const [waitingList, setWaitingList] = useState<Set<string>>(new Set());
  const [collapsedCatalogs, setCollapsedCatalogs] = useState<Record<string, boolean>>({});
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PASS' | 'FAIL'>('ALL');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'testing' | 'memory' | 'guide' | 'extract'>('testing');
  const [copied, setCopied] = useState(false);
  const [copiedType, setCopiedType] = useState<'context' | 'requirements' | null>(null);
  const [extractSubTab, setExtractSubTab] = useState<'context' | 'requirements'>('context');
  const [refreshInterval] = useState<number>(3000); // Poll every 3 seconds

  // Fetch the project list once on mount
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch('/api/projects');
        const list = await res.json();
        setProjects(list);
        if (list.length > 0) {
          // Default to the first project in list (e.g. project-ecommerce)
          setSelectedProjectId(list[0].id);
        }
      } catch (err) {
        console.error("Error fetching projects:", err);
      }
    };
    fetchProjects();
  }, []);

  const fetchData = async () => {
    if (!selectedProjectId) return;
    try {
      const statusRes = await fetch(`/api/status?projectId=${selectedProjectId}`);
      const statusJson = await statusRes.json();
      setData(statusJson);

      const memRes = await fetch('/api/shared-memory');
      const memJson = await memRes.json();
      setSharedMemory(memJson.content || '');

      // Set default selected run if none selected or the current selected run is not in the new data
      if (statusJson.runs && statusJson.runs.length > 0) {
        const exists = statusJson.runs.some((r: TestRun) => r.id === selectedRunId);
        if (!exists) {
          setSelectedRunId(statusJson.runs[0].id);
        }
      } else {
        setSelectedRunId(null);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [selectedProjectId, selectedRunId, refreshInterval]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setSelectedRunId(null);
    setExpandedTests(new Set());
    setStatusFilter('ALL');
    setLoading(true);
  };

  const handleSelectRun = (runId: string) => {
    setSelectedRunId(runId);
    setExpandedTests(new Set()); // Reset expanded test case
    setStatusFilter('ALL');
  };

  const handleToggleTest = (name: string) => {
    setExpandedTests(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  const handleToggleCatalog = (catalog: string) => {
    setCollapsedCatalogs(prev => ({
      ...prev,
      [catalog]: !prev[catalog]
    }));
  };

  const handleFilterChange = (filter: 'ALL' | 'PASS' | 'FAIL') => {
    setStatusFilter(filter);
    setExpandedTests(new Set());
  };

  // Helper to compute relative time (e.g. "1 phút trước", "2 giờ trước")
  const getRelativeTime = (timestamp: string): string => {
    const elapsed = Date.now() - new Date(timestamp).getTime();
    const seconds = Math.floor(elapsed / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) return 'Vừa xong';
    if (seconds < 60) return `${seconds} giây trước`;
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

  const activeRun = data?.runs.find(r => r.id === selectedRunId) || data?.runs[0] || null;
  const currentProject = projects.find(p => p.id === selectedProjectId);

  // Parse Shared Memory lines into sections
  const parseSharedMemory = (text: string) => {
    const sections = {
      rules: [] as string[],
      patterns: [] as string[],
      checklist: [] as string[]
    };

    if (!text) return sections;

    const lines = text.split('\n');
    let currentSection: 'none' | 'rules' | 'patterns' | 'checklist' = 'none';

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.includes('Quy tắc làm việc nghiêm ngặt')) {
        currentSection = 'rules';
        continue;
      } else if (line.includes('Nhật ký Kinh nghiệm') || line.includes('🧠 Nhật ký Kinh nghiệm')) {
        currentSection = 'patterns';
        continue;
      } else if (line.includes('Checklist Kiểm thử Tổng hợp')) {
        currentSection = 'checklist';
        continue;
      }

      if (currentSection === 'rules') {
        sections.rules.push(line);
      } else if (currentSection === 'patterns') {
        sections.patterns.push(line);
      } else if (currentSection === 'checklist') {
        sections.checklist.push(line);
      }
    }

    return sections;
  };

  const getRules = (rulesLines: string[]) => {
    const rulesList: { title: string; content: string[] }[] = [];
    let currentRule: { title: string; content: string[] } | null = null;

    rulesLines.forEach(line => {
      const trimmed = line.trim();
      if (/^\d+\.\s+/.test(trimmed)) {
        if (currentRule) rulesList.push(currentRule);
        currentRule = {
          title: trimmed.replace(/^\d+\.\s+\*\*/, '').replace(/\*\*$/, '').replace(/\*\*:/, ''),
          content: []
        };
      } else if (trimmed && currentRule) {
        const cleanContent = trimmed.replace(/^-\s+/, '').replace(/^\*\s+/, '');
        if (cleanContent) currentRule.content.push(cleanContent);
      }
    });
    if (currentRule) rulesList.push(currentRule);
    return rulesList;
  };

  const getPatterns = (patternsLines: string[]) => {
    const categories: { title: string; content: string[] }[] = [];
    let currentCat: { title: string; content: string[] } | null = null;

    patternsLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('### ') || (trimmed.startsWith('* ') && trimmed.includes(':'))) {
        if (currentCat) categories.push(currentCat);
        
        let title = trimmed;
        if (title.startsWith('### ')) title = title.slice(4);
        else if (title.startsWith('* ')) title = title.slice(2);
        
        currentCat = {
          title: title.replace(/^\*\*/, '').replace(/\*\*$/, '').replace(/\*\*:/, ''),
          content: []
        };
      } else if (trimmed && currentCat) {
        const cleanContent = trimmed.replace(/^-\s+/, '').replace(/^\*\s+/, '');
        if (cleanContent) currentCat.content.push(cleanContent);
      }
    });
    if (currentCat) categories.push(currentCat);
    
    return categories.filter(c => c.title.trim().length > 0);
  };

  const getChecklist = (checklistLines: string[]) => {
    const items: { text: string; checked: boolean }[] = [];
    checklistLines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('- [x]')) {
        items.push({
          text: trimmed.slice(6).trim(),
          checked: trimmed.startsWith('- [x]')
        });
      }
    });
    return items;
  };

  const parsedMemory = parseSharedMemory(sharedMemory);
  const rules = getRules(parsedMemory.rules);
  const patterns = getPatterns(parsedMemory.patterns);
  const checklist = getChecklist(parsedMemory.checklist);

  const copyPromptToClipboard = (type: 'context' | 'requirements') => {
    const PROMPT_CONTEXT = `Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất tài liệu đặc tả hệ thống (System Specification) chi tiết phục vụ cho việc viết Black-box Test. Tùy thuộc vào loại dự án (Backend API, Frontend Web/Mobile, hoặc Full-stack), hãy trả về tài liệu dưới dạng Markdown chuẩn (api_docs.md hoặc frontend_spec.md) để tôi có thể copy-paste trực tiếp sang dự án QA.

Đối với mỗi phần, bạn cần cung cấp đầy đủ các thông tin sau:

---

### PHẦN 1: NẾU DỰ ÁN LÀ BACKEND / API SERVICES
1. **Thông tin chung**:
   - Endpoint URL (Local/Staging base URL và path).
   - HTTP Method (GET, POST, PUT, DELETE, PATCH).
   - Headers yêu cầu (ví dụ: Authorization: Bearer <token>, Content-Type: application/json).

2. **Dữ liệu đầu vào (Request)**:
   - Chi tiết Query Parameters hoặc Request Body dưới dạng JSON mẫu.
   - Kiểu dữ liệu, trạng thái Bắt buộc (Required/Optional), và các ràng buộc validation (min/max, format, unique...).

3. **Dữ liệu đầu ra (Response) & HTTP Status Code**:
   - Happy Path: HTTP Status Code (200, 201...) và JSON response mẫu.
   - Error Cases: HTTP Status Code tương ứng (400, 401, 403, 404, 409, 422...) kèm cấu trúc JSON báo lỗi cụ thể.

4. **Tài khoản và Phân quyền (Auth & Roles)**:
   - Cách thức lấy Token đăng nhập (qua API /login, Firebase Auth, Session/Cookie...).
   - Tài khoản test mẫu (username/password/role) cho từng nhóm quyền để QA test phân quyền chéo.

5. **Quản lý dữ liệu test & Tác động Database (Test Data Strategy)**:
   - Các bảng (Tables) / Collections bị tác động trong DB.
   - Cơ chế dọn dẹp hoặc reset DB về trạng thái ban đầu phục vụ chạy test lặp lại.

6. **Tích hợp bên thứ ba & Các kết nối đặc biệt (Third-party & Special flows)**:
   - Các dịch vụ ngoài (Stripe, Twilio, SendGrid...) cần mock.
   - Cơ chế Rate Limit, Captcha cần bypass khi test tự động.
   - Luồng Real-time (WebSockets, SSE) hoặc Webhook callback.

---

### PHẦN 2: NẾU DỰ ÁN LÀ FRONTEND (WEB APP / MOBILE APP / CHROME EXTENSION)
1. **Màn hình & Luồng Điều hướng (Screens & Navigation Flows)**:
   - Danh sách các URL routes / Màn hình chính cần test (ví dụ: /login, /dashboard, /settings).
   - Sơ đồ chuyển đổi màn hình chính (ví dụ: Đăng nhập -> Chuyển hướng Dashboard -> Mở modal Profile).

2. **Các Form & Các thành phần tương tác (Interactive Elements)**:
   - Danh sách các Form (Đăng nhập, Thanh toán, Tìm kiếm...) và các trường Input.
   - Các phần tử tương tác quan trọng (Nút bấm, Dropdown, Modal, Popup, Toast notification...).
   - Quy tắc Validation tại Client (ví dụ: nút Submit bị khóa/mờ khi thiếu dữ liệu, hiển thị cảnh báo lỗi tức thì khi email sai format).

3. **Quản lý Trạng thái & Lưu trữ (Client State & Storage)**:
   - Ứng dụng lưu trữ session/token ở đâu (LocalStorage, SessionStorage, Cookies, hay IndexedDB)?
   - Các biến trạng thái (State) toàn cục quan trọng cần kiểm thử (ví dụ: Redux, Zustand, React Context).

4. **Kết nối API & Mocking**:
   - Base URL của API backend mà Frontend đang gọi tới.
   - Có cần giả lập (mock) API hoặc dữ liệu mạng nào khi chạy test UI độc lập không?

---

Hãy tự nhận diện loại hình dự án hiện tại và xuất trực tiếp nội dung file Markdown hoàn chỉnh, không cần giải thích hay dông dài ngoài lề.`;

    const PROMPT_REQUIREMENTS = `Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất danh sách các kịch bản kiểm thử (Test Cases) chi tiết dưới dạng Markdown phục vụ cho việc kiểm thử tự động (hoặc hiển thị trên QA Dashboard). 

Đầu ra cần được phân loại rõ ràng theo các nhóm nghiệp vụ (Catalog) và định nghĩa chi tiết Điều kiện đạt (Pass Condition) cho mỗi ca test.

### Yêu cầu cấu trúc đầu ra cho mỗi Test Case:
1. **ID Test Case**: Định dạng \`TC_[MÃ_DANH_MỤC]_[SỐ_THỨ_TỰ]\` (ví dụ: \`TC_AUTH_001\`, \`TC_ENERGY_003\`).
2. **Tên Test Case**: Mô tả ngắn gọn (ví dụ: \`Happy Path: Đăng ký tài khoản thành công\`).
3. **Danh mục (Catalog)**: Chọn 1 trong các nhóm chuẩn sau:
   - \`AUTH\` (Xác thực & Tài khoản)
   - \`API_KEY\` (Quản lý API Key)
   - \`ENERGY\` (Năng lượng & Đơn hàng)
   - \`TRANSACTION\` (Thanh toán & Giao dịch)
   - \`SECURITY\` (Bảo mật hệ thống)
   - \`RATE_LIMIT\` (Giới hạn tần suất)
   - \`CONCURRENCY\` (Xử lý đồng thời / Race Condition)
   - \`CLEANUP\` (Dọn dẹp dữ liệu hậu kiểm)
   - \`HEALTH\` (Trạng thái hệ thống)
   - \`GENERAL\` (Tổng hợp / Khác)
4. **Mô tả (Description)**: Mục tiêu và các bước thực hiện.
5. **Yêu cầu kỹ thuật (Technical Info)**:
   - HTTP Method và Path (hoặc UI Action đối với test giao diện).
   - Request Payload mẫu (JSON).
6. **Điều kiện Pass (Pass Condition - Cực kỳ quan trọng)**:
   - Ghi rõ công thức/quy tắc kiểm tra phản hồi để xác định test case PASS (ví dụ: *Status Code phải là 201, Response body phải chứa trường 'accessToken' và không bị rỗng*).
   - Nếu là luồng giả lập hoặc chưa code logic check tự động, tiền tố điều kiện với \`[SIMULATED]\`.

---

### MẪU ĐẦU RA MONG MUỐN:

# DANH SÁCH KỊCH BẢN KIỂM THỬ TRÍCH XUẤT

## Nhóm: AUTH (Xác thực & Tài khoản)

### TC_AUTH_001: Đăng nhập Google thành công lần đầu
- **Catalog**: AUTH
- **Mô tả**: Gửi ID Token của Google để đăng nhập. Hệ thống tạo tài khoản mới nếu chưa tồn tại và trả về JWT Token.
- **HTTP Endpoint**: \`POST /v1/auth/google\`
- **Request Body**:
  \`\`\`json
  {
    "idToken": "google_token_here"
  }
  \`\`\`
- **Điều kiện Pass**: Status code trả về là 200/201. Response body phải chứa thông tin user (\`email\`, \`id\`) và chuỗi \`accessToken\`.

---

Hãy quét codebase hiện tại, tự động gom nhóm các tính năng tương tự và xuất tài liệu Markdown hoàn chỉnh. Không cần giải thích thêm dông dài ngoài lề.`;

    const text = type === 'context' ? PROMPT_CONTEXT : PROMPT_REQUIREMENTS;
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleRunTests = async () => {
    if (!selectedProjectId) {
      alert("Vui lòng chọn một dự án trước khi chạy test.");
      return;
    }
    try {
      const res = await fetch('/api/run-tests', { 
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId: selectedProjectId })
      });
      if (res.ok) {
        alert("Đã bắt đầu chạy test!");
        fetchData();
      } else {
        alert("Có lỗi khi gọi API test.");
      }
    } catch (error) {
      console.error(error);
      alert("Không thể kết nối đến server.");
    }
  };

  return (
    <div className="app-container" style={{ paddingTop: '1.25rem', paddingBottom: '1.25rem', gap: '1rem' }}>
      {/* Sleek Compact Combined Header & Tabs Row */}
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)', 
        paddingBottom: '0.65rem', 
        marginBottom: '0.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        {/* Title */}
        <h1 className="brand-title" style={{ fontSize: '1.25rem', margin: 0, fontWeight: 800 }}>
          QA Agent Dashboard
        </h1>

        {/* Tab Switcher in the center */}
        <nav style={{ 
          display: 'flex', 
          gap: '0.25rem', 
          background: 'rgba(255, 255, 255, 0.02)', 
          padding: '0.2rem', 
          borderRadius: '8px', 
          border: '1px solid rgba(255, 255, 255, 0.05)' 
        }}>
          <button
            onClick={() => setActiveTab('testing')}
            style={{
              background: activeTab === 'testing' ? 'linear-gradient(135deg, #0284c7, #4f46e5)' : 'transparent',
              color: activeTab === 'testing' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '0.35rem 0.85rem',
              fontSize: '0.775rem',
              fontWeight: '700',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            📊 Kiểm thử
          </button>
          <button
            onClick={() => setActiveTab('memory')}
            style={{
              background: activeTab === 'memory' ? 'linear-gradient(135deg, #0284c7, #4f46e5)' : 'transparent',
              color: activeTab === 'memory' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '0.35rem 0.85rem',
              fontSize: '0.775rem',
              fontWeight: '700',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            🧠 Bộ nhớ
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            style={{
              background: activeTab === 'guide' ? 'linear-gradient(135deg, #0284c7, #4f46e5)' : 'transparent',
              color: activeTab === 'guide' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '0.35rem 0.85rem',
              fontSize: '0.775rem',
              fontWeight: '700',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            📋 Hướng dẫn
          </button>
          <button
            onClick={() => setActiveTab('extract')}
            style={{
              background: activeTab === 'extract' ? 'linear-gradient(135deg, #0284c7, #4f46e5)' : 'transparent',
              color: activeTab === 'extract' ? '#fff' : '#94a3b8',
              border: 'none',
              padding: '0.35rem 0.85rem',
              fontSize: '0.775rem',
              fontWeight: '700',
              borderRadius: '6px',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem'
            }}
          >
            💡 Trích xuất Prompt
          </button>
        </nav>

        {/* Refresh and Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button onClick={handleRunTests} className="refresh-btn" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', padding: '0.35rem 0.85rem', fontSize: '0.775rem', borderRadius: '6px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 'bold' }}>
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Chạy Tests Dự Án Này
          </button>
          <button onClick={fetchData} className="refresh-btn" style={{ padding: '0.35rem 0.85rem', fontSize: '0.775rem', borderRadius: '6px' }}>
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M21 20v-5h-.581m0 0a8.003 8.003 0 11-15.357-2" />
            </svg>
            Cập nhật
          </button>
        </div>
      </header>

      {/* Loading state */}
      {loading && projects.length === 0 && (
        <div className="card" style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div className="pulse-dot" style={{ width: '16px', height: '16px' }}></div>
            <p className="stat-label">Đang tải dữ liệu kiểm thử...</p>
          </div>
        </div>
      )}

      {/* Main Tab 1: API Testing */}
      {activeTab === 'testing' && !loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub Header Selector Bar */}
          <div className="card animate-fade-in" style={{ 
            display: 'flex', 
            flexDirection: 'column',
            gap: '0.75rem', 
            padding: '1rem 1.5rem', 
            borderRadius: '10px',
            background: 'rgba(30, 41, 59, 0.25)',
            borderColor: 'rgba(255, 255, 255, 0.05)'
          }}>
            {/* Top row: Selectors */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
              {/* Project Dropdown Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📁 Dự án:
                </span>
                <select 
                  value={selectedProjectId} 
                  onChange={(e) => handleSelectProject(e.target.value)}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '0.45rem 1rem',
                    borderRadius: '6px',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {/* Test Runs Dropdown Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  ⏱️ Phiên chạy:
                </span>
                {data?.runs && data.runs.length > 0 ? (
                  <select 
                    value={selectedRunId || ''} 
                    onChange={(e) => handleSelectRun(e.target.value)}
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      color: '#fff',
                      padding: '0.45rem 1rem',
                      borderRadius: '6px',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    {data.runs.map(run => {
                      const hasFailed = run.summary.failed > 0;
                      const dateStr = new Date(run.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                      const relTime = getRelativeTime(run.timestamp);
                      let statusText = '';
                      if (run.status === 'running') {
                        statusText = '⚡ Đang chạy...';
                      } else if (run.status === 'pending') {
                        statusText = '⏳ Đang chờ';
                      } else {
                        statusText = hasFailed ? `❌ FAIL (${run.summary.failed} lỗi)` : '✅ PASS';
                      }
                      return (
                        <option key={run.id} value={run.id}>
                          {dateStr} ({relTime}) - {statusText}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <span style={{ fontSize: '0.875rem', color: '#64748b' }}>Chưa có phiên chạy</span>
                )}
              </div>
            </div>

            {/* Bottom row: Project description & Dynamic connection status line */}
            {currentProject && (
              <div style={{ 
                fontSize: '0.8rem', 
                color: '#94a3b8', 
                borderTop: '1px solid rgba(255, 255, 255, 0.05)', 
                paddingTop: '0.6rem',
                marginTop: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                lineHeight: '1.4'
              }}>
                <div>
                  <strong>Mô tả dự án:</strong> {currentProject.description}
                </div>
                
                {/* Minimalist connection status line */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', marginTop: '0.1rem' }}>
                  <strong>Cổng API:</strong> 
                  <span 
                    className={`pulse-dot ${data?.isApiOnline ? '' : 'stopped'}`} 
                    style={{ 
                      width: '8px', 
                      height: '8px',
                      backgroundColor: data?.isApiOnline ? 'hsl(var(--color-success))' : 'hsl(var(--color-error))',
                      boxShadow: data?.isApiOnline ? '0 0 8px rgba(16, 185, 129, 0.5)' : 'none'
                    }}
                  ></span>
                  <code style={{ fontFamily: 'monospace', color: data?.isApiOnline ? '#34d399' : '#f43f5e' }}>
                    {data?.targetUrl || 'Không xác định'}
                  </code>
                </div>
              </div>
            )}
          </div>

          {/* 1-Column Layout: Test cases details spanning 100% width */}
          <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <h2 className="section-title" style={{ margin: 0 }}>
                <svg style={{ width: '18px', height: '18px', color: '#818cf8' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Chi tiết kết quả kiểm thử
              </h2>
              
              {/* Integrated Summary inside Column Header */}
              {activeRun ? (
                <div style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '6px',
                  padding: '0.5rem 1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '1.5rem',
                  flexWrap: 'wrap',
                  width: '100%',
                  marginBottom: '0.25rem'
                }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', fontSize: '0.8rem' }}>
                    {/* Run Time */}
                    <div>
                      <span style={{ color: '#64748b', fontWeight: '700', marginRight: '0.35rem' }}>BẮT ĐẦU:</span>
                      <span style={{ color: '#e2e8f0', fontFamily: 'monospace' }}>
                        {new Date(activeRun.timestamp).toLocaleString('vi-VN')} ({getRelativeTime(activeRun.timestamp)})
                      </span>
                    </div>

                    {/* Run Status badge */}
                    <div>
                      <span style={{ color: '#64748b', fontWeight: '700', marginRight: '0.35rem' }}>TRẠNG THÁI:</span>
                      {activeRun.status === 'running' ? (
                        <span style={{ color: '#38bdf8', fontWeight: '700', background: 'rgba(56, 189, 248, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.2)' }} className="pulse">
                          ⚡ Đang chạy...
                        </span>
                      ) : activeRun.status === 'pending' ? (
                        <span style={{ color: '#fbbf24', fontWeight: '700', background: 'rgba(251, 191, 36, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
                          ⏳ Đang chờ
                        </span>
                      ) : (
                        <span style={{ color: '#34d399', fontWeight: '700', background: 'rgba(52, 211, 153, 0.1)', padding: '0.15rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                          ✓ Hoàn thành
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Result counts */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {activeRun.summary.failed > 0 ? (
                      <span style={{ color: '#fda4af', fontWeight: '700', fontSize: '0.75rem', background: 'rgba(244, 63, 94, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(244, 63, 94, 0.2)' }}>
                        ❌ FAILED ({activeRun.summary.failed} lỗi)
                      </span>
                    ) : activeRun.status === 'running' ? (
                      <span style={{ color: '#94a3b8', fontWeight: '700', fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                        Running...
                      </span>
                    ) : (
                      <span style={{ color: '#a7f3d0', fontWeight: '700', fontSize: '0.75rem', background: 'rgba(16, 185, 129, 0.12)', padding: '0.2rem 0.5rem', borderRadius: '4px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                        ✅ ALL PASS
                      </span>
                    )}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '0.6rem' }}>
                      <span>Tổng: <strong>{activeRun.summary.total}</strong></span>
                      <span className="text-success">Đạt: <strong>{activeRun.summary.passed}</strong></span>
                      <span className="text-error">Lỗi: <strong>{activeRun.summary.failed}</strong></span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Auto-Fix Report (Dynamic Showcase) */}
            {activeRun && activeRun.autoFixReport && (
              <div className="animate-fade-in" style={{
                background: 'rgba(56, 189, 248, 0.05)',
                border: '1px solid rgba(56, 189, 248, 0.15)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#38bdf8', fontWeight: '800', fontSize: '0.825rem' }}>
                  <span>🔧 BÁO CÁO TỰ VÁ LỖI (AUTO-HEALING)</span>
                  <span style={{ fontSize: '0.65rem', color: '#fff', background: '#0284c7', padding: '0.15rem 0.45rem', borderRadius: '4px', fontWeight: '700' }}>
                    HEALED SUCCESS
                  </span>
                </div>
                <h4 style={{ margin: '0.1rem 0', fontSize: '0.9rem', color: '#fff', fontWeight: '700' }}>
                  {activeRun.autoFixReport.title}
                </h4>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                  {activeRun.autoFixReport.details}
                </p>
                {activeRun.autoFixReport.modifiedFiles && activeRun.autoFixReport.modifiedFiles.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.725rem', color: '#64748b', fontWeight: 'bold' }}>FILE ĐÃ SỬA:</span>
                    {activeRun.autoFixReport.modifiedFiles.map((f, i) => (
                      <span key={i} style={{ fontSize: '0.7rem', fontFamily: 'monospace', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.12)', padding: '0.15rem 0.4rem', borderRadius: '4px', border: '1px solid rgba(56, 189, 248, 0.15)' }}>
                        {f}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Performance Insights (Dynamic Showcase) */}
            {activeRun && activeRun.performance && (
              <div className="animate-fade-in" style={{
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                padding: '1rem',
                marginBottom: '0.25rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1rem'
              }}>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Độ trễ trung bình (Avg Latency)
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#34d399', fontFamily: 'monospace' }}>
                    {activeRun.performance.avgResponseTimeMs} ms
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    Độ trễ 95% (p95 Latency)
                  </span>
                  <span style={{ fontSize: '1.2rem', fontWeight: '800', color: '#fbbf24', fontFamily: 'monospace' }}>
                    {activeRun.performance.p95ResponseTimeMs} ms
                  </span>
                </div>
                <div>
                  <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 'bold', display: 'block', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                    API chậm nhất (Slowest API)
                  </span>
                  <span style={{ fontSize: '0.775rem', fontWeight: '700', color: '#f43f5e', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                    {activeRun.performance.slowestEndpoint} ({activeRun.performance.maxResponseTimeMs}ms)
                  </span>
                </div>
              </div>
            )}

            <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginBottom: '0.5rem' }}>
              💡 Click trực tiếp vào một ca test bất kỳ dưới đây để mở rộng xem dữ liệu Headers, Request, Response và log lỗi chi tiết.
            </p>

            {/* Filter Buttons */}
            {activeRun && activeRun.testCases && activeRun.testCases.length > 0 && (
              <div style={{ 
                display: 'flex', 
                gap: '0.5rem', 
                alignItems: 'center', 
                background: 'rgba(255, 255, 255, 0.02)', 
                padding: '0.4rem 0.75rem', 
                borderRadius: '8px', 
                border: '1px solid rgba(255, 255, 255, 0.05)',
                marginBottom: '0.25rem',
                flexWrap: 'wrap'
              }}>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '700', marginRight: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🔍 Lọc kết quả:
                </span>
                <button 
                  onClick={() => handleFilterChange('ALL')}
                  style={{
                    background: statusFilter === 'ALL' ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                    color: statusFilter === 'ALL' ? '#38bdf8' : '#94a3b8',
                    border: `1px solid ${statusFilter === 'ALL' ? 'rgba(56, 189, 248, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Tất cả ({activeRun.testCases.length})
                </button>
                <button 
                  onClick={() => handleFilterChange('PASS')}
                  style={{
                    background: statusFilter === 'PASS' ? 'rgba(16, 185, 129, 0.12)' : 'transparent',
                    color: statusFilter === 'PASS' ? '#34d399' : '#94a3b8',
                    border: `1px solid ${statusFilter === 'PASS' ? 'rgba(16, 185, 129, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Thành công ({activeRun.testCases.filter(tc => tc.status === 'PASS').length})
                </button>
                <button 
                  onClick={() => handleFilterChange('FAIL')}
                  style={{
                    background: statusFilter === 'FAIL' ? 'rgba(244, 63, 94, 0.12)' : 'transparent',
                    color: statusFilter === 'FAIL' ? '#f43f5e' : '#94a3b8',
                    border: `1px solid ${statusFilter === 'FAIL' ? 'rgba(244, 63, 94, 0.25)' : 'rgba(255, 255, 255, 0.05)'}`,
                    padding: '0.25rem 0.65rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    transition: 'all 0.15s'
                  }}
                >
                  Thất bại ({activeRun.testCases.filter(tc => tc.status === 'FAIL').length})
                </button>
                
                <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }}></div>
                
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.75rem', color: '#cbd5e1', cursor: 'pointer', userSelect: 'none' }}>
                  <input 
                    type="checkbox" 
                    checked={autoExpand}
                    onChange={(e) => setAutoExpand(e.target.checked)}
                    style={{ cursor: 'pointer' }}
                  />
                  Tự động mở rộng chi tiết
                </label>
              </div>
            )}

            <div className="test-cases-container">
              {activeRun && activeRun.testCases && activeRun.testCases.length > 0 ? (
                (() => {
                  const filtered = activeRun.testCases.filter(tc => {
                    if (statusFilter === 'ALL') return true;
                    return tc.status === statusFilter;
                  });
                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
                        Không có ca kiểm thử nào có trạng thái "{statusFilter === 'PASS' ? 'Thành công' : 'Thất bại'}".
                      </div>
                    );
                  }
                  const grouped: Record<string, TestCase[]> = {};
                  filtered.forEach(tc => {
                    const cat = tc.catalog || 'GENERAL';
                    if (!grouped[cat]) grouped[cat] = [];
                    grouped[cat].push(tc);
                  });
                  
                  const catalogOrder = Object.keys(CATALOG_META);
                  const sortedCatalogs = Object.keys(grouped).sort((a, b) => {
                    let idxA = catalogOrder.indexOf(a);
                    let idxB = catalogOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                  });
                  
                  return sortedCatalogs.map(catalogKey => {
                    const testsInCatalog = grouped[catalogKey];
                    const meta = CATALOG_META[catalogKey] || CATALOG_META['GENERAL'];
                    const passCount = testsInCatalog.filter(t => t.status === 'PASS').length;
                    const totalCount = testsInCatalog.length;
                    
                    return (
                      <div key={catalogKey} style={{ marginBottom: '1.5rem' }}>
                        <div 
                          onClick={() => handleToggleCatalog(catalogKey)}
                          style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.5rem 1rem', background: 'rgba(30, 41, 59, 0.5)',
                          borderRadius: '8px', marginBottom: '0.75rem',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          cursor: 'pointer'
                        }}>
                          <span style={{ fontSize: '1.25rem' }}>{meta.icon}</span>
                          <span style={{ fontWeight: 600, color: '#f8fafc', fontSize: '0.95rem' }}>{meta.label}</span>
                          <span style={{ 
                            marginLeft: 'auto', 
                            fontSize: '0.75rem', 
                            background: passCount === totalCount ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                            color: passCount === totalCount ? '#34d399' : '#f43f5e',
                            padding: '0.15rem 0.5rem', borderRadius: '12px', fontWeight: 700 
                          }}>
                            {passCount}/{totalCount} Pass
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#64748b', transition: 'transform 0.2s', transform: collapsedCatalogs[catalogKey] ? 'rotate(-90deg)' : 'rotate(0deg)' }}>
                            ▼
                          </span>
                        </div>
                        
                        {!collapsedCatalogs[catalogKey] && (
                        <div style={{ paddingLeft: '0.5rem', borderLeft: '2px solid rgba(255,255,255,0.05)', marginLeft: '1rem' }}>
                          {testsInCatalog.map((tc, tcIdx) => {
                            const isExpanded = autoExpand || expandedTests.has(tc.name);
                            const hasFailed = tc.status === 'FAIL';
                            
                            const idMatch = tc.name.match(/^(TC_[A-Z0-9_]+)/);
                            const tcId = idMatch ? idMatch[1] : tc.name;
                            const isSelectedForCopy = waitingList.has(tcId);
                            
                            return (
                              <div key={tc.name + tcIdx} className="test-case-item">
                                <div 
                                  className="test-case-header" 
                                  onClick={() => handleToggleTest(tc.name)}
                          style={{
                            borderLeft: hasFailed ? '4px solid hsl(var(--color-error))' : '4px solid hsl(var(--color-success))',
                            background: isExpanded ? 'rgba(255, 255, 255, 0.05)' : 'rgba(30, 41, 59, 0.15)'
                          }}
                        >
                          <div className="test-case-title-area" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', flex: 1 }}>
                            <span className={`test-case-method method-${tc.request.method.toLowerCase()}`}>
                              {tc.request.method}
                            </span>
                            <span className="test-case-name" style={{ fontSize: '0.875rem' }}>{tc.name}</span>
                            
                            {/* Nút Chọn ID */}
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setWaitingList(prev => {
                                  const newSet = new Set(prev);
                                  if (newSet.has(tcId)) newSet.delete(tcId);
                                  else newSet.add(tcId);
                                  return newSet;
                                });
                              }}
                              style={{
                                marginLeft: '0.5rem',
                                padding: '0.15rem 0.5rem',
                                fontSize: '0.7rem',
                                borderRadius: '4px',
                                background: isSelectedForCopy ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                color: isSelectedForCopy ? '#34d399' : '#94a3b8',
                                border: `1px solid ${isSelectedForCopy ? 'rgba(16, 185, 129, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.2rem',
                                fontWeight: isSelectedForCopy ? 'bold' : 'normal'
                              }}
                            >
                              {isSelectedForCopy ? '✓ Đã chọn ID' : '+ Chọn ID'}
                            </button>
                          </div>
                          <div className="test-case-meta">
                            <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', opacity: 0.7 }}>{tc.request.url}</span>
                            <span className={`badge ${hasFailed ? 'badge-error' : 'badge-success'}`}>
                              {tc.status}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                              ▼
                            </span>
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className="test-case-details" style={{ display: 'block' }}>
                            {tc.errorMsg && (
                              <div className="error-banner" style={{ marginBottom: '1rem' }}>
                                {tc.errorMsg}
                              </div>
                            )}

                            {/* ĐIỀU KIỆN PASS BLOCK - LUÔN HIỂN THỊ ĐỂ CẢNH BÁO NẾU THIẾU */}
                            <div style={{
                              marginBottom: '1rem',
                              padding: '0.8rem 1rem',
                              borderRadius: '8px',
                              background: tc.passCondition 
                                ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234, 179, 8, 0.12)' : 'rgba(99, 102, 241, 0.12)')
                                : 'rgba(244, 63, 94, 0.08)', // Red background for missing condition
                              border: `1px solid ${tc.passCondition 
                                ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234,179,8,0.5)' : 'rgba(99,102,241,0.5)')
                                : 'rgba(244, 63, 94, 0.3)'}`,
                              boxShadow: tc.passCondition 
                                ? (tc.passCondition.startsWith('[SIMULATED]') ? '0 0 12px rgba(234, 179, 8, 0.15)' : '0 0 12px rgba(99, 102, 241, 0.15)')
                                : 'none',
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: '0.75rem',
                              fontSize: '0.9rem',
                            }}>
                              <span 
                                title={!tc.passCondition 
                                  ? 'Kịch bản test chưa được định nghĩa công thức kiểm tra tính đúng đắn. Cần code lại test script!'
                                  : (tc.passCondition.startsWith('[SIMULATED]') 
                                      ? 'Điều kiện này do hệ thống trích xuất tự động. Cần QA/Dev review lại để đảm bảo chính xác.' 
                                      : 'Điều kiện này đã được QA/Dev viết tay và review cẩn thận, có độ tin cậy tuyệt đối.')}
                                style={{
                                flexShrink: 0,
                                fontWeight: 800,
                                cursor: 'help',
                                color: tc.passCondition 
                                  ? (tc.passCondition.startsWith('[SIMULATED]') ? '#facc15' : '#a5b4fc')
                                  : '#f87171',
                                fontSize: '0.75rem',
                                padding: '0.2rem 0.6rem',
                                borderRadius: '6px',
                                background: tc.passCondition 
                                  ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234,179,8,0.2)' : 'rgba(99,102,241,0.2)')
                                  : 'rgba(244, 63, 94, 0.15)',
                                marginTop: '0.05rem',
                                border: `1px solid ${tc.passCondition 
                                  ? (tc.passCondition.startsWith('[SIMULATED]') ? 'rgba(234,179,8,0.4)' : 'rgba(99,102,241,0.4)')
                                  : 'rgba(244, 63, 94, 0.3)'}`
                              }}>
                                {!tc.passCondition 
                                  ? '❌ THIẾU ĐIỀU KIỆN PASS' 
                                  : (tc.passCondition.startsWith('[SIMULATED]') ? '⚠ SIMULATED' : '🎯 ĐIỀU KIỆN PASS (KIỂM TRA KỸ)')}
                              </span>
                              <span style={{ color: tc.passCondition ? '#e2e8f0' : '#fca5a5', lineHeight: 1.6, fontWeight: 500 }}>
                                {!tc.passCondition 
                                  ? 'Test case này trong file kết quả trả về không chứa mô tả Điều kiện Pass. Vui lòng cập nhật script để bổ sung!'
                                  : (tc.passCondition.startsWith('[SIMULATED]')
                                    ? tc.passCondition.replace('[SIMULATED]', '').trim()
                                    : tc.passCondition)}
                              </span>
                            </div>

                            {/* Image Screenshot (UI Test Specific) */}
                            {tc.screenshot && (
                              <div className="detail-section" style={{ marginBottom: '1rem' }}>
                                <span className="detail-label">📸 Ảnh chụp màn hình (UI Screenshot)</span>
                                <div style={{ 
                                  marginTop: '0.5rem', 
                                  position: 'relative', 
                                  borderRadius: '8px', 
                                  overflow: 'hidden', 
                                  border: '1px solid rgba(255, 255, 255, 0.08)',
                                  background: '#090d16'
                                }}>
                                  <img 
                                    src={tc.screenshot} 
                                    alt={tc.name} 
                                    style={{ maxWidth: '100%', display: 'block', height: 'auto', cursor: 'zoom-in', margin: '0 auto' }} 
                                    onClick={() => window.open(tc.screenshot, '_blank')}
                                  />
                                </div>
                              </div>
                            )}

                            <div className="detail-section" style={{ marginBottom: '1rem' }}>
                              <span className="detail-label">
                                {tc.request.method === 'CHECK_UI' || tc.request.method === 'CLICK_ACTION' || tc.request.method === 'NAVIGATE_TABS'
                                  ? 'UI Action / Target'
                                  : 'HTTP Endpoint'}
                              </span>
                              <div className="code-block" style={{ color: '#38bdf8' }}>
                                {tc.request.method} {tc.request.url.startsWith('http') ? tc.request.url : (tc.request.method === 'CHECK_UI' || tc.request.method === 'CLICK_ACTION' || tc.request.method === 'NAVIGATE_TABS' ? tc.request.url : `http://localhost:4000${tc.request.url}`)} (Status: {tc.statusCode})
                              </div>
                            </div>
                            
                            {tc.request.body && (
                              <div className="detail-section" style={{ marginBottom: '1rem' }}>
                                <span className="detail-label">Dữ liệu gửi đi (Request Payload)</span>
                                <pre className="code-block">
                                  {JSON.stringify(tc.request.body, null, 2)}
                                </pre>
                              </div>
                            )}

                            {tc.response && tc.response.body && (
                              <div className="detail-section" style={{ marginBottom: tc.logs && tc.logs.length > 0 ? '1rem' : '0' }}>
                                <span className="detail-label">Kết quả trả về (Response Body)</span>
                                <pre className="code-block" style={{ borderColor: hasFailed ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)' }}>
                                  {JSON.stringify(tc.response.body, null, 2)}
                                </pre>
                              </div>
                            )}

                            {tc.logs && tc.logs.length > 0 && (
                              <div className="detail-section">
                                <span className="detail-label">⚠️ Nhật ký lỗi Console / Network (Logs)</span>
                                <pre className="code-block" style={{ 
                                  maxHeight: '180px', 
                                  overflowY: 'auto', 
                                  background: 'rgba(244, 63, 94, 0.05)', 
                                  color: '#fca5a5', 
                                  borderColor: 'rgba(244, 63, 94, 0.15)',
                                  fontFamily: 'monospace',
                                  fontSize: '0.75rem',
                                  whiteSpace: 'pre-wrap'
                                }}>
                                  {tc.logs.join('\n')}
                                </pre>
                              </div>
                            )}
                          </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                        )}
                      </div>
                    );
                  });
                })()
              ) : activeRun && activeRun.status === 'running' ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
                  <div className="pulse-dot" style={{ width: '12px', height: '12px', margin: '0 auto 1rem', display: 'block' }}></div>
                  Đang khởi chạy kịch bản kiểm thử...
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', fontSize: '0.9rem' }}>
                  Chưa có dữ liệu phiên chạy test cho dự án này. Hãy khởi chạy runner.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 2: Shared Memory */}
      {activeTab === 'memory' && (
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="memory-header">
            <h2 className="memory-title-main">Trí tuệ QA Agent & Nhật ký lỗi học được</h2>
            <p className="brand-subtitle" style={{ fontSize: '0.95rem' }}>
              Cơ sở tri thức giúp QA Agent tự tích lũy kinh nghiệm kiểm thử qua nhiều dự án và tự cải tiến kịch bản test thông minh hơn.
            </p>
          </div>

          <div className="memory-grid">
            {/* Column 1: Rules & Guidelines */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 className="section-title" style={{ color: '#f59e0b', fontSize: '1.15rem' }}>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Quy tắc làm việc nghiêm ngặt (Strict QA Persona)
              </h3>
              
              {rules.length > 0 ? (
                rules.map((rule, idx) => (
                  <div key={idx} className="rule-alert-card">
                    <div className="rule-card-title">
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem' }}>
                        Rule {idx + 1}
                      </span>
                      {rule.title}
                    </div>
                    <div className="rule-card-text">
                      {rule.content.map((c, i) => (
                        <p key={i} style={{ marginTop: i > 0 ? '0.25rem' : '0' }}>{c}</p>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="pattern-empty-state">Chưa nạp quy tắc làm việc.</p>
              )}
            </div>

            {/* Column 2: Bug Patterns & Checklist */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {/* Category Grid for Bug Patterns */}
              <div>
                <h3 className="section-title" style={{ color: '#10b981', fontSize: '1.15rem', marginBottom: '1.25rem' }}>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Nhật ký Kinh nghiệm & Bug Patterns học được
                </h3>
                
                <div className="patterns-grid">
                  {patterns.length > 0 ? (
                    patterns.map((pat, idx) => (
                      <div key={idx} className="pattern-card">
                        <div className="pattern-card-title">
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                          {pat.title}
                        </div>
                        {pat.content.length > 0 && pat.content[0] !== 'Chưa ghi nhận kinh nghiệm.' ? (
                          <ul className="pattern-card-list">
                            {pat.content.map((item, i) => (
                              <li key={i}>{item}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="pattern-empty-state">Chưa phát hiện lỗi phổ biến nào trong nhóm này.</p>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="pattern-empty-state">Chưa nạp nhật ký bug patterns.</p>
                  )}
                </div>
              </div>

              {/* General Checklist */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                <h3 className="section-title" style={{ color: '#3b82f6', fontSize: '1.15rem' }}>
                  <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Checklist Kiểm thử Tổng hợp (Dùng chung)
                </h3>
                
                <div className="checklist-grid">
                  {checklist.length > 0 ? (
                    checklist.map((item, idx) => (
                      <div key={idx} className={`checklist-item ${item.checked ? 'checked' : ''}`}>
                        <span className={`checkbox-custom ${item.checked ? 'checked' : ''}`}>
                          {item.checked && (
                            <svg style={{ width: '10px', height: '10px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </span>
                        <span>{item.text}</span>
                      </div>
                    ))
                  ) : (
                    <p className="pattern-empty-state">Chưa nạp checklist.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Tab 3: Agent Guide */}
      {activeTab === 'guide' && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', padding: '2rem' }}>
          <div className="memory-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
            <h2 className="memory-title-main" style={{ fontSize: '1.5rem', color: '#38bdf8' }}>
              📋 Hướng Dẫn Vận Hành & Cách Giao Việc Cho Agent
            </h2>
            <p className="brand-subtitle" style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Tìm hiểu năng lực của QA Agent, cách tương tác và quy trình tự động hóa kiểm thử API của bạn.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            {/* Box 1: Capabilities */}
            <div className="rule-alert-card" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(56, 189, 248, 0.15)', height: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#38bdf8', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                🚀 Tôi có thể làm gì?
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.25rem', margin: 0 }}>
                <li><strong>Quét lỗi tự động</strong>: Tự động tạo kịch bản gọi API, giả lập tham số biên, dữ liệu không hợp lệ để phát hiện lỗ hổng/crash.</li>
                <li><strong>Tự động sửa code (Auto-Debugging)</strong>: Đọc hiểu source code backend của bạn, định vị dòng code lỗi và trực tiếp vá lỗi.</li>
                <li><strong>Ghi nhớ & Tránh lặp lại lỗi</strong>: Tự đúc kết bài học kinh nghiệm về các bug thường gặp và lưu vào bộ nhớ chung (Shared Memory).</li>
                <li><strong>Giám sát thời gian thực</strong>: Theo dõi trạng thái kết nối cổng API và hiển thị kết quả kiểm thử tức thì lên Dashboard.</li>
              </ul>
            </div>

            {/* Box 2: How to assign tasks */}
            <div className="rule-alert-card" style={{ background: 'rgba(30, 41, 59, 0.2)', border: '1px solid rgba(245, 158, 11, 0.15)', height: '100%' }}>
              <h3 style={{ fontSize: '1.1rem', color: '#f59e0b', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                📥 Cách giao việc cho tôi?
              </h3>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', color: '#cbd5e1', paddingLeft: '1.25rem', margin: 0 }}>
                <li><strong>Chat trực tiếp</strong>: Gõ yêu cầu của bạn vào khung chat (ví dụ: <em>"Hãy viết kịch bản test tính năng login"</em> hoặc <em>"Sửa giúp tôi lỗi 500 ở API đăng ký"</em>).</li>
                <li><strong>Chế độ tự trị với lệnh <code>/goal</code></strong>: Sử dụng khi giao task lớn. Tôi sẽ tự chạy ngầm, tự quyết định giải pháp, tự viết code và test đi test lại cho tới khi hoàn thành mục tiêu.</li>
                <li><strong>Lên lịch tự động với lệnh <code>/schedule</code></strong>: Dùng để thiết lập lịch chạy test định kỳ (ví dụ: quét API mỗi giờ một lần) để làm hệ thống giám sát.</li>
              </ul>
            </div>
          </div>

          {/* Full-width workflow section */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: '#10b981', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              ⚙️ Quy trình tôi thực hiện công việc (Workflow)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.35rem' }}>BƯỚC 1</div>
                <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: '#fff' }}>1. Khảo sát (Research)</h4>
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>Tôi đọc mã nguồn, khảo sát cấu trúc thư mục, API endpoints và trạng thái cổng kết nối để hiểu bài toán.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.35rem' }}>BƯỚC 2</div>
                <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: '#fff' }}>2. Lập kế hoạch (Planning)</h4>
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>Với các task lớn, tôi tạo bản đề xuất kỹ thuật <code>implementation_plan.md</code> gửi bạn duyệt trước khi chạy.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.35rem' }}>BƯỚC 3</div>
                <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: '#fff' }}>3. Thực thi (Execution)</h4>
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>Tôi trực tiếp lập trình kịch bản test, chạy thử nghiệm, tự đọc log lỗi và tự sửa code backend nếu phát hiện lỗi crash.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#10b981', marginBottom: '0.35rem' }}>BƯỚC 4</div>
                <h4 style={{ fontSize: '0.9rem', margin: '0 0 0.5rem 0', color: '#fff' }}>4. Báo cáo & Lưu giữ</h4>
                <p style={{ fontSize: '0.775rem', color: '#94a3b8', margin: 0, lineHeight: '1.4' }}>Đẩy kết quả lên Dashboard thời gian thực, lưu trữ lỗi học được vào Shared Memory và báo cáo hoàn thành task.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {activeTab === 'extract' && (
        <div className="card animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
          <div className="memory-header" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '1rem' }}>
            <h2 className="memory-title-main" style={{ fontSize: '1.5rem', color: '#38bdf8' }}>
              💡 Trích Xuất Ngữ Cảnh & Yêu Cầu Kiểm Thử
            </h2>
            <p className="brand-subtitle" style={{ fontSize: '0.95rem', marginTop: '0.5rem' }}>
              Sao chép các prompt chuẩn này và chạy ở các dự án phát triển khác của bạn để tự động tạo tài liệu đặc tả hoặc danh sách kịch bản test.
            </p>
          </div>

          {/* Sub Tab Switcher */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setExtractSubTab('context')}
              style={{
                background: extractSubTab === 'context' ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                color: extractSubTab === 'context' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderBottom: extractSubTab === 'context' ? '2px solid #38bdf8' : 'none',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              1. Trích xuất đặc tả API/UI (QA Context)
            </button>
            <button
              onClick={() => setExtractSubTab('requirements')}
              style={{
                background: extractSubTab === 'requirements' ? 'rgba(56, 189, 248, 0.08)' : 'transparent',
                color: extractSubTab === 'requirements' ? '#38bdf8' : '#94a3b8',
                border: 'none',
                borderBottom: extractSubTab === 'requirements' ? '2px solid #38bdf8' : 'none',
                padding: '0.5rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              2. Trích xuất kịch bản & Pass Condition
            </button>

            <button 
              onClick={() => copyPromptToClipboard(extractSubTab)} 
              style={{
                marginLeft: 'auto',
                background: copiedType === extractSubTab ? 'linear-gradient(135deg, #10b981, #059669)' : 'linear-gradient(135deg, #0284c7, #4f46e5)',
                color: '#fff',
                border: 'none',
                padding: '0.45rem 1.25rem',
                fontSize: '0.8rem',
                fontWeight: '700',
                borderRadius: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)',
                alignSelf: 'center'
              }}
            >
              {copiedType === extractSubTab ? '✓ Đã sao chép!' : '📋 Sao chép Prompt hiện tại'}
            </button>
          </div>

          <div style={{ background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)', padding: '1.5rem', maxHeight: '500px', overflowY: 'auto' }}>
            <pre style={{ margin: 0, fontSize: '0.825rem', fontFamily: 'monospace', color: '#e2e8f0', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
              {extractSubTab === 'context' ? (
`Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất tài liệu đặc tả hệ thống (System Specification) chi tiết phục vụ cho việc viết Black-box Test. Tùy thuộc vào loại dự án (Backend API, Frontend Web/Mobile, hoặc Full-stack), hãy trả về tài liệu dưới dạng Markdown chuẩn (api_docs.md hoặc frontend_spec.md) để tôi có thể copy-paste trực tiếp sang dự án QA.

Đối với mỗi phần, bạn cần cung cấp đầy đủ các thông tin sau:

---

### PHẦN 1: NẾU DỰ ÁN LÀ BACKEND / API SERVICES
1. **Thông tin chung**:
   - Endpoint URL (Local/Staging base URL và path).
   - HTTP Method (GET, POST, PUT, DELETE, PATCH).
   - Headers yêu cầu (ví dụ: Authorization: Bearer <token>, Content-Type: application/json).

2. **Dữ liệu đầu vào (Request)**:
   - Chi tiết Query Parameters hoặc Request Body dưới dạng JSON mẫu.
   - Kiểu dữ liệu, trạng thái Bắt buộc (Required/Optional), và các ràng buộc validation (min/max, format, unique...).

3. **Dữ liệu đầu ra (Response) & HTTP Status Code**:
   - Happy Path: HTTP Status Code (200, 201...) và JSON response mẫu.
   - Error Cases: HTTP Status Code tương ứng (400, 401, 403, 404, 409, 422...) kèm cấu trúc JSON báo lỗi cụ thể.

4. **Tài khoản và Phân quyền (Auth & Roles)**:
   - Cách thức lấy Token đăng nhập (qua API /login, Firebase Auth, Session/Cookie...).
   - Tài khoản test mẫu (username/password/role) cho từng nhóm quyền để QA test phân quyền chéo.

5. **Quản lý dữ liệu test & Tác động Database (Test Data Strategy)**:
   - Các bảng (Tables) / Collections bị tác động trong DB.
   - Cơ chế dọn dẹp hoặc reset DB về trạng thái ban đầu phục vụ chạy test lặp lại.

6. **Tích hợp bên thứ ba & Các kết nối đặc biệt (Third-party & Special flows)**:
   - Các dịch vụ ngoài (Stripe, Twilio, SendGrid...) cần mock.
   - Cơ chế Rate Limit, Captcha cần bypass khi test tự động.
   - Luồng Real-time (WebSockets, SSE) hoặc Webhook callback.

---

### PHẦN 2: NẾU DỰ ÁN LÀ FRONTEND (WEB APP / MOBILE APP / CHROME EXTENSION)
1. **Màn hình & Luồng Điều hướng (Screens & Navigation Flows)**:
   - Danh sách các URL routes / Màn hình chính cần test (ví dụ: /login, /dashboard, /settings).
   - Sơ đồ chuyển đổi màn hình chính (ví dụ: Đăng nhập -> Chuyển hướng Dashboard -> Mở modal Profile).

2. **Các Form & Các thành phần tương tác (Interactive Elements)**:
   - Danh sách các Form (Đăng nhập, Thanh toán, Tìm kiếm...) và các trường Input.
   - Các phần tử tương tác quan trọng (Nút bấm, Dropdown, Modal, Popup, Toast notification...).
   - Quy tắc Validation tại Client (ví dụ: nút Submit bị khóa/mờ khi thiếu dữ liệu, hiển thị cảnh báo lỗi tức thì khi email sai format).

3. **Quản lý Trạng thái & Lưu trữ (Client State & Storage)**:
   - Ứng dụng lưu trữ session/token ở đâu (LocalStorage, SessionStorage, Cookies, hay IndexedDB)?
   - Các biến trạng thái (State) toàn cục quan trọng cần kiểm thử (ví dụ: Redux, Zustand, React Context).

4. **Kết nối API & Mocking**:
   - Base URL của API backend mà Frontend đang gọi tới.
   - Có cần giả lập (mock) API hoặc dữ liệu mạng nào khi chạy test UI độc lập không?

---

Hãy tự nhận diện loại hình dự án hiện tại và xuất trực tiếp nội dung file Markdown hoàn chỉnh, không cần giải thích hay dông dài ngoài lề.`
              ) : (
`Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất danh sách các kịch bản kiểm thử (Test Cases) chi tiết dưới dạng Markdown phục vụ cho việc kiểm thử tự động (hoặc hiển thị trên QA Dashboard). 

Đầu ra cần được phân loại rõ ràng theo các nhóm nghiệp vụ (Catalog) và định nghĩa chi tiết Điều kiện đạt (Pass Condition) cho mỗi ca test.

### Yêu cầu cấu trúc đầu ra cho mỗi Test Case:
1. **ID Test Case**: Định dạng TC_[MÃ_DANH_MỤC]_[SỐ_THỨ_TỰ] (ví dụ: TC_AUTH_001, TC_ENERGY_003).
2. **Tên Test Case**: Mô tả ngắn gọn (ví dụ: Happy Path: Đăng ký tài khoản thành công).
3. **Danh mục (Catalog)**: Chọn 1 trong các nhóm chuẩn sau:
   - AUTH (Xác thực & Tài khoản)
   - API_KEY (Quản lý API Key)
   - ENERGY (Năng lượng & Đơn hàng)
   - TRANSACTION (Thanh toán & Giao dịch)
   - SECURITY (Bảo mật hệ thống)
   - RATE_LIMIT (Giới hạn tần suất)
   - CONCURRENCY (Xử lý đồng thời / Race Condition)
   - CLEANUP (Dọn dẹp dữ liệu hậu kiểm)
   - HEALTH (Trạng thái hệ thống)
   - GENERAL (Tổng hợp / Khác)
4. **Mô tả (Description)**: Mục tiêu và các bước thực hiện.
5. **Yêu cầu kỹ thuật (Technical Info)**:
   - HTTP Method và Path (hoặc UI Action đối với test giao diện).
   - Request Payload mẫu (JSON).
6. **Điều kiện Pass (Pass Condition - Cực kỳ quan trọng)**:
   - Ghi rõ công thức/quy tắc kiểm tra phản hồi để xác định test case PASS (ví dụ: Status Code phải là 201, Response body phải chứa trường 'accessToken' và không bị rỗng).
   - Nếu là luồng giả lập hoặc chưa code logic check tự động, tiền tố điều kiện với [SIMULATED].

---

### MẪU ĐẦU RA MONG MUỐN:

# DANH SÁCH KỊCH BẢN KIỂM THỬ TRÍCH XUẤT

## Nhóm: AUTH (Xác thực & Tài khoản)

### TC_AUTH_001: Đăng nhập Google thành công lần đầu
- **Catalog**: AUTH
- **Mô tả**: Gửi ID Token của Google để đăng nhập. Hệ thống tạo tài khoản mới nếu chưa tồn tại và trả về JWT Token.
- **HTTP Endpoint**: POST /v1/auth/google
- **Request Body**:
  \`\`\`json
  {
    "idToken": "google_token_here"
  }
  \`\`\`
- **Điều kiện Pass**: Status code trả về là 200/201. Response body phải chứa thông tin user (email, id) và chuỗi accessToken.

---

Hãy quét codebase hiện tại, tự động gom nhóm các tính năng tương tự và xuất tài liệu Markdown hoàn chỉnh. Không cần giải thích thêm dông dài ngoài lề.`
              )}
            </pre>
          </div>
        </div>
      )}

      {/* Floating Action Button cho Danh sách chờ */}
      {waitingList.size > 0 && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.75rem',
          animation: 'fadeInUp 0.3s ease-out'
        }}>
          {/* Nút Copy */}
          <button
            onClick={() => {
              navigator.clipboard.writeText(Array.from(waitingList).join('\n'));
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            }}
            style={{
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              border: 'none',
              padding: '0.85rem 1.5rem',
              borderRadius: '50px',
              fontSize: '0.95rem',
              fontWeight: '800',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.4), 0 0 0 1px rgba(255,255,255,0.1) inset',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
            onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{
              background: 'rgba(255,255,255,0.2)',
              borderRadius: '50%',
              width: '24px',
              height: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              marginRight: '0.25rem'
            }}>
              {waitingList.size}
            </div>
            {copied ? 'Đã Copy!' : 'Copy ID đã chọn'}
          </button>
          
          {/* Nút Clear List (nhỏ hơn, nằm dưới) */}
          <button
            onClick={() => setWaitingList(new Set())}
            style={{
              background: 'rgba(15, 23, 42, 0.8)',
              color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              padding: '0.4rem 1rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              backdropFilter: 'blur(4px)',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#f43f5e'}
            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Xóa danh sách
          </button>
        </div>
      )}
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
