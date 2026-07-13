import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Ban, RotateCcw, Phone } from 'lucide-react';
import { playerService } from '../services/playerService';
import type { Player, PlayerFormData, Position } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'GK', label: 'Thủ môn (GK)' },
  { value: 'DEF', label: 'Hậu vệ (DEF)' },
  { value: 'MID', label: 'Tiền vệ (MID)' },
  { value: 'FWD', label: 'Tiền đạo (FWD)' },
];

const positionBadge: Record<Position, 'amber' | 'blue' | 'emerald' | 'red'> = {
  GK: 'amber',
  DEF: 'blue',
  MID: 'emerald',
  FWD: 'red',
};

export const PlayersPage: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
  const [deleteMode, setDeleteMode] = useState<'deactivate' | 'hard-delete'>('deactivate');
  const [checkingDeletability, setCheckingDeletability] = useState(false);
  const [canHardDelete, setCanHardDelete] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlayerFormData>();

  const load = useCallback(async () => {
    const data = await playerService.getAll();
    setPlayers(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingPlayer(null);
    reset({ name: '', jerseyNumber: undefined, position: 'GK', phone: '' });
    setIsModalOpen(true);
  };

  const openEdit = (p: Player) => {
    setEditingPlayer(p);
    reset({ name: p.name, jerseyNumber: p.jerseyNumber, position: p.position, phone: p.phone || '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: PlayerFormData) => {
    setIsSubmitting(true);
    try {
      if (editingPlayer) {
        await playerService.update(editingPlayer.id, { ...data, jerseyNumber: Number(data.jerseyNumber) });
        addToast('Cập nhật cầu thủ thành công!', 'success');
      } else {
        await playerService.create({ ...data, jerseyNumber: Number(data.jerseyNumber) });
        addToast('Thêm cầu thủ thành công!', 'success');
      }
      setIsModalOpen(false);
      load();
    } catch {
      addToast('Có lỗi xảy ra!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeactivateDialog = async (p: Player) => {
    setDeleteTarget(p);
    setDeleteMode('deactivate');
    setCanHardDelete(false);
    setCheckingDeletability(true);
    try {
      const hasRecords = await playerService.hasRelatedRecords(p.id);
      setCanHardDelete(!hasRecords);
    } catch {
      setCanHardDelete(false);
    } finally {
      setCheckingDeletability(false);
    }
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setDeleteMode('deactivate');
  };

  const handleDeactivate = async () => {
    if (!deleteTarget) return;
    try {
      await playerService.setActive(deleteTarget.id, false);
      addToast(`Đã vô hiệu hóa cầu thủ ${deleteTarget.name}`, 'success');
      closeDeleteDialog();
      load();
    } catch {
      addToast('Có lỗi xảy ra!', 'error');
    }
  };

  const handleHardDelete = async () => {
    if (!deleteTarget) return;
    try {
      await playerService.delete(deleteTarget.id);
      addToast(`Đã xóa vĩnh viễn cầu thủ ${deleteTarget.name}`, 'success');
      closeDeleteDialog();
      load();
    } catch {
      addToast('Có lỗi xảy ra!', 'error');
    }
  };

  const handleReactivate = async (p: Player) => {
    try {
      await playerService.setActive(p.id, true);
      addToast(`Đã kích hoạt lại cầu thủ ${p.name}`, 'success');
      load();
    } catch {
      addToast('Có lỗi xảy ra!', 'error');
    }
  };

  const scoped = players.filter((p) => p.isActive === (statusFilter === 'active'));
  const filtered = scoped.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      String(p.jerseyNumber).includes(search) ||
      p.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo tên, số áo, vị trí..."
          />
        </div>
        {isAdmin && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Thêm cầu thủ
          </Button>
        )}
      </div>

      {/* Status tabs */}
      <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-gray-900/60 border border-white/10">
        <button
          onClick={() => setStatusFilter('active')}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'active'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : 'text-white/50 hover:text-white/80 border border-transparent'
          }`}
        >
          Đang hoạt động
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
            statusFilter === 'inactive'
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-white/50 hover:text-white/80 border border-transparent'
          }`}
        >
          Đã vô hiệu hóa
        </button>
      </div>

      {/* Player list — cards on mobile (avoids squeezing 6 columns / horizontal scroll),
          table on sm+ where there's enough width to show everything at a glance */}
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="px-5 py-10 text-center text-white/30">
            Không tìm thấy cầu thủ nào
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-white/5">
              {filtered.map((p) => (
                <div key={p.id} className="p-4 flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-sm font-bold text-emerald-400">
                      {p.name.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">{p.name}</span>
                      <Badge variant={positionBadge[p.position]} size="sm">{p.position}</Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/50">
                      <span className="font-mono">#{p.jerseyNumber}</span>
                      {p.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {p.phone}
                        </span>
                      )}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 shrink-0">
                      {statusFilter === 'active' ? (
                        <>
                          <button
                            onClick={() => openEdit(p)}
                            className="w-10 h-10 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex items-center justify-center"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openDeactivateDialog(p)}
                            className="w-10 h-10 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                          >
                            <Ban className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleReactivate(p)}
                          className="w-10 h-10 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all flex items-center justify-center"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Cầu thủ
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Số áo
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      Vị trí
                    </th>
                    <th className="px-5 py-3.5 text-left text-xs font-medium text-white/40 uppercase tracking-wider">
                      SĐT
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-medium text-white/40 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filtered.map((p, index) => (
                    <tr key={p.id} className="hover:bg-white/3 transition-colors group">
                      <td className="px-5 py-4 text-white/30">{index + 1}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/10 border border-emerald-500/20 flex items-center justify-center">
                            <span className="text-xs font-bold text-emerald-400">
                              {p.name.charAt(0)}
                            </span>
                          </div>
                          <span className="font-medium text-white">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-mono text-white/80">#{p.jerseyNumber}</span>
                      </td>
                      <td className="px-5 py-4">
                        <Badge variant={positionBadge[p.position]}>{p.position}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        {p.phone ? (
                          <span className="flex items-center gap-1.5 text-white/60">
                            <Phone className="w-3 h-3" />
                            {p.phone}
                          </span>
                        ) : (
                          <span className="text-white/20">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {isAdmin && (
                          <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            {statusFilter === 'active' ? (
                              <>
                                <button
                                  onClick={() => openEdit(p)}
                                  className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openDeactivateDialog(p)}
                                  className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                                >
                                  <Ban className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleReactivate(p)}
                                className="p-1.5 rounded-lg text-white/40 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                              >
                                <RotateCcw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <div className="px-5 py-3 border-t border-white/5 text-xs text-white/30">
          {filtered.length} / {scoped.length} cầu thủ {statusFilter === 'active' ? 'đang hoạt động' : 'đã vô hiệu hóa'}
        </div>
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingPlayer ? 'Sửa thông tin cầu thủ' : 'Thêm cầu thủ mới'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Họ tên"
            required
            placeholder="Nguyễn Văn A"
            {...register('name', { required: 'Vui lòng nhập họ tên' })}
            error={errors.name?.message}
          />
          <Input
            label="Số áo"
            required
            type="number"
            min={1}
            max={99}
            placeholder="10"
            {...register('jerseyNumber', {
              required: 'Vui lòng nhập số áo',
              min: { value: 1, message: 'Số áo tối thiểu là 1' },
              max: { value: 99, message: 'Số áo tối đa là 99' },
            })}
            error={errors.jerseyNumber?.message}
          />
          <Select
            label="Vị trí"
            required
            options={POSITIONS}
            {...register('position', { required: true })}
          />
          <Input
            label="Số điện thoại"
            type="tel"
            placeholder="09xxxxxxxx (không bắt buộc)"
            {...register('phone')}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingPlayer ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Deactivate / Hard delete */}
      {deleteMode === 'deactivate' ? (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Vô hiệu hóa cầu thủ"
          message={`Cầu thủ "${deleteTarget?.name}" sẽ không xuất hiện trong danh sách chọn cho trận mới, đóng quỹ mới, nhưng lịch sử điểm danh/thành tích cũ vẫn được giữ nguyên.`}
          confirmLabel="Vô hiệu hóa"
          onConfirm={handleDeactivate}
          onCancel={closeDeleteDialog}
        >
          {checkingDeletability ? (
            <p className="text-xs text-white/30 -mt-3 mb-4">Đang kiểm tra dữ liệu liên quan...</p>
          ) : canHardDelete ? (
            <button
              type="button"
              onClick={() => setDeleteMode('hard-delete')}
              className="text-xs text-red-400 hover:text-red-300 underline -mt-3 mb-4"
            >
              Cầu thủ này chưa có dữ liệu gì — xóa vĩnh viễn thay vì vô hiệu hóa?
            </button>
          ) : null}
        </ConfirmDialog>
      ) : (
        <ConfirmDialog
          isOpen={!!deleteTarget}
          title="Xóa vĩnh viễn cầu thủ"
          message={`Cầu thủ "${deleteTarget?.name}" chưa có dữ liệu điểm danh/thành tích/đóng góp nào. Xóa vĩnh viễn sẽ xóa hẳn khỏi hệ thống và KHÔNG THỂ hoàn tác.`}
          confirmLabel="Xóa vĩnh viễn"
          onConfirm={handleHardDelete}
          onCancel={closeDeleteDialog}
        >
          <button
            type="button"
            onClick={() => setDeleteMode('deactivate')}
            className="text-xs text-white/40 hover:text-white/70 underline -mt-3 mb-4"
          >
            ← Quay lại vô hiệu hóa
          </button>
        </ConfirmDialog>
      )}
    </div>
  );
};
