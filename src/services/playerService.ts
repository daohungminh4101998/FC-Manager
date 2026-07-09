import { createClient } from "@supabase/supabase-js";
import type { Player, PlayerFormData } from "../types";
const supabase = createClient(
    "https://fwkwqnqqfxcxivmuivqi.supabase.co",
    "sb_publishable_RZbh5-WUgOEuectQA5ol-w_lUARtJNp",
  );
export const playerService = {
  
  async getAll(): Promise<Player[]> {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return data ?? [];
  },

  async getById(id: string): Promise<Player | undefined> {
    const { data, error } = await supabase
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data;
  },

  async create(data: PlayerFormData): Promise<Player> {
    const { data: player, error } = await supabase
      .from("players")
      .insert(data)
      .select()
      .single();

    if (error) throw error;

    return player;
  },

  async update(id: string, data: PlayerFormData): Promise<Player> {
    const { data: player, error } = await supabase
      .from("players")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return player;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from("players")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};