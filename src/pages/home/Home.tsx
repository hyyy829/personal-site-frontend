import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Spin, Typography } from '@douyinfe/semi-ui';
import { pagePosts } from '@/api/blog';
import type { BlogSummary } from '@/types/blog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 首页：Hero + 最新文章 + 模块导航 */
export default function Home() {
  const { t } = useTranslation();
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
        <h1 className="site-hero-title">{t('home.heroTitle')}</h1>
        <p className="site-hero-subtitle">{t('home.heroSubtitle')}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button theme="solid" onClick={() => (window.location.href = '/blog')}>
            {t('home.ctaBlog')}
          </Button>
          <Button onClick={() => (window.location.href = '/about')}>{t('home.ctaAbout')}</Button>
        </div>
      </section>

      <section className="site-section">
        <h2 className="site-section-title">{t('home.latestPosts')}</h2>
        <p className="site-section-subtitle">{t('home.latestPostsSubtitle')}</p>
        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
        ) : posts.length === 0 ? (
          <Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>
        ) : (
          <div>
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.id}`} className="site-post-item">
                <div className="site-post-item-title">{post.title}</div>
                {post.summary && <p className="site-post-item-summary">{post.summary}</p>}
                <div className="site-post-item-meta">
                  {post.publishedAt && <span>{t('blog.publishedAt')} {post.publishedAt.slice(0, 10)}</span>}
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
        <p className="site-section-subtitle">{t('home.modulesSubtitle')}</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {(['moduleBlog', 'moduleProject', 'moduleAdmin'] as const).map((key) => (
            <div
              key={key}
              style={{
                border: '1px solid var(--site-color-border)',
                borderRadius: 'var(--site-radius-md)',
                padding: 'var(--site-space-5)',
                background: 'var(--site-color-bg)',
              }}
            >
              <Typography.Title heading={5} style={{ marginTop: 0 }}>
                {t(`home.${key}`)}
              </Typography.Title>
              <Typography.Text type="tertiary">{t(`home.${key}Desc`)}</Typography.Text>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
