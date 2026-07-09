import React from 'react';
import { useLocation } from 'react-router-dom';
import { Bell } from 'lucide-react';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

const pageTitles: Record<string, { title: string; desc: string }> = {
  '/': { title: 'Dashboard', desc: 'Tổng quan hệ thống' },
  '/players': { title: 'Quản lý cầu thủ', desc: 'Danh sách và thông tin cầu thủ' },
  '/matches': { title: 'Quản lý trận đấu', desc: 'Lịch thi đấu và kết quả' },
  '/attendance': { title: 'Điểm danh', desc: 'Quản lý điểm danh theo trận' },
  '/statistics': { title: 'Thống kê', desc: 'Thống kê hiệu suất cầu thủ' },
  '/performance': { title: 'Cập nhật sau trận', desc: 'Nhập bàn thắng và kiến tạo' },
};

export const Header: React.FC = () => {
  const location = useLocation();
  const matchedKey = Object.keys(pageTitles).find((key) => {
    if (key === '/') return location.pathname === '/';
    return location.pathname.startsWith(key);
  });
  const pageInfo = pageTitles[matchedKey || '/'] || pageTitles['/'];

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-gray-900/50 backdrop-blur-sm shrink-0">
      <div>
        <h1 className="text-lg font-bold text-white">{pageInfo.title}</h1>
        <p className="text-xs text-white/40">{pageInfo.desc}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-white/60 capitalize">
            {dayjs().format('dddd, DD/MM/YYYY')}
          </p>
        </div>
        <div className="relative">
          <button className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
            <Bell className="w-4 h-4" />
          </button>
        </div>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-emerald-500/20">
          A
        </div>
      </div>
    </header>
  );
};
