import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Descriptions, Spin, Typography } from '@douyinfe/semi-ui';
import { adminPagePosts } from '@/api/blog';
import { getTopPaths, getVisitSummary } from '@/api/infra';
import type { TopPath, VisitSummary } from '@/types/infra';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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

  return (
    <div className="site-admin-page">
      <Typography.Title heading={4}>{t('admin.dashboard.title')}</Typography.Title>
      <Typography.Paragraph type="tertiary">{t('admin.dashboard.welcome', { name: user.nickname || user.username })}</Typography.Paragraph>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <Card title={t('admin.dashboard.blogTotal')}>
          {blogTotal === null ? (
            <Spin />
          ) : (
            <Typography.Title heading={2} style={{ margin: 0 }}>
              {blogTotal}
            </Typography.Title>
          )}
        </Card>
        <Card title={t('admin.dashboard.visits')}>
          {visitSummary === null ? (
            <Spin />
          ) : (
            <Typography.Title heading={2} style={{ margin: 0 }}>
              {visitSummary.total} <Typography.Text type="tertiary" size="small">({t('admin.dashboard.today')} {visitSummary.today})</Typography.Text>
            </Typography.Title>
          )}
        </Card>
        <Card title={t('admin.dashboard.tenant')}>
          <Descriptions
            data={[
              { key: t('admin.tenantLabel'), value: currentTenant ? `${currentTenant.name} (#${currentTenant.id})` : currentTenantId },
              { key: t('common.siteName'), value: user.username },
            ]}
          />
        </Card>
        <Card title={t('admin.dashboard.quickLinks')}>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Button theme="solid" onClick={() => navigate('/admin/blog')}>
              {t('admin.dashboard.goBlog')}
            </Button>
            <Button onClick={() => navigate('/admin/system')}>{t('admin.dashboard.goSystem')}</Button>
          </div>
        </Card>
        {canViewStats && topPaths.length > 0 && (
          <Card title={t('admin.dashboard.topPaths')} style={{ gridColumn: '1 / -1' }}>
            {topPaths.map((item) => (
              <div key={item.path} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                <Typography.Text>{item.path}</Typography.Text>
                <Typography.Text type="tertiary">{item.count}</Typography.Text>
              </div>
            ))}
          </Card>
        )}
      </div>
    </div>
  );
}
