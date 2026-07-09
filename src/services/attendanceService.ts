import { mockAttendances } from '../data/mockData';
import type { Attendance, AttendanceRecord } from '../types';
import dayjs from 'dayjs';

let attendances = [...mockAttendances];

export const attendanceService = {
  getByMatch: (matchId: string): Promise<Attendance | undefined> => {
    return Promise.resolve(attendances.find((a) => a.matchId === matchId));
  },

  save: (matchId: string, records: AttendanceRecord[]): Promise<Attendance> => {
    const existing = attendances.find((a) => a.matchId === matchId);
    if (existing) {
      attendances = attendances.map((a) =>
        a.matchId === matchId
          ? { ...a, records, savedAt: dayjs().toISOString() }
          : a
      );
    } else {
      attendances = [
        ...attendances,
        { matchId, records, savedAt: dayjs().toISOString() },
      ];
    }
    return Promise.resolve(
      attendances.find((a) => a.matchId === matchId)!
    );
  },

  getAll: (): Promise<Attendance[]> => {
    return Promise.resolve([...attendances]);
  },
};
