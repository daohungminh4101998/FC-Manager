import React, { useEffect, useState, useCallback, useMemo } from 'react';
import dayjs from 'dayjs';
import { playerService } from '../services/playerService';
import { attendanceService } from '../services/attendanceService';
import { performanceService } from '../services/performanceService';
import { matchService } from '../services/matchService';
import type {
  PlayerStats,
  Player,
  Match,
  Attendance,
  MatchPerformance,
  GoalkeeperStat,
  MatchDefender,
} from '../types';
import { SearchInput } from '../components/ui/SearchInput';
import { Badge } from '../components/ui/Badge';
import { PlayerDetailModal, type DetailTab } from '../components/ui/PlayerDetailModal';
import { MatchStatModal, type MatchStatRow } from '../components/ui/MatchStatModal';
import { Goal, Handshake, Calendar, XCircle, TrendingUp, X, Shield, Users } from 'lucide-react';

type SortKey = 'name' | 'matchesPlayed' | 'matchesAbsent' | 'totalGoals' | 'totalAssists' | 'totalGoalsConceded';
type YearFilter = 'all' | number;

interface DetailState {
  playerStats: PlayerStats;
  tab: DetailTab;
}

interface GoalkeeperRanking {
  player: Player;
  totalConceded: number;
  totalMatchesPlayed: number;
  concededPerMatch: number;
}

interface DefenderRanking {
  player: Player;
  matchesCount: number;
}

