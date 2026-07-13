# FC Manager - Quản lý điểm danh đội bóng

A modern web application for managing football team attendance, player statistics, match records, contributions, and performance analytics.

## 📋 Overview

FC Manager is a React-based web application built with Vite, TypeScript, and TailwindCSS. It provides a comprehensive suite of tools for football team administrators to track player attendance, match performance, financial contributions, and generate statistical reports.

The application integrates with Supabase for backend services and uses React Router for client-side routing.

## 🛠️ Technology Stack

- **Frontend Framework**: React 19 with React Router DOM v7
- **Build Tool**: Vite
- **Styling**: TailwindCSS v4
- **Language**: TypeScript
- **State Management**: React Context (Toast)
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Date Handling**: Day.js
- **Icons**: Lucide React
- **Utilities**: clsx
- **Backend**: Supabase (via @supabase/supabase-js)
- **Linting**: Oxlint

## 📁 Project Structure

```
app_diem_danh/
├── public/                  # Static assets (favicon, icons)
│   ├── favicon.svg
│   └── icons.svg
├── src/                     # Source code
│   ├── assets/              # Static images and icons
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── components/          # Reusable UI components
│   │   ├── layout/          # Layout components (Header, Sidebar, Layout)
│   │   │   ├── AppLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/              # Atomic UI components
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       ├── ConfirmDialog.tsx
│   │       ├── FormControls.tsx
│   │       ├── Modal.tsx
│   │       ├── SearchInput.tsx
│   │       ├── SearchInput.tsx
│   │       ├── ToastContainer.tsx
│   │       └── PlayerDetailModal.tsx
│   ├── contexts/            # React Context providers
│   │   └── ToastContext.tsx
│   ├── pages/               # Page components (routes)
│   │   ├── AttendancePage.tsx
│   │   ├── ContributionsPage.tsx
│   │   ├── ContributionDetailPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── MatchesPage.tsx
│   │   ├── PlayersPage.tsx
│   │   ├── PerformancePage.tsx
│   │   └── StatisticsPage.tsx
│   ├── services/            # Service layers for API calls
│   │   ├── authService.ts
│   │   ├── attendanceService.ts
│   │   ├── contributionService.ts
│   │   ├── matchService.ts
│   │   ├── performanceService.ts
│   │   └── playerService.ts
│   ├── apis/                # API configuration and shared types
│   │   └── common.ts
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts
│   ├── data/                # Mock data or constants
│   │   └── mockData.ts
│   ├── index.css            # Global CSS (Tailwind directives)
│   ├── App.tsx              # Main App component with routing
│   └── main.tsx             # Entry point
├── .oxlintrc.json           # Oxlint configuration
├── index.html               # HTML template
├── package.json             # Project dependencies and scripts
├── tsconfig.json            # TypeScript configuration
├── tsconfig.app.json        # App-specific TypeScript settings
├── tsconfig.node.json       # Node-specific TypeScript settings
├── vite.config.ts           # Vite configuration (React + Tailwind)
└── README.md
```

### Key Directories

- **`src/pages`** – Each file represents a route/view in the application.
- **`src/components/ui`** – Reusable, presentational components (buttons, modals, forms, etc.).
- **`src/components/layout`** – Layout components that wrap pages (header, sidebar).
- **`src/services`** – Encapsulate API calls to Supabase/rest endpoints.
- **`src/contexts`** – React providers (currently Toast for notifications).
- **`src/types`** – Shared TypeScript interfaces and types.
- **`src/data`** – Mock data or constants used during development.

## 🚀 Getting Started

### Prerequisites

- Node.js (>= 18 recommended)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd app_diem_danh
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory with your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   (Vite prefixes environment variables with `VITE_` to expose them to the client.)

### Development

Start the development server:
```bash
npm run dev
```
The app will be available at `http://localhost:5173`.

### Building for Production

```bash
npm run build
```
The production build will be output to the `dist/` directory.

Preview the production build:
```bash
npm run preview
```

### Linting

Run the linter to check code quality:
```bash
npm run lint
```

## 🧩 Features

- **Dashboard**: Overview of team statistics and recent activities.
- **Players**: Manage player profiles, view statistics, and track attendance.
- **Matches**: Schedule, record, and analyze match results.
- **Attendance**: Track player attendance for training sessions and matches.
- **Performance**: Analyze individual and team performance metrics.
- **Contributions**: Track financial contributions from players or sponsors.
- **Statistics**: Generate reports and visualizations for team performance.
- **Authentication**: Simple login system (demo credentials: admin / 123456).

## 🔄 Workflow (Luồng hoạt động)

1. **Đăng nhập** – Người dùng mở ứng dụng và được đưa tới trang login (demo: admin / 123456). Sau khi xác thực, ứng dụng lưu token/session (localStorage hoặc context) để giữ trạng thái đăng nhập.
2. **Dashboard** – Trang chủ hiển thị tổng quan: số lượng cầu thủ, trận đấu gần nhất, tỷ lệ điểm danh, tổng đóng góp, v.v. Dữ liệu được lấy từ Supabase qua các service (playerService, matchService, attendanceService, contributionService) và đưa vào state React.
3. **Chọn module qua Sidebar** – Người dùng click vào một trong các mục:Players, Matches, Attendance, Performance, Contributions, Statistics.
4. **Thực hiện CRUD** – Trong mỗi module:
   - **Xem danh sách**: tạo request GET tới Supabase (ví dụ: `playerService.getAll()`), hiển thị danh sách trong bảng hoặc карточки.
   - **Thêm mới**: mở form (React Hook Form), khi submit gọi service POST (ví dụ: `playerService.create(data)`), sau khi thành công làm mới danh sách.
   - **Chỉnh sửa**: mở form với dữ liệu hiện tại, gọi service PUT/PATCH, cập nhật state.
   - **Xóa**: gọi service DELETE, sau khi thành công xóa mục khỏi danh sách.
   Mỗi hành đi kèm thông báo toast (ToastContext) để phản hồi thành công/thất bại.
5. **Chi tiết** – Trang contribution detail (`/contributions/:id`) lấy contribution ID từ route, gọi service `getById` và hiển thị thông tin chi tiết.
6. **Cập nhật realtime (tùy chọn)** – Nếu sử dụng Supabase Realtime, các service có thể subscribe tới thay đổi và cập nhật UI mà không cần làm mới thủ công.
7. **Đăng xuất** – Cho phiên bản sau (hiện tại chỉ có login cố định), khi đăng xuất sẽ xóa token và chuyển hướng về trang login.

### Luồng dữ liệu
```
UI (React Component) 
   ↦ (gọi service) 
Services (authService, playerService, ...) 
   ↦ (HTTP request qua Axios) 
Supabase (REST API / Realtime) 
   ↦ (Phản hồi JSON) 
Services 
   ↦ (Cập nhật React state / context) 
UI (render lại)
```

## 📖 Usage

After logging in, navigate through the sidebar to access different modules. Each module provides CRUD operations where applicable, with data persisted to Supabase.

## 🤝 Contributing

1. Fork the repository.
2. Create a new branch for your feature or bug fix.
3. Commit your changes with descriptive messages.
4. Push to your fork and submit a pull request.

Please ensure your code follows the existing style and passes the linter.

## 📄 License

This project is licensed under the MIT License.

---

*Built with ❤️ for football team management.*