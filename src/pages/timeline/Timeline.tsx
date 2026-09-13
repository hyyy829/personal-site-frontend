import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Pagination, Spin, Tag, Typography } from '@douyinfe/semi-ui';
import { pageTimeline } from '@/api/content';
import type { TimelineItem } from '@/types/content';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 20;

/** 时间线：按事件日期倒序展示站点里程碑 */
export default function TimelinePage() {
  const { t } = useTranslation();
  useDocumentTitle('common.nav.timeline');
  const [items, setItems] = useState<TimelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    pageTimeline({ page, pageSize: PAGE_SIZE })
      .then((data) => {
        setItems(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="site-section-title" style={{ fontSize: 'var(--site-font-size-xxl)', margin: 0 }}>
        {t('common.nav.timeline')}
      </h1>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '96px auto' }} />
      ) : items.length === 0 ? (
        <div style={{ padding: 'var(--site-space-10) 0' }}>
          <Empty title={<Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>} />
        </div>
      ) : (
        <div style={{ marginTop: 'var(--site-space-6)', position: 'relative', paddingLeft: 24, borderLeft: '2px solid var(--site-color-border)' }}>
          {items.map((item) => (
            <div key={item.id} style={{ position: 'relative', paddingBottom: 'var(--site-space-6)' }}>
              <span
                style={{
                  position: 'absolute',
                  left: -31,
                  top: 6,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  background: 'var(--site-color-accent)',
                }}
              />
              <div className="site-post-item-meta" style={{ marginTop: 0 }}>
                <span>{item.eventDate}</span>
                {item.tag && <Tag size="small" color="white" type="light">{item.tag}</Tag>}
              </div>
              <div className="site-post-item-title" style={{ marginTop: 4 }}>{item.title}</div>
              {item.content && (
                <Typography.Paragraph type="tertiary" style={{ marginTop: 4 }}>
                  {item.content}
                </Typography.Paragraph>
              )}
            </div>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
