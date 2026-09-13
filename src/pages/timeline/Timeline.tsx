import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Empty, Pagination, Skeleton, Tag } from 'antd';
import PageHeader from '@/components/common/PageHeader';
import { pageTimeline } from '@/api/timeline';
import type { TimelineItem } from '@/types/timeline';
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
    <div>
      <PageHeader title={t('common.nav.timeline')} />

      {loading ? (
        <Skeleton active paragraph={{ rows: 6 }} />
      ) : items.length === 0 ? (
        <div className="site-empty">
          <Empty description={t('common.state.empty')} />
        </div>
      ) : (
        <div className="site-timeline">
          {items.map((item) => (
            <div key={item.id} className="site-timeline-item">
              <span className="site-timeline-dot" aria-hidden="true" />
              <div className="site-meta">
                <span className="site-timeline-date">{item.eventDate}</span>
                {item.tag && <Tag color="default">{item.tag}</Tag>}
              </div>
              <h3 className="site-timeline-title">{item.title}</h3>
              {item.content && <p className="site-timeline-content">{item.content}</p>}
            </div>
          ))}
        </div>
      )}

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--site-space-6)' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
