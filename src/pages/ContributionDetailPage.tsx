import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { contributionService } from "../services/contributionService";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/FormControls";
import { Select } from "../components/ui/FormControls";
import dayjs from "dayjs";
import { useToast } from "../contexts/ToastContext";
import type { Contribution, ContributionPlayer } from "../types";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export const ContributionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [players, setPlayers] = useState<ContributionPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: "cash" as "cash" | "bank_transfer" | "other",
    paidAt: dayjs().format("YYYY-MM-DD"),
    note: "",
  });

  // Edit contribution state
  const [editingContribution, setEditingContribution] = useState<Contribution | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Contribution>>({
    name: '',
    default_amount: 0,
    due_date: '',
    description: '',
  });
  const [editIsSubmitting, setEditIsSubmitting] = useState(false);

  // Delete contribution state
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // History modal state
  type HistoryEntry = {
    id: string;
    amount: number;
    paidAt: string;
    method: "cash" | "bank_transfer" | "other";
    note: string | null;
    playerName: string;
  };
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contribRes, playersRes] = await Promise.all([
        contributionService.getById(id ?? ""),
        contributionService.getPlayers(id ?? ""),
      ]);
      setContribution(contribRes ?? null);
      setPlayers(playersRes);
    } catch (err) {
      console.error("Failed to load contribution data", err);
      addToast("Failed to load contribution data", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (playerId: string) => {
    setSelectedPlayerId(playerId);
    // reset form
    setPaymentForm({
      amount: 0,
      method: "cash",
      paidAt: dayjs().format("YYYY-MM-DD"),
      note: "",
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    try {
      // First add transaction
      await contributionService.addTransaction(
        selectedPlayerId,
        Number(paymentForm.amount),
        paymentForm.method,
        paymentForm.paidAt,
        paymentForm.note ?? null,
      );
      // Update player payment amount
      await contributionService.updatePlayerPayment(
        selectedPlayerId,
        Number(paymentForm.amount),
      );
      // Refresh data
      await loadData();
      setPaymentModalOpen(false);
      addToast("Recorded payment successfully", "success");
    } catch (err) {
      console.error("Payment failed", err);
      addToast("Failed to record payment", "error");
    }
  };

  // Edit contribution functions
  const openEditContribution = () => {
    if (!contribution) return;
    setEditingContribution(contribution);
    setEditFormData({
      name: contribution.name,
      default_amount: contribution.default_amount,
      due_date: contribution.due_date,
      description: contribution.description ?? '',
    });
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async () => {
    setEditIsSubmitting(true);
    try {
      await contributionService.update(contribution!.id, {
        name: editFormData.name as string,
        default_amount: Number(editFormData.default_amount),
        due_date: editFormData.due_date as string,
        description: editFormData.description ?? undefined,
      });
      addToast('Cập nhật đợt thu thành công', 'success');
      await loadData();
      setIsEditModalOpen(false);
    } catch (err) {
      console.error('Failed to update contribution:', err);
      addToast('Có lỗi xảy ra khi cập nhật', 'error');
    } finally {
      setEditIsSubmitting(false);
    }
  };

  // Delete contribution functions
  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contributionService.delete(deleteTarget);
      addToast('Đã xóa đợt thu', 'success');
      navigate(-1); // Go back to contributions list
    } catch (err) {
      console.error('Failed to delete contribution:', err);
      addToast('Không thể xóa đợt thu', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  // History functions
  const openHistory = async () => {
    if (!contribution) return;
    setHistoryLoading(true);
    try {
      const transactions = await contributionService.getTransactionsByContributionId(contribution.id);
      // Map transactions to include player name
      const historyWithPlayer: HistoryEntry[] = transactions.map(t => {
        const player = players.find(p => p.id === t.contributionPlayerId)?.players;
        return {
          id: t.id,
          amount: t.amount,
          paidAt: t.paidAt,
          method: t.method,
          note: t.note ?? null,
          playerName: player ? player.name : 'Unknown',
        };
      });
      setHistoryData(historyWithPlayer);
    } catch (err) {
      console.error('Failed to load transaction history:', err);
      addToast('Không thể tải lịch sử giao dịch', 'error');
    } finally {
      setHistoryLoading(false);
    }
    setIsHistoryModalOpen(true);
  };

  const closeHistory = () => {
    setIsHistoryModalOpen(false);
    setHistoryData([]);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!contribution) {
    return (
      <div className="p-6">
        <p className="text-red-400">Contribution not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{contribution.name}</h1>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <Button
            variant="outline"
            onClick={openEditContribution}
          >
            Chỉnh sửa
          </Button>
          <Button
            onClick={() => setDeleteTarget(contribution.id)}
            variant="outline"
          >
            Xóa
          </Button>
          <Button
            onClick={openHistory}
            variant="outline"
          >
            Lịch sử
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-white/40">Tổng cần thu</h2>
          <p className="mt-2 text-2xl font-bold text-white">
            {contribution.default_amount.toLocaleString()} vnđ
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-white/40">Tổng đã thu</h2>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {players
              .reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)
              .toLocaleString()} vnđ
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-white/40">Tổng còn thiếu</h2>
          <p className="mt-2 text-2xl font-bold text-red-400">
            {(
              contribution.default_amount * (players.length ?? 0) -
              players.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)
            ).toLocaleString()} vnđ
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-700">
          <thead>
            <tr className="bg-gray-800">
              <th className="px-6 py-3 text-left text-sm font-medium text-white/40">
                Tên cầu thủ
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/40">
                Số tiền phải đóng
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/40">
                Đã đóng
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/40">
                Còn thiếu
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/40">
                Trạng thái
              </th>
              <th className="px-6 py-3 text-left text-sm font-medium text-white/40">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {players.map((p) => (
              <tr key={p.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 text-white">
                  {p.players?.name ?? "Unknown"}
                </td>
                <td className="px-6 py-4 text-white">
                  {p.amountDue.toLocaleString()} vnđ
                </td>
                <td className="px-6 py-4 text-white">
                  {p.amountPaid.toLocaleString()} vnđ
                </td>
                <td className="px-6 py-4 text-white">
                  {p.amountDue - p.amountPaid >= 0
                    ? (p.amountDue - p.amountPaid).toLocaleString()
                    : "0"} vnđ
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      p.status === "paid"
                        ? "bg-green-500/20 text-green-400"
                        : p.status === "partial"
                          ? "bg-yellow-500/20 text-yellow-400"
                          : p.status === "exempt"
                            ? "bg-gray-500/20 text-gray-400"
                            : "bg-red-500/20 text-red-400"
                    }`}
                  >
                    {p.status === "paid"
                      ? "Đã đóng"
                      : p.status === "partial"
                        ? "Đóng một phần"
                        : p.status === "exempt"
                          ? "Miễn giảm"
                          : "Chưa đóng"}
                  </span>
                </td>
                <td className="px-6 py-4 text-right space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenPayment(p.id)}
                  >
                    Thu tiền
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // TODO: show transaction history modal
                    }}
                  >
                    Lịch sử
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        title="Thu tiền"
        size="md"
      >
        <form onSubmit={handleSubmitPayment} className="space-y-4">
          <Input
            label="Số tiền (vnđ)"
            name="amount"
            type="number"
            value={paymentForm.amount}
            onChange={handlePaymentChange}
            required
            min="0"
          />
          <Select
            label="Hình thức thanh toán"
            name="method"
            value={paymentForm.method}
            onChange={handlePaymentChange}
            required
            options={[
              { value: "cash", label: "Tiền mặt" },
              { value: "bank_transfer", label: "Chuyển khoản" },
              { value: "other", label: "Khác" },
            ]}
          />
          <Input
            label="Ngày thu (yyyy-mm-dd)"
            name="paidAt"
            type="date"
            value={paymentForm.paidAt}
            onChange={handlePaymentChange}
            required
          />
          <Input
            label="Ghi chú (tùy chọn)"
            name="note"
            type="text"
            value={paymentForm.note}
            onChange={handlePaymentChange}
          />
          <div className="flex justify-end">
            <Button
              onClick={() => setPaymentModalOpen(false)}
              variant="outline"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitPayment}
              variant="primary"
              loading={false}
            >
              Xác nhận
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Contribution Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Chỉnh sửa đợt thu"
      >
        <div className="space-y-4">
          <Input
            label="Tên đợt thu"
            value={editFormData.name ?? ''}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            required
          />
          <Input
            label="Số tiền mặc định (vnđ)"
            type="number"
            value={editFormData.default_amount ?? 0}
            onChange={(e) => setEditFormData({ ...editFormData, default_amount: Number(e.target.value) })}
            required
            min="0"
          />
          <Input
            label="Hạn chius (dd/mm/yyyy)"
            type="date"
            value={editFormData.due_date ?? ''}
            onChange={(e) => setEditFormData({ ...editFormData, due_date: e.target.value })}
            required
          />
          <Input
            label="Mô tả (tùy chọn)"
            value={editFormData.description ?? ''}
            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
          />
          <div className="flex justify-end">
            <Button variant="secondary" type="button" onClick={() => setIsEditModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={editIsSubmitting} onClick={handleEditSubmit}>
              {editingContribution ? 'Cập nhật' : 'Tạo'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete Contribution */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa đợt thu"
        message={`Bạn có chắc muốn xóa đợt thu "${contribution?.name}"? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={closeHistory}
        title="Lịch sử giao dịch"
        size="lg"
      >
        {historyLoading ? (
          <p className="text-center py-8">Đang tải...</p>
        ) : historyData.length === 0 ? (
          <p className="text-center py-8 text-white/50">Chưa có giao dịch nào.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-gray-800 border border-white/10 rounded-lg">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Ngày
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Hình thức
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Ghi chú
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Cầu thủ
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {historyData.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-white">
                      {dayjs(t.paidAt).format('DD/MM/YYYY')}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {t.amount.toLocaleString()} vnđ
                    </td>
                    <td className="px-6 py-4 text-white">
                      {t.method === 'cash' ? 'Tiền mặt' : t.method === 'bank_transfer' ? 'Chuyển khoản' : 'Khác'}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {t.note ?? ''}
                    </td>
                    <td className="px-6 py-4 text-white">
                      {t.playerName}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>
    </div>
  );
};