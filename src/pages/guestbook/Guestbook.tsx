import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Empty, Form, Pagination, Spin, Typography } from '@douyinfe/semi-ui';
import { createGuestbookMessage, pageGuestbook } from '@/api/comment';
import type { PublicComment } from '@/types/comment';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

/** 留言板：游客留言提交后进入审核，审核通过后展示 */
export default function Guestbook() {
  const { t } = useTranslation();
  useDocumentTitle('common.nav.guestbook');
  const [messages, setMessages] = useState<PublicComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageGuestbook(currentPage, PAGE_SIZE)
      .then((data) => {
        setMessages(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const handleSubmit = async (values: { authorName: string; content: string }) => {
    setSubmitting(true);
    try {
      await createGuestbookMessage({ authorName: values.authorName, content: values.content });
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一 Toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 720 }}>
      <h1 className="site-section-title" style={{ fontSize: 'var(--site-font-size-xxl)', margin: 0 }}>
        {t('common.nav.guestbook')}
      </h1>
      <Typography.Paragraph type="tertiary">{t('guestbook.subtitle')}</Typography.Paragraph>

      <div style={{ border: '1px solid var(--site-color-border)', borderRadius: 'var(--site-radius-md)', padding: 'var(--site-space-5)', background: 'var(--site-color-bg)' }}>
        <Form onSubmit={handleSubmit} layout="vertical">
          <Form.Input field="authorName" label={t('guestbook.name')} rules={[{ required: true }, { max: 50 }]} />
          <Form.TextArea field="content" label={t('guestbook.content')} rows={3} rules={[{ required: true }, { max: 1000 }]} />
          <Button htmlType="submit" theme="solid" type="primary" loading={submitting}>
            {t('guestbook.submit')}
          </Button>
        </Form>
      </div>

      <div style={{ marginTop: 'var(--site-space-6)' }}>
        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '64px auto' }} />
        ) : messages.length === 0 ? (
          <Empty title={<Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>} />
        ) : (
          messages.map((message) => (
            <div key={message.id} style={{ display: 'flex', gap: 12, padding: 'var(--site-space-4) 0', borderBottom: '1px solid var(--site-color-border)' }}>
              <Avatar size="small" color="light-blue">
                {message.authorName.slice(0, 1).toUpperCase()}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{message.authorName}</div>
                <Typography.Paragraph style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {message.content}
                </Typography.Paragraph>
                <div className="site-post-item-meta" style={{ marginTop: 4 }}>{message.createdAt.slice(0, 16).replace('T', ' ')}</div>
              </div>
            </div>
          ))
        )}
      </div>

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--site-space-5)' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
