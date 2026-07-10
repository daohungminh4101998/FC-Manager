import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { contributionService } from '../services/contributionService';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/FormControls';
import { Select } from '../components/ui/FormControls';
import dayjs from 'dayjs';
import { useToast } from '../contexts/ToastContext';
import type { Contribution, ContributionPlayer } from '../types';

export const ContributionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [contribution, setContribution] = useState<Contribution | null>(null);
  const [players, setPlayers] = useState<ContributionPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('');
  const [paymentForm, setPaymentForm] = useState({
    amount: 0,
    method: 'cash' as 'cash' | 'bank_transfer' | 'other',
    paidAt: dayjs().format('YYYY-MM-DD'),
    note: '',
  });
  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [contribRes, playersRes] = await Promise.all([
        contributionService.getById(id ?? ''),
        contributionService.getPlayers(id ?? ''),
      ]);
      setContribution(contribRes ?? null);
      setPlayers(playersRes);
    } catch (err) {
      console.error('Failed to load contribution data', err);
      addToast('Failed to load contribution data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPayment = (playerId: string) => {
    setSelectedPlayerId(playerId);
    // reset form
    setPaymentForm({
      amount: 0,
      method: 'cash',
      paidAt: dayjs().format('YYYY-MM-DD'),
      note: '',
    });
    setPaymentModalOpen(true);
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setPaymentForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayerId) return;
    try {
      // First add transaction
      const transaction = await contributionService.addTransaction(
        selectedPlayerId,
        Number(paymentForm.amount),
        paymentForm.method,
        paymentForm.paidAt,
        paymentForm.note ?? null
      );
      // Update player payment amount
      await contributionService.updatePlayerPayment(selectedPlayerId, Number(paymentForm.amount));
      // Refresh data
      await loadData();
      setPaymentModalOpen(false);
      addToast('Recorded payment successfully', 'success');
    } catch (err) {
      console.error('Payment failed', err);
      addToast('Failed to record payment', 'error');
    }
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
            {/* TODO compute total paid from players */}
            {players.reduce((sum, p) => sum + (p.amountPaid ?? 0), 0).toLocaleString()} vnđ
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
                  {/* Player name from joined player */}{p.players?.name ?? 'Unknown'}
                </td>
                <td className="px-6 py-4 text-white">
                  {p.amountDue.toLocaleString()} vnđ
                </td>
                <td className="px-6 py-4 text-white">
                  {p.amountPaid.toLocaleString()} vnđ
                </td>
                <td className="px-6 py-4 text-white">
                  {p.amountDue - p.amountPaid >= 0 ? (p.amountDue - p.amountPaid).toLocaleString() : '0'} vnđ
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      p.status === 'paid'
                        ? 'bg-green-500/20 text-green-400'
                        : p.status === 'partial'
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : p.status === 'exempt'
                        ? 'bg-gray-500/20 text-gray-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}
                  >
                    {p.status === 'paid'
                      ? 'Đã đóng'
                      : p.status === 'partial'
                      ? 'Đóng một phần'
                      : p.status === 'exempt'
                      ? 'Miễn giảm'
                      : 'Chưa đóng'}
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
              { value: 'cash', label: 'Tiền mặt' },
              { value: 'bank_transfer', label: 'Chuyển khoản' },
              { value: 'other', label: 'Khác' },
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
            <Button onClick={() => setPaymentModalOpen(false)} variant="outline">
              Hủy
            </Button>
            <Button onClick={handleSubmitPayment} variant="primary" loading={false}>
              Xác nhận
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

