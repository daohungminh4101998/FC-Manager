import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import dayjs from 'dayjs';
import type { Match, Player } from '../../types';
import { Modal } from './Modal';

interface MatchStatColumn {
  label: string;
  value: string | number;
}

export interface MatchStatRow {
  match: Match;
  columns: MatchStatColumn[];
}

interface MatchStatModalProps {
  isOpen: boolean;
  onClose: () => void;
  player: Player;
  title: string;
  rows: MatchStatRow[];
}

export const MatchStatModal: React.FC<MatchStatModalProps> = ({
  isOpen,
  onClose,
  player,
  title,
  rows,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`${title} — ${player.name}`} size="lg">
      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-10 gap-3">
          <p className="text-sm text-white/30">Chưa có dữ liệu</p>
        </div>
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <div
              key={row.match.id}
              className="flex flex-wrap items-center gap-4 p-4 rounded-xl bg-white/3 border border-white/5"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">vs {row.match.opponent}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <Calendar className="w-3 h-3 text-blue-400" />
                    {dayjs(row.match.date).format('DD/MM/YYYY')}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-white/50">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {row.match.venue}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                {row.columns.map((col) => (
                  <div key={col.label} className="text-center">
                    <p className="text-[10px] text-white/40 uppercase tracking-wide">{col.label}</p>
                    <p className="text-sm font-bold text-white">{col.value}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
};
