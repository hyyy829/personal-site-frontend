import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input, Pagination, Spin, Typography } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import { pagePosts } from '@/api/blog';
import type { BlogSummary } from '@/types/blog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

/** 博客列表：分页 + 关键词检索 */
export default function BlogList() {
  const { t } = useTranslation();
  useDocumentTitle('blog.title');
  const [posts, setPosts] = useState<BlogSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback((currentPage: number, currentKeyword: string) => {
    setLoading(true);
    pagePosts({ page: currentPage, pageSize: PAGE_SIZE, keyword: currentKeyword || undefined })
      .then((data) => {
        setPosts(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page, keyword);
  }, [load, page, keyword]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <h1 className="site-section-title" style={{ margin: 0 }}>
          {t('blog.listTitle')}
        </h1>
        <Input
          prefix={<IconSearch />}
          placeholder={t('blog.keywordPlaceholder')}
          style={{ width: 260 }}
          showClear
          onChange={(value) => {
            setPage(1);
            setKeyword(value);
          }}
        />
      </div>

      <div style={{ marginTop: 'var(--site-space-5)' }}>
        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />
        ) : posts.length === 0 ? (
          <Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>
        ) : (
          posts.map((post) => (
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
          ))
        )}
      </div>

      {total > PAGE_SIZE && (
        <div style={{ marginTop: 'var(--site-space-6)', display: 'flex', justifyContent: 'center' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