export const StatisticsPage: React.FC = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [allAttendances, setAllAttendances] = useState<Attendance[]>([]);
  const [allMatches, setAllMatches] = useState<Match[]>([]);
  const [allPerformances, setAllPerformances] = useState<(MatchPerformance & { match: Match })[]>([]);
  const [allGoalkeeperStats, setAllGoalkeeperStats] = useState<(GoalkeeperStat & { match: Match })[]>([]);
  const [allDefenders, setAllDefenders] = useState<(MatchDefender & { match: Match })[]>([]);

  const [year, setYear] = useState<YearFilter>('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('totalGoals');
  const [sortAsc, setSortAsc] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState<DetailState | null>(null);
  const [gkDetail, setGkDetail] = useState<{ player: Player; rows: MatchStatRow[] } | null>(null);
  const [defDetail, setDefDetail] = useState<{ player: Player; rows: MatchStatRow[] } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [ps, attendances, matches, performances, gkStats, defenders] = await Promise.all([
      playerService.getAll(),
      attendanceService.getAll(),
      matchService.getAll(),
      performanceService.getAllPerformances(),
      performanceService.getAllGoalkeeperStats(),
      performanceService.getAllDefenders(),
    ]);

    setPlayers(ps);
    setAllAttendances(attendances);
    setAllMatches(matches);
    setAllPerformances(performances);
    setAllGoalkeeperStats(gkStats);
    setAllDefenders(defenders);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const availableYears = useMemo(() => {
    const years = new Set(allMatches.map((m) => dayjs(m.date).year()));
    return [...years].sort((a, b) => b - a);
  }, [allMatches]);

  const pastMatchIds = useMemo(() => {
    return new Set(
      allMatches
        .filter((m) => !dayjs(m.date).isAfter(dayjs()))
        .filter((m) => year === 'all' || dayjs(m.date).year() === year)
        .map((m) => m.id)
    );
  }, [allMatches, year]);

  const yearPerformances = useMemo(
    () => allPerformances.filter((p) => year === 'all' || dayjs(p.match.date).year() === year),
    [allPerformances, year]
  );
  const yearGoalkeeperStats = useMemo(
    () => allGoalkeeperStats.filter((g) => year === 'all' || dayjs(g.match.date).year() === year),
    [allGoalkeeperStats, year]
  );
  const yearDefenders = useMemo(
    () => allDefenders.filter((d) => year === 'all' || dayjs(d.match.date).year() === year),
    [allDefenders, year]
  );

  const stats: PlayerStats[] = useMemo(() => {
    return players.map((player) => {
      const playerAttendances = allAttendances.filter((a) => pastMatchIds.has(a.matchId));

      const matchesPlayed = playerAttendances.filter((a) =>
        a.records.find((r) => r.playerId === player.id && r.status === 'present')
      ).length;

      const matchesAbsent = playerAttendances.filter((a) =>
        a.records.find((r) => r.playerId === player.id && r.status === 'absent')
      ).length;

      const totalGoals = yearPerformances
        .filter((p) => p.playerId === player.id)
        .reduce((sum, p) => sum + p.goals, 0);

      const totalAssists = yearPerformances
        .filter((p) => p.playerId === player.id)
        .reduce((sum, p) => sum + p.assists, 0);

      const totalGoalsConceded = yearGoalkeeperStats
        .filter((g) => g.playerId === player.id)
        .reduce((sum, g) => sum + g.goalsConceded, 0);

      return { player, matchesPlayed, matchesAbsent, totalGoals, totalAssists, totalGoalsConceded };
    });
  }, [players, allAttendances, pastMatchIds, yearPerformances, yearGoalkeeperStats]);

  const topScorers = useMemo(
    () => stats.filter((s) => s.totalGoals > 0).sort((a, b) => b.totalGoals - a.totalGoals),
    [stats]
  );
  const topAssisters = useMemo(
    () => stats.filter((s) => s.totalAssists > 0).sort((a, b) => b.totalAssists - a.totalAssists),
    [stats]
  );

  const goalkeeperRankings: GoalkeeperRanking[] = useMemo(() => {
    const byPlayer = new Map<string, { totalConceded: number; totalMatchesPlayed: number }>();
    yearGoalkeeperStats.forEach((g) => {
      const current = byPlayer.get(g.playerId) || { totalConceded: 0, totalMatchesPlayed: 0 };
      current.totalConceded += g.goalsConceded;
      current.totalMatchesPlayed += g.matchesPlayed;
      byPlayer.set(g.playerId, current);
    });

    const rankings: GoalkeeperRanking[] = [];
    byPlayer.forEach((value, playerId) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;
      rankings.push({
        player,
        totalConceded: value.totalConceded,
        totalMatchesPlayed: value.totalMatchesPlayed,
        concededPerMatch: value.totalMatchesPlayed > 0
          ? Number((value.totalConceded / value.totalMatchesPlayed).toFixed(2))
          : 0,
      });
    });

    return rankings.sort((a, b) => a.concededPerMatch - b.concededPerMatch);
  }, [yearGoalkeeperStats, players]);

  const defenderRankings: DefenderRanking[] = useMemo(() => {
    const byPlayer = new Map<string, number>();
    yearDefenders.forEach((d) => byPlayer.set(d.playerId, (byPlayer.get(d.playerId) ?? 0) + 1));

    const rankings: DefenderRanking[] = [];
    byPlayer.forEach((count, playerId) => {
      const player = players.find((p) => p.id === playerId);
      if (!player) return;
      rankings.push({ player, matchesCount: count });
    });

    return rankings.sort((a, b) => b.matchesCount - a.matchesCount);
  }, [yearDefenders, players]);

  /** Tính danh sách trận với bàn thắng/kiến tạo cho một cầu thủ */
  const buildMatchDetails = (playerId: string) => {
    return yearPerformances
      .filter((p) => p.playerId === playerId && (p.goals > 0 || p.assists > 0))
      .map((p) => ({ match: p.match, goals: p.goals, assists: p.assists }))
      .sort((a, b) => dayjs(b.match.date).diff(dayjs(a.match.date)));
  };

  const openDetail = (s: PlayerStats, tab: DetailTab) => {
    setDetail({ playerStats: s, tab });
  };

  const openGoalkeeperDetail = (ranking: GoalkeeperRanking) => {
    const rows: MatchStatRow[] = yearGoalkeeperStats
      .filter((g) => g.playerId === ranking.player.id)
      .sort((a, b) => dayjs(b.match.date).diff(dayjs(a.match.date)))
      .map((g) => ({
        match: g.match,
        columns: [
          { label: 'Bàn thua', value: g.goalsConceded },
          { label: 'Số trận', value: g.matchesPlayed.toFixed(2) },
        ],
      }));
    setGkDetail({ player: ranking.player, rows });
  };

  const openDefenderDetail = (ranking: DefenderRanking) => {
    const rows: MatchStatRow[] = yearDefenders
      .filter((d) => d.playerId === ranking.player.id)
      .sort((a, b) => dayjs(b.match.date).diff(dayjs(a.match.date)))
      .map((d) => ({ match: d.match, columns: [] }));
    setDefDetail({ player: ranking.player, rows });
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
      {/* Year filter */}
      <div className="flex items-center gap-2">
        <label className="text-xs text-white/40">Năm</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="px-3 py-1.5 rounded-lg text-sm text-white bg-gray-800 border border-white/10
            focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
        >
          <option value="all">Tất cả</option>
          {availableYears.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {topScorer && topScorer.totalGoals > 0 && (
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
        {topAssist && topAssist.totalAssists > 0 && (
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
        {mostPresent && mostPresent.matchesPlayed > 0 && (
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

      {/* Player stats — cards on mobile (7 columns is too dense for horizontal
          scroll to stay usable), sortable table on sm+ */}
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
        <div className="sm:hidden divide-y divide-white/5">
          {filtered.map((s, index) => (
            <div key={s.player.id} className="p-4">
              <div className="flex items-center gap-3">
                <span className="text-xs text-white/30 w-4 shrink-0">{index + 1}</span>
                <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-emerald-400">
                    #{s.player.jerseyNumber}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{s.player.name}</p>
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
              <div className="grid grid-cols-4 gap-2 mt-3 text-center">
                <div>
                  <p className="text-[10px] text-white/40 uppercase flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3" />Tham dự
                  </p>
                  <p className="text-sm font-semibold text-white mt-0.5">{s.matchesPlayed}</p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase flex items-center justify-center gap-1">
                    <XCircle className="w-3 h-3" />Vắng
                  </p>
                  <p className={`text-sm font-semibold mt-0.5 ${s.matchesAbsent > 2 ? 'text-red-400' : 'text-white/60'}`}>
                    {s.matchesAbsent}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase flex items-center justify-center gap-1">
                    <Goal className="w-3 h-3" />Bàn
                  </p>
                  {s.totalGoals > 0 ? (
                    <button
                      onClick={() => openDetail(s, 'goals')}
                      className="text-sm font-bold text-amber-400 mt-0.5 active:scale-95 transition-all"
                    >
                      {s.totalGoals}
                    </button>
                  ) : (
                    <p className="text-sm text-white/20 mt-0.5">—</p>
                  )}
                </div>
                <div>
                  <p className="text-[10px] text-white/40 uppercase flex items-center justify-center gap-1">
                    <Handshake className="w-3 h-3" />Kiến tạo
                  </p>
                  {s.totalAssists > 0 ? (
                    <button
                      onClick={() => openDetail(s, 'assists')}
                      className="text-sm font-bold text-purple-400 mt-0.5 active:scale-95 transition-all"
                    >
                      {s.totalAssists}
                    </button>
                  ) : (
                    <p className="text-sm text-white/20 mt-0.5">—</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-center gap-1 mt-2 text-xs text-white/40">
                <X className="w-3 h-3 text-red-400" />
                Bàn thua: <span className={s.totalGoalsConceded > 0 ? 'text-red-400 font-semibold' : 'text-white/60'}>{s.totalGoalsConceded}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden sm:block overflow-x-auto">
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

      {/* Ranking tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Table 1 — Vua phá lưới */}
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
            <Goal className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-semibold text-white">Vua phá lưới</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 w-8">#</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase">Cầu thủ</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-white/40 uppercase">Bàn thắng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topScorers.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-6 text-center text-white/30 text-sm">Chưa có dữ liệu</td></tr>
                ) : (
                  topScorers.map((s, i) => (
                    <tr
                      key={s.player.id}
                      className="hover:bg-white/3 transition-colors cursor-pointer"
                      onClick={() => openDetail(s, 'goals')}
                    >
                      <td className="px-5 py-3 text-white/30 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 text-white font-medium">{s.player.name}</td>
                      <td className="px-5 py-3 text-center text-amber-400 font-bold">{s.totalGoals}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 2 — Vua kiến tạo */}
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
            <Handshake className="w-4 h-4 text-purple-400" />
            <h3 className="text-sm font-semibold text-white">Vua kiến tạo</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 w-8">#</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase">Cầu thủ</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-white/40 uppercase">Kiến tạo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {topAssisters.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-6 text-center text-white/30 text-sm">Chưa có dữ liệu</td></tr>
                ) : (
                  topAssisters.map((s, i) => (
                    <tr
                      key={s.player.id}
                      className="hover:bg-white/3 transition-colors cursor-pointer"
                      onClick={() => openDetail(s, 'assists')}
                    >
                      <td className="px-5 py-3 text-white/30 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 text-white font-medium">{s.player.name}</td>
                      <td className="px-5 py-3 text-center text-purple-400 font-bold">{s.totalAssists}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 3 — Thủ môn xuất sắc nhất */}
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
            <Shield className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Thủ môn xuất sắc nhất</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 w-8">#</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase">Cầu thủ</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-white/40 uppercase">Bàn thua</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-white/40 uppercase">Số trận</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-white/40 uppercase">Bàn thua/trận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {goalkeeperRankings.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-6 text-center text-white/30 text-sm">Chưa có dữ liệu</td></tr>
                ) : (
                  goalkeeperRankings.map((r, i) => (
                    <tr
                      key={r.player.id}
                      className="hover:bg-white/3 transition-colors cursor-pointer"
                      onClick={() => openGoalkeeperDetail(r)}
                    >
                      <td className="px-5 py-3 text-white/30 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 text-white font-medium">{r.player.name}</td>
                      <td className="px-5 py-3 text-center text-red-400 font-semibold">{r.totalConceded}</td>
                      <td className="px-5 py-3 text-center text-white/70">{r.totalMatchesPlayed.toFixed(2)}</td>
                      <td className="px-5 py-3 text-center text-blue-400 font-bold">{r.concededPerMatch.toFixed(2)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Table 4 — Hậu vệ tham gia nhiều nhất */}
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3.5 border-b border-white/5 flex items-center gap-2">
            <Users className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-white">Hậu vệ tham gia nhiều nhất</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 w-8">#</th>
                  <th className="px-5 py-3 text-left text-xs font-medium text-white/40 uppercase">Cầu thủ</th>
                  <th className="px-5 py-3 text-center text-xs font-medium text-white/40 uppercase">Số trận</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {defenderRankings.length === 0 ? (
                  <tr><td colSpan={3} className="px-5 py-6 text-center text-white/30 text-sm">Chưa có dữ liệu</td></tr>
                ) : (
                  defenderRankings.map((r, i) => (
                    <tr
                      key={r.player.id}
                      className="hover:bg-white/3 transition-colors cursor-pointer"
                      onClick={() => openDefenderDetail(r)}
                    >
                      <td className="px-5 py-3 text-white/30 text-xs">{i + 1}</td>
                      <td className="px-5 py-3 text-white font-medium">{r.player.name}</td>
                      <td className="px-5 py-3 text-center text-emerald-400 font-bold">{r.matchesCount}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Player Detail Modal (goals / assists) */}
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

      {/* Goalkeeper Detail Modal */}
      {gkDetail && (
        <MatchStatModal
          isOpen={!!gkDetail}
          onClose={() => setGkDetail(null)}
          player={gkDetail.player}
          title="Thống kê thủ môn"
          rows={gkDetail.rows}
        />
      )}

      {/* Defender Detail Modal */}
      {defDetail && (
        <MatchStatModal
          isOpen={!!defDetail}
          onClose={() => setDefDetail(null)}
          player={defDetail.player}
          title="Các trận đá hậu vệ"
          rows={defDetail.rows}
        />
      )}
    </div>
  );
};
