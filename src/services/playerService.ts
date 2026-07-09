import type { Player, PlayerFormData } from "../types";
import { supabaseClient } from "../apis/common";

export const playerService = {
  
  async getAll(): Promise<Player[]> {
    const { data, error } = await supabaseClient
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data ?? [];
  },

  async getById(id: string): Promise<Player | undefined> {
    const { data, error } = await supabaseClient
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async create(data: PlayerFormData): Promise<Player> {
    const { data: player, error } = await supabaseClient
      .from("players")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return player;
  },

  async update(id: string, data: PlayerFormData): Promise<Player> {
    const { data: player, error } = await supabaseClient
      .from("players")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return player;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from("players")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};