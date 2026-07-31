import React, { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Plus, Pencil, Trash2, MapPin, Calendar, FileText, Video, X } from 'lucide-react';
import { matchService } from '../services/matchService';
import { attendanceService } from '../services/attendanceService';
import { performanceService } from '../services/performanceService';
import type { Match, MatchFormData, MatchResult } from '../types';
import { Modal } from '../components/ui/Modal';
import { Button } from '../components/ui/Button';
import { Input, Textarea, Select } from '../components/ui/FormControls';
import { SearchInput } from '../components/ui/SearchInput';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { Badge } from '../components/ui/Badge';
import { VenueLink } from '../components/ui/VenueLink';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { getYouTubeEmbedUrl } from '../utils/youtube';
import dayjs from 'dayjs';
import { Link } from 'react-router-dom';

type BadgeVariant = 'emerald' | 'blue' | 'amber' | 'red' | 'purple' | 'gray';

const resultMeta: Record<MatchResult, { label: string; variant: BadgeVariant }> = {
  Win: { label: 'Thắng', variant: 'emerald' },
  Draw: { label: 'Hoà', variant: 'amber' },
  Loss: { label: 'Thua', variant: 'red' },
};

interface MatchFormValues {
  opponent: string;
  date: string;
  venue: string;
  note: string;
  result: '' | MatchResult;
  locationUrl: string;
  highlightUrl: string;
}

const URL_PATTERN = { value: /^https?:\/\/.+/i, message: 'URL không hợp lệ' };

