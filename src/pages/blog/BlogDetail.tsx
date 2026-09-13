import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton, Typography } from 'antd';
import { getPost } from '@/api/blog';
import type { BlogDetail } from '@/types/blog';
import MarkdownView from '@/components/blog/MarkdownView';
import CommentSection from '@/components/blog/CommentSection';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/date';

/** 博客详情：Markdown 渲染 */
export default function BlogDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  useDocumentTitle('blog.title');
  const [post, setPost] = useState<BlogDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPost(id ?? '')
      .then((data) => {
        if (!cancelled) setPost(data);
      })
      .catch(() => undefined)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (post) {
      document.title = `${post.title} · ${t('common.siteName')}`;
    }
  }, [post, t]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!post) {
    return (
      <div className="site-empty">
        <div style={{ textAlign: 'center' }}>
          <Typography.Title level={4} style={{ marginBottom: 'var(--site-space-3)' }}>
            {t('common.state.notFound')}
          </Typography.Title>
          <Link to="/blog">{t('common.actions.back')}</Link>
        </div>
      </div>
    );
  }

  return (
    <article className="site-article">
      <header className="site-article-header">
        <h1 className="site-article-title">{post.title}</h1>
        <div className="site-article-meta">
          {post.publishedAt && (
            <span>
              {t('blog.publishedAt')} {formatDate(post.publishedAt)}
            </span>
          )}
          <span>
            {post.viewCount} {t('blog.views')}
          </span>
        </div>
      </header>
      {post.coverUrl && <img className="site-article-cover" src={post.coverUrl} alt={post.title} loading="lazy" />}
      <MarkdownView content={post.content} />
      <CommentSection postId={post.id} />
    </article>
  );
}
