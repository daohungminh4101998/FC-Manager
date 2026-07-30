import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import type { Role } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Role[];
  /** Require a logged-in user (any role) even when no allowedRoles restriction applies. */
  requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles, requireAuth }) => {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const mustAuthenticate = requireAuth || !!allowedRoles;
  const isRoleAllowed = !allowedRoles || (!!user && allowedRoles.includes(user.role));

  useEffect(() => {
    if (isAuthenticated && allowedRoles && !isRoleAllowed) {
      addToast('Bạn không có quyền truy cập trang này!', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, allowedRoles, isRoleAllowed]);

  if (mustAuthenticate && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isRoleAllowed) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