export const MatchesPage: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [matches, setMatches] = useState<Match[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMatch, setEditingMatch] = useState<Match | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Match | null>(null);
  const [deleteImpact, setDeleteImpact] = useState<{
    attendance: number;
    scorers: number;
    goalkeepers: number;
    defenders: number;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [highlightMatch, setHighlightMatch] = useState<Match | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<MatchFormValues>();

  const watchedResult = watch('result');

  const load = useCallback(async () => {
    const data = await matchService.getAll();
    setMatches(data);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => {
    setEditingMatch(null);
    reset({ opponent: '', date: dayjs().format('YYYY-MM-DD'), venue: '', note: '', result: '', locationUrl: '', highlightUrl: '' });
    setIsModalOpen(true);
  };

  const openEdit = (m: Match) => {
    setEditingMatch(m);
    reset({
      opponent: m.opponent,
      date: m.date,
      venue: m.venue,
      note: m.note || '',
      result: m.result || '',
      locationUrl: m.locationUrl || '',
      highlightUrl: m.highlightUrl || '',
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (data: MatchFormValues) => {
    setIsSubmitting(true);
    const payload: MatchFormData = {
      opponent: data.opponent,
      date: data.date,
      venue: data.venue,
      note: data.note,
      result: data.result || null,
      locationUrl: data.locationUrl || null,
      highlightUrl: data.highlightUrl || null,
    };
    try {
      if (editingMatch) {
        await matchService.update(editingMatch.id, payload);
        addToast('Cập nhật trận đấu thành công!', 'success');
      } else {
        await matchService.create(payload);
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

  const openDeleteDialog = async (match: Match) => {
    setDeleteTarget(match);
    setDeleteImpact(null);
    try {
      const [attendance, performances, gkStats, defenders] = await Promise.all([
        attendanceService.getByMatch(match.id),
        performanceService.getByMatch(match.id),
        performanceService.getGoalkeeperStats(match.id),
        performanceService.getDefenders(match.id),
      ]);
      setDeleteImpact({
        attendance: attendance?.records.length ?? 0,
        scorers: performances.filter((p) => p.goals > 0 || p.assists > 0).length,
        goalkeepers: gkStats.length,
        defenders: defenders.length,
      });
    } catch {
      setDeleteImpact({ attendance: 0, scorers: 0, goalkeepers: 0, defenders: 0 });
    }
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    setDeleteImpact(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await matchService.delete(deleteTarget.id);
      addToast(`Đã xóa trận đấu vs ${deleteTarget.opponent}`, 'success');
      closeDeleteDialog();
      load();
    } catch {
      addToast('Có lỗi xảy ra!', 'error');
    }
  };

  const deleteMessage = (() => {
    if (!deleteTarget) return '';
    if (!deleteImpact) return 'Đang kiểm tra dữ liệu liên quan...';
    const { attendance, scorers, goalkeepers, defenders } = deleteImpact;
    if (attendance === 0 && scorers === 0 && goalkeepers === 0 && defenders === 0) {
      return `Bạn có chắc muốn xóa trận đấu "vs ${deleteTarget.opponent}"? Trận này chưa có dữ liệu điểm danh/thành tích nào.`;
    }
    return `Xóa trận đấu "vs ${deleteTarget.opponent}" sẽ xóa VĨNH VIỄN ${attendance} lượt điểm danh, ${scorers} cầu thủ ghi bàn/kiến tạo, ${goalkeepers} thủ môn, ${defenders} hậu vệ đã ghi nhận cho trận này. Hành động không thể hoàn tác.`;
  })();

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
        {isAdmin && (
          <Button leftIcon={<Plus className="w-4 h-4" />} onClick={openCreate}>
            Thêm trận đấu
          </Button>
        )}
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
                    {match.result ? (
                      <Badge variant={resultMeta[match.result].variant}>
                        {resultMeta[match.result].label}
                      </Badge>
                    ) : (
                      <Badge variant={upcoming ? 'emerald' : 'gray'}>
                        {upcoming ? 'Sắp diễn ra' : 'Đã đấu'}
                      </Badge>
                    )}
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEdit(match)}
                        className="w-9 h-9 rounded-lg text-white/40 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex items-center justify-center"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteDialog(match)}
                        className="w-9 h-9 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
                    <VenueLink venue={match.venue} locationUrl={match.locationUrl} />
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
                    className="flex-1 flex items-center justify-center min-h-[40px] text-center py-2 rounded-lg text-xs font-medium
                      bg-emerald-500/10 text-emerald-400 border border-emerald-500/20
                      hover:bg-emerald-500/20 transition-colors"
                  >
                    Điểm danh
                  </Link>
                  {!upcoming && isAdmin && (
                    <Link
                      to={`/performance?match=${match.id}`}
                      className="flex-1 flex items-center justify-center min-h-[40px] text-center py-2 rounded-lg text-xs font-medium
                        bg-amber-500/10 text-amber-400 border border-amber-500/20
                        hover:bg-amber-500/20 transition-colors"
                    >
                      Cập nhật sau trận
                    </Link>
                  )}
                  {match.highlightUrl && (
                    <button
                      onClick={() => setHighlightMatch(match)}
                      className="flex-1 flex items-center justify-center gap-1.5 min-h-[40px] text-center py-2 rounded-lg text-xs font-medium
                        bg-red-500/10 text-red-400 border border-red-500/20
                        hover:bg-red-500/20 transition-colors"
                    >
                      <Video className="w-3.5 h-3.5" />
                      Highlight
                    </button>
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
          <Select
            label="Kết quả"
            {...register('result')}
            options={[
              { value: '', label: '-- Chưa cập nhật --' },
              { value: 'Win', label: 'Thắng' },
              { value: 'Draw', label: 'Hoà' },
              { value: 'Loss', label: 'Thua' },
            ]}
          />
          <Input
            label="Link địa điểm (Google Maps)"
            placeholder="https://maps.google.com/..."
            {...register('locationUrl', { pattern: URL_PATTERN })}
            error={errors.locationUrl?.message}
          />
          {watchedResult && (
            <Input
              label="Link highlight (YouTube)"
              placeholder="https://youtube.com/watch?v=..."
              {...register('highlightUrl', { pattern: URL_PATTERN })}
              error={errors.highlightUrl?.message}
            />
          )}
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
        message={deleteMessage}
        onConfirm={handleDelete}
        onCancel={closeDeleteDialog}
      />

      {/* Highlight Viewer */}
      {highlightMatch && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setHighlightMatch(null)}
        >
          <div
            className="relative w-full sm:max-w-3xl px-0 sm:px-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setHighlightMatch(null)}
              className="absolute -top-11 right-3 sm:-top-12 sm:right-4 w-9 h-9 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            {(() => {
              const embedUrl = highlightMatch.highlightUrl ? getYouTubeEmbedUrl(highlightMatch.highlightUrl) : null;
              return embedUrl ? (
                <div className="aspect-video w-full bg-black sm:rounded-xl overflow-hidden shadow-2xl">
                  <iframe
                    src={embedUrl}
                    className="w-full h-full"
                    allowFullScreen
                    title={`Highlight vs ${highlightMatch.opponent}`}
                  />
                </div>
              ) : (
                <div className="bg-gray-900 border border-white/10 sm:rounded-xl p-8 text-center">
                  <a
                    href={highlightMatch.highlightUrl ?? undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
                  >
                    Xem link gốc
                  </a>
                </div>
              );
            })()}
            <p className="mt-3 px-4 sm:px-0 text-sm text-white/60 text-center sm:text-left">
              vs {highlightMatch.opponent}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
