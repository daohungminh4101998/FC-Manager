import type { Contribution, ContributionFormData, ContributionPlayer, ContributionTransaction, PaymentMethod, ContributionPaymentStatus } from '../types';
import { supabaseClient } from '../apis/common';

export const contributionService = {
  // Contribution CRUD
  getAll: async (): Promise<Contribution[]> => {
    const { data, error } = await supabaseClient
      .from('contributions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
  },

  getById: async (id: string): Promise<Contribution | null> => {
    const { data, error } = await supabaseClient
      .from('contributions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },

  create: async (data: ContributionFormData): Promise<Contribution> => {
    const now = new Date().toISOString();
    const { data: newContribution, error } = await supabaseClient
      .from('contributions')
      .insert([
        {
          name: data.name,
          default_amount: data.default_amount,
          due_date: data.due_date,
          description: data.description ?? null,
          created_at: now,
        },
      ])
      .select();

    if (error) throw error;
    const contribution = newContribution[0];
    await contributionService.initializePlayers(
      contribution.id,
      contribution.default_amount
    );
    return newContribution[0];
  },

  update: async (id: string, data: Partial<ContributionFormData>): Promise<Contribution> => {
    const updates: any = {};
    if (data.name !== undefined) updates.name = data.name;
    if (data.default_amount !== undefined) updates.default_amount = data.default_amount;
    if (data.due_date !== undefined) updates.due_date = data.due_date;
    if (data.description !== undefined) {
      updates.description = data.description ?? null;
    } else {
      // if description is explicitly set to undefined, we keep existing? We'll not update.
    }
    // If no fields to update, just return current.
    if (Object.keys(updates).length === 0) {
      const { data: current } = await supabaseClient
        .from('contributions')
        .select('*')
        .eq('id', id)
        .single();
      if (current === null) throw new Error('Contribution not found');
      return current;
    }

    const { data: updated, error } = await supabaseClient
      .from('contributions')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return updated[0];
  },

  // Explicit two-step delete: remove child contribution_players first so this
  // works correctly regardless of the live FK's ON DELETE rule (RESTRICT vs
  // CASCADE) — callers are expected to have already confirmed no player under
  // this contribution has any transactions before calling this.
  delete: async (id: string): Promise<void> => {
    try {
      const { error: childError } = await supabaseClient
        .from('contribution_players')
        .delete()
        .eq('contribution_id', id);
      if (childError) throw childError;

      const { error } = await supabaseClient.from('contributions').delete().eq('id', id);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.code === '23503') {
        throw new Error(
          'Không thể xóa đợt thu vì đã có giao dịch thanh toán. Vui lòng xử lý từng nghĩa vụ đóng góp trước.'
        );
      }
      throw err;
    }
  },

  // Deleting a single player's contribution obligation. Blocked at the DB
  // level (23503) if that player already has contribution_transactions.
  deleteContributionPlayer: async (contributionPlayerId: string): Promise<void> => {
    try {
      const { error } = await supabaseClient
        .from('contribution_players')
        .delete()
        .eq('id', contributionPlayerId);
      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      if (err?.code === '23503') {
        throw new Error(
          'Không thể xóa: cầu thủ này đã có giao dịch thanh toán. Vui lòng xóa các giao dịch liên quan trước, hoặc đặt trạng thái miễn giảm thay vì xóa.'
        );
      }
      throw err;
    }
  },

  // Players for a contribution
  getPlayers: async (contributionId: string): Promise<ContributionPlayer[]> => {
    const { data, error } = await supabaseClient
      .from('contribution_players')
      .select('*, players(name, jerseyNumber)')
      .eq('contribution_id', contributionId);

    if (error) throw error;
    return (data ?? []).map((item) => ({
      id: item.id,
      contributionId: item.contribution_id,
      playerId: item.player_id,
      amountDue: item.amount_due,
      amountPaid: item.amount_paid,
      status: item.status as ContributionPaymentStatus,
      players: item.players
        ? { name: item.players.name, jerseyNumber: item.players.jerseyNumber }
        : undefined,
    }));
  },

  // Initialize players for a contribution (called when contribution created)
  initializePlayers: async (contributionId: string, default_amount: number): Promise<void> => {
    // Get all active players
    const { data: players, error: playersError } = await supabaseClient
      .from('players')
      .select('id')
      .eq('is_active', true);

    if (playersError) throw playersError;
    if (!players || players.length === 0) return;

    const playerRecords = players.map((p) => ({
      contribution_id: contributionId,
      player_id: p.id,
      amount_due: default_amount,
      amount_paid: 0,
      status: 'unpaid' as ContributionPaymentStatus,
    }));

    const { error } = await supabaseClient
      .from('contribution_players')
      .insert(playerRecords);

    if (error) throw error;
  },

  // Record a payment transaction
  addTransaction: async (
    contributionPlayerId: string,
    amount: number,
    method: PaymentMethod,
    paidAt: string,
    note?: string | null
  ): Promise<ContributionTransaction> => {
    const now = new Date().toISOString();
    const { data: transaction, error } = await supabaseClient
      .from('contribution_transactions')
      .insert([
        {
          contribution_id: contributionPlayerId,
          amount,
          method,
          paid_at: paidAt,
          note: note ?? null,
          created_at: now,
        },
      ])
      .select();

    if (error) throw error;
    return transaction[0];
  },

  // Update player payment status after a transaction
  updatePlayerPayment: async (
    contributionPlayerId: string,
    amountPaid: number
  ): Promise<void> => {
    // Get current player record
    const { data: playerData, error: fetchError } = await supabaseClient
      .from('contribution_players')
      .select('amount_due, amount_paid')
      .eq('id', contributionPlayerId)
      .single();

    if (fetchError) throw fetchError;
    if (!playerData) throw new Error('Player record not found');

    const newAmountPaid = (playerData.amount_paid ?? 0) + amountPaid;
    let status: ContributionPaymentStatus;
    if (newAmountPaid >= playerData.amount_due) {
      status = 'paid';
    } else if (newAmountPaid > 0) {
      status = 'partial';
    } else {
      status = 'unpaid';
    }
    // Note: exempt status is not changed via payments; assume set elsewhere.

    const { error: updateError } = await supabaseClient
      .from('contribution_players')
      .update({
        amount_paid: newAmountPaid,
        status,
      })
      .eq('id', contributionPlayerId);

    if (updateError) throw updateError;
  },

  // Get transaction history for a contribution player
  getTransactions: async (
    contributionPlayerId: string
  ): Promise<ContributionTransaction[]> => {
    const { data, error } = await supabaseClient
      .from('contribution_transactions')
      .select('*')
      .eq('contribution_id', contributionPlayerId)
      .order('paid_at', { ascending: false });

    if (error) throw error;
    return (data ?? []).map((t) => ({
      id: t.id,
      contributionPlayerId: t.contribution_id,
      amount: t.amount,
      paidAt: t.paid_at,
      method: t.method as PaymentMethod,
      note: t.note ?? null,
      createdAt: t.created_at,
    }));
  },

  // Get summary stats for a contribution
  getSummary: async (contributionId: string) => {
    const { data: players, error } = await supabaseClient
      .from('contribution_players')
      .select('amount_due, amount_paid, status')
      .eq('contribution_id', contributionId);

    if (error) throw error;

    const totalDue = players?.reduce((sum, p) => sum + (p.amount_due ?? 0), 0) ?? 0;
    const totalPaid = players?.reduce((sum, p) => sum + (p.amount_paid ?? 0), 0) ?? 0;
    const paidCount = players?.filter((p) => p.status === 'paid').length ?? 0;
    const partialCount = players?.filter((p) => p.status === 'partial').length ?? 0;
    const unpaidCount = players?.filter((p) => p.status === 'unpaid').length ?? 0;
    const exemptCount = players?.filter((p) => p.status === 'exempt').length ?? 0;

    return {
      totalDue,
      totalPaid,
      remaining: totalDue - totalPaid,
      paidCount,
      partialCount,
      unpaidCount,
      exemptCount,
      playerCount: players?.length ?? 0,
    };
  },
};