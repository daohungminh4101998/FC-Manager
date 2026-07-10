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
  CircleDollarSign,
  X
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/players', icon: Users, label: 'Cầu thủ' },
  { to: '/matches', icon: Calendar, label: 'Trận đấu' },
  { to: '/attendance', icon: ClipboardList, label: 'Điểm danh' },
  { to: '/statistics', icon: BarChart3, label: 'Thống kê' },
  { to: '/performance', icon: Trophy, label: 'Sau trận', adminOnly: true },
  { to: '/contributions', icon: CircleDollarSign, label: 'Đóng quỹ' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onMobileClose }) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const visibleNavItems = navItems.filter((item) => !item.adminOnly || isAdmin);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={clsx(
          'flex flex-col h-full bg-gray-900/95 lg:bg-gray-900/80 border-r border-white/5',
          'fixed inset-y-0 left-0 z-50 w-64 transition-transform duration-300 ease-in-out',
          'lg:static lg:z-auto lg:translate-x-0 lg:transition-[width] lg:duration-300',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'lg:w-16' : 'lg:w-64'
        )}
      >
        {/* Logo */}
        <div
          className={clsx(
            'flex items-center h-16 px-4 border-b border-white/5 shrink-0',
            collapsed ? 'lg:justify-center' : 'gap-3'
          )}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className={clsx('overflow-hidden flex-1', collapsed && 'lg:hidden')}>
            <p className="text-sm font-bold text-white whitespace-nowrap">
              ⚽ FC Manager
            </p>
            <p className="text-xs text-white/40 whitespace-nowrap">
              Điểm danh đội bóng
            </p>
          </div>
          {/* Close button, mobile only */}
          <button
            onClick={onMobileClose}
            className="lg:hidden w-9 h-9 shrink-0 rounded-xl flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map(({ to, icon: Icon, label }) => {
            const isActive =
              to === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(to);
            return (
              <NavLink
                key={to}
                to={to}
                onClick={onMobileClose}
                className={clsx(
                  'flex items-center gap-3 px-3 py-3 lg:py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-200 group min-h-[44px]',
                  collapsed && 'lg:justify-center',
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
                <span className={clsx('truncate', collapsed && 'lg:hidden')}>{label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Collapse button — desktop only */}
        <div className="p-2 border-t border-white/5 shrink-0 hidden lg:block">
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
    </>
  );
};
