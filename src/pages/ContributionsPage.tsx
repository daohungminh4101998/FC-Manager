import React, { useEffect, useState } from 'react';
import { contributionService } from '../services/contributionService';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/FormControls';
import { Textarea } from '../components/ui/FormControls';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
// import { Contribution } from '../types';
interface Contribution {
  id: string;
  name: string;
  default_amount: number;
  due_date: string; // ISO string
  description?: string | null;
  createdAt: string;
}

export const ContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const navigate = useNavigate();

  const [formData, setFormData] = useState<Partial<Contribution>>({
    name: '',
    default_amount: 0,
    due_date: '',
    description: '',
  });

  const loadContributions = async () => {
    try {
      setLoading(true);
      const data = await contributionService.getAll();
      setContributions(data);
    } catch (err) {
      console.error('Failed to load contributions:', err);
      addToast('Failed to load contributions', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  const handleCreate = async () => {
    try {
      await contributionService.create({
        name: formData.name as string,
        default_amount: Number(formData.default_amount),
        due_date: formData.due_date as string,
        description: formData.description ?? undefined,
      });
      await loadContributions();
      setCreateModalOpen(false);
      addToast('Contribution created successfully', 'success');
      // reset form
      setFormData({ name: '', default_amount: 0, due_date: '', description: '' });
    } catch (err) {
      console.error('Failed to create contribution:', err);
      addToast('Failed to create contribution', 'error');
    }
  };

  const handleView = (id: string) => {
    navigate(`/contributions/${id}`);
  };

  return (
    <div className="p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Quản lý đóng quỹ đội bóng</h1>
        {isAdmin && (
          <Button onClick={() => setCreateModalOpen(true)} variant="primary" className="w-full sm:w-auto">
            Tạo đợt thu mới
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center py-8 text-white/50">Đang tải...</p>
      ) : contributions.length === 0 ? (
        <p className="text-center py-8 text-white/50">Chưa có đợt thu nào.</p>
      ) : (
        <>
          {/* Cards on mobile — the desktop table's 5 columns (name, amount, due
              date, status, action) squeeze too tightly on narrow screens */}
          <div className="sm:hidden space-y-3">
            {contributions.map((c) => (
              <div key={c.id} className="bg-gray-800 border border-white/10 rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-white font-medium">{c.name}</p>
                  <span className="shrink-0 px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                    Đang mở
                  </span>
                </div>
                <div className="mt-2 text-sm text-white/60 space-y-1">
                  <p>Số tiền mặc định: <span className="text-white">{c?.default_amount?.toLocaleString()} vnđ</span></p>
                  <p>Hạn đóng: <span className="text-white">{c.due_date}</span></p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleView(c.id)}
                  className="w-full mt-3"
                >
                  Chi tiết
                </Button>
              </div>
            ))}
          </div>

          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full bg-gray-800 border border-white/10 rounded-lg">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Tên đợt thu
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Số tiền mặc định
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Hạn đóng
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-white/50">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-700/50">
                    <td className="px-6 py-4 text-white">{c.name}</td>
                    <td className="px-6 py-4 text-white">{c?.default_amount?.toLocaleString()} vnđ</td>
                    <td className="px-6 py-4 text-white">
                      {(c.due_date)}
                    </td>
                    <td className="px-6 py-4">
                      {/* TODO: compute status from summary maybe later */}
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                        Đang mở
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(c.id)}
                      >
                        Chi tiết
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Create Modal */}
      <Modal isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)} title="Tạo đợt thu mới">
        <div className="space-y-4">
          <Input
            label="Tên đợt thu"
            value={formData.name ?? ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Số tiền mặc định (vnđ)"
            type="number"
            value={formData.default_amount ?? 0}
            onChange={(e) => setFormData({ ...formData, default_amount: Number(e.target.value) })}
            required
            min="0"
          />
          <Input
            label="Hạn đóng (dd/mm/yyyy)"
            type="date"
            value={formData.due_date ?? ''}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            required
          />
          <Textarea
            label="Mô tả (tùy chọn)"
            value={formData.description ?? ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
          <div className="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end">
            <Button onClick={() => setCreateModalOpen(false)} variant="outline" className="w-full sm:w-auto">
              Hủy
            </Button>
            <Button onClick={handleCreate} variant="primary" loading={false} className="w-full sm:w-auto">
              Tạo
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};