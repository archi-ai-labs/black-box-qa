---
name: extract-qa-context
description: Cung cấp prompt tối ưu để trích xuất đặc tả API (Request/Response JSON, Auth Roles, DB/Mock Strategy) từ các dự án khác phục vụ cho việc kiểm thử hộp đen.
---

# Extract QA Context Skill

Kỹ năng này cung cấp câu lệnh prompt tối ưu giúp người dùng trích xuất dữ liệu API từ các dự án phát triển khác và chuyển đổi chúng thành dạng đặc tả chuẩn (`api_docs.md`) trước khi chuyển cho QA Agent.

## 📋 Câu lệnh Prompt Trích xuất (Copy phần bên dưới)

```markdown
Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất tài liệu đặc tả hệ thống (System Specification) chi tiết phục vụ cho việc viết Black-box Test. Tùy thuộc vào loại dự án (Backend API, Frontend Web/Mobile, hoặc Full-stack), hãy trả về tài liệu dưới dạng Markdown chuẩn (api_docs.md hoặc frontend_spec.md) để tôi có thể copy-paste trực tiếp sang dự án QA.

Đối với mỗi phần, bạn cần cung cấp đầy đủ các thông tin sau:

---

### PHẦN 1: NẾU DỰ ÁN LÀ BACKEND / API SERVICES
1. **Thông tin chung**:
   - Endpoint URL (Local/Staging base URL và path).
   - HTTP Method (GET, POST, PUT, DELETE, PATCH).
   - Headers yêu cầu (ví dụ: `Authorization: Bearer <token>`, `Content-Type: application/json`).

2. **Dữ liệu đầu vào (Request)**:
   - Chi tiết Query Parameters hoặc Request Body dưới dạng JSON mẫu.
   - Kiểu dữ liệu, trạng thái Bắt buộc (Required/Optional), và các ràng buộc validation (min/max, format, unique...).

3. **Dữ liệu đầu ra (Response) & HTTP Status Code**:
   - **Happy Path**: HTTP Status Code (200, 201...) và JSON response mẫu.
   - **Error Cases**: HTTP Status Code tương ứng (400, 401, 403, 404, 409, 422...) kèm cấu trúc JSON báo lỗi cụ thể.

4. **Tài khoản và Phân quyền (Auth & Roles)**:
   - Cách thức lấy Token đăng nhập (qua API `/login`, Firebase Auth, Session/Cookie...).
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
   - Danh sách các URL routes / Màn hình chính cần test (ví dụ: `/login`, `/dashboard`, `/settings`).
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

Hãy tự nhận diện loại hình dự án hiện tại và xuất trực tiếp nội dung file Markdown hoàn chỉnh, không cần giải thích hay dông dài ngoài lề.
```
