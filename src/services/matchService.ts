import { mockMatches } from '../data/mockData';
import type { Match, MatchFormData } from '../types';
import dayjs from 'dayjs';

let matches = [...mockMatches];

export const matchService = {
  getAll: (): Promise<Match[]> => {
    return Promise.resolve([...matches].sort((a, b) => b.date.localeCompare(a.date)));
  },

  getById: (id: string): Promise<Match | undefined> => {
    return Promise.resolve(matches.find((m) => m.id === id));
  },

  create: (data: MatchFormData): Promise<Match> => {
    const newMatch: Match = {
      ...data,
      id: `m${Date.now()}`,
      createdAt: dayjs().toISOString(),
    };
    matches = [...matches, newMatch];
    return Promise.resolve(newMatch);
  },

  update: (id: string, data: MatchFormData): Promise<Match> => {
    matches = matches.map((m) => (m.id === id ? { ...m, ...data } : m));
    const updated = matches.find((m) => m.id === id)!;
    return Promise.resolve(updated);
  },

  delete: (id: string): Promise<void> => {
    matches = matches.filter((m) => m.id !== id);
    return Promise.resolve();
  },
};
