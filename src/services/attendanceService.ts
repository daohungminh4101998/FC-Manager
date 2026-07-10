import type { Attendance, AttendanceRecord } from '../types';
import dayjs from 'dayjs';
import { supabaseClient } from "../apis/common";


export const attendanceService = {
  getByMatch: async (matchId: string): Promise<Attendance | undefined> => {
    const { data, error } = await supabaseClient
      .from('attendance_records')
      .select('*')
      .eq('match_id', matchId)
      .order('created_at');

    if (error) throw error;

    if (!data || data.length === 0) {
      return undefined;
    }

    return {
      matchId,
      savedAt: data[0].created_at,
      records: data.map((item) => ({
        playerId: item.player_id,
        status: item.status,
      })),
    };
  },

  save: async (
    matchId: string,
    records: AttendanceRecord[]
  ): Promise<Attendance> => {
    // Xóa dữ liệu cũ
    const { error: deleteError } = await supabaseClient
      .from('attendance_records')
      .delete()
      .eq('match_id', matchId);

    if (deleteError) throw deleteError;

    // Insert dữ liệu mới
    const { error: insertError } = await supabaseClient
      .from('attendance_records')
      .insert(
        records.map((record) => ({
          match_id: matchId,
          player_id: record.playerId,
          status: record.status,
        }))
      );

    if (insertError) throw insertError;

    return {
      matchId,
      savedAt: dayjs().toISOString(),
      records,
    };
  },

  getAll: async (): Promise<Attendance[]> => {
    const { data, error } = await supabaseClient
      .from('attendance_records')
      .select('*')
      .order('created_at');

    if (error) throw error;

    const grouped = new Map<string, Attendance>();

    for (const item of data ?? []) {
      if (!grouped.has(item.match_id)) {
        grouped.set(item.match_id, {
          matchId: item.match_id,
          savedAt: item.created_at,
          records: [],
        });
      }

      grouped.get(item.match_id)!.records.push({
        playerId: item.player_id,
        status: item.status,
      });
    }

    return Array.from(grouped.values());
  },
};
