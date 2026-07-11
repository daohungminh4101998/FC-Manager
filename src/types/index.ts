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
  isActive: boolean;
}

export type PlayerFormData = Omit<Player, 'id' | 'createdAt' | 'isActive'>;

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
export interface MatchPerformance {
  id: string;
  matchId: string;
  playerId: string;
  goals: number;
  assists: number;
  createdAt: string;
}

export type MatchPerformanceInput = Pick<MatchPerformance, 'playerId' | 'goals' | 'assists'>;

export interface GoalkeeperStat {
  id: string;
  matchId: string;
  playerId: string;
  goalsConceded: number;
  matchesPlayed: number;
  createdAt: string;
}

export type GoalkeeperStatInput = Pick<GoalkeeperStat, 'playerId' | 'goalsConceded' | 'matchesPlayed'>;

export interface MatchDefender {
  id: string;
  matchId: string;
  playerId: string;
  createdAt: string;
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
  totalGoalsConceded: number;
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

// =====================
// Contribution Types
// =====================
export type PaymentMethod = 'cash' | 'bank_transfer' | 'other';

export type ContributionPaymentStatus = 'unpaid' | 'partial' | 'paid' | 'exempt';

export interface Contribution {
  id: string;
  name: string;
  default_amount: number;
  due_date: string; // ISO string
  description?: string | null;
  createdAt: string;
}

export type ContributionFormData = Omit<Contribution, 'id' | 'createdAt'>;

export interface ContributionPlayer {
  id: string;
  contributionId: string;
  playerId: string;
  amountDue: number;
  amountPaid: number;
  status: ContributionPaymentStatus;
  /** Optional player details (name, jerseyNumber) when fetched with join */
  players?: {
    name: string;
    jerseyNumber: number;
  };
}

export interface ContributionTransaction {
  id: string;
  contributionPlayerId: string;
  amount: number;
  paidAt: string; // ISO string
  method: PaymentMethod;
  note?: string | null;
  createdAt: string;
}

// =====================
// Auth Types
// =====================
export type Role = 'Admin' | 'User' | 'Player';

export interface AuthUser {
  id: string;
  username: string;
  role: Role;
  playerId: string | null;
}

export type RegisterPayload =
  | { role: 'User'; username: string; password: string }
  | { role: 'Player'; username: string; password: string; playerId: string };
