import React, { useEffect, useState } from "react";
import { contributionService } from "../services/contributionService";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/FormControls";
import { Textarea } from "../components/ui/FormControls";
import { useToast } from "../contexts/ToastContext";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContribution, setEditingContribution] =
    useState<Contribution | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<Partial<Contribution>>({
    name: "",
    default_amount: 0,
    due_date: "",
    description: "",
  });

  const loadContributions = async () => {
    try {
      setLoading(true);
      const data = await contributionService.getAll();
      setContributions(data);
    } catch (err) {
      console.error("Failed to load contributions:", err);
      addToast("Failed to load contributions", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContributions();
  }, []);

  const resetForm = () => {
    setFormData({
      name: "",
      default_amount: 0,
      due_date: "",
      description: "",
    });
  };

  const openCreate = () => {
    setEditingContribution(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEdit = (contribution: Contribution) => {
    setEditingContribution(contribution);
    setFormData({
      name: contribution.name,
      default_amount: contribution.default_amount,
      due_date: contribution.due_date,
      description: contribution.description ?? "",
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingContribution) {
        await contributionService.update(editingContribution.id, {
          name: formData.name as string,
          default_amount: Number(formData.default_amount),
          due_date: formData.due_date as string,
          description: formData.description ?? undefined,
        });
        addToast("Cập nhật đợt thu thành công", "success");
      } else {
        await contributionService.create({
          name: formData.name as string,
          default_amount: Number(formData.default_amount),
          due_date: formData.due_date as string,
          description: formData.description ?? undefined,
        });
        addToast("Tạo đợt thu thành công", "success");
      }
      await loadContributions();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save contribution:", err);
      addToast("Có lỗi xảy ra", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await contributionService.delete(deleteTarget);
      addToast("Đã xóa đợt thu", "success");
      await loadContributions();
    } catch (err) {
      console.error("Failed to delete contribution:", err);
      addToast("Không thể xóa đợt thu", "error");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleView = (id: string) => {
    navigate(`/contributions/${id}`);
  };
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">
          Quản lý đóng quỹ đội bóng
        </h1>
        <div className="flex space-x-3">
          <Button onClick={openCreate} variant="primary">
            Tạo đợt thu mới
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-8 text-white/50">Đang tải...</p>
      ) : contributions.length === 0 ? (
        <p className="text-center py-8 text-white/50">Chưa có đợt thu nào.</p>
      ) : (
        <div className="overflow-x-auto">
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
                  <td className="px-6 py-4 text-white">
                    {c?.default_amount?.toLocaleString()} vnđ
                  </td>
                  <td className="px-6 py-4 text-white">{c.due_date}</td>
                  <td className="px-6 py-4">
                    {/* TODO: compute status from summary maybe later */}
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-500/20 text-blue-400">
                      Đang mở
                    </span>
                  </td>
                  <td className="py-4 text-left space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(c.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <button
                      onClick={() => openEdit(c)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(c.id)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit/Create Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingContribution ? "Chỉnh sửa đợt thu" : "Tạo đợt thu mới"}
      >
        <div className="space-y-4">
          <Input
            label="Tên đợt thu"
            value={formData.name ?? ""}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Số tiền mặc định (vnđ)"
            type="number"
            value={formData.default_amount ?? 0}
            onChange={(e) =>
              setFormData({
                ...formData,
                default_amount: Number(e.target.value),
              })
            }
            required
            min="0"
          />
          <Input
            label="Hạn đóng (dd/mm/yyyy)"
            type="date"
            value={formData.due_date ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, due_date: e.target.value })
            }
            required
          />
          <Textarea
            label="Mô tả (tùy chọn)"
            value={formData.description ?? ""}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <div className="flex justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              isLoading={isSubmitting}
              onClick={handleSubmit}
            >
              {editingContribution ? "Cập nhật" : "Tạo"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa đợt thu"
        message={`Bạn có chắc muốn xóa đợt thu này? Hành động này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
