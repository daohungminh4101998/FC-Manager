import React, { useEffect, useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { playerService } from '../services/playerService';
import { attendanceService } from '../services/attendanceService';
import { performanceService } from '../services/performanceService';
import { matchService } from '../services/matchService';
import type { PlayerStats, Match, MatchPerformance } from '../types';
import { SearchInput } from '../components/ui/SearchInput';
import { Badge } from '../components/ui/Badge';
import { PlayerDetailModal, type DetailTab } from '../components/ui/PlayerDetailModal';
import { Goal, Handshake, Calendar, XCircle, TrendingUp, X } from 'lucide-react';

type SortKey = 'name' | 'matchesPlayed' | 'matchesAbsent' | 'totalGoals' | 'totalAssists' | 'totalGoalsConceded';

interface DetailState {
  playerStats: PlayerStats;
  tab: DetailTab;
}

export const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allPerfs, setAllPerfs] = useState<MatchPerformance[]>([]);
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalGoals');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailState | null>(null);
  const load = useCallback(async () => {
    setLoading(true);
    const [players, allAttendances, perfs, matches] = await Promise.all([
      playerService.getAll(),
      attendanceService.getAll(),
      performanceService.getAll(),
      matchService.getAll(),
    ]);

    const pastMatchIds = new Set(
      matches
        .filter((m) => !dayjs(m.date).isAfter(dayjs()))
        .map((m) => m.id)
    );

    const result: PlayerStats[] = players.map((player) => {
      const playerAttendances = allAttendances.filter((a) =>
        pastMatchIds.has(a.matchId)
      );

      const matchesPlayed = playerAttendances.filter((a) =>
        a.records.find((r) => r.playerId === player.id && r.status === 'present')
      ).length;

      const matchesAbsent = playerAttendances.filter((a) =>
        a.records.find((r) => r.playerId === player.id && r.status === 'absent')
      ).length;

      const totalGoals = perfs.reduce((sum, perf) => {
        const pp = perf.performances.find((p) => p.playerId === player.id);
        return sum + (pp?.goals || 0);
      }, 0);

      const totalAssists = perfs.reduce((sum, perf) => {
        const pp = perf.performances.find((p) => p.playerId === player.id);
        return sum + (pp?.assists || 0);
      }, 0);

      const totalGoalsConceded = perfs.reduce((sum, perf) => {
        const pp = perf.performances.find((p) => p.playerId === player.id);
        return sum + (pp?.goalsConceded || 0);
      }, 0);

      return { player, matchesPlayed, matchesAbsent, totalGoals, totalAssists, totalGoalsConceded };
    });

    setStats(result);
    setAllMatches(matches);
    setAllPerfs(perfs);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  /** Tính danh sách trận với bàn thắng/kiến tạo cho một cầu thủ */
  const buildMatchDetails = (playerId: string) => {
    return allPerfs
      .map((perf) => {
        const match = allMatches.find((m) => m.id === perf.matchId);
        const pp = perf.performances.find((p) => p.playerId === playerId);
        if (!match || !pp || (pp.goals === 0 && pp.assists === 0)) return null;
        return { match, goals: pp.goals, assists: pp.assists };
      })
      .filter(Boolean)
      .sort((a, b) => dayjs(b!.match.date).diff(dayjs(a!.match.date))) as {
        match: Match;
        goals: number;
        assists: number;
      }[];
  };

  const openDetail = (s: PlayerStats, tab: DetailTab) => {
    setDetail({ playerStats: s, tab });
  };

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((prev) => !prev);
    else { setSortKey(key); setSortAsc(false); }
  };

  const filtered = stats
    .filter((s) => s.player.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      let aVal: string | number, bVal: string | number;
      if (sortKey === 'name') {
        aVal = a.player.name;
        bVal = b.player.name;
      } else {
        aVal = a[sortKey];
        bVal = b[sortKey];
      }
      if (aVal < bVal) return sortAsc ? -1 : 1;
      if (aVal > bVal) return sortAsc ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ col }: { col: SortKey }) => (
    <span className="ml-1 text-white/20">
      {sortKey === col ? (sortAsc ? '↑' : '↓') : '↕'}
    </span>
  );

  const topScorer = [...stats].sort((a, b) => b.totalGoals - a.totalGoals)[0];
  const topAssist = [...stats].sort((a, b) => b.totalAssists - a.totalAssists)[0];
  const mostPresent = [...stats].sort((a, b) => b.matchesPlayed - a.matchesPlayed)[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topScorer && (
          <button
            onClick={() => openDetail(topScorer, 'goals')}
            className="text-left bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4
              hover:border-amber-500/40 hover:bg-amber-500/10 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Goal className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-400 font-medium">Vua phá lưới</span>
              <span className="ml-auto text-[10px] text-amber-400/50 group-hover:text-amber-400/80 transition-colors">
                Chi tiết →
              </span>
            </div>
            <p className="text-base font-bold text-white">{topScorer.player.name}</p>
            <p className="text-2xl font-black text-amber-400">{topScorer.totalGoals} bàn</p>
          </button>
        )}
        {topAssist && (
          <button
            onClick={() => openDetail(topAssist, 'assists')}
            className="text-left bg-purple-500/5 border border-purple-500/20 rounded-2xl p-4
              hover:border-purple-500/40 hover:bg-purple-500/10 transition-all active:scale-[0.98] group"
          >
            <div className="flex items-center gap-2 mb-2">
              <Handshake className="w-4 h-4 text-purple-400" />
              <span className="text-xs text-purple-400 font-medium">Vua kiến tạo</span>
              <span className="ml-auto text-[10px] text-purple-400/50 group-hover:text-purple-400/80 transition-colors">
                Chi tiết →
              </span>
            </div>
            <p className="text-base font-bold text-white">{topAssist.player.name}</p>
            <p className="text-2xl font-black text-purple-400">{topAssist.totalAssists} kiến tạo</p>
          </button>
        )}
        {mostPresent && (
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-emerald-400 font-medium">Tham dự nhiều nhất</span>
            </div>
            <p className="text-base font-bold text-white">{mostPresent.player.name}</p>
            <p className="text-2xl font-black text-emerald-400">{mostPresent.matchesPlayed} trận</p>
          </div>
        )}
      </div>

      {/* Search */}
      <div className="w-full sm:w-72">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Tìm cầu thủ..."
        />
      </div>

      {/* Table */}
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3.5 text-left text-xs font-medium text-white/40 w-8">#</th>
                <th
                  className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors"
                  onClick={() => handleSort('name')}
                >
                  Cầu thủ <SortIcon col="name" />
                </th>
                <th
                  className="px-5 py-3.5 text-center text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors"
                  onClick={() => handleSort('matchesPlayed')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    Tham dự <SortIcon col="matchesPlayed" />
                  </div>
                </th>
                <th
                  className="px-5 py-3.5 text-center text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors"
                  onClick={() => handleSort('matchesAbsent')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <XCircle className="w-3.5 h-3.5" />
                    Vắng <SortIcon col="matchesAbsent" />
                  </div>
                </th>
                <th
                  className="px-5 py-3.5 text-center text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors"
                  onClick={() => handleSort('totalGoals')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Goal className="w-3.5 h-3.5" />
                    Bàn thắng <SortIcon col="totalGoals" />
                  </div>
                </th>
                <th
                  className="px-5 py-3.5 text-center text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors"
                  onClick={() => handleSort('totalGoalsConceded')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <X className="w-3.5 h-3.5 text-red-400" />
                    Bàn thua <SortIcon col="totalGoalsConceded" />
                  </div>
                </th>
                <th
                  className="px-5 py-3.5 text-center text-xs font-medium text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/70 transition-colors"
                  onClick={() => handleSort('totalAssists')}
                >
                  <div className="flex items-center justify-center gap-1">
                    <Handshake className="w-3.5 h-3.5 text-purple-400" />
                    Kiến tạo <SortIcon col="totalAssists" />
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.map((s, index) => (
                <tr key={s.player.id} className="hover:bg-white/3 transition-colors group">
                  <td className="px-5 py-4 text-white/30 text-xs">{index + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <span className="text-xs font-bold text-emerald-400">
                          #{s.player.jerseyNumber}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-white">{s.player.name}</p>
                        <Badge
                          variant={
                            ({ GK: 'amber', DEF: 'blue', MID: 'emerald', FWD: 'red' } as const)[s.player.position]
                          }
                          size="sm"
                        >
                          {s.player.position}
                        </Badge>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="font-semibold text-white">{s.matchesPlayed}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={s.matchesAbsent > 2 ? 'text-red-400 font-semibold' : 'text-white/60'}>
                      {s.matchesAbsent}
                    </span>
                  </td>

                  {/* ── Bàn thắng – click để xem chi tiết ── */}
                  <td className="px-5 py-4 text-center">
                    {s.totalGoals > 0 ? (
                      <button
                        onClick={() => openDetail(s, 'goals')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                          bg-amber-500/10 border border-amber-500/20 text-amber-400 font-bold
                          hover:bg-amber-500/20 hover:border-amber-500/40
                          active:scale-95 transition-all cursor-pointer"
                        title="Xem chi tiết bàn thắng"
                      >
                        <Goal className="w-3 h-3" />
                        {s.totalGoals}
                      </button>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>

                  {/* ── Bàn thua – hiển thị số bàn thua ── */}
                  <td className="px-5 py-4 text-center">
                    <span className={s.totalGoalsConceded > 0 ? 'text-red-400 font-semibold' : 'text-white/60'}>
                      {s.totalGoalsConceded}
                    </span>
                  </td>

                  {/* ── Kiến tạo – click để xem chi tiết ── */}
                  <td className="px-5 py-4 text-center">
                    {s.totalAssists > 0 ? (
                      <button
                        onClick={() => openDetail(s, 'assists')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg
                          bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold
                          hover:bg-purple-500/20 hover:border-purple-500/40
                          active:scale-95 transition-all cursor-pointer"
                        title="Xem chi tiết kiến tạo"
                      >
                        <Handshake className="w-3 h-3" />
                        {s.totalAssists}
                      </button>
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5">
          <p className="text-xs text-white/20">
            💡 Click vào số bàn thắng, bàn thua hoặc kiến tạo để xem chi tiết từng trận
          </p>
        </div>
      </div>

      {/* Player Detail Modal */}
      {detail && (
        <PlayerDetailModal
          isOpen={!!detail}
          onClose={() => setDetail(null)}
          player={detail.playerStats.player}
          tab={detail.tab}
          matchDetails={buildMatchDetails(detail.playerStats.player.id)}
          totalGoals={detail.playerStats.totalGoals}
          totalAssists={detail.playerStats.totalAssists}
        />
      )}
    </div>
  );
};