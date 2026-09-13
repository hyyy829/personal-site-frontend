import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Avatar, Button, Empty, Form, Input, Pagination, Spin, Typography } from 'antd';
import { createGuestbookMessage, pageGuestbook } from '@/api/comment';
import type { PublicComment } from '@/types/comment';
import PageHeader from '@/components/common/PageHeader';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateTime } from '@/utils/date';

const PAGE_SIZE = 10;

interface GuestbookForm {
  authorName: string;
  content: string;
}

/** 留言板：游客留言提交后进入审核，审核通过后展示 */
export default function Guestbook() {
  const { t } = useTranslation();
  useDocumentTitle('common.nav.guestbook');
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<GuestbookForm>();
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

  const handleSubmit = async (values: GuestbookForm) => {
    setSubmitting(true);
    try {
      await createGuestbookMessage({ authorName: values.authorName, content: values.content });
      form.resetFields();
      void message.success(t('guestbook.submitSuccess'));
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="site-page">
      <PageHeader title={t('common.nav.guestbook')} subtitle={t('guestbook.subtitle')} />

      <div className="site-card site-form-card">
        <Form<GuestbookForm> form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
          <Form.Item name="authorName" label={t('guestbook.name')} rules={[{ required: true }, { max: 50 }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label={t('guestbook.content')} rules={[{ required: true }, { max: 1000 }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={submitting}>
            {t('guestbook.submit')}
          </Button>
        </Form>
      </div>

      <section className="site-section">
        {loading ? (
          <div className="site-state">
            <Spin size="large" />
          </div>
        ) : messages.length === 0 ? (
          <div className="site-empty">
            <Empty description={t('common.state.empty')} />
          </div>
        ) : (
          <div className="site-post-list">
            {messages.map((message) => (
              <div key={message.id} className="site-post-item">
                <div style={{ display: 'flex', gap: 'var(--site-space-3)' }}>
                  <Avatar size="small" style={{ background: 'var(--site-color-accent)', flexShrink: 0 }}>
                    {message.authorName.slice(0, 1).toUpperCase()}
                  </Avatar>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="site-post-item-title" style={{ fontSize: 'var(--site-font-size-md)' }}>
                      {message.authorName}
                    </div>
                    <Typography.Paragraph style={{ margin: 'var(--site-space-2) 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                      {message.content}
                    </Typography.Paragraph>
                    <div className="site-post-item-meta">{formatDateTime(message.createdAt)}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--site-space-5)' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
        </div>
      )}
    </div>
  );
}
