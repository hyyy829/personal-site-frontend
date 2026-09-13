import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Skeleton } from 'antd';
import { ArrowRightOutlined, FileTextOutlined, ProjectOutlined, SettingOutlined } from '@ant-design/icons';
import { pagePosts } from '@/api/blog';
import type { BlogSummary } from '@/types/blog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/date';

const MODULES = [
  { key: 'moduleBlog', to: '/blog', icon: <FileTextOutlined /> },
  { key: 'moduleProject', to: '/project', icon: <ProjectOutlined /> },
  { key: 'moduleAdmin', to: '/admin', icon: <SettingOutlined /> },
];

/** 首页：Hero + 最新文章 + 模块导航 */
export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  useDocumentTitle();
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    pagePosts({ page: 1, pageSize: 5 })
      .then((data) => setPosts(data.records))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <section className="site-hero">
        <span className="site-hero-badge">
          <span className="site-hero-badge-dot" aria-hidden="true" />
          {t('home.badge')}
        </span>
        <h1 className="site-hero-title">{t('home.heroTitle')}</h1>
        <p className="site-hero-subtitle">{t('home.heroSubtitle')}</p>
        <div className="site-hero-actions">
          <Button type="primary" size="large" onClick={() => navigate('/blog')}>
            {t('home.ctaBlog')}
          </Button>
          <Button size="large" onClick={() => navigate('/about')}>
            {t('home.ctaAbout')}
          </Button>
        </div>
      </section>

      <section className="site-section">
        <div className="site-page-header">
          <div>
            <h2 className="site-section-title">{t('home.latestPosts')}</h2>
            <p className="site-page-subtitle">{t('home.latestPostsSubtitle')}</p>
          </div>
          <Link to="/blog" className="site-page-extra">
            {t('home.viewAll')}
            <ArrowRightOutlined />
          </Link>
        </div>

        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : posts.length === 0 ? (
          <div className="site-empty">
            <Empty description={t('common.state.empty')} />
          </div>
        ) : (
          <div className="site-post-list">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="site-post-item">
                {post.coverUrl && <img className="site-post-item-cover" src={post.coverUrl} alt={post.title} loading="lazy" />}
                <div className="site-post-item-title">{post.title}</div>
                {post.summary && <p className="site-post-item-summary">{post.summary}</p>}
                <div className="site-post-item-meta">
                  {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
                  <span>
                    {post.viewCount} {t('blog.views')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="site-section">
        <h2 className="site-section-title">{t('home.modules')}</h2>
        <p className="site-page-subtitle">{t('home.modulesSubtitle')}</p>
        <div className="site-grid">
          {MODULES.map((module) => (
            <Link key={module.key} to={module.to} className="site-card site-card-hover site-project-card">
              <span className="site-module-icon" aria-hidden="true">
                {module.icon}
              </span>
              <h3 className="site-project-name">{t(`home.${module.key}`)}</h3>
              <p className="site-project-summary">{t(`home.${module.key}Desc`)}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
