import { Suspense } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spin } from '@douyinfe/semi-ui';
import ThemeToggle from '@/components/common/ThemeToggle';
import LanguageToggle from '@/components/common/LanguageToggle';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const NAV_ITEMS = [
  { to: '/', key: 'common.nav.home' },
  { to: '/blog', key: 'common.nav.blog' },
  { to: '/project', key: 'common.nav.project' },
  { to: '/about', key: 'common.nav.about' },
];

/** 前台布局：顶部导航 + 内容 + 页脚 */
export default function PublicLayout() {
  const { t } = useTranslation();
  useDocumentTitle();

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
