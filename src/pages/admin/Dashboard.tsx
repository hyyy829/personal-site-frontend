import { useEffect, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Descriptions, Spin } from 'antd';
import { adminPagePosts } from '@/api/blog';
import { getTopPaths, getVisitSummary } from '@/api/stats';
import type { TopPath, VisitSummary } from '@/types/stats';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';

/** 单个指标卡：标签走次要色，数值使用 token 字号，加载中保持占位 */
function MetricCard({ label, loading, children }: { label: ReactNode; loading: boolean; children?: ReactNode }) {
  return (
    <div className="site-card">
      <div className="site-meta">{label}</div>
      {loading ? (
        <div style={{ marginTop: 'var(--site-space-3)' }}>
          <Spin />
        </div>
      ) : (
        <div
          style={{
            fontSize: 'var(--site-font-size-xxl)',
            fontWeight: 'var(--site-font-weight-semibold)',
            lineHeight: 'var(--site-line-height-tight)',
            marginTop: 'var(--site-space-2)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}

/** 后台首页：会话信息 + 博客统计 + 访问统计 + 快捷入口 */
export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle('menu.dashboard');

  const { user, tenants, currentTenantId, permissions } = useAuthStore();
  const [blogTotal, setBlogTotal] = useState<number | null>(null);
  const [visitSummary, setVisitSummary] = useState<VisitSummary | null>(null);
  const [topPaths, setTopPaths] = useState<TopPath[]>([]);
  const canViewStats = permissions.includes('stats:view');

  useEffect(() => {
    adminPagePosts({ page: 1, pageSize: 1 })
      .then((data) => setBlogTotal(data.total))
      .catch(() => undefined);
    if (canViewStats) {
      getVisitSummary().then(setVisitSummary).catch(() => undefined);
      getTopPaths(5).then(setTopPaths).catch(() => undefined);
    }
  }, [canViewStats]);

  const currentTenant = tenants.find((tenant) => tenant.id === currentTenantId);
  const unitStyle = {
    fontSize: 'var(--site-font-size-md)',
    fontWeight: 'var(--site-font-weight-normal)',
    color: 'var(--site-color-text-tertiary)',
  } as const;

  return (
    <div className="site-admin-page">
      <PageHeader
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.welcome', { name: user.nickname || user.username })}
      />

      <div className="site-grid">
        <MetricCard label={t('admin.dashboard.blogTotal')} loading={blogTotal === null}>
          {blogTotal}
          <span style={{ ...unitStyle, marginLeft: 'var(--site-space-1)' }}>{t('admin.dashboard.postUnit')}</span>
        </MetricCard>

        <MetricCard label={t('admin.dashboard.visits')} loading={visitSummary === null}>
          {visitSummary?.total}
          <span style={{ ...unitStyle, marginLeft: 'var(--site-space-2)' }}>
            ({t('admin.dashboard.today')} {visitSummary?.today})
          </span>
        </MetricCard>

        <div className="site-card">
          <div className="site-meta">{t('admin.dashboard.tenant')}</div>
          <div style={{ marginTop: 'var(--site-space-3)' }}>
            <Descriptions
              size="small"
              column={1}
              colon={false}
              items={[
                {
                  key: 'tenant',
                  label: t('admin.tenantLabel'),
                  children: currentTenant ? `${currentTenant.name} (#${currentTenant.id})` : currentTenantId,
                },
                { key: 'user', label: t('common.siteName'), children: user.username },
              ]}
            />
          </div>
        </div>

        <div className="site-card">
          <div className="site-meta">{t('admin.dashboard.quickLinks')}</div>
          <div style={{ display: 'flex', gap: 'var(--site-space-3)', flexWrap: 'wrap', marginTop: 'var(--site-space-4)' }}>
            <Button type="primary" onClick={() => navigate('/admin/blog')}>
              {t('admin.dashboard.goBlog')}
            </Button>
            <Button onClick={() => navigate('/admin/system')}>{t('admin.dashboard.goSystem')}</Button>
          </div>
        </div>

        {canViewStats && topPaths.length > 0 && (
          <div className="site-card" style={{ gridColumn: '1 / -1' }}>
            <div className="site-meta">{t('admin.dashboard.topPaths')}</div>
            <div style={{ marginTop: 'var(--site-space-3)' }}>
              {topPaths.map((item) => (
                <div
                  key={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--site-space-4)',
                    padding: 'var(--site-space-2) 0',
                  }}
                >
                  <span style={{ color: 'var(--site-color-text-secondary)' }}>{item.path}</span>
                  <span style={{ color: 'var(--site-color-text-tertiary)', fontSize: 'var(--site-font-size-sm)' }}>{item.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
