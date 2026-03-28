# ⚽ PitchSync - Hệ Thống Đặt Sân & Ghép Trận Trực Tuyến

PitchSync là một nền tảng hiện đại giúp kết nối chủ sân bóng và người chơi. Hệ thống hỗ trợ tìm kiếm sân, đặt lịch, thanh toán đặt cọc và đặc biệt là tính năng bảng tin ghép trận để kết nối các đội bóng với nhau.

## 🌟 Tính năng chính (Frontend v1.0)

### 1. Dành cho Người chơi (Player)
- **Trang chủ:** Banner giới thiệu và danh sách sân bóng nổi bật.
- **Tìm sân:** Bộ lọc thông minh theo loại sân (5, 7, 11) và khu vực.
- **Chi tiết sân:** Xem lịch trống theo thời gian thực và chọn khung giờ đá.
- **Thanh toán:** Quy trình xác nhận hóa đơn và chọn phương thức cọc (MoMo/Stripe).
- **Bảng tin ghép trận:** Đăng tin tìm đối thủ và xác nhận nhận kèo giao hữu.
- **Chat nội bộ:** Hệ thống nhắn tin 1-1 để thương lượng giữa các đội bóng.
- **Hồ sơ cá nhân:** Quản lý thông tin và theo dõi lịch sử đặt sân (Sắp đá/Đã hủy).

### 2. Dành cho Chủ sân (Owner)
- **Dashboard:** Thống kê doanh thu, tổng đơn hàng và các khoản cọc chờ duyệt.
- **Quản lý sân:** Thêm, sửa, xóa thông tin các sân con và cập nhật trạng thái bảo trì.
- **Quản lý đơn hàng:** Duyệt hoặc từ chối các yêu cầu đặt cọc từ người chơi.

### 3. Dành cho Quản trị viên (Admin)
- **Tổng quan:** Theo dõi toàn bộ hoạt động và doanh thu trên nền tảng.
- **Quản lý người dùng:** Khóa hoặc mở khóa tài khoản thành viên.
- **Kiểm duyệt:** Phê duyệt các yêu cầu đăng ký kinh doanh sân bóng mới.

## 🛠 Công nghệ sử dụng

- **Core:** React.js (TypeScript)
- **Build Tool:** Vite (Cực nhanh)
- **Styling:** Tailwind CSS v4 (Modern & Utility-first)
- **Icons:** React Icons (FontAwesome & Material Icons)
- **Routing:** React Router DOM v6 (Quản lý luồng chuyển trang)

## 🏗 Cấu trúc thư mục

```text
frontend/
├── src/
│   ├── components/      # Các thành phần tái sử dụng (Button, Modal, Navbar...)
│   │   ├── common/      # Component dùng chung toàn hệ thống
│   │   ├── match/       # Component liên quan đến Ghép trận
│   │   └── owner/       # Component dành riêng cho Chủ sân
│   ├── pages/           # Giao diện các trang chính
│   │   ├── player/      # Luồng người chơi
│   │   ├── owner/       # Luồng chủ sân
│   │   ├── admin/       # Luồng quản trị
│   │   └── auth/        # Đăng nhập & Đăng ký
│   ├── mocks/           # Dữ liệu giả lập để test giao diện
│   └── App.tsx          # Cấu hình Route chính
└── README.md

🚀 Hướng dẫn cài đặt
Clone dự án:

Bash
git clone [https://github.com/your-repo/pitch-management-system.git](https://github.com/your-repo/pitch-management-system.git)
cd pitch-management-system/frontend
Cài đặt thư viện:

Bash
npm install
Chạy ứng dụng (Dev mode):

Bash
npm run dev
Ứng dụng sẽ chạy tại: http://localhost:5173

🔑 Tài khoản Test (Mock Auth)
Sử dụng các Email sau tại trang Đăng nhập để trải nghiệm các quyền khác nhau:

Admin: admin@gmail.com -> Vào trang Quản trị hệ thống.

Chủ sân: owner@gmail.com -> Vào trang Dashboard chủ sân.

Người chơi: any@gmail.com -> Vào trang dành cho khách hàng.

© 2024 PitchSync Team.

