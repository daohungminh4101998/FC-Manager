import { useState } from "react";
import { LINEUP_POSITION_COLORS, type LineupPlayer } from "../../types";

interface LineupPlayerListProps {
  players: LineupPlayer[];
  onRemove: (id: string) => void;
  formation: string;
  onFormationChange: (formation: string) => void;
  onReorder?: (players: LineupPlayer[]) => void;
}

const formations = [
  { id: "1-3-2-1", name: "1-3-2-1" },
  { id: "1-2-3-1", name: "1-2-3-1" },
  { id: "1-3-1-2", name: "1-3-1-2" },
  { id: "1-2-2-2", name: "1-2-2-2" },
  { id: "1-2-1-3", name: "1-2-1-3" },
  { id: "1-3-3", name: "1-3-3" },
];

export default function LineupPlayerList({
  players,
  onFormationChange,
  onReorder,
}: LineupPlayerListProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handlePlayerClick = (index: number) => {
    if (selectedIndex === null) {
      setSelectedIndex(index);
    } else if (selectedIndex !== index) {
      const newPlayers = [...players];
      const playerOld = newPlayers[selectedIndex];
      const playerNew = newPlayers[index];
      newPlayers[selectedIndex] = { ...playerNew, x: playerOld.x, y: playerOld.y };
      newPlayers[index] = { ...playerOld, x: playerNew.x, y: playerNew.y };
      setSelectedIndex(null);
      onReorder?.(newPlayers);
      setSelectedIndex(null);
    } else {
      setSelectedIndex(null);
    }
  };

  const renderPlayerItem = (p: LineupPlayer, index: number) => (
    <li
      key={p.id}
      onClick={() => handlePlayerClick(index)}
      className={`flex items-center justify-between px-2 py-1.5 rounded hover:bg-slate-700 cursor-pointer transition-colors ${
        selectedIndex === index ? "bg-sky-900/50 ring-1 ring-sky-500" : ""
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-bold ${LINEUP_POSITION_COLORS[p.position].split(" ")[1]}`}
        >
          {p.position}
        </span>
        <span className="text-sm">{p.name}</span>
      </div>
      {selectedIndex === index && (
        <span className="text-xs text-sky-400">✓ Đã chọn</span>
      )}
    </li>
  );

  return (
    <div className="w-64 bg-slate-800 rounded-lg p-3 text-white">
      <h2 className="font-bold mb-2">Danh sách cầu thủ ({players.length})</h2>
      <label className="block text-xs text-slate-300 font-medium mb-1">
        Sơ đồ
      </label>
      <select
        onChange={(e) => onFormationChange(e.target.value)}
        className="w-full mb-3 px-2 py-1.5 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:ring-1 focus:ring-sky-500"
      >
        {formations.map((f) => (
          <option key={f.id} value={f.id}>
            {f.name}
          </option>
        ))}
      </select>
      {selectedIndex !== null && (
        <p className="text-xs text-sky-400 mb-2">
          Click vào cầu thủ khác để đổi chỗ
        </p>
      )}
      <ul className="space-y-1">
        {players?.slice(0, 7).map((p, i) => renderPlayerItem(p, i))}
        <hr />
        {players
          ?.slice(7, players?.length)
          .map((p, i) => renderPlayerItem(p, 7 + i))}
      </ul>
    </div>
  );
}
