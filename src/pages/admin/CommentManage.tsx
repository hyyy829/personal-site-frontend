import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popconfirm, Select, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { deleteComment, pageComments, updateCommentStatus } from '@/api/comment';
import type { CommentManagement, CommentStatus, CommentTargetType } from '@/types/comment';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

/** 评论管理：审核（通过/驳回）与删除 */
export default function CommentManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.commentManage');

  const canApprove = useAuthStore((state) => state.permissions.includes('comment:approve'));
  const canDelete = useAuthStore((state) => state.permissions.includes('comment:delete'));

  const [records, setRecords] = useState<CommentManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CommentStatus | ''>('');
  const [targetType, setTargetType] = useState<CommentTargetType | ''>('');
  const [loading, setLoading] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageComments({
      page: currentPage,
      pageSize: PAGE_SIZE,
      status: status || undefined,
      targetType: targetType || undefined,
    })
      .then((data) => {
        setRecords(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [status, targetType]);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const handleStatus = async (record: CommentManagement, next: 'approved' | 'rejected') => {
    await updateCommentStatus(record.id, next);
    Toast.success(t('admin.blog.saved'));
    load(page);
  };

  const handleRemove = async (record: CommentManagement) => {
    await deleteComment(record.id);
    Toast.success(t('common.actions.delete'));
    load(page);
  };

  const statusTag = (value: CommentStatus) =>
    value === 'approved' ? (
      <Tag color="green">{t('comment.status.approved')}</Tag>
    ) : value === 'pending' ? (
      <Tag color="orange">{t('comment.status.pending')}</Tag>
    ) : (
      <Tag color="red">{t('comment.status.rejected')}</Tag>
    );

  const columns: ColumnProps<CommentManagement>[] = [
    { title: t('comment.author'), dataIndex: 'authorName', width: 120 },
    { title: t('comment.content'), dataIndex: 'content', ellipsis: true },
    {
      title: t('comment.target'),
      dataIndex: 'targetType',
      width: 100,
      render: (value: CommentTargetType) =>
        value === 'blog' ? <Tag color="blue">{t('comment.targetBlog')}</Tag> : <Tag color="purple">{t('comment.targetGuestbook')}</Tag>,
    },
    { title: t('comment.statusLabel'), dataIndex: 'status', width: 100, render: statusTag },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => value?.slice(0, 16).replace('T', ' ') ?? '-' },
    {
      title: t('admin.blog.actions'),
      width: 240,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {canApprove && record.status !== 'approved' && (
            <Button size="small" type="primary" onClick={() => void handleStatus(record, 'approved')}>
              {t('comment.approve')}
            </Button>
          )}
          {canApprove && record.status === 'approved' && (
            <Button size="small" onClick={() => void handleStatus(record, 'rejected')}>
              {t('comment.reject')}
            </Button>
          )}
          {canDelete && (
            <Popconfirm title={t('comment.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
              <Button size="small" type="danger">
                {t('common.actions.delete')}
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="site-admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <Typography.Title heading={4} style={{ margin: 0 }}>
          {t('menu.commentManage')}
        </Typography.Title>
        <div style={{ display: 'flex', gap: 8 }}>
          <Select value={status || undefined} placeholder={t('comment.statusLabel')} style={{ width: 140 }} showClear
            onChange={(value) => { setPage(1); setStatus((value as CommentStatus) ?? ''); }}
            optionList={[
              { value: 'pending', label: t('comment.status.pending') },
              { value: 'approved', label: t('comment.status.approved') },
              { value: 'rejected', label: t('comment.status.rejected') },
            ]}
          />
          <Select value={targetType || undefined} placeholder={t('comment.target')} style={{ width: 140 }} showClear
            onChange={(value) => { setPage(1); setTargetType((value as CommentTargetType) ?? ''); }}
            optionList={[
              { value: 'blog', label: t('comment.targetBlog') },
              { value: 'guestbook', label: t('comment.targetGuestbook') },
            ]}
          />
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ currentPage: page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />
    </div>
  );
}
