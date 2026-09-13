import { Suspense, useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Drawer, Menu, Spin } from 'antd';
import { MenuOutlined, SearchOutlined } from '@ant-design/icons';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageToggle from '@/components/common/LanguageToggle';
import { reportVisit } from '@/api/stats';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const NAV_ITEMS = [
  { to: '/', key: 'common.nav.home' },
  { to: '/blog', key: 'common.nav.blog' },
  { to: '/project', key: 'common.nav.project' },
  { to: '/timeline', key: 'common.nav.timeline' },
  { to: '/tools', key: 'common.nav.tools' },
  { to: '/guestbook', key: 'common.nav.guestbook' },
  { to: '/about', key: 'common.nav.about' },
];

const FOOTER_PATHS = ['/blog', '/project', '/about'];

/** 前台布局：顶部导航 + 内容 + 页脚；路由切换时上报访问统计 */
export default function PublicLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);
  useDocumentTitle();

  useEffect(() => {
    void reportVisit(location.pathname).catch(() => undefined);
  }, [location.pathname]);

  // 移动端抽屉在路由切换后自动收起
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  const footerItems = NAV_ITEMS.filter((item) => FOOTER_PATHS.includes(item.to));

  return (
    <div className="site-public">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-logo">
            <span className="site-logo-mark" aria-hidden="true">
              {t('common.siteName').slice(0, 1)}
            </span>
            {t('common.siteName')}
          </Link>
          <nav className="site-nav">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? 'active' : '')} end={item.to === '/'}>
                {t(item.key)}
              </NavLink>
            ))}
          </nav>
          <div className="site-header-actions">
            <Button type="text" icon={<SearchOutlined />} aria-label={t('search.title')} onClick={() => navigate('/search')} />
            <LanguageToggle />
            <ThemeToggle />
            <Button
              className="site-nav-mobile-trigger"
              type="text"
              icon={<MenuOutlined />}
              aria-label={t('common.actions.menu')}
              onClick={() => setDrawerOpen(true)}
            />
          </div>
        </div>
      </header>

      <Drawer title={t('common.siteName')} placement="right" width={256} open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={NAV_ITEMS.map((item) => ({ key: item.to, label: t(item.key) }))}
          onClick={({ key }) => navigate(String(key))}
          style={{ borderInlineEnd: 'none' }}
        />
      </Drawer>

      <main className="site-main">
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

      <footer className="site-footer">
        <div className="site-footer-inner">
          <span>
            © {new Date().getFullYear()} {t('common.siteName')} · {t('common.footer.copyright')}
          </span>
          <span className="site-footer-links">
            {footerItems.map((item) => (
              <Link key={item.to} to={item.to}>
                {t(item.key)}
              </Link>
            ))}
          </span>
        </div>
      </footer>
    </div>
  );
}
