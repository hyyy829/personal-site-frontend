import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spin, Typography } from 'antd';
import type { ReactNode } from 'react';
import { useAuthStore } from '@/stores/auth';

/**
 * 页面级权限守卫：菜单里被隐藏的页面若直接输入 URL 访问，在此拦截（CONSTRAINTS.md 7.1.4）。
 * 只渲染无权限提示、不做跳转，避免把用户弹回首页；接口权限仍由后端最终校验。
 */
export default function RequirePermission({ permission, children }: { permission: string; children: ReactNode }) {
  const { t } = useTranslation();
  const permissions = useAuthStore((state) => state.permissions);
  const initialized = useAuthStore((state) => state.initialized);

  // 硬刷新时 fetchMe 尚未返回，此时 permissions 为空会误判为无权限，先展示加载态
  if (!initialized) {
    return (
      <div className="site-state">
        <Spin size="large" />
      </div>
    );
  }

  if (!permissions.includes(permission)) {
    return (
      <div className="site-state" style={{ flexDirection: 'column', gap: 'var(--site-space-3)' }}>
        <Typography.Title level={4}>{t('common.state.forbidden')}</Typography.Title>
        <Link to="/admin">
          <Button type="primary">{t('common.actions.back')}</Button>
        </Link>
      </div>
    );
  }

  return children;
}
