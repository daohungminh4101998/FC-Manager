import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, MapPin, Calendar, FileText } from 'lucide-react';
import { matchService } from '../services/matchService';
import type { Match, MatchFormData } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea } from '../components/ui/FormControls';
import { SearchInput } from '../components/ui/SearchInput';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Badge } from '../components/ui/Badge';
import { useToast } from '../contexts/ToastContext';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

export const MatchesPage: React.FC = () => {
  const { addToast } = useToast();
  const [matches, setMatches] = useState<Match[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<MatchFormData>();

  const load = useCallback(async () => {
    const data = await matchService.getAll();
    setMatches(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingMatch(null);
    reset({ opponent: '', date: dayjs().format('YYYY-MM-DD'), venue: '', note: '' });
    setIsModalOpen(true);
  };

  const openEdit = (m: Match) => {
    setEditingMatch(m);
    reset({ opponent: m.opponent, date: m.date, venue: m.venue, note: m.note || '' });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: MatchFormData) => {
    setIsSubmitting(true);
    try {
      if (editingMatch) {
        await matchService.update(editingMatch.id, data);
        addToast('Cập nhật trận đấu thành công!', 'success');
      } else {
        await matchService.create(data);
        addToast('Thêm trận đấu thành công!', 'success');
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
    await matchService.delete(deleteTarget.id);
    addToast(`Đã xóa trận đấu vs ${deleteTarget.opponent}`, 'success');
    setDeleteTarget(null);
    load();
  };

  const filtered = matches.filter(
    (m) =>
      m.opponent.toLowerCase().includes(search.toLowerCase()) ||
      m.venue.toLowerCase().includes(search.toLowerCase())
  );

  const isUpcoming = (date: string) => dayjs(date).isAfter(dayjs());

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="w-full sm:w-72">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Tìm theo đối thủ, địa điểm..."
          />
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
          Thêm trận đấu
        </Button>
      </div>

      {/* Match Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="lg:col-span-2 bg-gray-900/60 border border-white/10 rounded-2xl py-12 text-center text-white/30">
            Không tìm thấy trận đấu nào
          </div>
        ) : (
          filtered.map((match) => {
            const upcoming = isUpcoming(match.date);
            return (
              <div
                key={match.id}
                className="bg-gray-900/60 border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant={upcoming ? 'emerald' : 'gray'}>
                      {upcoming ? 'Sắp diễn ra' : 'Đã đấu'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(match)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(match)}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-3">
                  vs {match.opponent}
                </h3>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                    {dayjs(match.date).format('DD/MM/YYYY')}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    {match.venue}
                  </div>
                  {match.note && (
                    <div className="flex items-start gap-2 text-sm text-white/40">
                      <FileText className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="italic">{match.note}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
                  <Link
                    to={`/attendance?match=${match.id}`}
                    className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium
                      bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                      hover:bg-emerald-500/20 transition-colors"
                  >
                    Điểm danh
                  </Link>
                  {!upcoming && (
                    <Link
                      to={`/performance?match=${match.id}`}
                      className="flex-1 text-center py-1.5 rounded-lg text-xs font-medium
                        bg-amber-500/10 text-amber-400 border border-amber-500/20
                        hover:bg-amber-500/20 transition-colors"
                    >
                      Cập nhật sau trận
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Form Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMatch ? 'Sửa thông tin trận đấu' : 'Thêm trận đấu mới'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Đối thủ"
            required
            placeholder="FC Sao Đỏ"
            {...register('opponent', { required: 'Vui lòng nhập tên đối thủ' })}
            error={errors.opponent?.message}
          />
          <Input
            label="Ngày thi đấu"
            required
            type="date"
            {...register('date', { required: 'Vui lòng chọn ngày thi đấu' })}
            error={errors.date?.message}
          />
          <Input
            label="Địa điểm"
            required
            placeholder="Sân Mỹ Đình"
            {...register('venue', { required: 'Vui lòng nhập địa điểm' })}
            error={errors.venue?.message}
          />
          <Textarea
            label="Ghi chú"
            rows={3}
            placeholder="Ghi chú về trận đấu..."
            {...register('note')}
          />
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="secondary" type="button" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingMatch ? 'Cập nhật' : 'Thêm mới'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Xóa trận đấu"
        message={`Bạn có chắc muốn xóa trận đấu "vs ${deleteTarget?.opponent}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
