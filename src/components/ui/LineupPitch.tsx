import type { LineupPlayer } from "../../types";
import LineupPlayerToken from "./LineupPlayerToken";
import pitch from "../../assets/pitch/pitch.jpg";
interface LineupPitchProps {
  players: LineupPlayer[];
  onMove: (id: string, x: number, y: number) => void;
  onSwap: (
    draggedId: string,
    targetId: string,
    startX: number,
    startY: number,
  ) => void;
}

export default function LineupPitch({
  players,
  onMove,
  onSwap,
}: LineupPitchProps) {
  return (
    <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden shadow-xl">
      {/* Background sân bóng - thay đường dẫn bằng ảnh của bạn */}
      <img
        src={pitch}
        alt="Sân bóng"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />
      {players.map((p) => (
        <LineupPlayerToken onSwap={onSwap} key={p.id} player={p} onMove={onMove} players={players} />
      ))}
    </div>
  );
}
