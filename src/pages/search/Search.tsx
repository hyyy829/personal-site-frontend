import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Empty, Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { searchSite } from '@/api/search';
import type { SearchResponse } from '@/types/search';
import PageHeader from '@/components/common/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/** 站内搜索结果页：PostgreSQL 聚合博客与项目 */
export default function Search() {
  const { t } = useTranslation();
  useDocumentTitle('search.title');
  const [keyword, setKeyword] = useState('');
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  const runSearch = useCallback((value: string) => {
    const trimmed = value.trim();
    if (!trimmed) {
      return;
    }
    setLoading(true);
    setSearched(true);
    searchSite(trimmed)
      .then((data) => setResult(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get('keyword');
    if (initial) {
      setKeyword(initial);
      void runSearch(initial);
    }
  }, [runSearch]);

  return (
    <div className="site-page">
      <PageHeader title={t('search.title')} />

      <div style={{ display: 'flex', gap: 'var(--site-space-2)', maxWidth: 'var(--site-reading-width)' }}>
        <Input
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          onPressEnter={() => runSearch(keyword)}
          prefix={<SearchOutlined />}
          placeholder={t('search.placeholder')}
          allowClear
        />
        <Button type="primary" onClick={() => runSearch(keyword)}>
          {t('common.actions.search')}
        </Button>
      </div>

      {loading ? (
        <div className="site-state">
          <Spin size="large" />
        </div>
      ) : searched && result ? (
        <>
          <section className="site-section">
            <h2 className="site-section-title" style={{ marginBottom: 'var(--site-space-4)' }}>
              {t('search.blogs')}
            </h2>
            {result.blogs.length === 0 ? (
              <div className="site-empty">
                <Empty description={t('common.state.empty')} />
              </div>
            ) : (
              <div className="site-post-list">
                {result.blogs.map((hit) => (
                  <Link key={hit.id} to={`/blog/${hit.id}`} className="site-post-item">
                    <div className="site-post-item-title">{hit.title}</div>
                    {hit.summary ? <p className="site-post-item-summary">{hit.summary}</p> : null}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="site-section">
            <h2 className="site-section-title" style={{ marginBottom: 'var(--site-space-4)' }}>
              {t('search.projects')}
            </h2>
            {result.projects.length === 0 ? (
              <div className="site-empty">
                <Empty description={t('common.state.empty')} />
              </div>
            ) : (
              <div className="site-post-list">
                {result.projects.map((hit) => (
                  <Link key={hit.id} to={`/project/${hit.id}`} className="site-post-item">
                    <div className="site-post-item-title">{hit.name}</div>
                    {hit.summary ? <p className="site-post-item-summary">{hit.summary}</p> : null}
                  </Link>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
