import { useRef, useState } from "react";
import { LINEUP_POSITION_COLORS, type LineupPlayer } from "../../types";

interface LineupPlayerTokenProps {
  player: LineupPlayer;
  players: LineupPlayer[];
  onMove: (id: string, x: number, y: number) => void;
  onSwap: (draggedId: string, targetId: string, startX: number, startY: number) => void;
}

const SWAP_THRESHOLD = 8;

export default function LineupPlayerToken({
  player,
  players,
  onMove,
  onSwap,
}: LineupPlayerTokenProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [justSwapped, setJustSwapped] = useState(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    const pitch = ref.current?.parentElement as HTMLDivElement;
    if (!pitch) return;

    setIsDragging(true);

    const startX = player.x;
    const startY = player.y;
    let lastX = startX;
    let lastY = startY;

    const move = (ev: PointerEvent) => {
      const rect = pitch.getBoundingClientRect();
      const x = Math.min(
        100,
        Math.max(0, ((ev.clientX - rect.left) / rect.width) * 100),
      );
      const y = Math.min(
        100,
        Math.max(0, ((ev.clientY - rect.top) / rect.height) * 100),
      );
      lastX = x;
      lastY = y;
      onMove(player.id, x, y);
    };

    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      setIsDragging(false);

      const target = players.find((p) => {
        if (p.id === player.id) return false;
        const dx = p.x - lastX;
        const dy = p.y - lastY;
        return Math.sqrt(dx * dx + dy * dy) < SWAP_THRESHOLD;
      });

      if (target) {
        onSwap(player.id, target.id, startX, startY);
        setJustSwapped(true);
        setTimeout(() => setJustSwapped(false), 400);
      }
    };

    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      className={`absolute flex flex-col items-center select-none touch-none
        ${isDragging ? "cursor-grabbing z-50" : "cursor-grab z-10"}
        ${isDragging ? "" : "transition-[left,top] duration-300 ease-out"}
      `}
      style={{
        left: `${player.x}%`,
        top: `${player.y}%`,
        transform: `translate(-50%, -50%) scale(${isDragging ? 1.15 : 1})`,
        transition: isDragging
          ? "transform 150ms ease-out"
          : "left 300ms ease-out, top 300ms ease-out, transform 200ms ease-out",
      }}
    >
      <div
        className={`w-20 h-20 rounded-full bg-slate-900 border-2 ${LINEUP_POSITION_COLORS[player.position]}
          flex items-center justify-center text-white text-sm font-bold overflow-hidden
          transition-shadow duration-200
          ${isDragging ? "shadow-2xl ring-4 ring-white/30" : "shadow-lg"}
          ${justSwapped ? "animate-swap-pulse" : ""}
        `}
      >
        <img
          src={"https://i.pinimg.com/736x/8c/0a/bd/8c0abd182289dd49fa575b4673c3b037.jpg"}
          alt={player.name}
          className="w-full h-full rounded-full pointer-events-none"
          draggable={false}
        />
      </div>
      <span
        className={`mt-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white text-[10px] whitespace-nowrap
          transition-opacity duration-200 ${isDragging ? "opacity-70" : "opacity-100"}`}
      >
        {player.name}
      </span>
      <span
        className={`text-[10px] font-bold ${LINEUP_POSITION_COLORS[player.position].split(" ")[1]}`}
      >
        {player.rating.toFixed(1)}
      </span>
    </div>
  );
}