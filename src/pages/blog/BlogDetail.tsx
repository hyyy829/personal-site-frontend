import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Spin, Typography } from '@douyinfe/semi-ui';
import { getPost } from '@/api/blog';
import type { BlogDetail } from '@/types/blog';
import MarkdownView from '@/components/blog/MarkdownView';
import CommentSection from '@/components/blog/CommentSection';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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
    return <Spin size="large" style={{ display: 'block', margin: '96px auto' }} />;
  }

  if (!post) {
    return (
      <div style={{ textAlign: 'center', padding: '96px 0' }}>
        <Typography.Title heading={4}>{t('common.state.notFound')}</Typography.Title>
        <Link to="/blog">{t('common.actions.back')}</Link>
      </div>
    );
  }

  return (
    <article>
      <header className="site-article-header">
        <h1 className="site-article-title">{post.title}</h1>
        <div className="site-article-meta">
          {post.publishedAt && <span>{t('blog.publishedAt')} {post.publishedAt.slice(0, 10)}</span>}
          <span>
            {post.viewCount} {t('blog.views')}
          </span>
        </div>
      </header>
      <MarkdownView content={post.content} />
      <CommentSection postId={post.id} />
    </article>
  );
}
