import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Avatar, Button, Form, Pagination, Spin, Typography } from '@douyinfe/semi-ui';
import { createPostComment, pagePostComments } from '@/api/comment';
import type { PublicComment } from '@/types/comment';

const PAGE_SIZE = 10;

/** 博客文章评论区：展示已审核评论，游客可提交（先审后显） */
export default function CommentSection({ postId }: { postId: number }) {
  const { t } = useTranslation();
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

  const handleSubmit = async (values: { authorName: string; content: string }) => {
    setSubmitting(true);
    try {
      await createPostComment(postId, { authorName: values.authorName, content: values.content });
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一 Toast
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="site-section" style={{ marginTop: 'var(--site-space-8)' }}>
      <h2 className="site-section-title">{t('comment.title')}</h2>

      <div style={{ border: '1px solid var(--site-color-border)', borderRadius: 'var(--site-radius-md)', padding: 'var(--site-space-5)', background: 'var(--site-color-bg)' }}>
        <Form onSubmit={handleSubmit} layout="vertical">
          <Form.Input field="authorName" label={t('guestbook.name')} rules={[{ required: true }, { max: 50 }]} />
          <Form.TextArea field="content" label={t('guestbook.content')} rows={3} rules={[{ required: true }, { max: 1000 }]} />
          <Button htmlType="submit" theme="solid" type="primary" loading={submitting}>
            {t('comment.submit')}
          </Button>
        </Form>
        <Typography.Text type="tertiary" size="small">{t('comment.moderationNotice')}</Typography.Text>
      </div>

      <div style={{ marginTop: 'var(--site-space-5)' }}>
        {loading ? (
          <Spin size="large" style={{ display: 'block', margin: '48px auto' }} />
        ) : comments.length === 0 ? (
          <Typography.Text type="tertiary">{t('common.state.empty')}</Typography.Text>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} style={{ display: 'flex', gap: 12, padding: 'var(--site-space-4) 0', borderBottom: '1px solid var(--site-color-border)' }}>
              <Avatar size="small" color="light-blue">
                {comment.authorName.slice(0, 1).toUpperCase()}
              </Avatar>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 600 }}>{comment.authorName}</div>
                <Typography.Paragraph style={{ margin: '4px 0 0', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {comment.content}
                </Typography.Paragraph>
                <div className="site-post-item-meta" style={{ marginTop: 4 }}>{comment.createdAt.slice(0, 16).replace('T', ' ')}</div>
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
    </section>
  );
}
