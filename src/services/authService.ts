import { supabaseClient } from "../apis/common";

export async function login(username: string, password: string) {
  const { data, error } = await supabaseClient
    .from('login')
    .select('id, username, role, created_at')
    .eq('username', username)
    .eq('password_hash', password)
    .single();

  if (error) {
    return null;
  }

  return data;
}