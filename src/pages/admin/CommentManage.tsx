import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Popconfirm, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { deleteComment, pageComments, updateCommentStatus } from '@/api/comment';
import type { CommentManagement, CommentStatus, CommentTargetType } from '@/types/comment';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDateTime } from '@/utils/date';

const PAGE_SIZE = 10;

/** 评论管理：审核（通过/驳回）与删除 */
export default function CommentManage() {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  useDocumentTitle('menu.commentManage');

  const canApprove = useAuthStore((state) => state.permissions.includes('comment:approve'));
  const canDelete = useAuthStore((state) => state.permissions.includes('comment:delete'));

  const [records, setRecords] = useState<CommentManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<CommentStatus | ''>('');
  const [targetType, setTargetType] = useState<CommentTargetType | ''>('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(
    (currentPage: number) => {
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
    },
    [status, targetType],
  );

  useEffect(() => {
    load(page);
  }, [load, page]);

  const handleStatus = async (record: CommentManagement, next: 'approved' | 'rejected') => {
    await updateCommentStatus(record.id, next);
    void message.success(t('common.actions.saved'));
    load(page);
  };

  const handleRemove = async (record: CommentManagement) => {
    await deleteComment(record.id);
    void message.success(t('common.actions.delete'));
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

  const columns: ColumnsType<CommentManagement> = [
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
    {
      title: t('blog.createdAt'),
      dataIndex: 'createdAt',
      width: 150,
      render: (value: string) => formatDateTime(value),
    },
    {
      title: t('admin.blog.actions'),
      width: 240,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
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
            <Popconfirm
              title={t('comment.deleteConfirm')}
              okText={t('common.actions.confirm')}
              cancelText={t('common.actions.cancel')}
              onConfirm={() => void handleRemove(record)}
            >
              <Button size="small" danger>
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
      <PageHeader title={t('menu.commentManage')} />

      <div className="site-toolbar">
        <div style={{ display: 'flex', gap: 'var(--site-space-3)', flexWrap: 'wrap' }}>
          <Select<CommentStatus>
            style={{ width: 160 }}
            value={status || undefined}
            placeholder={t('comment.statusLabel')}
            allowClear
            onChange={(value: CommentStatus | undefined) => {
              setPage(1);
              setStatus(value ?? '');
            }}
            options={[
              { value: 'pending', label: t('comment.status.pending') },
              { value: 'approved', label: t('comment.status.approved') },
              { value: 'rejected', label: t('comment.status.rejected') },
            ]}
          />
          <Select<CommentTargetType>
            style={{ width: 160 }}
            value={targetType || undefined}
            placeholder={t('comment.target')}
            allowClear
            onChange={(value: CommentTargetType | undefined) => {
              setPage(1);
              setTargetType(value ?? '');
            }}
            options={[
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
        pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: setPage, showSizeChanger: false }}
      />
    </div>
  );
}
