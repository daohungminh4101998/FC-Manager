import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { contributionService } from "../services/contributionService";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/FormControls";
import { Select } from "../components/ui/FormControls";
import dayjs from "dayjs";
import { useToast } from "../contexts/ToastContext";
import { useAuth } from "../contexts/AuthContext";
import type { Contribution, ContributionPlayer } from "../types";

export const ContributionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === "Admin";

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

  if (loading) {
    return <div className="p-3 sm:p-6">Loading...</div>;
  }

  if (!contribution) {
    return (
      <div className="p-3 sm:p-6">
        <p className="text-red-400">Contribution not found.</p>
        <Button onClick={() => navigate(-1)} variant="outline">
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-3">
        <h1 className="text-xl sm:text-2xl font-bold text-white">{contribution.name}</h1>
        {isAdmin && (
          <div className="grid grid-cols-2 sm:flex sm:space-x-3 gap-3 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                // TODO: edit contribution
              }}
            >
              Chỉnh sửa
            </Button>
            <Button
              onClick={() => {
                // TODO: delete confirmation
              }}
              variant="outline"
            >
              Xóa
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-white/40">Tổng cần thu</h2>
          <p className="mt-2 text-2xl font-bold text-white">
            {contribution.default_amount.toLocaleString()} vnđ
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-white/40">Tổng đã thu</h2>
          <p className="mt-2 text-2xl font-bold text-emerald-400">
            {/* TODO compute total paid from players */}
            {players
              .reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)
              .toLocaleString()}{" "}
            vnđ
          </p>
        </div>
        <div className="bg-gray-800 rounded-xl p-4">
          <h2 className="text-sm font-medium text-white/40">Tổng còn thiếu</h2>
          <p className="mt-2 text-2xl font-bold text-red-400">
            {(
              contribution.default_amount * (players.length ?? 0) -
              players.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0)
            ).toLocaleString()}{" "}
            vnđ
          </p>
        </div>
      </div>

      {/* Cards on mobile — 6 columns (name, due, paid, remaining, status, 2
          actions) don't fit a phone screen even with horizontal scroll */}
      <div className="sm:hidden space-y-3">
        {players.map((p) => (
          <div key={p.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2">
              <p className="text-white font-medium">{p.players?.name ?? "Unknown"}</p>
              <span
                className={`shrink-0 px-2 py-1 text-xs rounded-full ${
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
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div>
                <p className="text-[10px] text-white/40 uppercase">Phải đóng</p>
                <p className="text-sm text-white mt-0.5">{p.amountDue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase">Đã đóng</p>
                <p className="text-sm text-emerald-400 mt-0.5">{p.amountPaid.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-white/40 uppercase">Còn thiếu</p>
                <p className="text-sm text-red-400 mt-0.5">
                  {p.amountDue - p.amountPaid >= 0 ? (p.amountDue - p.amountPaid).toLocaleString() : "0"}
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3">
              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => handleOpenPayment(p.id)}>
                  Thu tiền
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                className={!isAdmin ? "col-span-2" : ""}
                onClick={() => {
                  // TODO: show transaction history modal
                }}
              >
                Lịch sử
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden sm:block overflow-x-auto">
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
                  {/* Player name from joined player */}
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
                    : "0"}{" "}
                  vnđ
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
                  {isAdmin && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenPayment(p.id)}
                    >
                      Thu tiền
                    </Button>
                  )}
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
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button
              onClick={() => setPaymentModalOpen(false)}
              variant="outline"
              className="w-full sm:w-auto"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmitPayment}
              variant="primary"
              loading={false}
              className="w-full sm:w-auto"
            >
              Xác nhận
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
