# Ting Thu Chi 💰

Ứng dụng quản lý thu chi cá nhân thông minh với giao diện hiện đại và tích hợp Google Sheets.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/CSS-Custom-purple)

## ✨ Tính năng

- 📊 **Dashboard** - Tổng quan thu chi với biểu đồ trực quan
- 💳 **Quản lý giao dịch** - Thêm, sửa, xóa giao dịch dễ dàng
- 📁 **Phân loại** - Quản lý danh mục thu chi linh hoạt
- 📅 **Lọc theo thời gian** - Xem theo tháng, năm hoặc khoảng thời gian tùy chọn
- ☁️ **Google Sheets** - Đồng bộ dữ liệu với Google Sheets
- 🌙 **Dark/Light mode** - Giao diện tối/sáng tùy chỉnh
- 📱 **Responsive** - Tối ưu cho desktop và mobile

## 🚀 Cài đặt

### Yêu cầu
- Node.js 18+
- npm hoặc yarn

### Bước 1: Clone repository

```bash
git clone https://gitlab.com/fanova-studio/TingThuChi.git
cd TingThuChi
```

### Bước 2: Cài đặt dependencies

```bash
cd app
npm install
```

### Bước 3: Cấu hình Google Sheets (tùy chọn)

1. Tạo file `.env.local` trong thư mục `app/`:

```env
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...your key...\n-----END PRIVATE KEY-----"
```

2. Cấu hình Spreadsheet ID trong app: **Cài đặt → Google Sheets**

### Bước 4: Chạy ứng dụng

```bash
# Development
npm run dev

# Production build
npm run build
npm start
```

Truy cập: [http://localhost:3000](http://localhost:3000)

## 📁 Cấu trúc dự án

```
app/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/             # API routes
│   │   ├── categories/      # Trang danh mục
│   │   ├── settings/        # Trang cài đặt
│   │   └── transactions/    # Trang giao dịch
│   ├── components/          # React components
│   │   ├── auth/            # Authentication
│   │   ├── dashboard/       # Dashboard widgets
│   │   ├── layout/          # Layout components
│   │   ├── theme/           # Theme provider
│   │   ├── transactions/    # Transaction components
│   │   └── ui/              # UI primitives
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities
│   └── types/               # TypeScript types
├── data/                    # Data files (gitignored)
└── public/                  # Static assets
```

## 🔧 Scripts

| Script | Mô tả |
|--------|-------|
| `npm run dev` | Chạy development server |
| `npm run build` | Build production |
| `npm start` | Chạy production server |
| `npm run lint` | Kiểm tra linting |

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Custom CSS với CSS Variables
- **Icons**: Lucide React
- **Charts**: Recharts
- **Date**: date-fns
- **Database**: Google Sheets API / Local Excel

## 📱 Screenshots

| Dashboard | Giao dịch | Cài đặt |
|-----------|-----------|---------|
| Tổng quan thu chi | Quản lý giao dịch | Cấu hình app |

## 📄 License

MIT License - Xem file [LICENSE](LICENSE) để biết thêm chi tiết.

---

Made with ❤️ by Fanova Studio
