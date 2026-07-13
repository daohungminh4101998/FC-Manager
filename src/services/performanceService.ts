import type {
  Match,
  MatchPerformance,
  MatchPerformanceInput,
  GoalkeeperStat,
  GoalkeeperStatInput,
  MatchDefender,
} from '../types';
import { supabaseClient } from '../apis/common';
import { mapMatchRow } from './matchService';
import dayjs from 'dayjs';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPerformanceRow(row: any): MatchPerformance {
  return {
    id: row.id,
    matchId: row.match_id,
    playerId: row.player_id,
    goals: row.goals,
    assists: row.assists,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapGoalkeeperStatRow(row: any): GoalkeeperStat {
  return {
    id: row.id,
    matchId: row.match_id,
    playerId: row.player_id,
    goalsConceded: row.goals_conceded,
    matchesPlayed: row.matches_played,
    createdAt: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDefenderRow(row: any): MatchDefender {
  return {
    id: row.id,
    matchId: row.match_id,
    playerId: row.player_id,
    createdAt: row.created_at,
  };
}

export const performanceService = {
  getByMatch: async (matchId: string): Promise<MatchPerformance[]> => {
    const { data, error } = await supabaseClient
      .from('match_performances')
      .select('*')
      .eq('match_id', matchId);

    if (error) throw error;
    return (data ?? []).map(mapPerformanceRow);
  },

  upsertPerformances: async (matchId: string, records: MatchPerformanceInput[]): Promise<void> => {
    const { error: deleteError } = await supabaseClient
      .from('match_performances')
      .delete()
      .eq('match_id', matchId);
    if (deleteError) throw deleteError;

    if (records.length === 0) return;

    const { error: insertError } = await supabaseClient.from('match_performances').insert(
      records.map((r) => ({
        match_id: matchId,
        player_id: r.playerId,
        goals: r.goals,
        assists: r.assists,
      }))
    );
    if (insertError) throw insertError;
  },

  getGoalkeeperStats: async (matchId: string): Promise<GoalkeeperStat[]> => {
    const { data, error } = await supabaseClient
      .from('goalkeeper_stats')
      .select('*')
      .eq('match_id', matchId);

    if (error) throw error;
    return (data ?? []).map(mapGoalkeeperStatRow);
  },

  upsertGoalkeeperStats: async (matchId: string, records: GoalkeeperStatInput[]): Promise<void> => {
    const { error: deleteError } = await supabaseClient
      .from('goalkeeper_stats')
      .delete()
      .eq('match_id', matchId);
    if (deleteError) throw deleteError;

    if (records.length === 0) return;

    const { error: insertError } = await supabaseClient.from('goalkeeper_stats').insert(
      records.map((r) => ({
        match_id: matchId,
        player_id: r.playerId,
        goals_conceded: r.goalsConceded,
        matches_played: r.matchesPlayed,
      }))
    );
    if (insertError) throw insertError;
  },

  getDefenders: async (matchId: string): Promise<MatchDefender[]> => {
    const { data, error } = await supabaseClient
      .from('match_defenders')
      .select('*')
      .eq('match_id', matchId);

    if (error) throw error;
    return (data ?? []).map(mapDefenderRow);
  },

  setDefenders: async (matchId: string, playerIds: string[]): Promise<void> => {
    const { error: deleteError } = await supabaseClient
      .from('match_defenders')
      .delete()
      .eq('match_id', matchId);
    if (deleteError) throw deleteError;

    if (playerIds.length === 0) return;

    const { error: insertError } = await supabaseClient
      .from('match_defenders')
      .insert(playerIds.map((playerId) => ({ match_id: matchId, player_id: playerId })));
    if (insertError) throw insertError;
  },

  getAllPerformances: async (year?: number): Promise<(MatchPerformance & { match: Match })[]> => {
    const { data, error } = await supabaseClient.from('match_performances').select('*, matches(*)');

    if (error) throw error;

    return (data ?? [])
      .filter((row) => row.matches)
      .map((row) => ({ ...mapPerformanceRow(row), match: mapMatchRow(row.matches) }))
      .filter((row) => year === undefined || dayjs(row.match.date).year() === year);
  },

  getAllGoalkeeperStats: async (year?: number): Promise<(GoalkeeperStat & { match: Match })[]> => {
    const { data, error } = await supabaseClient.from('goalkeeper_stats').select('*, matches(*)');

    if (error) throw error;

    return (data ?? [])
      .filter((row) => row.matches)
      .map((row) => ({ ...mapGoalkeeperStatRow(row), match: mapMatchRow(row.matches) }))
      .filter((row) => year === undefined || dayjs(row.match.date).year() === year);
  },

  getAllDefenders: async (year?: number): Promise<(MatchDefender & { match: Match })[]> => {
    const { data, error } = await supabaseClient.from('match_defenders').select('*, matches(*)');

    if (error) throw error;

    return (data ?? [])
      .filter((row) => row.matches)
      .map((row) => ({ ...mapDefenderRow(row), match: mapMatchRow(row.matches) }))
      .filter((row) => year === undefined || dayjs(row.match.date).year() === year);
  },
};
