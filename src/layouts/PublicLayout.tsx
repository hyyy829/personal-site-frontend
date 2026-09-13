import { Suspense, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spin } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageToggle from '@/components/common/LanguageToggle';
import { reportVisit } from '@/api/infra';
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

/** 前台布局：顶部导航 + 内容 + 页脚；路由切换时上报访问统计 */
export default function PublicLayout() {
  const { t } = useTranslation();
  const location = useLocation();
  useDocumentTitle();

  useEffect(() => {
    void reportVisit(location.pathname).catch(() => undefined);
  }, [location.pathname]);

  return (
    <div className="site-public">
      <header className="site-header">
        <div className="site-header-inner">
          <Link to="/" className="site-logo">
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
            <Link to="/search" aria-label={t('search.title')}>
              <Button theme="borderless" icon={<IconSearch size="large" />} />
            </Link>
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main className="site-main">
        <Suspense fallback={<Spin size="large" style={{ display: 'block', margin: '96px auto' }} />}>
          <Outlet />
        </Suspense>
      </main>
      <footer className="site-footer">
        <div className="site-footer-inner">
          © {new Date().getFullYear()} {t('common.siteName')} · {t('common.footer.copyright')}
        </div>
      </footer>
    </div>
  );
}
