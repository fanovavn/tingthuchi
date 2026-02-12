# Nhật ký thay đổi (Changelog)

Các thay đổi đáng chú ý của dự án sẽ được ghi lại trong tệp này.

## [v7.1.0] - 2026-02-12

### Thay đổi (Changed)
- **Bảng Giao Dịch Hàng Ngày**:
  - Cập nhật giao diện để nổi bật dòng của **Ngày Hiện Tại** thay vì luôn là dòng đầu tiên.
  - Tăng độ bo tròn góc (`border-radius: 8px`) cho dòng được chọn.
  - Sử dụng viền tím đậm hơn (`border-purple-600`) cho chế độ sáng để tăng độ tương phản.

## [v7.0.0] - 2026-02-11

### Thêm mới (Added)
- **Trang Tổng Kết Năm**: Giới thiệu trang tổng quan tài chính năm toàn diện với:
  - Thẻ KPI cho Tổng Thu, Tổng Chi, Chênh Lệch và Chỉ Số Dư Dả.
  - Biểu đồ Xu hướng Hàng tháng (Thu nhập vs Chi tiêu vs Dòng tiền ròng).
  - Biểu đồ Nguồn thu nhập & Phân bổ chi tiêu.
  - Điểm nổi bật chính (Tháng tốt nhất, Danh mục cao nhất, v.v.).
  - Bản đồ nhiệt hoạt động chi tiêu hàng ngày.
- **Chỉ Số Dư Dả (Abundance Index)**:
  - Thêm widget KPI mới vào Dashboard và trang Tổng Kết Năm.
  - Thay thế thuật ngữ "Tỷ lệ tiết kiệm" để hướng tới tư duy tích cực về sự dư dả.
  - Có chỉ báo trực quan (viền màu bên trái thẻ) để dễ nhận diện.

### Thay đổi (Changed)
- **Thuật ngữ**: Đổi tên "Tiết kiệm" thành "Dư dả" trên toàn bộ ứng dụng.
- **Bố cục Dashboard**:
  - Các thẻ tóm tắt giờ hiển thị trên một hàng ngang (4 cột) trên Desktop (màn hình >= 1280px).
  - Nội dung chính tận dụng toàn bộ chiều rộng màn hình để hiển thị dữ liệu rõ ràng hơn.
- **Cải thiện Giao diện**:
  - **Tooltip biểu đồ**: Tăng khả năng đọc với nền tối tương phản cao và chữ trắng.
  - **Đường lưới biểu đồ**: Làm mờ đường lưới thành màu xám nhạt tinh tế giúp giao diện sạch sẽ hơn.
  - **Tái sử dụng**: Chuẩn hóa các thành phần biểu đồ giữa Dashboard và trang Tổng Kết Năm.

## [v6.1.0] - 2026-02-08

### Thêm mới (Added)
- **Popup Giao dịch Ngày**: Nhấp vào một ngày trong bảng Dashboard sẽ mở danh sách chi tiết các giao dịch của ngày hôm đó.
- **Bảng Giao dịch Ngày**: Thay thế biểu đồ bằng bảng hiển thị Thu, Chi, Chênh lệch và Giá trị trung bình.

### Thay đổi (Changed)
- **Giao diện Mặc định**: Ứng dụng giờ mặc định là **Chế độ Sáng (Light Mode)**.
- **Logic So sánh**:
  - Bảng Ngày: "Chênh lệch" so sánh **Chi tiêu vs Chi tiêu** (Hôm nay vs Hôm qua).
  - Top 10 Chi tiêu: So sánh hiển thị chữ "Tăng"/"Giảm" thay vì biểu tượng để rõ ràng hơn.
- **Linting**: Sửa các lỗi `any` strict type và biến không sử dụng trong mã nguồn.

## [v6.0.0] - 2026-02-08

### Thêm mới (Added)
- **Hiển thị Phiên bản**: Thêm hiển thị số phiên bản ở Sidebar (Desktop) và Menu (Mobile).
- **Sắp xếp Danh mục**: Danh mục trong trang "Thêm giao dịch" được sắp xếp theo bảng chữ cái (hỗ trợ tiếng Việt).

### Thay đổi (Changed)
- **Nâng cấp Phiên bản**: Cập nhật phiên bản dự án lên v6.0.0.

## [v5] - 2026-02-08

### Thêm mới (Added)
- **Trang Thêm Giao dịch**: Tạo trang riêng tại `/transactions/add` hỗ trợ quay lại URL trước đó.
- **Thông báo Telegram**: Tích hợp thông báo Telegram tự động khi thêm giao dịch mới.
- **Popup Thành công**: Thêm modal thông báo thành công sau khi gửi giao dịch với tùy chọn "Thêm giao dịch khác" hoặc "Về danh sách".
- **API Telegram**: Tạo `/api/telegram` và `src/lib/telegram.ts` để xử lý gửi tin nhắn.

### Thay đổi (Changed)
- **Form Giao dịch**: Tái cấu trúc `TransactionForm` để hỗ trợ cả chế độ modal và trang riêng.
- **Điều hướng**: Cập nhật Dashboard và trang Giao dịch để liên kết đến trang thêm mới.
- **Định dạng Telegram**: Cập nhật mẫu tin nhắn thành `Icon Số tiền : Mô tả (Ngày - Danh mục)` với icon chi tiêu là 😕.

### Cấu hình (Configuration)
- Thêm `TELEGRAM_BOT_TOKEN` và `TELEGRAM_CHAT_ID` vào `.env.local`.
