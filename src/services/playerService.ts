import type { Player, PlayerFormData } from "../types";
import { supabaseClient } from "../apis/common";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapPlayerRow(row: any): Player {
  return {
    id: row.id,
    name: row.name,
    jerseyNumber: row.jerseyNumber,
    position: row.position,
    phone: row.phone,
    createdAt: row.createdAt,
    isActive: row.is_active,
  };
}

export const playerService = {

  async getAll(): Promise<Player[]> {
    const { data, error } = await supabaseClient
      .from("players")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapPlayerRow);
  },

  async getActive(): Promise<Player[]> {
    const { data, error } = await supabaseClient
      .from("players")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return (data ?? []).map(mapPlayerRow);
  },

  async getById(id: string): Promise<Player | undefined> {
    const { data, error } = await supabaseClient
      .from("players")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    return data ? mapPlayerRow(data) : undefined;
  },

  async create(data: PlayerFormData): Promise<Player> {
    const { data: player, error } = await supabaseClient
      .from("players")
      .insert({ ...data, is_active: true })
      .select()
      .single();

    if (error) throw error;

    return mapPlayerRow(player);
  },

  async update(id: string, data: PlayerFormData): Promise<Player> {
    const { data: player, error } = await supabaseClient
      .from("players")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return mapPlayerRow(player);
  },

  async setActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabaseClient
      .from("players")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw error;
  },

  // Returns true if this player has any history recorded against them
  // (attendance, performance stats, or contribution obligations) — used to
  // decide whether a hard delete is safe or must fall back to deactivation.
  async hasRelatedRecords(id: string): Promise<boolean> {
    const checks = await Promise.all([
      supabaseClient.from("attendance_records").select("id", { count: "exact", head: true }).eq("player_id", id),
      supabaseClient.from("match_performances").select("id", { count: "exact", head: true }).eq("player_id", id),
      supabaseClient.from("goalkeeper_stats").select("id", { count: "exact", head: true }).eq("player_id", id),
      supabaseClient.from("match_defenders").select("id", { count: "exact", head: true }).eq("player_id", id),
      supabaseClient.from("contribution_players").select("id", { count: "exact", head: true }).eq("player_id", id),
    ]);

    checks.forEach(({ error }) => {
      if (error) throw error;
    });

    return checks.some(({ count }) => (count ?? 0) > 0);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabaseClient
      .from("players")
      .delete()
      .eq("id", id);

    if (error) throw error;
  },
};
