import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Descriptions, Spin, Typography } from '@douyinfe/semi-ui';
import { adminPagePosts } from '@/api/blog';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 后台首页：会话信息 + 博客统计 + 快捷入口 */
export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle('menu.dashboard');

  const { user, tenants, currentTenantId } = useAuthStore();
  const [blogTotal, setBlogTotal] = useState<number | null>(null);

  useEffect(() => {
    adminPagePosts({ page: 1, pageSize: 1 })
      .then((data) => setBlogTotal(data.total))
      .catch(() => undefined);
  }, []);

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
      </div>
    </div>
  );
}
