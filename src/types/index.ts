// =====================
// Player Types
// =====================
export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';

export interface Player {
  id: string;
  name: string;
  jerseyNumber: number;
  position: Position;
  phone?: string;
  createdAt: string;
}

export type PlayerFormData = Omit<Player, 'id' | 'createdAt'>;

// =====================
// Match Types
// =====================
export interface Match {
  id: string;
  opponent: string;
  date: string;
  venue: string;
  note?: string;
  createdAt: string;
}

export type MatchFormData = Omit<Match, 'id' | 'createdAt'>;

// =====================
// Attendance Types
// =====================
export type AttendanceStatus = 'present' | 'absent';

export interface AttendanceRecord {
  playerId: string;
  status: AttendanceStatus;
}

export interface Attendance {
  matchId: string;
  records: AttendanceRecord[];
  savedAt: string;
}

// =====================
// Match Performance Types
// =====================
export interface PlayerPerformance {
  playerId: string;
  goals: number;
  assists: number;
}

export interface MatchPerformance {
  matchId: string;
  performances: PlayerPerformance[];
  savedAt: string;
}

// =====================
// Statistics Types
// =====================
export interface PlayerStats {
  player: Player;
  matchesPlayed: number;
  matchesAbsent: number;
  totalGoals: number;
  totalAssists: number;
}

// =====================
// Toast / Notification Types
// =====================
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}
