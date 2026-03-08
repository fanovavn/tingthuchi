# Nhật ký thay đổi (Changelog)

Các thay đổi đáng chú ý của dự án sẽ được ghi lại trong tệp này.

## [v8.3.0] - 2026-03-08

### Thêm mới (Added)
- **Trang Kế Hoạch Chi Tiêu** (`/plan-money`): Theo dõi thu/chi định kỳ trong tháng (cố định 30 ngày).
  - Timeline 30 ngày dạng lưới với tổng quan thu/chi theo từng ngày.
  - Dots navigation bar: nhấn vào dot để cuộn đến ngày tương ứng.
  - Summary cards: Tổng Thu Dự Kiến, Tổng Chi Dự Kiến, Chênh Lệch.
  - Person summary: Hiển thị số tiền cần xử lý theo từng người (Tý, Mèo).
  - Nút **+** trên mỗi ô ngày để thêm hạng mục trực tiếp vào ngày đó.
- **CRUD Kế Hoạch Chi Tiêu**: Tương tác Google Sheets qua tab "PlanMoney".
  - Cấu trúc sheet: DayNumber | Note | Amount | Type | Assignee | Id | Description | Checked.
  - API routes: `GET/POST /api/plan-money`, `PUT/DELETE /api/plan-money/[id]`, `POST/DELETE /api/plan-money/check`.
- **Nhấn item để sửa/xóa**: Click vào item trên timeline mở form chỉnh sửa, có nút xóa với popup xác nhận 2 bước.
- **Đánh dấu đã xử lý (Check)**: Nhấn icon trên item để đánh dấu hoàn thành.
  - Viền xanh, tiêu đề gạch ngang, item mờ đi khi đã check.
  - Trạng thái lưu trên Google Sheets (cột H) để đồng bộ giữa các thiết bị.
  - Nút "Clear tất cả" để reset toàn bộ trạng thái check.
- **Ghi chú thêm (Description)**: Trường ghi chú bổ sung cho mỗi hạng mục, hiển thị dạng italic trên timeline.
- **Menu "Kế hoạch chi tiêu"**: Thêm vào Sidebar và MobileHeader với icon RefreshCw.

### Thay đổi (Changed)
- **Ô nhập số tiền**: Font lớn 24px, bold, tự động format dấu chấm phân cách (VD: 5.000.000).
- **Cập nhật version**: Hiển thị v8.3.0 trên Sidebar và MobileHeader.

## [v8.2.0] - 2026-02-21

### Thêm mới (Added)
- **Tích hợp Google Sheets cho Danh mục**: Kết nối trang "Danh mục" với tab "Category" trên Google Sheets.
  - CRUD đầy đủ: Thêm, sửa, xóa danh mục đồng bộ trực tiếp với Google Sheets.
  - Cấu trúc sheet: ID | Tên danh mục | Nhóm danh mục | Color.
  - API routes: `GET/POST /api/categories` và `PUT/DELETE /api/categories/[id]`.
- **Bộ chọn màu danh mục**: Hỗ trợ chọn màu cho danh mục với 20 preset colors + color picker tùy chỉnh.
  - Xem trước (preview) label danh mục với màu đã chọn ngay trong form.
- **Popup xác nhận xóa**: Thay thế cơ chế "bấm 2 lần" bằng modal xác nhận rõ ràng khi xóa danh mục.
  - Hiển thị tên & màu danh mục sắp xóa, cảnh báo không thể hoàn tác.
  - Loading state khi đang xử lý xóa.

### Thay đổi (Changed)
- **Form Thêm Giao Dịch**: Danh mục trong dropdown giờ được load từ Google Sheets API thay vì hardcode.
  - Tự động phân loại theo Chi tiêu / Thu nhập.
  - Thêm/sửa/xóa danh mục ở trang Quản lý sẽ tự động cập nhật trong form giao dịch.
- **Bộ lọc Giao Dịch (FilterBar)**: Dropdown danh mục cũng load từ Google Sheets API.
- **Cập nhật version**: Hiển thị v8.2.0 trên Sidebar và MobileHeader.

### Sửa lỗi (Fixed)
- **Mapping cột sai**: Sửa lỗi `CategorySheetsDB` đọc sai thứ tự cột (ID ở cột A, không phải cột D).
- **Dữ liệu color bị lệch**: Sửa lỗi trường `color` trả về tên nhóm danh mục thay vì mã màu hex.

## [v8.1.0] - 2026-02-20

### Thêm mới (Added)
- **Nhóm giao dịch theo ngày**: Danh sách giao dịch được nhóm theo ngày với header hiển thị:
  - Ngày tháng và thứ trong tuần (VD: 20/02/2026 - thứ sáu).
  - Tổng thu và tổng chi trong ngày.
  - Badge "Hôm nay" nổi bật cho ngày hiện tại.

### Thay đổi (Changed)
- **Header ngày hôm nay**: Nền tím đậm với chữ trắng cho dễ đọc.
- **Font size số tiền**: Tăng lên 24px trong form giao dịch & tiết kiệm.

### Sửa lỗi (Fixed)
- **Ngày ghi vào Google Sheet**: Sửa lỗi ngày bị chuyển thành số serial (46054) bằng cách thêm prefix text.

## [v8.0.0] - 2026-02-20

### Thêm mới (Added)
- **Trang Tiết Kiệm** (`/savings`): Quản lý giao dịch gửi vào & rút ra tiết kiệm.
  - Thống kê: Tổng gửi vào, Tổng rút ra, Số dư thực tế.
  - Danh sách giao dịch tiết kiệm, sắp xếp theo ngày mới nhất.
  - Form thêm/sửa giao dịch tiết kiệm với format số tiền VND (dấu chấm).
  - Xem chi tiết, sửa và xóa giao dịch.
  - Lọc giao dịch theo năm.
- **Tích hợp Google Sheets**: Kết nối tab "Saving" để đọc/ghi dữ liệu tiết kiệm (CRUD).
- **Thông báo Telegram**: Tự động gửi tin nhắn khi thêm giao dịch tiết kiệm.
  - Gửi vào: 🚀 Gửi tiết kiệm + số tiền → số dư thực tế.
  - Rút ra: 🆘 Rút tiết kiệm - số tiền → số dư còn lại.
- **Menu Tiết kiệm**: Thêm mục "Tiết kiệm" (PiggyBank icon) vào Sidebar & MobileHeader.

### Thay đổi (Changed)
- **Font size số tiền**: Tăng lên 24px trong form giao dịch & tiết kiệm để nổi bật hơn.
- **Format số tiền VND**: Hiển thị dấu chấm phân cách hàng nghìn (50.000) trong ô nhập liệu.

### Sửa lỗi (Fixed)
- **Ngày bị chuyển thành số serial**: Sửa lỗi Google Sheets tự chuyển ngày `20/02/2026` thành số `46054`.
- **Xử lý lỗi API**: Cải thiện hiển thị lỗi khi tương tác Google Sheets (alert chi tiết thay vì lỗi chung).
- **Format ngày Telegram**: Đổi từ `dd-mm` sang `dd/mm/yyyy`.

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
