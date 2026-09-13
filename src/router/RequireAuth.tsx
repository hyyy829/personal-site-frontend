import { Navigate, useLocation } from 'react-router-dom';
import { Spin } from 'antd';
import { useTranslation } from 'react-i18next';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';

/**
 * 后台路由守卫：前端只做体验层跳转，接口权限由后端最终校验（CONSTRAINTS.md 7.1.4）。
 */
export default function RequireAuth({ children }: { children: ReactNode }) {
  const { token } = useAuthStore();
  const location = useLocation();

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

export function AuthChecking() {
  const { t } = useTranslation();
  return (
    <div className="site-state" style={{ gap: 'var(--site-space-3)' }}>
      <Spin size="large" />
      <span>{t('common.state.loading')}</span>
    </div>
  );
}
