import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { useAuth } from '../../contexts/AuthContext';

dayjs.locale('vi');

const pageTitles: Record<string, { title: string; desc: string }> = {
  '/': { title: 'Dashboard', desc: 'Tổng quan hệ thống' },
  '/players': { title: 'Quản lý cầu thủ', desc: 'Danh sách và thông tin cầu thủ' },
  '/matches': { title: 'Quản lý trận đấu', desc: 'Lịch thi đấu và kết quả' },
  '/attendance': { title: 'Điểm danh', desc: 'Quản lý điểm danh theo trận' },
  '/statistics': { title: 'Thống kê', desc: 'Thống kê hiệu suất cầu thủ' },
  '/performance': { title: 'Cập nhật sau trận', desc: 'Nhập bàn thắng và kiến tạo' },
};

const roleLabels: Record<string, string> = {
  Admin: 'Quản trị viên',
  User: 'Người xem',
  Player: 'Cầu thủ',
};

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const matchedKey = Object.keys(pageTitles).find((key) => {
    if (key === '/') return location.pathname === '/';
    return location.pathname.startsWith(key);
  });
  const pageInfo = pageTitles[matchedKey || '/'] || pageTitles['/'];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 flex items-center justify-between gap-2 px-3 sm:px-6 border-b border-white/5 bg-gray-900/50 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-10 h-10 shrink-0 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-bold text-white truncate">{pageInfo.title}</h1>
          <p className="text-xs text-white/40 truncate hidden xs:block">{pageInfo.desc}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-white/60 capitalize">
            {dayjs().format('dddd, DD/MM/YYYY')}
          </p>
        </div>
        <div className="relative hidden xs:block">
          <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Bell className="w-4 h-4" />
          </button>
        </div>
        {user && (
          <div className="text-right hidden sm:block">
            <p className="text-xs font-medium text-white">{user.username}</p>
            <p className="text-[10px] text-white/40">{roleLabels[user.role]}</p>
          </div>
        )}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20 shrink-0">
          {user ? user.username.charAt(0).toUpperCase() : 'A'}
        </div>
        <button
          onClick={handleLogout}
          title="Đăng xuất"
          className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
