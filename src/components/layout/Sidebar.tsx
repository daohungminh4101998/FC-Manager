import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  ClipboardList,
  BarChart3,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Zap,
  CircleDollarSign
} from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/players', icon: Users, label: 'Cầu thủ' },
  { to: '/matches', icon: Calendar, label: 'Trận đấu' },
  { to: '/attendance', icon: ClipboardList, label: 'Điểm danh' },
  { to: '/statistics', icon: BarChart3, label: 'Thống kê' },
  { to: '/performance', icon: Trophy, label: 'Sau trận' },
  { to: '/contributions', icon: CircleDollarSign, label: 'Đóng quỹ' },
];

export const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={clsx(
        'flex flex-col h-full bg-gray-900/80 border-r border-white/5',
        'transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Logo */}
      <div
        className={clsx(
          'flex items-center h-16 px-4 border-b border-white/5',
          collapsed ? 'justify-center' : 'gap-3'
        )}
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
          <Zap className="w-5 h-5 text-white" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white whitespace-nowrap">
              ⚽ FC Manager
            </p>
            <p className="text-xs text-white/40 whitespace-nowrap">
              Điểm danh đội bóng
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive =
            to === '/'
              ? location.pathname === '/'
              : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-200 group',
                collapsed && 'justify-center',
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                  : 'text-white/50 hover:text-white hover:bg-white/5 border border-transparent'
              )}
              title={collapsed ? label : undefined}
            >
              <Icon
                className={clsx(
                  'w-5 h-5 shrink-0 transition-transform duration-200',
                  'group-hover:scale-110',
                  isActive && 'text-emerald-400'
                )}
              />
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-2 border-t border-white/5">
        <button
          onClick={() => setCollapsed((c) => !c)}
          className={clsx(
            'flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs',
            'text-white/40 hover:text-white hover:bg-white/5 transition-all',
            collapsed && 'justify-center'
          )}
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <>
              <ChevronLeft className="w-4 h-4" />
              <span>Thu gọn</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
