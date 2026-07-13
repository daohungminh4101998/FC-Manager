import type { Match, MatchFormData } from '../types';
import { supabaseClient } from "../apis/common";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapMatchRow(row: any): Match {
  return {
    id: row.id,
    opponent: row.opponent,
    date: row.match_date,
    venue: row.venue,
    note: row.note,
    createdAt: row.created_at,
  };
}

export const matchService = {
  getAll: async (): Promise<Match[]> => {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapMatchRow);
  },

  getById: async (id: string): Promise<Match | undefined> => {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Không tìm thấy
      throw error;
    }

    return mapMatchRow(data);
  },

  create: async (formData: MatchFormData): Promise<Match> => {
    const { data, error } = await supabaseClient
      .from('matches')
      .insert({
        opponent: formData.opponent,
        match_date: formData.date,
        venue: formData.venue,
        note: formData.note,
      })
      .select()
      .single();

    if (error) throw error;

    return mapMatchRow(data);
  },

  update: async (id: string, formData: MatchFormData): Promise<Match> => {
    const { data, error } = await supabaseClient
      .from('matches')
      .update({
        opponent: formData.opponent,
        match_date: formData.date,
        venue: formData.venue,
        note: formData.note,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return mapMatchRow(data);
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabaseClient
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
