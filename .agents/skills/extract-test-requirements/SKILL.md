---
name: extract-test-requirements
description: Cung cấp prompt tối ưu để tự động quét codebase và trích xuất danh sách kịch bản kiểm thử (Test Cases) chi tiết phân nhóm theo Catalog kèm Điều kiện Pass (Pass Condition) chuẩn xác.
---

# Extract Test Requirements Skill

Kỹ năng này cung cấp câu lệnh prompt tối ưu giúp người dùng tự động quét codebase của dự án khác để trích xuất danh sách các kịch bản kiểm thử (Test Cases), tự động phân nhóm theo Catalog nghiệp vụ và định nghĩa Điều kiện Pass (Pass Condition) chi tiết để đưa vào file cấu hình kiểm thử hoặc hiển thị trên Dashboard.

## 📋 Câu lệnh Prompt Trích xuất (Copy phần bên dưới)

```markdown
Hãy quét toàn bộ codebase của dự án hiện tại và trích xuất danh sách các kịch bản kiểm thử (Test Cases) chi tiết dưới dạng Markdown phục vụ cho việc kiểm thử tự động (hoặc hiển thị trên QA Dashboard). 

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

Hãy quét codebase hiện tại, tự động gom nhóm các tính năng tương tự và xuất tài liệu Markdown hoàn chỉnh. Không cần giải thích thêm dông dài ngoài lề.
```
