import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const isRoleAllowed = !allowedRoles || (!!user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (isAuthenticated && !isRoleAllowed) {
      addToast('Bạn không có quyền truy cập trang này!', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isRoleAllowed]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isRoleAllowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
