import type { Player, Match, Attendance, MatchPerformance } from '../types';
import dayjs from 'dayjs';

// =====================
// Mock Players
// =====================
export const mockPlayers: Player[] = [
  { id: 'p1', name: 'Nguyễn Văn An', jerseyNumber: 1, position: 'GK', phone: '0901234561', createdAt: dayjs().subtract(60, 'day').toISOString() },
  { id: 'p2', name: 'Trần Đình Bình', jerseyNumber: 4, position: 'DEF', phone: '0901234562', createdAt: dayjs().subtract(55, 'day').toISOString() },
  { id: 'p3', name: 'Lê Công Cường', jerseyNumber: 5, position: 'DEF', phone: '0901234563', createdAt: dayjs().subtract(50, 'day').toISOString() },
  { id: 'p4', name: 'Phạm Minh Dũng', jerseyNumber: 6, position: 'DEF', phone: '0901234564', createdAt: dayjs().subtract(48, 'day').toISOString() },
  { id: 'p5', name: 'Hoàng Anh Đức', jerseyNumber: 8, position: 'MID', phone: '0901234565', createdAt: dayjs().subtract(45, 'day').toISOString() },
  { id: 'p6', name: 'Nguyễn Hữu Em', jerseyNumber: 10, position: 'MID', phone: '0901234566', createdAt: dayjs().subtract(40, 'day').toISOString() },
  { id: 'p7', name: 'Vũ Tiến Phong', jerseyNumber: 14, position: 'MID', createdAt: dayjs().subtract(38, 'day').toISOString() },
  { id: 'p8', name: 'Đặng Quốc Giang', jerseyNumber: 7, position: 'FWD', phone: '0901234568', createdAt: dayjs().subtract(35, 'day').toISOString() },
  { id: 'p9', name: 'Bùi Thế Hùng', jerseyNumber: 9, position: 'FWD', phone: '0901234569', createdAt: dayjs().subtract(30, 'day').toISOString() },
  { id: 'p10', name: 'Cao Xuân Khôi', jerseyNumber: 11, position: 'FWD', createdAt: dayjs().subtract(25, 'day').toISOString() },
  { id: 'p11', name: 'Đinh Văn Long', jerseyNumber: 3, position: 'DEF', phone: '0901234571', createdAt: dayjs().subtract(20, 'day').toISOString() },
  { id: 'p12', name: 'Tô Thành Minh', jerseyNumber: 17, position: 'MID', phone: '0901234572', createdAt: dayjs().subtract(15, 'day').toISOString() },
];

// =====================
// Mock Matches
// =====================
export const mockMatches: Match[] = [
  { id: 'm1', opponent: 'FC Sao Đỏ', date: dayjs().subtract(28, 'day').format('YYYY-MM-DD'), venue: 'Sân Mỹ Đình', note: 'Trận giao hữu', createdAt: dayjs().subtract(30, 'day').toISOString() },
  { id: 'm2', opponent: 'Câu lạc bộ Hà Nội B', date: dayjs().subtract(21, 'day').format('YYYY-MM-DD'), venue: 'Sân Hàng Đẫy', note: '', createdAt: dayjs().subtract(22, 'day').toISOString() },
  { id: 'm3', opponent: 'Thể Công Trẻ', date: dayjs().subtract(14, 'day').format('YYYY-MM-DD'), venue: 'Sân Đống Đa', note: 'Vòng loại giải hè', createdAt: dayjs().subtract(15, 'day').toISOString() },
  { id: 'm4', opponent: 'FC Phương Nam', date: dayjs().subtract(7, 'day').format('YYYY-MM-DD'), venue: 'Sân Cẩm Phả', note: '', createdAt: dayjs().subtract(8, 'day').toISOString() },
  { id: 'm5', opponent: 'CLB Tuổi Trẻ', date: dayjs().add(7, 'day').format('YYYY-MM-DD'), venue: 'Sân Quân Khu 3', note: 'Vòng tứ kết', createdAt: dayjs().toISOString() },
];

