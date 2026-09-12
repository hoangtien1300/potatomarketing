# 🥔 Potato English - Marketing Command Hub v2.0

> Trung tâm điều hành Marketing đa kênh & Quản trị Cơ sở Dữ liệu Thương hiệu chuẩn hóa của Hệ thống Anh ngữ Potato English.

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/phamhoangtien1300-3141s-projects/potatomarketing)
[![GitHub Repository](https://img.shields.io/badge/GitHub-potatomarketing-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/hoangtien1300/potatomarketing)
[![Google Sheet Data](https://img.shields.io/badge/Google%20Sheet-Live%20Sync-0F9D58?style=for-the-badge&logo=googlesheets&logoColor=white)](https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/edit#gid=1973975368)

---

## 🚀 Liên kết Trực Tuyến

- **Production URL**: [https://potatomarketing.vercel.app](https://potatomarketing.vercel.app)
- **Vercel Project Dashboard**: [https://vercel.com/phamhoangtien1300-3141s-projects/potatomarketing](https://vercel.com/phamhoangtien1300-3141s-projects/potatomarketing)
- **GitHub Repository**: [https://github.com/hoangtien1300/potatomarketing](https://github.com/hoangtien1300/potatomarketing)
- **Google Sheet Master Database**: [Potato Marketing Master Sheet (Tab About us #gid=1973975368)](https://docs.google.com/spreadsheets/d/11tOjhZiPCLYvIPQ4eV6l3fc-2m2Gv8wNl4DV4c9NBas/edit?pli=1&gid=1973975368#gid=1973975368)

---

## ✨ Tính Năng Nổi Bật

1. **Giao Diện Trẻ Trung, Năng Động Chuẩn Bộ Nhận Diện**:
   - Tông màu chủ đạo: Xanh Cyan `#00AEEF`, Xanh Navy `#0B2545`, Vàng Khoai Tây `#F5A623`.
   - Typography Inter sắc nét, bố cục thẻ Card bóng đổ mềm mại, chuẩn UX Dashboard hiện đại.

2. **Hệ Thống Menu Sidebar Accordion Thông Minh**:
   - Khi nhấp vào mục cha bất kỳ, hệ thống lập tức kích hoạt chuyển đổi tab tương ứng và tự động mở rộng danh sách mục con bên dưới.
   - Các danh mục khác tự động thu gọn để giữ thanh điều hướng luôn gọn gàng, tinh tế.
   - Toàn bộ tiêu đề menu được tối ưu ngắn gọn (≤ 4 từ).

3. **Quản Trị Cơ Sở Dữ Liệu Thương Hiệu (Tab About Us #gid=1973975368)**:
   - 35 thông số nhận diện thương hiệu cốt lõi được cấu trúc thành 6 nhóm thông tin:
     - *1. Tổng Quan & Pháp Lý*
     - *2. Độc Bản & Năng Lực Cốt Lõi*
     - *3. Nhận Diện Thị Giác & Màu Sắc*
     - *4. Tone Of Voice & Ngôn Ngữ*
     - *5. Nhân Vật Đại Diện (Mascot & KOL)*
     - *6. Thông Tin Liên Hệ & Chi Nhánh*
   - Giao diện nhập liệu trực quan dạng Form WordPress/Settings, cho phép điều chỉnh nhanh từng ô box và lưu thay đổi hàng loạt.
   - Hỗ trợ đồng bộ 2 chiều trực tiếp với Google Sheet.

4. **Quản Lý Lịch Đăng Đa Kênh & AI Agents Hub**:
   - Lịch phát sóng Omnichannel Calendar 30 ngày (Fanpage, TikTok, SEO, Zalo OA).
   - Danh sách phân quyền tài khoản và bảng điều khiển chuyên gia AI Agents.

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: HTML5, Tailwind CSS CDN, FontAwesome 6 Pro icons, Vanilla JavaScript ES6+.
- **Backend / Serverless API**: Vercel Serverless Functions (Node.js 18+).
- **Database / Data Source**: Google Sheets API (Tab About us `#gid=1973975368`).
- **Hosting & CI/CD**: Vercel, GitHub Actions.

---

## 📂 Cấu Trúc Dự Án

```
potatomarketing/
├── index.html                  # Giao diện chính Potato English Hub v2.0
├── student_score_report.html   # Module tra cứu báo cáo học viên
├── potato_logo.png             # Logo Mascot chuẩn nhận diện thương hiệu
├── Potato_English_Logo.jpeg    # Logo phụ trợ
├── favicon.ico                 # Favicon trang web
├── assets/                     # Thư mục chứa hình ảnh & biểu tượng
├── api/                        # Vercel Serverless Functions
│   ├── about-us.js             # GET /api/about-us (Live Google Sheet CSV sync)
│   ├── about-us-sync.js        # POST /api/about-us/sync
│   └── about-us-batch.js       # POST /api/about-us/batch-update
├── vercel.json                 # Cấu hình routing và rewrite Vercel
├── package.json                # Cấu hình metadata dự án
└── README.md                   # Tài liệu hướng dẫn sử dụng
```

---

© 2026 **POTATO ENGLISH**. Never Stop Learning.
