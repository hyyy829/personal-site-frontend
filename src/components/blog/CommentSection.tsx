import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Avatar, Button, Empty, Form, Input, List, Pagination, Skeleton, Typography } from 'antd';
import { createPostComment, pagePostComments } from '@/api/comment';
import type { PublicComment } from '@/types/comment';
import { formatDateTime } from '@/utils/date';

const PAGE_SIZE = 10;

interface CommentFormValues {
  authorName: string;
  content: string;
}

/** 博客文章评论区：展示已审核评论，游客可提交（先审后显） */
export default function CommentSection({ postId }: { postId: number }) {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  const [form] = Form.useForm<CommentFormValues>();
  const [comments, setComments] = useState<PublicComment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pagePostComments(postId, currentPage, PAGE_SIZE)
      .then((data) => {
        setComments(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [postId]);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const handleSubmit = async (values: CommentFormValues) => {
    setSubmitting(true);
    try {
      await createPostComment(postId, { authorName: values.authorName, content: values.content });
      form.resetFields();
      void message.success(t('comment.submitSuccess'));
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="site-section" style={{ marginTop: 'var(--site-space-8)' }}>
      <h2 className="site-section-title">{t('comment.title')}</h2>

      <div className="site-card" style={{ marginTop: 'var(--site-space-5)' }}>
        <Form<CommentFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item name="authorName" label={t('guestbook.name')} rules={[{ required: true }, { max: 50 }]}>
            <Input maxLength={50} />
          </Form.Item>
          <Form.Item name="content" label={t('guestbook.content')} rules={[{ required: true }, { max: 1000 }]}>
            <Input.TextArea rows={3} maxLength={1000} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              {t('comment.submit')}
            </Button>
          </Form.Item>
        </Form>
        <Typography.Text style={{ display: 'block', marginTop: 'var(--site-space-4)', color: 'var(--site-color-text-tertiary)' }}>
          {t('comment.moderationNotice')}
        </Typography.Text>
      </div>

      <div style={{ marginTop: 'var(--site-space-5)' }}>
        {loading ? (
          <Skeleton active paragraph={{ rows: 4 }} />
        ) : comments.length === 0 ? (
          <div className="site-empty">
            <Empty description={t('common.state.empty')} />
          </div>
        ) : (
          <List
            dataSource={comments}
            split={false}
            renderItem={(comment) => (
              <List.Item style={{ padding: 'var(--site-space-4) 0', borderBottom: '1px solid var(--site-color-border)', alignItems: 'flex-start' }}>
                <List.Item.Meta
                  avatar={<Avatar style={{ background: 'var(--site-color-accent)' }}>{comment.authorName.slice(0, 1).toUpperCase()}</Avatar>}
                  title={<span style={{ color: 'var(--site-color-text)' }}>{comment.authorName}</span>}
                  description={
                    <>
                      <Typography.Paragraph style={{ margin: 0, color: 'var(--site-color-text-secondary)', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                        {comment.content}
                      </Typography.Paragraph>
                      <div className="site-post-item-meta">{formatDateTime(comment.createdAt)}</div>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </div>

      {total > PAGE_SIZE && (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--site-space-5)' }}>
          <Pagination total={total} pageSize={PAGE_SIZE} current={page} onChange={setPage} />
        </div>
      )}
    </section>
  );
}
