import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Input, Spin, Typography } from '@douyinfe/semi-ui';
import { IconSearch } from '@douyinfe/semi-icons';
import { searchSite } from '@/api/search';
import type { SearchResponse } from '@/types/search';
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
    <div style={{ maxWidth: 720 }}>
      <h1 className="site-section-title" style={{ fontSize: 'var(--site-font-size-xxl)', margin: 0 }}>
        {t('search.title')}
      </h1>

      <div style={{ display: 'flex', gap: 8, marginTop: 'var(--site-space-5)' }}>
        <Input
          value={keyword}
          onChange={(value) => setKeyword(value)}
          onEnterPress={() => runSearch(keyword)}
          prefix={<IconSearch />}
          placeholder={t('search.placeholder')}
          showClear
        />
        <Button theme="solid" onClick={() => runSearch(keyword)}>
          {t('common.actions.search')}
        </Button>
      </div>

      {loading && <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />}

      {!loading && searched && result && (
        <div style={{ marginTop: 'var(--site-space-6)' }}>
          <h2 className="site-section-title">{t('search.blogs')}</h2>
          {result.blogs.length === 0 ? (
            <Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>
          ) : (
            result.blogs.map((hit) => (
              <Link key={hit.id} to={`/blog/${hit.id}`} className="site-post-item">
                <div className="site-post-item-title">{hit.title}</div>
                {hit.summary && <p className="site-post-item-summary">{hit.summary}</p>}
              </Link>
            ))
          )}

          <h2 className="site-section-title" style={{ marginTop: 'var(--site-space-6)' }}>{t('search.projects')}</h2>
          {result.projects.length === 0 ? (
            <Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>
          ) : (
            result.projects.map((hit) => (
              <Link key={hit.id} to={`/project/${hit.id}`} className="site-post-item">
                <div className="site-post-item-title">{hit.name}</div>
                {hit.summary && <p className="site-post-item-summary">{hit.summary}</p>}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
