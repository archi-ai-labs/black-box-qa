# Đề xuất Giải pháp: Trợ lý Kiểm thử Độc lập (Black-box QA Agent)

Tài liệu này phác thảo ý tưởng thiết lập hệ thống **QA Agent độc lập** giúp tự động hóa kiểm thử, tối ưu hóa chất lượng code trước khi bàn giao cho Tester thực tế, và tự cải tiến liên tục qua nhiều dự án.

---

## 1. Mô hình Hoạt động (Black-box QA Model)
Để đảm bảo tính độc lập và bảo mật, tôi (Antigravity) sẽ hoạt động như một **nhà thầu QA ngoài**:
* **Không gian làm việc riêng**: Toàn bộ code test sẽ nằm trong thư mục `/Users/apple/.gemini/antigravity/scratch/qa-agent-tests` trên máy của bạn. Dự án chính của bạn hoàn toàn không bị ảnh hưởng.
* **Phương thức kiểm thử**: Kiểm thử hộp đen (Black-box). Tôi chỉ cần bạn cung cấp **Endpoint (URL/Localhost)**, **Mô tả nghiệp vụ** và **Tài liệu API (Docs)**.
* **Cách thức chạy**: Tôi tự viết script (Node.js/Python) và bắn request trực tiếp tới server đang chạy local hoặc staging của bạn để kiểm tra phản hồi.

---

## 2. Các Tính năng Nâng cấp cốt lõi

### 2.1. Bộ nhớ dùng chung (Shared Memory)
* **Cách hoạt động**: Tôi duy trì một cơ sở tri thức tại file `shared_memory.md` để lưu lại các lỗi phổ biến (như lỗi phân quyền, lỗi validate dữ liệu đầu vào, SQL Injection).
* **Giá trị**: Khi nhận dự án mới, tôi sẽ tự động áp dụng các bài học từ các dự án cũ để thiết kế kịch bản test thông minh hơn mà bạn không cần nhắc.

### 2.2. Thông báo tự động qua Telegram/Discord (Push Notifications)
* **Cách hoạt động**: Tích hợp Telegram Bot hoặc Discord Webhook vào runner của tôi.
* **Giá trị**: Bạn có thể tắt máy tính hoặc đi cafe. Khi test chạy xong, kết quả chi tiết (Pass/Fail) và log lỗi sẽ được gửi trực tiếp tới điện thoại của bạn.

### 2.3. Giả lập API bên thứ 3 (Mock Server)
* **Cách hoạt động**: Nếu API của bạn gọi tới Stripe (Thanh toán), Twilio (SMS), Firebase Auth... Tôi sẽ dựng một mock server local đóng vai các dịch vụ này.
* **Giá trị**: Test offline 100%, không tốn chi phí gọi API thật, dễ dàng giả lập các trường hợp lỗi hiếm gặp (ví dụ: lỗi thẻ hết tiền, lỗi server Stripe sập).

### 2.4. Kiểm tra tự động định kỳ (Auto-schedule / Cron)
* **Cách hoạt động**: Cài đặt tác vụ chạy ẩn định kỳ (ví dụ: mỗi 1 tiếng).
* **Giá trị**: Tự động ping và kiểm thử server của bạn 24/7. Nếu server gặp sự cố hoặc database bị lỗi, tôi sẽ nhắn tin cảnh báo ngay lập tức.

---

## 3. Lộ trình Triển khai (Roadmap)

### Giai đoạn 1: Demo & Setup Cơ bản (Ngay bây giờ)
1. Tôi setup thư mục kiểm thử độc lập tại máy của bạn.
2. Tôi tạo một **API giả lập (Mock Server)** local để đóng vai API của bạn.
3. Tôi viết script test và chạy thử từ A-Z để bạn xem cách tôi bắn request và bắt lỗi thực tế.

### Giai đoạn 2: Tích hợp Thông báo (Telegram / Discord)
1. Bạn tạo Webhook Discord hoặc Telegram Token.
2. Tôi tích hợp vào hệ thống để báo lỗi tự động.

### Giai đoạn 3: Vận hành thực tế
* Bạn gửi API của các dự án thực tế cho tôi test.
* Tôi bắt đầu tích lũy kinh nghiệm vào bộ nhớ chung.

---

## 4. Kịch bản chạy thử (Demo Script)
Dưới đây là ví dụ về cách tôi sẽ báo cáo lỗi cho bạn khi chạy Demo:

```bash
[TEST RUNNER] Bắt đầu kiểm thử API: Đăng ký tài khoản
--------------------------------------------------
Test case 1: Đăng ký thành công với dữ liệu hợp lệ -> [PASS] (Status 201)
Test case 2: Đăng ký với Email sai định dạng -> [FAIL] (Nhận 500 thay vì 400 Bad Request)
Test case 3: Đăng ký trùng Email -> [PASS] (Status 409 Conflict)

=> Kết luận: 1/3 test case bị FAIL. Phát hiện lỗi crash 500 khi email không đúng định dạng.
```
