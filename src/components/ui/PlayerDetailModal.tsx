import React from 'react';
import { X, Goal, Handshake, Calendar, MapPin, Trophy } from 'lucide-react';
import type { Player, Match } from '../../types';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';

dayjs.locale('vi');

export type DetailTab = 'goals' | 'assists';

interface MatchGoalDetail {
  match: Match;
  goals: number;
  assists: number;
}

interface PlayerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  tab: DetailTab;
  matchDetails: MatchGoalDetail[];
  totalGoals: number;
  totalAssists: number;
}

export const PlayerDetailModal: React.FC<PlayerDetailModalProps> = ({
  isOpen,
  onClose,
  player,
  tab: initialTab,
  matchDetails,
  totalGoals,
  totalAssists,
}) => {
  const [activeTab, setActiveTab] = React.useState<DetailTab>(initialTab);

  // Sync tab khi prop thay đổi
  React.useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const goalMatches = matchDetails.filter((d) => d.goals > 0);
  const assistMatches = matchDetails.filter((d) => d.assists > 0);
  const displayList = activeTab === 'goals' ? goalMatches : assistMatches;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-gray-900 border border-white/10 rounded-2xl shadow-2xl animate-modal-in overflow-hidden">

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
          {/* Glow accent */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />

          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <span className="text-2xl font-black text-emerald-400">
                    {player.name.charAt(0)}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-md bg-gray-900 border border-white/10 flex items-center justify-center">
                  <span className="text-[9px] font-bold text-white/60">
                    #{player.jerseyNumber}
                  </span>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-bold text-white">{player.name}</h2>
                <p className="text-xs text-white/40 mt-0.5">
                  {player.position} · #{player.jerseyNumber}
                </p>
                {/* Mini stats */}
                <div className="flex items-center gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs text-amber-400">
                    <Goal className="w-3.5 h-3.5" />
                    <span className="font-bold">{totalGoals}</span> bàn
                  </span>
                  <span className="text-white/10">·</span>
                  <span className="flex items-center gap-1 text-xs text-purple-400">
                    <Handshake className="w-3.5 h-3.5" />
                    <span className="font-bold">{totalAssists}</span> kiến tạo
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-5 bg-white/5 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('goals')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'goals'
                ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                : 'text-white/40 hover:text-white/70'
                }`}
            >
              <Goal className="w-3.5 h-3.5" />
              Bàn thắng
              {goalMatches.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'goals' ? 'bg-amber-500/20 text-amber-300' : 'bg-white/10 text-white/40'
                  }`}>
                  {totalGoals}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('assists')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'assists'
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/20'
                : 'text-white/40 hover:text-white/70'
                }`}
            >
              <Handshake className="w-3.5 h-3.5" />
              Kiến tạo
              {assistMatches.length > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${activeTab === 'assists' ? 'bg-purple-500/20 text-purple-300' : 'bg-white/10 text-white/40'
                  }`}>
                  {totalAssists}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-[55vh] overflow-y-auto">
          {displayList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                {activeTab === 'goals'
                  ? <Goal className="w-6 h-6 text-white/20" />
                  : <Handshake className="w-6 h-6 text-white/20" />
                }
              </div>
              <p className="text-sm text-white/30">
                Chưa có {activeTab === 'goals' ? 'bàn thắng' : 'kiến tạo'} nào
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Timeline */}
              {displayList.map((detail, idx) => {
                const value = activeTab === 'goals' ? detail.goals : detail.assists;
                const isGoal = activeTab === 'goals';
                return (
                  <div
                    key={detail.match.id}
                    className={`relative flex gap-4 p-4 rounded-xl border transition-all
                      ${isGoal
                        ? 'bg-amber-500/5 border-amber-500/15 hover:border-amber-500/30'
                        : 'bg-purple-500/5 border-purple-500/15 hover:border-purple-500/30'
                      }`}
                  >
                    {/* Timeline line */}
                    {idx < displayList.length - 1 && (
                      <div className="absolute left-[28px] top-full h-3 w-px bg-white/5 z-10" />
                    )}

                    {/* Icon + Count */}
                    <div className={`shrink-0 w-9 h-9 rounded-xl flex flex-col items-center justify-center
                      ${isGoal ? 'bg-amber-500/15' : 'bg-purple-500/15'}`}>
                      <span className={`text-lg font-black leading-none
                        ${isGoal ? 'text-amber-400' : 'text-purple-400'}`}>
                        {value}
                      </span>
                    </div>

                    {/* Match Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Trophy className="w-3.5 h-3.5 text-white/30 shrink-0" />
                        <p className="text-sm font-semibold text-white truncate">
                          vs {detail.match.opponent}
                        </p>
                        {/* "Cả hai" badge */}
                        {detail.goals > 0 && detail.assists > 0 && (
                          <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-white/40 border border-white/10">
                            ⚡ {detail.goals}G · {detail.assists}A
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1 text-xs text-white/50">
                          <Calendar className="w-3 h-3 text-blue-400" />
                          {dayjs(detail.match.date).format('dddd, DD/MM/YYYY')}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-white/50">
                          <MapPin className="w-3 h-3 text-emerald-400" />
                          {detail.match.venue}
                        </span>
                      </div>
                      {detail.match.note && (
                        <p className="text-[11px] text-white/30 italic mt-1 truncate">
                          {detail.match.note}
                        </p>
                      )}
                    </div>

                    {/* Value Pill */}
                    <div className={`shrink-0 self-start mt-0.5`}>
                      <span className={`text-xs font-bold px-2 py-1 rounded-lg
                        ${isGoal
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-purple-500/20 text-purple-300'
                        }`}>
                        {value > 1 ? `×${value}` : isGoal ? '⚽' : '🤝'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer summary */}
        <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs text-white/30">
            {displayList.length} trận có {activeTab === 'goals' ? 'bàn thắng' : 'kiến tạo'}
          </p>
          <p className={`text-sm font-bold ${activeTab === 'goals' ? 'text-amber-400' : 'text-purple-400'}`}>
            Tổng: {activeTab === 'goals' ? totalGoals : totalAssists}{' '}
            {activeTab === 'goals' ? 'bàn' : 'kiến tạo'}
          </p>
        </div>
      </div>
    </div>
  );
};
