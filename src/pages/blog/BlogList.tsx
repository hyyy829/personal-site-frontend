import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Empty, Input, Pagination, Skeleton } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import PageHeader from '@/components/common/PageHeader';
import { pagePosts } from '@/api/blog';
import type { BlogSummary } from '@/types/blog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/date';

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
      <PageHeader
        title={t('blog.listTitle')}
        extra={
          <Input
            prefix={<SearchOutlined />}
            placeholder={t('blog.keywordPlaceholder')}
            style={{ width: 260 }}
            allowClear
            value={keyword}
            onChange={(event) => {
              setPage(1);
              setKeyword(event.target.value);
            }}
          />
        }
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
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
                {post.publishedAt && (
                  <span>
                    {t('blog.publishedAt')} {formatDate(post.publishedAt)}
                  </span>
                )}
                <span>
                  {post.viewCount} {t('blog.views')}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div style={{ marginTop: 'var(--site-space-6)', display: 'flex', justifyContent: 'center' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
