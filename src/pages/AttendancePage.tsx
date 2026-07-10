import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Save, Check, X, CheckCircle2 } from 'lucide-react';
import { matchService } from '../services/matchService';
import { playerService } from '../services/playerService';
import { attendanceService } from '../services/attendanceService';
import type { Match, Player, AttendanceRecord, AttendanceStatus } from '../types';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';
import clsx from 'clsx';

type PositionVariant = 'amber' | 'blue' | 'emerald' | 'red';
const positionBadge: Record<string, PositionVariant> = {
  GK: 'amber',
  DEF: 'blue',
  MID: 'emerald',
  FWD: 'red',
};

export const AttendancePage: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const isPlayer = user?.role === 'Player';
  const canEdit = isAdmin || isPlayer;
  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<string>('');
  const [records, setRecords] = useState<Map<string, AttendanceStatus>>(new Map());
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [ms, ps] = await Promise.all([
      matchService.getAll(),
      playerService.getAll(),
    ]);
    setMatches(ms);
    setPlayers(ps);

    const matchIdFromUrl = searchParams.get('match');
    const defaultMatchId = matchIdFromUrl || (ms.length > 0 ? ms[0].id : '');
    setSelectedMatchId(defaultMatchId);
  }, [searchParams]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedMatchId) return;
    attendanceService.getByMatch(selectedMatchId).then((att) => {
      const map = new Map<string, AttendanceStatus>();
      if (att) {
        att.records.forEach((r) => map.set(r.playerId, r.status));
        setSavedAt(att.savedAt);
      } else {
        setSavedAt(null);
      }
      setRecords(map);
    });
  }, [selectedMatchId]);

  const toggle = (playerId: string, status: AttendanceStatus) => {
    setRecords((prev) => {
      const next = new Map(prev);
      next.set(playerId, status);
      return next;
    });
  };

  const markAll = (status: AttendanceStatus) => {
    const next = new Map<string, AttendanceStatus>();
    players.forEach((p) => next.set(p.id, status));
    setRecords(next);
  };

  const handleSave = async () => {
    if (!selectedMatchId) return;
    setIsSaving(true);
    try {
      const recordList: AttendanceRecord[] = players.map((p) => ({
        playerId: p.id,
        status: records.get(p.id) || 'absent',
      }));
      const saved = await attendanceService.save(selectedMatchId, recordList);
      setSavedAt(saved.savedAt);
      addToast('Lưu điểm danh thành công!', 'success');
    } catch {
      addToast('Lưu điểm danh thất bại!', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const presentCount = [...records.values()].filter((s) => s === 'present').length;
  const absentCount = [...records.values()].filter((s) => s === 'absent').length;
  const visiblePlayers = isPlayer ? players.filter((p) => p.id === user?.playerId) : players;

  return (
    <div className="space-y-5">
      {/* Match Selector */}
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
        <label className="text-sm font-medium text-white/60 mb-2 block">
          Chọn trận đấu
        </label>
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
              vs {m.opponent} — {dayjs(m.date).format('DD/MM/YYYY')} — {m.venue}
            </option>
          ))}
        </select>

        {selectedMatch && (
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="text-xs text-white/40">
              📅 {dayjs(selectedMatch.date).format('dddd, DD/MM/YYYY')}
            </span>
            <span className="text-xs text-white/40">
              📍 {selectedMatch.venue}
            </span>
            {savedAt && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã lưu {dayjs(savedAt).format('HH:mm DD/MM')}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stats + Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">{presentCount} có mặt</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20">
            <X className="w-3.5 h-3.5 text-red-400" />
            <span className="text-sm text-red-400 font-medium">{absentCount} vắng mặt</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {isAdmin && (
            <>
              <Button size="sm" variant="secondary" onClick={() => markAll('present')}>
                Tất cả có mặt
              </Button>
              <Button size="sm" variant="secondary" onClick={() => markAll('absent')}>
                Tất cả vắng
              </Button>
            </>
          )}
          {canEdit && (
            <Button
              leftIcon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              isLoading={isSaving}
              className="w-full sm:w-auto"
            >
              Lưu điểm danh
            </Button>
          )}
        </div>
      </div>

      {/* Player List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {visiblePlayers.map((player) => {
          const status = records.get(player.id);
          const isPresent = status === 'present';
          const isAbsent = status === 'absent';

          return (
            <div
              key={player.id}
              className={clsx(
                'flex items-center gap-3 sm:gap-4 p-4 rounded-xl border transition-all',
                isPresent && 'bg-emerald-500/5 border-emerald-500/30',
                isAbsent && 'bg-red-500/5 border-red-500/20',
                !status && 'bg-gray-900/60 border-white/10'
              )}
            >
              <div
                className={clsx(
                  'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
                  isPresent && 'bg-emerald-500/15',
                  isAbsent && 'bg-red-500/10',
                  !status && 'bg-white/5'
                )}
              >
                <span
                  className={clsx(
                    'text-sm font-bold',
                    isPresent && 'text-emerald-400',
                    isAbsent && 'text-red-400',
                    !status && 'text-white/40'
                  )}
                >
                  #{player.jerseyNumber}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{player.name}</p>
                <Badge variant={positionBadge[player.position]} size="sm">
                  {player.position}
                </Badge>
              </div>
              {canEdit ? (
                <div className="flex items-center gap-1.5 sm:gap-1.5 shrink-0">
                  <button
                    onClick={() => toggle(player.id, 'present')}
                    title="Có mặt"
                    className={clsx(
                      'w-11 h-11 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-all',
                      isPresent
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-white/10 text-white/30 hover:border-emerald-500/50 hover:text-emerald-400'
                    )}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggle(player.id, 'absent')}
                    title="Vắng mặt"
                    className={clsx(
                      'w-11 h-11 sm:w-9 sm:h-9 rounded-lg border flex items-center justify-center transition-all',
                      isAbsent
                        ? 'bg-red-500 border-red-500 text-white'
                        : 'border-white/10 text-white/30 hover:border-red-500/50 hover:text-red-400'
                    )}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Badge variant={isPresent ? 'emerald' : isAbsent ? 'red' : 'gray'} size="sm">
                  {isPresent ? 'Có mặt' : isAbsent ? 'Vắng mặt' : 'Chưa điểm danh'}
                </Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
