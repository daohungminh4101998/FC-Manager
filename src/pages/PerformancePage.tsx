import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Goal, Handshake, CheckCircle2 } from 'lucide-react';
import { matchService } from '../services/matchService';
import { playerService } from '../services/playerService';
import { attendanceService } from '../services/attendanceService';
import { performanceService } from '../services/performanceService';
import type { Match, Player, PlayerPerformance } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';
import dayjs from 'dayjs';

type PositionVariant = 'amber' | 'blue' | 'emerald' | 'red';
const positionBadge: Record<string, PositionVariant> = {
  GK: 'amber', DEF: 'blue', MID: 'emerald', FWD: 'red',
};

export const PerformancePage: React.FC = () => {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(new Set());
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [performances, setPerformances] = useState<Map<string, { goals: number; assists: number }>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [ms, ps] = await Promise.all([
      matchService.getAll(),
      playerService.getAll(),
    ]);
    // Only past matches
    const pastMatches = ms.filter((m) => !dayjs(m.date).isAfter(dayjs()));
    setMatches(pastMatches);
    setPlayers(ps);

    const matchIdFromUrl = searchParams.get('match');
    const defaultId = matchIdFromUrl || (pastMatches.length > 0 ? pastMatches[0].id : '');
    setSelectedMatchId(defaultId);
  }, [searchParams]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedMatchId) return;

    // Load attendance to know which players were present
    attendanceService.getByMatch(selectedMatchId).then((att) => {
      if (att) {
        const presentIds = new Set(
          att.records.filter((r) => r.status === 'present').map((r) => r.playerId)
        );
        setPresentPlayerIds(presentIds);
      } else {
        setPresentPlayerIds(new Set(players.map((p) => p.id)));
      }
    });

    // Load saved performance
    performanceService.getByMatch(selectedMatchId).then((perf) => {
      const map = new Map<string, { goals: number; assists: number }>();
      if (perf) {
        perf.performances.forEach((p) => map.set(p.playerId, { goals: p.goals, assists: p.assists }));
        setSavedAt(perf.savedAt);
      } else {
        setSavedAt(null);
      }
      setPerformances(map);
    });
  }, [selectedMatchId, players]);

  const updateStat = (
    playerId: string,
    field: 'goals' | 'assists',
    value: number
  ) => {
    setPerformances((prev) => {
      const next = new Map(prev);
      const current = next.get(playerId) || { goals: 0, assists: 0 };
      next.set(playerId, { ...current, [field]: Math.max(0, value) });
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedMatchId) return;
    setIsSaving(true);
    try {
      const perfList: PlayerPerformance[] = [];
      performances.forEach((v, playerId) => {
        if (v.goals > 0 || v.assists > 0) {
          perfList.push({ playerId, goals: v.goals, assists: v.assists });
        }
      });
      const saved = await performanceService.save(selectedMatchId, perfList);
      setSavedAt(saved.savedAt);
      addToast('Lưu thống kê sau trận thành công!', 'success');
    } catch {
      addToast('Có lỗi khi lưu!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const activePlayers = players.filter((p) => presentPlayerIds.has(p.id));
  const selectedMatch = matches.find((m) => m.id === selectedMatchId);

  const totalGoals = [...performances.values()].reduce((s, v) => s + v.goals, 0);
  const totalAssists = [...performances.values()].reduce((s, v) => s + v.assists, 0);

  return (
    <div className="space-y-5">
      {/* Match Selector */}
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
        <label className="text-sm font-medium text-white/60 mb-2 block">
          Chọn trận đấu (chỉ trận đã đấu)
        </label>
        {matches.length === 0 ? (
          <p className="text-sm text-white/30">Chưa có trận nào đã đấu.</p>
        ) : (
          <select
            value={selectedMatchId}
            onChange={(e) => {
              setSelectedMatchId(e.target.value);
              setSearchParams({ match: e.target.value });
            }}
            className="w-full sm:w-96 px-3.5 py-2.5 rounded-lg text-sm text-white
              bg-gray-800 border border-white/10 focus:outline-none
              focus:ring-2 focus:ring-emerald-500/50"
          >
            {matches.map((m) => (
              <option key={m.id} value={m.id}>
                vs {m.opponent} — {dayjs(m.date).format('DD/MM/YYYY')}
              </option>
            ))}
          </select>
        )}
        {selectedMatch && (
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="text-xs text-white/40">📍 {selectedMatch.venue}</span>
            {savedAt && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã lưu {dayjs(savedAt).format('HH:mm DD/MM')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20">
            <Goal className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-sm text-amber-400 font-medium">{totalGoals} bàn thắng</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Handshake className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">{totalAssists} kiến tạo</span>
          </div>
        </div>
        <Button
          leftIcon={<Save className="w-4 h-4" />}
          onClick={handleSave}
          isLoading={isSaving}
          disabled={matches.length === 0}
        >
          Lưu thống kê
        </Button>
      </div>

      {/* Performance Table */}
      {matches.length > 0 && (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <p className="text-sm text-white/50">
              Chỉ hiển thị {activePlayers.length} cầu thủ có mặt trong trận
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase">
                    Cầu thủ
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-medium text-white/40 uppercase">
                    <div className="flex items-center justify-center gap-1">
                      <Goal className="w-3.5 h-3.5 text-amber-400" />
                      Bàn thắng
                    </div>
                  </th>
                  <th className="px-5 py-3.5 text-center text-xs font-medium text-white/40 uppercase">
                    <div className="flex items-center justify-center gap-1">
                      <Handshake className="w-3.5 h-3.5 text-purple-400" />
                      Kiến tạo
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activePlayers.map((player) => {
                  const perf = performances.get(player.id) || { goals: 0, assists: 0 };
                  return (
                    <tr key={player.id} className="hover:bg-white/3 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">
                              #{player.jerseyNumber}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">{player.name}</p>
                            <Badge variant={positionBadge[player.position]} size="sm">
                              {player.position}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateStat(player.id, 'goals', perf.goals - 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/50
                              hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30
                              transition-all text-sm font-bold"
                          >
                            −
                          </button>
                          <span
                            className={`w-8 text-center font-bold text-lg ${
                              perf.goals > 0 ? 'text-amber-400' : 'text-white/30'
                            }`}
                          >
                            {perf.goals}
                          </span>
                          <button
                            onClick={() => updateStat(player.id, 'goals', perf.goals + 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/50
                              hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30
                              transition-all text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => updateStat(player.id, 'assists', perf.assists - 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/50
                              hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30
                              transition-all text-sm font-bold"
                          >
                            −
                          </button>
                          <span
                            className={`w-8 text-center font-bold text-lg ${
                              perf.assists > 0 ? 'text-purple-400' : 'text-white/30'
                            }`}
                          >
                            {perf.assists}
                          </span>
                          <button
                            onClick={() => updateStat(player.id, 'assists', perf.assists + 1)}
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/50
                              hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30
                              transition-all text-sm font-bold"
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
