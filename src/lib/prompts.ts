export const PROMPT_CONTEXT = `Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất tài liệu đặc tả hệ thống (System Specification) chi tiết phục vụ cho việc viết Black-box Test. Tùy thuộc vào loại dự án (Backend API, Frontend Web/Mobile, hoặc Full-stack), hãy trả về tài liệu dưới dạng Markdown chuẩn (api_docs.md hoặc frontend_spec.md) để tôi có thể copy-paste trực tiếp sang dự án QA.

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

export const PROMPT_REQUIREMENTS = `Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất danh sách các kịch bản kiểm thử (Test Cases) chi tiết dưới dạng Markdown phục vụ cho việc kiểm thử tự động (hoặc hiển thị trên QA Dashboard). 

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
