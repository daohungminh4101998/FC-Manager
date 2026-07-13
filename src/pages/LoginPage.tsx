import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Zap } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/FormControls';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface LoginFormData {
  username: string;
  password: string;
}

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      await login(data.username, data.password);
      navigate('/');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Đăng nhập thất bại!', 'error');
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
            <p className="text-xs text-white/40">Đăng nhập để tiếp tục</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Tên đăng nhập"
            {...register('username', { required: 'Vui lòng nhập tên đăng nhập' })}
            error={errors.username?.message}
            required
          />
          <Input
            label="Mật khẩu"
            type="password"
            {...register('password', { required: 'Vui lòng nhập mật khẩu' })}
            error={errors.password?.message}
            required
          />
          <Button
            type="submit"
            className="w-full"
            leftIcon={<LogIn className="w-4 h-4" />}
            isLoading={isSubmitting}
          >
            Đăng nhập
          </Button>
        </form>

        <p className="text-center text-sm text-white/40 mt-6">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};
