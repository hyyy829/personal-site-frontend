import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { MenuProps } from 'antd';
import { Avatar, Button, Drawer, Dropdown, Menu, Select, Spin } from 'antd';
import {
  ApartmentOutlined,
  CloudUploadOutlined,
  CommentOutlined,
  DashboardOutlined,
  FieldTimeOutlined,
  FileTextOutlined,
  HomeOutlined,
  LinkOutlined as LinkIcon,
  LoginOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuOutlined,
  MenuUnfoldOutlined,
  ProfileOutlined,
  ProjectOutlined,
  SafetyCertificateOutlined,
  SettingOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageToggle from '@/components/common/LanguageToggle';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { fetchMyMenus } from '@/api/menu';
import type { MenuNode } from '@/types/menu';

type MenuItem = NonNullable<MenuProps['items']>[number];

/** 后台菜单：permission 为空表示不控制；前端仅做体验层过滤，权限以后端校验为准 */
const ADMIN_MENUS = [
  { itemKey: '/admin', labelKey: 'menu.dashboard', permission: null, icon: <DashboardOutlined /> },
  { itemKey: '/admin/blog', labelKey: 'menu.blogManage', permission: 'blog:view', icon: <FileTextOutlined /> },
  { itemKey: '/admin/project', labelKey: 'menu.projectManage', permission: 'project:view', icon: <ProjectOutlined /> },
  { itemKey: '/admin/comment', labelKey: 'menu.commentManage', permission: 'comment:view', icon: <CommentOutlined /> },
  { itemKey: '/admin/friendlink', labelKey: 'menu.friendlinkManage', permission: 'friendlink:view', icon: <LinkIcon /> },
  { itemKey: '/admin/timeline', labelKey: 'menu.timelineManage', permission: 'timeline:view', icon: <FieldTimeOutlined /> },
  { itemKey: '/admin/file', labelKey: 'menu.fileManage', permission: 'file:view', icon: <CloudUploadOutlined /> },
  { itemKey: '/admin/user', labelKey: 'menu.userManage', permission: 'system:view', icon: <UserOutlined /> },
  { itemKey: '/admin/role', labelKey: 'menu.roleManage', permission: 'system:view', icon: <TeamOutlined /> },
  { itemKey: '/admin/permission', labelKey: 'menu.permissionManage', permission: 'system:view', icon: <SafetyCertificateOutlined /> },
  { itemKey: '/admin/tenant', labelKey: 'menu.tenantManage', permission: 'tenant:manage', icon: <ApartmentOutlined /> },
  { itemKey: '/admin/system', labelKey: 'menu.systemManage', permission: 'system:view', icon: <SettingOutlined /> },
  { itemKey: '/admin/operation-log', labelKey: 'menu.operationlogManage', permission: 'operationlog:view', icon: <ProfileOutlined /> },
  { itemKey: '/admin/login-log', labelKey: 'menu.loginlogManage', permission: 'loginlog:view', icon: <LoginOutlined /> },
];

/** 图标白名单：后端只回组件名，显式列举可避免打包器无法静态分析整个图标包 */
const MENU_ICONS: Record<string, JSX.Element> = {
  ApartmentOutlined: <ApartmentOutlined />,
  CloudUploadOutlined: <CloudUploadOutlined />,
  CommentOutlined: <CommentOutlined />,
  DashboardOutlined: <DashboardOutlined />,
  FieldTimeOutlined: <FieldTimeOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  LinkOutlined: <LinkIcon />,
  LoginOutlined: <LoginOutlined />,
  ProfileOutlined: <ProfileOutlined />,
  ProjectOutlined: <ProjectOutlined />,
  SafetyCertificateOutlined: <SafetyCertificateOutlined />,
  SettingOutlined: <SettingOutlined />,
  TeamOutlined: <TeamOutlined />,
  UserOutlined: <UserOutlined />,
};

function resolveMenuIcon(name: string | null | undefined): JSX.Element | undefined {
  return name ? MENU_ICONS[name] : undefined;
}

/** 服务端菜单转 antd items；path 为空的节点只做分组，不参与跳转 */
function toMenuItems(nodes: MenuNode[], t: (key: string) => string, permissions: string[]): MenuItem[] {
  const items: MenuItem[] = [];
  for (const node of nodes) {
    const children = node.children?.length ? toMenuItems(node.children, t, permissions) : [];
    const allowed = permissions.includes(node.code);
    // 纯分组节点自身权限码可能不在权限表里，只要有可见子项就保留，否则会连带隐藏子菜单
    if (!node.path) {
      if (!children.length) {
        continue;
      }
    } else if (!allowed) {
      continue;
    }
    items.push({
      key: node.path ?? node.code,
      icon: resolveMenuIcon(node.icon),
      label: node.nameKey ? t(node.nameKey) : node.code,
      ...(children.length ? { children } : {}),
    } as MenuItem);
  }
  return items;
}

/** 后台布局：侧边菜单 + 顶栏（租户切换 / 语言 / 主题 / 用户） */
export default function AdminLayout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  useDocumentTitle();

  const { user, tenants, currentTenantId, permissions, fetchMe, logout, switchTenant } = useAuthStore();
  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [apiMenus, setApiMenus] = useState<MenuNode[] | null>(null);

  useEffect(() => {
    void fetchMe().catch(() => undefined);
  }, [fetchMe]);

  useEffect(() => {
    // 接口可能尚未部署：失败时静默回退到内置菜单，拦截器已提示过错误不再重复打扰
    fetchMyMenus()
      .then((data) => setApiMenus(Array.isArray(data) ? data : null))
      .catch(() => {
        console.warn('[AdminLayout] 拉取服务端菜单失败，回退到内置菜单');
        setApiMenus(null);
      });
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const visibleMenus = ADMIN_MENUS.filter((item) => !item.permission || permissions.includes(item.permission));
  const fallbackItems: MenuItem[] = visibleMenus.map((item) => ({
    key: item.itemKey,
    icon: item.icon,
    label: t(item.labelKey),
  }));
  // 服务端菜单仍需过一遍前端权限表做安全兜底；结果为空也退回内置菜单，避免后台不可用
  const remoteItems = apiMenus?.length ? toMenuItems(apiMenus, t, permissions) : [];
  const menuItems = remoteItems.length ? remoteItems : fallbackItems;
  const activeMenu = ADMIN_MENUS.find((item) => item.itemKey === location.pathname);
  const selectedKeys = [activeMenu ? activeMenu.itemKey : '/admin'];

  const menu = (
    <Menu
      className="site-admin-menu"
      mode="inline"
      inlineCollapsed={collapsed}
      selectedKeys={selectedKeys}
      items={menuItems}
      onClick={({ key }) => navigate(String(key))}
    />
  );

  return (
    <div className="site-admin">
      <aside className={`site-admin-sidebar${collapsed ? ' is-collapsed' : ''}`}>
        <div className="site-admin-brand">
          <span className="site-logo-mark" aria-hidden="true">
            {t('common.siteName').slice(0, 1)}
          </span>
          {!collapsed && <span>{t('common.siteName')}</span>}
        </div>
        {menu}
        <div className="site-admin-sidebar-footer">
          <Button
            type="text"
            size="small"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            aria-label={t('common.actions.menu')}
            onClick={() => setCollapsed((value) => !value)}
          />
        </div>
      </aside>

      <Drawer
        title={t('common.siteName')}
        placement="left"
        width={256}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{ body: { padding: 0 } }}
      >
        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => navigate(String(key))}
          style={{ borderInlineEnd: 'none' }}
        />
      </Drawer>

      <div className="site-admin-main">
        <header className="site-admin-header">
          <Button
            className="site-admin-mobile-trigger"
            type="text"
            icon={<MenuOutlined />}
            aria-label={t('common.actions.menu')}
            onClick={() => setDrawerOpen(true)}
          />
          <div className="site-admin-header-actions">
            {tenants.length > 1 && (
              <Select
                value={currentTenantId}
                onChange={(value: number) => void switchTenant(value)}
                options={tenants.map((tenant) => ({ value: tenant.id, label: tenant.name }))}
                style={{ width: 160 }}
                aria-label={t('admin.tenantLabel')}
              />
            )}
            <LanguageToggle />
            <ThemeToggle />
            <Dropdown
              trigger={['click']}
              placement="bottomRight"
              menu={{
                items: [
                  { key: 'home', icon: <HomeOutlined />, label: t('auth.backHome') },
                  { type: 'divider' },
                  { key: 'logout', icon: <LogoutOutlined />, label: t('common.actions.logout') },
                ],
                onClick: ({ key }) => {
                  if (key === 'home') {
                    navigate('/');
                    return;
                  }
                  void logout().then(() => navigate('/login'));
                },
              }}
            >
              <span className="site-admin-user">
                <Avatar size={26} style={{ background: 'var(--site-color-accent)' }}>
                  {(user.nickname || user.username || '?').slice(0, 1).toUpperCase()}
                </Avatar>
                <span className="site-admin-user-name">{user.nickname || user.username}</span>
              </span>
            </Dropdown>
          </div>
        </header>

        <main className="site-admin-content">
          <Suspense
            fallback={
              <div className="site-state">
                <Spin size="large" />
              </div>
            }
          >
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
