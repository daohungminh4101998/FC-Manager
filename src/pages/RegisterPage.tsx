import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input, Select } from '../components/ui/FormControls';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authService } from '../services/authService';
import type { Player } from '../types';

interface RegisterFormData {
  accountType: 'User' | 'Player';
  username: string;
  password: string;
  confirmPassword: string;
  playerId: string;
}

export const RegisterPage: React.FC = () => {
  const { register: registerAccount } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [loadingPlayers, setLoadingPlayers] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({ defaultValues: { accountType: 'User' } });

  const accountType = watch('accountType');
  const password = watch('password');

  useEffect(() => {
    if (accountType !== 'Player') return;
    setLoadingPlayers(true);
    authService
      .getAvailablePlayersForRegistration()
      .then(setAvailablePlayers)
      .catch(() => addToast('Không thể tải danh sách cầu thủ!', 'error'))
      .finally(() => setLoadingPlayers(false));
  }, [accountType, addToast]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      if (data.accountType === 'Player') {
        await registerAccount({
          role: 'Player',
          username: data.username,
          password: data.password,
          playerId: data.playerId,
        });
      } else {
        await registerAccount({
          role: 'User',
          username: data.username,
          password: data.password,
        });
      }
      addToast('Đăng ký thành công!', 'success');
      navigate('/');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Đăng ký thất bại!', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl p-6 sm:p-8">
        <div className="flex flex-col items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-bold text-white">⚽ FC Manager</h1>
            <p className="text-xs text-white/40">Tạo tài khoản mới</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Select
            label="Loại tài khoản"
            {...register('accountType')}
            options={[
              { value: 'User', label: 'Người xem' },
              { value: 'Player', label: 'Cầu thủ' },
            ]}
          />

          {accountType === 'Player' && (
            <Select
              label="Chọn cầu thủ"
              {...register('playerId', { required: 'Vui lòng chọn cầu thủ' })}
              error={errors.playerId?.message}
              required
              disabled={loadingPlayers}
              options={[
                { value: '', label: loadingPlayers ? 'Đang tải...' : '-- Chọn cầu thủ --' },
                ...availablePlayers.map((p) => ({ value: p.id, label: `#${p.jerseyNumber} ${p.name}` })),
              ]}
            />
          )}

          <Input
            label="Tên đăng nhập"
            {...register('username', {
              required: 'Vui lòng nhập tên đăng nhập',
              minLength: { value: 3, message: 'Tối thiểu 3 ký tự' },
            })}
            error={errors.username?.message}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            {...register('password', {
              required: 'Vui lòng nhập mật khẩu',
              minLength: { value: 6, message: 'Tối thiểu 6 ký tự' },
            })}
            error={errors.password?.message}
            required
          />
          <Input
            label="Xác nhận mật khẩu"
            type="password"
            {...register('confirmPassword', {
              required: 'Vui lòng nhập lại mật khẩu',
              validate: (value) => value === password || 'Mật khẩu xác nhận không khớp',
            })}
            error={errors.confirmPassword?.message}
            required
          />

          <Button
            type="submit"
            className="w-full"
            leftIcon={<UserPlus className="w-4 h-4" />}
            isLoading={isSubmitting}
          >
            Đăng ký
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};
