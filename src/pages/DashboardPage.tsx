import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Calendar, Goal, Handshake, TrendingUp, ChevronRight, Trophy, Activity } from 'lucide-react';
import { playerService } from '../services/playerService';
import { matchService } from '../services/matchService';
import { performanceService } from '../services/performanceService';
import { contributionService } from '../services/contributionService';
import type { Player, Match } from '../types';
import dayjs from 'dayjs';
import { useToast } from '../contexts/ToastContext';

interface StatsCard {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
  border: string;
  to: string;
}

interface ContributionSummary {
  totalDue: number;
  totalPaid: number;
  remaining: number;
  paidCount: number;
  partialCount: number;
  unpaidCount: number;
  exemptCount: number;
  playerCount: number;
}

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalPlayers: 0,
    totalMatches: 0,
    totalGoals: 0,
    totalAssists: 0,
  });
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [contributionSummary, setContributionSummary] = useState<ContributionSummary | null>(null);
  const [, setContributionLoading] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [ps, ms, perfs] = await Promise.all([
          playerService.getActive(),
          matchService.getAll(),
          performanceService.getAllPerformances(),
        ]);

        const totalGoals = perfs.reduce((sum, p) => sum + p.goals, 0);
        const totalAssists = perfs.reduce((sum, p) => sum + p.assists, 0);

        setStats({
          totalPlayers: ps.length,
          totalMatches: ms.length,
          totalGoals,
          totalAssists,
        });
        setPlayers(ps);
        setMatches(ms.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data', err);
        addToast('Không thể tải dữ liệu tổng quan!', 'error');
      } finally {
        setLoading(false);
      }
    };

    load();

    // Load contribution summary (latest contribution)
    const loadContributionSummary = async () => {
      setContributionLoading(true);
      try {
        const contributions = await contributionService.getAll();
        if (contributions.length > 0) {
          const latest = contributions[0]; // already sorted descending by created_at in service
          const summary = await contributionService.getSummary(latest.id);
          setContributionSummary(summary);
        } else {
          setContributionSummary(null);
        }
      } catch (err) {
        console.error('Failed to load contribution summary', err);
        addToast('Không thể tải dữ liệu quỹ đóng góp!', 'error');
        setContributionSummary(null);
      } finally {
        setContributionLoading(false);
      }
    };

    loadContributionSummary();
  }, []);

  const statCards: StatsCard[] = [
    {
      label: 'Tổng cầu thủ',
      value: stats.totalPlayers,
      icon: Users,
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      border: 'border-emerald-500/20',
      to: '/players',
    },
    {
      label: 'Tổng trận đấu',
      value: stats.totalMatches,
      icon: Calendar,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      to: '/matches',
    },
    {
      label: 'Tổng bàn thắng',
      value: stats.totalGoals,
      icon: Goal,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      to: '/statistics',
    },
    {
      label: 'Tổng kiến tạo',
      value: stats.totalAssists,
      icon: Handshake,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
      to: '/statistics',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  const nextMatch = matches.find((m) => dayjs(m.date).isAfter(dayjs()));
  const recentMatches = matches.filter((m) => !dayjs(m.date).isAfter(dayjs())).slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/5 border border-emerald-500/15 rounded-2xl p-4 sm:p-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg sm:text-xl font-bold text-white">
              Chào mừng đến FC Manager! ⚽
            </h2>
            <p className="text-white/50 text-xs sm:text-sm mt-0.5">
              {dayjs().format('dddd, DD tháng MM, YYYY')}
            </p>
          </div>
        </div>
      </div>

      {/* Contribution Summary Card */}
      {contributionSummary !== null && (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Goal className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold text-white">Tổng quỹ đóng góp</h3>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 text-white">
            <div className="flex flex-col xs:flex-row gap-3 xs:gap-4 p-3 bg-gray-800/50 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">Tổng cần thu</p>
                <p className="text-lg font-bold truncate">{contributionSummary.totalDue.toLocaleString()} vnđ</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">Tổng đã thu</p>
                <p className="text-lg font-bold text-emerald-400 truncate">{contributionSummary.totalPaid.toLocaleString()} vnđ</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white/40">Còn thiếu</p>
                <p className="text-lg font-bold text-red-400 truncate">{contributionSummary.remaining.toLocaleString()} vnđ</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs text-white/50">
              <div>
                <p>Đã đóng:</p>
                <p className="font-medium">{contributionSummary.paidCount} người</p>
              </div>
              <div>
                <p>Đóng một phần:</p>
                <p className="font-medium">{contributionSummary.partialCount} người</p>
              </div>
              <div>
                <p>Chưa đóng:</p>
                <p className="font-medium">{contributionSummary.unpaidCount} người</p>
              </div>
              <div>
                <p>Miễn giảm:</p>
                <p className="font-medium">{contributionSummary.exemptCount} người</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.label}
              to={card.to}
              className={`group flex items-center gap-4 p-5 rounded-2xl border ${card.bg} ${card.border}
                hover:scale-[1.02] transition-all duration-200 cursor-pointer`}
            >
              <div
                className={`w-12 h-12 rounded-xl ${card.bg} ${card.border} border flex items-center justify-center`}
              >
                <Icon className={`w-6 h-6 ${card.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-3xl font-bold text-white">{card.value}</p>
                <p className="text-xs text-white/50 mt-0.5">{card.label}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 transition-colors" />
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Upcoming Match */}
        <div className="xl:col-span-1 space-y-4">
          {nextMatch && (
            <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold text-white">Trận tiếp theo</h3>
              </div>
              <div className="text-center py-3">
                <p className="text-xs text-white/40 mb-1">VS</p>
                <p className="text-xl font-bold text-white mb-2">{nextMatch.opponent}</p>
                <div className="space-y-1">
                  <p className="text-sm text-emerald-400 font-medium">
                    📅 {dayjs(nextMatch.date).format('DD/MM/YYYY')}
                  </p>
                  <p className="text-xs text-white/50">📍 {nextMatch.venue}</p>
                </div>
                {nextMatch.note && (
                  <p className="text-xs text-white/30 mt-2 italic">{nextMatch.note}</p>
                )}
              </div>
              <Link
                to={`/attendance`}
                className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-xl
                  bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 text-sm font-medium
                  hover:bg-emerald-500/25 transition-colors"
              >
                Điểm danh ngay
              </Link>
            </div>
          )}

          {/* Top Players */}
          <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">Cầu thủ</h3>
              </div>
              <Link to="/players" className="text-xs text-emerald-400 hover:text-emerald-300">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-2">
              {players.slice(0, 6).map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 py-2">
                  <span className="text-xs text-white/30 w-4">{i + 1}</span>
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <span className="text-xs font-bold text-emerald-400">
                      {p.jerseyNumber}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{p.name}</p>
                    <p className="text-xs text-white/40">{p.position}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="xl:col-span-2 bg-gray-900/60 border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-semibold text-white">Trận đã đấu</h3>
            </div>
            <Link to="/matches" className="text-xs text-emerald-400 hover:text-emerald-300">
              Xem tất cả
            </Link>
          </div>
          {recentMatches.length === 0 ? (
            <div className="flex items-center justify-center py-10 text-white/30 text-sm">
              Chưa có trận đấu nào
            </div>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-blue-400 leading-none">
                      {dayjs(match.date).format('DD')}
                    </span>
                    <span className="text-[10px] text-blue-400/60 leading-none">
                      T{dayjs(match.date).format('M')}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      vs {match.opponent}
                    </p>
                    <p className="text-xs text-white/40 truncate">📍 {match.venue}</p>
                  </div>
                  <Link
                    to={`/attendance`}
                    className="text-xs text-emerald-400 hover:text-emerald-300 whitespace-nowrap"
                  >
                    Xem điểm danh
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};