import React, { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Save, Goal, Handshake, CheckCircle2, Shield, Users, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { matchService } from "../services/matchService";
import { playerService } from "../services/playerService";
import { attendanceService } from "../services/attendanceService";
import { performanceService } from "../services/performanceService";
import type { Match, Player, MatchPerformanceInput, GoalkeeperStatInput } from "../types";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input, Select } from "../components/ui/FormControls";
import { useToast } from "../contexts/ToastContext";
import dayjs from "dayjs";

type PositionVariant = "amber" | "blue" | "emerald" | "red";
const positionBadge: Record<string, PositionVariant> = {
  GK: "amber",
  DEF: "blue",
  MID: "emerald",
  FWD: "red",
};

interface GoalkeeperRow {
  key: string;
  playerId: string;
  goalsConceded: number;
  matchesPlayed: number;
}

export const PerformancePage: React.FC = () => {
  const { addToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [presentPlayerIds, setPresentPlayerIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedMatchId, setSelectedMatchId] = useState<string>("");
  const [performances, setPerformances] = useState<
    Map<string, { goals: number; assists: number }>
  >(new Map());
  const [goalkeeperRows, setGoalkeeperRows] = useState<GoalkeeperRow[]>([]);
  const [defenderIds, setDefenderIds] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | null>(null);
  const nextRowKey = useRef(0);

  const load = useCallback(async () => {
    const [ms, ps] = await Promise.all([
      matchService.getAll(),
      playerService.getAll(),
    ]);
    // Only past matches
    const pastMatches = ms.filter((m) => !dayjs(m.date).isAfter(dayjs()));
    setMatches(pastMatches);
    setPlayers(ps);

    const matchIdFromUrl = searchParams.get("match");
    const defaultId =
      matchIdFromUrl || (pastMatches.length > 0 ? pastMatches[0].id : "");
    setSelectedMatchId(defaultId);
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedMatchId) return;
    // Load attendance to know which players were present
    attendanceService.getByMatch(selectedMatchId).then((att) => {
      if (att) {
        const presentIds = new Set(
          att.records
            .filter((r) => r.status === "present")
            .map((r) => r.playerId),
        );
        setPresentPlayerIds(presentIds);
      } else {
        setPresentPlayerIds(new Set(players.map((p) => p.id)));
      }
    });

    // Load saved performance / goalkeeper / defender data
    Promise.all([
      performanceService.getByMatch(selectedMatchId),
      performanceService.getGoalkeeperStats(selectedMatchId),
      performanceService.getDefenders(selectedMatchId),
    ]).then(([perfRows, gkRows, defenderRows]) => {
      const perfMap = new Map<string, { goals: number; assists: number }>();
      perfRows.forEach((p) => perfMap.set(p.playerId, { goals: p.goals, assists: p.assists }));
      setPerformances(perfMap);

      setGoalkeeperRows(
        gkRows.map((r) => ({
          key: `gk-${nextRowKey.current++}`,
          playerId: r.playerId,
          goalsConceded: r.goalsConceded,
          matchesPlayed: r.matchesPlayed,
        })),
      );

      setDefenderIds(new Set(defenderRows.map((d) => d.playerId)));

      const timestamps = [
        ...perfRows.map((r) => r.createdAt),
        ...gkRows.map((r) => r.createdAt),
        ...defenderRows.map((r) => r.createdAt),
      ].sort();
      setSavedAt(timestamps.length > 0 ? timestamps[timestamps.length - 1] : null);
    });
  }, [selectedMatchId, players]);

  const updateStat = (
    playerId: string,
    field: "goals" | "assists",
    value: number,
  ) => {
    setPerformances((prev) => {
      const next = new Map(prev);
      const current = next.get(playerId) || { goals: 0, assists: 0 };
      next.set(playerId, { ...current, [field]: Math.max(0, value) });
      return next;
    });
  };

  const addGoalkeeperRow = () => {
    setGoalkeeperRows((prev) => [
      ...prev,
      { key: `gk-${nextRowKey.current++}`, playerId: "", goalsConceded: 0, matchesPlayed: 1 },
    ]);
  };

  const updateGoalkeeperRow = (key: string, patch: Partial<GoalkeeperRow>) => {
    setGoalkeeperRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const removeGoalkeeperRow = (key: string) => {
    setGoalkeeperRows((prev) => prev.filter((r) => r.key !== key));
  };

  const toggleDefender = (playerId: string) => {
    setDefenderIds((prev) => {
      const next = new Set(prev);
      if (next.has(playerId)) next.delete(playerId);
      else next.add(playerId);
      return next;
    });
  };

  const handleSave = async () => {
    if (!selectedMatchId) return;

    const gkRows = goalkeeperRows.filter((r) => r.playerId);
    const seenPlayerIds = new Set<string>();
    for (const row of gkRows) {
      if (seenPlayerIds.has(row.playerId)) {
        addToast("Một thủ môn không thể có nhiều hơn một dòng trong cùng một trận!", "error");
        return;
      }
      seenPlayerIds.add(row.playerId);
      if (!(row.matchesPlayed > 0 && row.matchesPlayed <= 1)) {
        addToast("Số trận của thủ môn phải lớn hơn 0 và không vượt quá 1!", "error");
        return;
      }
    }

    setIsSaving(true);
    try {
      const perfList: MatchPerformanceInput[] = activePlayers.map((p) => {
        const v = performances.get(p.id) || { goals: 0, assists: 0 };
        return { playerId: p.id, goals: v.goals, assists: v.assists };
      });
      const gkList: GoalkeeperStatInput[] = gkRows.map((r) => ({
        playerId: r.playerId,
        goalsConceded: r.goalsConceded,
        matchesPlayed: Number(r.matchesPlayed.toFixed(2)),
      }));

      await Promise.all([
        performanceService.upsertPerformances(selectedMatchId, perfList),
        performanceService.upsertGoalkeeperStats(selectedMatchId, gkList),
        performanceService.setDefenders(selectedMatchId, [...defenderIds]),
      ]);
      setSavedAt(dayjs().toISOString());
      addToast("Lưu thống kê sau trận thành công!", "success");
    } catch {
      addToast("Có lỗi khi lưu!", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const activePlayers = players.filter((p) => presentPlayerIds.has(p.id));
  const selectedMatch = matches.find((m) => m.id === selectedMatchId);
  const totalGoals = [...performances.values()].reduce((s, v) => s + v.goals, 0);
  const totalAssists = [...performances.values()].reduce((s, v) => s + v.assists, 0);

  const playerOptions = [
    { value: "", label: "-- Chọn cầu thủ --" },
    ...activePlayers.map((p) => ({ value: p.id, label: `#${p.jerseyNumber} ${p.name}` })),
  ];

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
                vs {m.opponent} — {dayjs(m.date).format("DD/MM/YYYY")}
              </option>
            ))}
          </select>
        )}
        {selectedMatch && (
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="text-xs text-white/40">
              📍 {selectedMatch.venue}
            </span>
            {savedAt && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Đã lưu {dayjs(savedAt).format("HH:mm DD/MM")}
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
            <span className="text-sm text-amber-400 font-medium">
              {totalGoals} bàn thắng
            </span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
            <Handshake className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-sm text-purple-400 font-medium">
              {totalAssists} kiến tạo
            </span>
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

      {/* Goals / Assists — cards on mobile so the +/- steppers get full-size
          touch targets, table on sm+ where 3 narrow columns fit comfortably */}
      {matches.length > 0 && (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <p className="text-sm text-white/50">
              Chỉ hiển thị {activePlayers.length} cầu thủ có mặt trong trận
            </p>
          </div>

          <div className="sm:hidden divide-y divide-white/5">
            {activePlayers.map((player) => {
              const perf = performances.get(player.id) || { goals: 0, assists: 0 };
              return (
                <div key={player.id} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-emerald-400">
                        #{player.jerseyNumber}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white truncate">{player.name}</p>
                      <Badge variant={positionBadge[player.position]} size="sm">
                        {player.position}
                      </Badge>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/3 border border-white/5">
                      <span className="flex items-center gap-1 text-xs text-amber-400 shrink-0">
                        <Goal className="w-3.5 h-3.5" />Bàn
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateStat(player.id, "goals", perf.goals - 1)}
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50
                            hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30
                            transition-all text-sm font-bold shrink-0"
                        >
                          −
                        </button>
                        <span className={`w-6 text-center font-bold text-lg ${perf.goals > 0 ? "text-amber-400" : "text-white/30"}`}>
                          {perf.goals}
                        </span>
                        <button
                          onClick={() => updateStat(player.id, "goals", perf.goals + 1)}
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50
                            hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30
                            transition-all text-sm font-bold shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/3 border border-white/5">
                      <span className="flex items-center gap-1 text-xs text-purple-400 shrink-0">
                        <Handshake className="w-3.5 h-3.5" />KT
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateStat(player.id, "assists", perf.assists - 1)}
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50
                            hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30
                            transition-all text-sm font-bold shrink-0"
                        >
                          −
                        </button>
                        <span className={`w-6 text-center font-bold text-lg ${perf.assists > 0 ? "text-purple-400" : "text-white/30"}`}>
                          {perf.assists}
                        </span>
                        <button
                          onClick={() => updateStat(player.id, "assists", perf.assists + 1)}
                          className="w-9 h-9 rounded-lg bg-white/5 border border-white/10 text-white/50
                            hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30
                            transition-all text-sm font-bold shrink-0"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hidden sm:block overflow-x-auto">
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
                    <tr
                      key={player.id}
                      className="hover:bg-white/3 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">
                              #{player.jerseyNumber}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-white">
                              {player.name}
                            </p>
                            <Badge
                              variant={positionBadge[player.position]}
                              size="sm"
                            >
                              {player.position}
                            </Badge>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              updateStat(player.id, "goals", perf.goals - 1)
                            }
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/50
                              hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/30
                              transition-all text-sm font-bold"
                          >
                            −
                          </button>
                          <span
                            className={`w-8 text-center font-bold text-lg ${
                              perf.goals > 0
                                ? "text-amber-400"
                                : "text-white/30"
                            }`}
                          >
                            {perf.goals}
                          </span>
                          <button
                            onClick={() =>
                              updateStat(player.id, "goals", perf.goals + 1)
                            }
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
                            onClick={() =>
                              updateStat(player.id, "assists", perf.assists - 1)
                            }
                            className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 text-white/50
                              hover:bg-purple-500/10 hover:text-purple-400 hover:border-purple-500/30
                              transition-all text-sm font-bold"
                          >
                            −
                          </button>
                          <span
                            className={`w-8 text-center font-bold text-lg ${
                              perf.assists > 0
                                ? "text-purple-400"
                                : "text-white/30"
                            }`}
                          >
                            {perf.assists}
                          </span>
                          <button
                            onClick={() =>
                              updateStat(player.id, "assists", perf.assists + 1)
                            }
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

      {/* Goalkeeper sub-form */}
      {matches.length > 0 && (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Thủ môn</h3>
            </div>
            <Button
              size="sm"
              variant="secondary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={addGoalkeeperRow}
            >
              Thêm thủ môn
            </Button>
          </div>
          <div className="p-5 space-y-3">
            {goalkeeperRows.length === 0 ? (
              <p className="text-sm text-white/30">Chưa có thủ môn nào được ghi nhận cho trận này.</p>
            ) : (
              goalkeeperRows.map((row) => (
                <div
                  key={row.key}
                  className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-3 p-3 rounded-xl bg-white/3 border border-white/5"
                >
                  <div className="w-full sm:flex-1 sm:min-w-[200px]">
                    <Select
                      label="Cầu thủ"
                      value={row.playerId}
                      onChange={(e) => updateGoalkeeperRow(row.key, { playerId: e.target.value })}
                      options={playerOptions}
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:flex gap-3 w-full sm:w-auto">
                    <div className="sm:w-28">
                      <Input
                        label="Bàn thua"
                        type="number"
                        min={0}
                        step={1}
                        value={row.goalsConceded}
                        onChange={(e) =>
                          updateGoalkeeperRow(row.key, { goalsConceded: Math.max(0, Number(e.target.value) || 0) })
                        }
                      />
                    </div>
                    <div className="sm:w-32">
                      <Input
                        label="Số trận (0-1)"
                        type="number"
                        min={0.01}
                        max={1}
                        step={0.05}
                        value={row.matchesPlayed}
                        onChange={(e) =>
                          updateGoalkeeperRow(row.key, { matchesPlayed: Number(e.target.value) || 0 })
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeGoalkeeperRow(row.key)}
                    title="Xóa dòng"
                    className="self-end sm:self-auto w-full sm:w-auto flex items-center justify-center gap-2 min-h-[44px] sm:min-h-0 p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span className="sm:hidden text-sm">Xóa dòng</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Defenders checklist */}
      {matches.length > 0 && (
        <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Hậu vệ tham gia trận</h3>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {activePlayers.map((player) => {
              const checked = defenderIds.has(player.id);
              return (
                <label
                  key={player.id}
                  className={clsx(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all",
                    checked
                      ? "bg-blue-500/10 border-blue-500/30"
                      : "bg-white/3 border-white/5 hover:border-white/10",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleDefender(player.id)}
                    className="w-4 h-4 accent-blue-500"
                  />
                  <span className="text-sm text-white">
                    #{player.jerseyNumber} {player.name}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
