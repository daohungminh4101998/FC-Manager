import { mockPlayers } from '../data/mockData';
import type { Player, PlayerFormData } from '../types';
import dayjs from 'dayjs';

let players = [...mockPlayers];

export const playerService = {
  getAll: (): Promise<Player[]> => {
    return Promise.resolve([...players]);
  },

  getById: (id: string): Promise<Player | undefined> => {
    return Promise.resolve(players.find((p) => p.id === id));
  },

  create: (data: PlayerFormData): Promise<Player> => {
    const newPlayer: Player = {
      ...data,
      id: `p${Date.now()}`,
      createdAt: dayjs().toISOString(),
    };
    players = [...players, newPlayer];
    return Promise.resolve(newPlayer);
  },

  update: (id: string, data: PlayerFormData): Promise<Player> => {
    players = players.map((p) => (p.id === id ? { ...p, ...data } : p));
    const updated = players.find((p) => p.id === id)!;
    return Promise.resolve(updated);
  },

  delete: (id: string): Promise<void> => {
    players = players.filter((p) => p.id !== id);
    return Promise.resolve();
  },
};
