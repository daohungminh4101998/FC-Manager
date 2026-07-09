import { mockPerformances } from '../data/mockData';
import type { MatchPerformance, PlayerPerformance } from '../types';
import dayjs from 'dayjs';

let performances = [...mockPerformances];

export const performanceService = {
  getByMatch: (matchId: string): Promise<MatchPerformance | undefined> => {
    return Promise.resolve(performances.find((p) => p.matchId === matchId));
  },

  save: (
    matchId: string,
    perf: PlayerPerformance[]
  ): Promise<MatchPerformance> => {
    const existing = performances.find((p) => p.matchId === matchId);
    if (existing) {
      performances = performances.map((p) =>
        p.matchId === matchId
          ? { ...p, performances: perf, savedAt: dayjs().toISOString() }
          : p
      );
    } else {
      performances = [
        ...performances,
        { matchId, performances: perf, savedAt: dayjs().toISOString() },
      ];
    }
    return Promise.resolve(
      performances.find((p) => p.matchId === matchId)!
    );
  },

  getAll: (): Promise<MatchPerformance[]> => {
    return Promise.resolve([...performances]);
  },
};
