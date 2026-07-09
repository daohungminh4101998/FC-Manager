import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, Phone } from 'lucide-react';
import { playerService } from '../services/playerService';
import type { Player, PlayerFormData, Position } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { Badge } from '../components/ui/Badge';
import { SearchInput } from '../components/ui/SearchInput';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../contexts/ToastContext';

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
  const [players, setPlayers] = useState<Player[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);
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

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await playerService.delete(deleteTarget.id);
    addToast(`Đã xóa cầu thủ ${deleteTarget.name}`, 'success');
    setDeleteTarget(null);
    load();
  };

  const filtered = players.filter(
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
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Thêm cầu thủ
        </Button>
      </div>

      {/* Table */}
      <div className="bg-gray-900/60 border border-white/10 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
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
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-white/30">
                    Không tìm thấy cầu thủ nào
                  </td>
                </tr>
              ) : (
                filtered.map((p, index) => (
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
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-white/5 text-xs text-white/30">
          {filtered.length} / {players.length} cầu thủ
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

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa cầu thủ"
        message={`Bạn có chắc muốn xóa cầu thủ "${deleteTarget?.name}"? Thao tác này không thể hoàn tác.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