// =====================
// Mock Attendances
// =====================
export const mockAttendances: Attendance[] = [
  {
    matchId: 'm1',
    savedAt: dayjs().subtract(28, 'day').toISOString(),
    records: [
      { playerId: 'p1', status: 'present' }, { playerId: 'p2', status: 'present' },
      { playerId: 'p3', status: 'present' }, { playerId: 'p4', status: 'absent' },
      { playerId: 'p5', status: 'present' }, { playerId: 'p6', status: 'present' },
      { playerId: 'p7', status: 'absent' }, { playerId: 'p8', status: 'present' },
      { playerId: 'p9', status: 'present' }, { playerId: 'p10', status: 'present' },
      { playerId: 'p11', status: 'present' }, { playerId: 'p12', status: 'absent' },
    ],
  },
  {
    matchId: 'm2',
    savedAt: dayjs().subtract(21, 'day').toISOString(),
    records: [
      { playerId: 'p1', status: 'present' }, { playerId: 'p2', status: 'absent' },
      { playerId: 'p3', status: 'present' }, { playerId: 'p4', status: 'present' },
      { playerId: 'p5', status: 'present' }, { playerId: 'p6', status: 'present' },
      { playerId: 'p7', status: 'present' }, { playerId: 'p8', status: 'absent' },
      { playerId: 'p9', status: 'present' }, { playerId: 'p10', status: 'present' },
      { playerId: 'p11', status: 'absent' }, { playerId: 'p12', status: 'present' },
    ],
  },
  {
    matchId: 'm3',
    savedAt: dayjs().subtract(14, 'day').toISOString(),
    records: [
      { playerId: 'p1', status: 'present' }, { playerId: 'p2', status: 'present' },
      { playerId: 'p3', status: 'absent' }, { playerId: 'p4', status: 'present' },
      { playerId: 'p5', status: 'present' }, { playerId: 'p6', status: 'absent' },
      { playerId: 'p7', status: 'present' }, { playerId: 'p8', status: 'present' },
      { playerId: 'p9', status: 'absent' }, { playerId: 'p10', status: 'present' },
      { playerId: 'p11', status: 'present' }, { playerId: 'p12', status: 'present' },
    ],
  },
  {
    matchId: 'm4',
    savedAt: dayjs().subtract(7, 'day').toISOString(),
    records: [
      { playerId: 'p1', status: 'present' }, { playerId: 'p2', status: 'present' },
      { playerId: 'p3', status: 'present' }, { playerId: 'p4', status: 'present' },
      { playerId: 'p5', status: 'absent' }, { playerId: 'p6', status: 'present' },
      { playerId: 'p7', status: 'present' }, { playerId: 'p8', status: 'present' },
      { playerId: 'p9', status: 'present' }, { playerId: 'p10', status: 'absent' },
      { playerId: 'p11', status: 'present' }, { playerId: 'p12', status: 'present' },
    ],
  },
];

// =====================
// Mock Performances
// =====================
export const mockPerformances: MatchPerformance[] = [
  {
    matchId: 'm1',
    savedAt: dayjs().subtract(28, 'day').toISOString(),
    performances: [
      { playerId: 'p8', goals: 2, assists: 0, goalsConceded: 0 },
      { playerId: 'p9', goals: 1, assists: 1, goalsConceded: 0 },
      { playerId: 'p6', goals: 0, assists: 2, goalsConceded: 0 },
      { playerId: 'p5', goals: 0, assists: 1, goalsConceded: 0 },
    ],
  },
  {
    matchId: 'm2',
    savedAt: dayjs().subtract(21, 'day').toISOString(),
    performances: [
      { playerId: 'p9', goals: 2, assists: 0, goalsConceded: 0 },
      { playerId: 'p10', goals: 1, assists: 1, goalsConceded: 0 },
      { playerId: 'p8', goals: 1, assists: 0, goalsConceded: 0 },
      { playerId: 'p6', goals: 0, assists: 1, goalsConceded: 0 },
    ],
  },
  {
    matchId: 'm3',
    savedAt: dayjs().subtract(14, 'day').toISOString(),
    performances: [
      { playerId: 'p8', goals: 1, assists: 1, goalsConceded: 0 },
      { playerId: 'p5', goals: 1, assists: 0, goalsConceded: 0 },
      { playerId: 'p7', goals: 0, assists: 2, goalsConceded: 0 },
    ],
  },
  {
    matchId: 'm4',
    savedAt: dayjs().subtract(7, 'day').toISOString(),
    performances: [
      { playerId: 'p9', goals: 3, assists: 0, goalsConceded: 0 },
      { playerId: 'p6', goals: 1, assists: 1, goalsConceded: 0 },
      { playerId: 'p8', goals: 0, assists: 2, goalsConceded: 0 },
      { playerId: 'p12', goals: 1, assists: 0, goalsConceded: 0 },
    ],
  },
];
