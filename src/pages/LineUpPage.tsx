import React, { useEffect, useRef, useState } from "react";
import type { LineupPlayer, Player } from "../types";
import { initialLineupPlayers } from "../data/mockData";
import LineupPlayerList from "../components/ui/LineupPlayerList";
import LineupPitch from "../components/ui/LineupPitch";
import { applyFormation, getFormation } from "../utils/formation";
import { ChevronDown } from "lucide-react";

const lineupPositionMap: Record<Player["position"], LineupPlayer["position"]> =
  {
    GK: "GK",
    DEF: "DF",
    MID: "MF",
    FWD: "FW",
  };

const toLineupPlayers = (players: Player[]): LineupPlayer[] =>
  players.map((player) => ({
    id: player.id,
    name: player.name,
    position: lineupPositionMap[player.position],
    rating: 7,
    x: 50,
    y: 50,
  }));

interface LineUpPageProps {
  players?: Player[];
}

export const LineUpPage: React.FC<LineUpPageProps> = ({ players }) => {
  const [lineupPlayers, setLineupPlayers] = useState<LineupPlayer[]>([]);
  const syncedKeyRef = useRef<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(true);

  useEffect(() => {
    const list =
      players && players.length > 0
        ? toLineupPlayers(players)
        : initialLineupPlayers;
    const key = list
      .map((p) => p.id)
      .sort()
      .join("|");
    if (key === syncedKeyRef.current) return;
    syncedKeyRef.current = key;
    setLineupPlayers(applyFormation(list, "1-3-2-1"));
  }, [players]);
  // Đội hình hiện tại, suy ra từ tọa độ thực tế của cầu thủ (để đồng bộ
  // khi người dùng kéo thả tự do làm lệch khỏi formation đã chọn)
  const formation = getFormation(lineupPlayers);

  // Khi người dùng CHỌN 1 formation mới (vd từ dropdown trong LineupPlayerList)
  const handleFormationChange = (newFormation: string) => {
    setLineupPlayers((prev) => applyFormation(prev, newFormation));
  };

  const handleMove = (id: string, x: number, y: number) => {
    setLineupPlayers((prev) =>
      prev.map((p) => (p.id === id ? { ...p, x, y } : p)),
    );
  };

  const handleRemove = (id: string) => {
    setLineupPlayers((prev) => prev.filter((p) => p.id !== id));
  };

  const handleSwap = (
    draggedId: string,
    targetId: string,
    startX: number,
    startY: number,
  ) => {
    setLineupPlayers((prev) => {
      const target = prev.find((p) => p.id === targetId);
      if (!target) return prev;
      return prev.map((p) => {
        if (p.id === draggedId) return { ...p, x: target.x, y: target.y };
        if (p.id === targetId) return { ...p, x: startX, y: startY };
        return p;
      });
    });
  };

  const avgRating =
    lineupPlayers.reduce((sum, p) => sum + p.rating, 0) /
    (lineupPlayers.length || 1);
  return (
    <div className="space-y-5">
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl p-5">
        <button
          type="button"
          onClick={() => setIsCollapsed((prev) => !prev)}
          className="flex items-center justify-between w-full"
        >
          <div className="text-left">
            <h1 className="text-lg font-semibold text-white">
              Đội hình (LineUp)
            </h1>
            <p className="text-sm text-white/50 mt-2">
              Đội hình ({lineupPlayers.length} cầu thủ) — Rating TB:{" "}
              {avgRating.toFixed(2)}
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-white/50 transition-transform duration-200 shrink-0 ${isCollapsed && '-rotate-90'}`}
          />
        </button>
      </div>

      {!isCollapsed && (
        <div className="flex flex-col md:flex-row gap-5 items-start">
          <LineupPlayerList
            onReorder={(player) => {
              setLineupPlayers(player);
            }}
            players={lineupPlayers}
            onRemove={handleRemove}
            formation={formation}
            onFormationChange={handleFormationChange}
          />
          <div className="w-full">
            <LineupPitch
              players={lineupPlayers?.slice(0, 7)}
              onMove={handleMove}
              onSwap={handleSwap}
            />
            <p className="mt-2 text-xs text-white/40">
              💡 Kéo thả cầu thủ để di chuyển vị trí
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineUpPage;
