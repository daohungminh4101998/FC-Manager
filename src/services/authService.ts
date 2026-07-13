import type { AuthUser, RegisterPayload, Player } from "../types";
import { supabaseClient } from "../apis/common";
import { playerService } from "./playerService";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapAuthUserRow(row: any): AuthUser {
  return {
    id: row.id,
    username: row.username,
    role: row.role,
    playerId: row.player_id,
  };
}

async function usernameExists(username: string): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from("login")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

async function playerHasAccount(playerId: string): Promise<boolean> {
  const { data, error } = await supabaseClient
    .from("login")
    .select("id")
    .eq("player_id", playerId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export const authService = {
  login: async (username: string, password: string): Promise<AuthUser | null> => {
    const { data, error } = await supabaseClient
      .from("login")
      .select("id, username, role, player_id")
      .eq("username", username)
      .eq("password_hash", password)
      .single();

    if (error) {
      return null;
    }

    return mapAuthUserRow(data);
  },

  register: async (payload: RegisterPayload): Promise<AuthUser> => {
    if (payload.role !== "User" && payload.role !== "Player") {
      throw new Error("Không được phép đăng ký loại tài khoản này");
    }

    if (await usernameExists(payload.username)) {
      throw new Error("Tên đăng nhập đã tồn tại");
    }

    if (payload.role === "Player" && (await playerHasAccount(payload.playerId))) {
      throw new Error("Cầu thủ này đã có tài khoản");
    }

    const { data, error } = await supabaseClient
      .from("login")
      .insert({
        username: payload.username,
        password_hash: payload.password,
        role: payload.role,
        player_id: payload.role === "Player" ? payload.playerId : null,
      })
      .select("id, username, role, player_id")
      .single();

    if (error) {
      // Race-condition fallback in case two registrations land between the pre-checks above and this insert.
      if (error.code === "23505") {
        if (error.message.includes("player_id")) {
          throw new Error("Cầu thủ này đã có tài khoản");
        }
        throw new Error("Tên đăng nhập đã tồn tại");
      }
      throw error;
    }

    return mapAuthUserRow(data);
  },

  getAvailablePlayersForRegistration: async (): Promise<Player[]> => {
    const [activePlayers, taken] = await Promise.all([
      playerService.getActive(),
      supabaseClient.from("login").select("player_id").eq("role", "Player").not("player_id", "is", null),
    ]);

    if (taken.error) throw taken.error;

    const takenIds = new Set((taken.data ?? []).map((r) => r.player_id as string));
    return activePlayers.filter((p) => !takenIds.has(p.id));
  },
};
