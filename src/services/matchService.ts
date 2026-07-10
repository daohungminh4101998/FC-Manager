import type { Match, MatchFormData } from '../types';
import { supabaseClient } from "../apis/common";

export const matchService = {
  getAll: async (): Promise<Match[]> => {
    const { data, error } = await supabaseClient
      .from('matches')
      .select('*')
      .order('match_date', { ascending: false });

    if (error) throw error;

    return (data ?? []).map(item => ({
      id: item.id,
      opponent: item.opponent,
      date: item.match_date,
      venue: item.venue,
      note: item.note,
      createdAt: item.created_at,
    }));
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

    return {
      id: data.id,
      opponent: data.opponent,
      date: data.match_date,
      venue: data.venue,
      note: data.note,
      createdAt: data.created_at,
    };
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

    return {
      id: data.id,
      opponent: data.opponent,
      date: data.match_date,
      venue: data.venue,
      note: data.note,
      createdAt: data.created_at,
    };
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

    return {
      id: data.id,
      opponent: data.opponent,
      date: data.match_date,
      venue: data.venue,
      note: data.note,
      createdAt: data.created_at,
    };
  },

  delete: async (id: string): Promise<void> => {
    const { error } = await supabaseClient
      .from('matches')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};
