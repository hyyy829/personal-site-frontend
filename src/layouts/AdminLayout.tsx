import { Suspense, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Avatar, Dropdown, Nav, Select, Spin } from '@douyinfe/semi-ui';
import { IconExit, IconHome } from '@douyinfe/semi-icons';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageToggle from '@/components/common/LanguageToggle';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 后台菜单：permission 为空表示不控制；前端仅做体验层过滤，权限以后端校验为准 */
const ADMIN_MENUS = [
  { itemKey: '/admin', labelKey: 'menu.dashboard', permission: null },
  { itemKey: '/admin/blog', labelKey: 'menu.blogManage', permission: 'blog:view' },
  { itemKey: '/admin/project', labelKey: 'menu.projectManage', permission: 'project:view' },
  { itemKey: '/admin/user', labelKey: 'menu.userManage', permission: 'system:view' },
  { itemKey: '/admin/role', labelKey: 'menu.roleManage', permission: 'system:view' },
  { itemKey: '/admin/permission', labelKey: 'menu.permissionManage', permission: 'system:view' },
  { itemKey: '/admin/tenant', labelKey: 'menu.tenantManage', permission: 'tenant:manage' },
  { itemKey: '/admin/system', labelKey: 'menu.systemManage', permission: 'system:view' },
];

/** 后台布局：侧边菜单 + 顶栏（租户切换 / 用户 / 主题 / 语言） */
export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle();

  const { user, tenants, currentTenantId, permissions, fetchMe, logout, switchTenant } = useAuthStore();

  useEffect(() => {
    void fetchMe().catch(() => undefined);
  }, [fetchMe]);

  const visibleMenus = ADMIN_MENUS.filter((item) => !item.permission || permissions.includes(item.permission));

  return (
    <div className="site-admin">
      <aside className="site-admin-sidebar">
        <Nav
          style={{ flex: 1 }}
          selectedKeys={[location.pathname]}
          items={visibleMenus.map((item) => ({
            itemKey: item.itemKey,
            text: t(item.labelKey),
          }))}
          onSelect={(data) => navigate(String(data.itemKey))}
          header={{ text: t('common.siteName') }}
          footer={{ collapseButton: true }}
        />
      </aside>
      <div className="site-admin-main">
        <header className="site-admin-header">
          {tenants.length > 1 && (
            <Select
              value={currentTenantId}
              onChange={(value) => void switchTenant(Number(value))}
              optionList={tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))}
              style={{ width: 160 }}
              size="small"
              aria-label={t('admin.tenantLabel')}
            />
          )}
          <LanguageToggle />
          <ThemeToggle />
          <Dropdown
            trigger="click"
            position="bottomRight"
            render={
              <Dropdown.Menu>
                <Dropdown.Item icon={<IconHome />} onClick={() => navigate('/')}>
                  {t('auth.backHome')}
                </Dropdown.Item>
                <Dropdown.Item icon={<IconExit />} onClick={() => void logout().then(() => navigate('/login'))}>
                  {t('common.actions.logout')}
                </Dropdown.Item>
              </Dropdown.Menu>
            }
          >
            <span style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Avatar size="small" color="light-blue">
                {(user.nickname || user.username || '?').slice(0, 1).toUpperCase()}
              </Avatar>
              {user.nickname || user.username}
            </span>
          </Dropdown>
        </header>
        <main className="site-admin-content">
          <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '96px auto' }} />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
