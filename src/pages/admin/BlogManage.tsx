import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, Modal, Popconfirm, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { deletePost, adminGetPost, adminPagePosts, createPost, updatePost } from '@/api/blog';
import type { BlogDetail, BlogSummary, BlogUpsertRequest } from '@/types/blog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { useAuthStore } from '@/stores/auth';
import { formatDate } from '@/utils/date';

const PAGE_SIZE = 10;

interface FormValues {
  title: string;
  summary?: string;
  content: string;
  coverUrl?: string;
  status: 'draft' | 'published';
}

/** 博客管理：分页列表 + 新建/编辑弹窗 + 删除 */
export default function BlogManage() {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  useDocumentTitle('menu.blogManage');

  // 权限码取自后端种子（V1__init_schema_and_seed.sql）；平台管理员与细粒度授权均可操作
  const permissions = useAuthStore((state) => state.permissions);
  const canCreate = permissions.includes('system:manage') || permissions.includes('blog:add');
  const canEdit = permissions.includes('system:manage') || permissions.includes('blog:edit');
  const canDelete = permissions.includes('blog:delete');

  const [records, setRecords] = useState<BlogSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<BlogDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    adminPagePosts({ page: currentPage, pageSize: PAGE_SIZE })
      .then((data) => {
        setRecords(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load(page);
  }, [load, page]);

  const openCreate = () => {
    setEditing(null);
    setModalVisible(true);
  };

  const openEdit = async (record: BlogSummary) => {
    const detail = await adminGetPost(record.id);
    setEditing(detail);
    setModalVisible(true);
  };

  const handleRemove = async (record: BlogSummary) => {
    await deletePost(record.id);
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const handleSubmit = async (values: FormValues) => {
    const payload: BlogUpsertRequest = {
      title: values.title,
      content: values.content,
      summary: values.summary,
      coverUrl: values.coverUrl,
      status: values.status,
    };
    setSaving(true);
    try {
      if (editing) {
        await updatePost(editing.id, payload);
      } else {
        await createPost(payload);
      }
      void message.success(t('admin.blog.saved'));
      setModalVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<BlogSummary> = [
    { title: t('blog.field.title'), dataIndex: 'title', ellipsis: true },
    {
      title: t('blog.field.status'),
      dataIndex: 'status',
      width: 110,
      render: (value: BlogSummary['status']) =>
        value === 'published' ? (
          <Tag color="green">{t('blog.published')}</Tag>
        ) : (
          <Tag color="default">{t('blog.draft')}</Tag>
        ),
    },
    {
      title: t('blog.publishedAtColumn'),
      dataIndex: 'publishedAt',
      width: 180,
      render: (value: string | null) => formatDate(value),
    },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 180, render: (value: string) => formatDate(value) },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
          {canEdit && (
            <Button size="small" onClick={() => void openEdit(record)}>
              {t('common.actions.edit')}
            </Button>
          )}
          {canDelete && (
            <Popconfirm
              title={t('admin.blog.deleteConfirm')}
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
      <PageHeader
        title={t('admin.blog.title')}
        extra={
          canCreate ? (
            <Button type="primary" onClick={openCreate}>
              {t('admin.blog.create')}
            </Button>
          ) : null
        }
      />

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: PAGE_SIZE,
          total,
          onChange: setPage,
          showSizeChanger: false,
        }}
      />

      <Modal
        title={editing ? t('admin.blog.edit') : t('admin.blog.create')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={720}
      >
        <Form<FormValues>
          key={editing?.id ?? 'new'}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: editing?.title ?? '',
            summary: editing?.summary ?? '',
            content: editing?.content ?? '',
            coverUrl: editing?.coverUrl ?? '',
            status: editing?.status ?? 'draft',
          }}
        >
          <Form.Item name="title" label={t('blog.field.title')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label={t('blog.field.summary')}>
            <Input />
          </Form.Item>
          <Form.Item name="coverUrl" label={t('blog.field.coverUrl')}>
            <Input />
          </Form.Item>
          <Form.Item name="status" label={t('blog.field.status')}>
            <Select
              style={{ width: 200 }}
              options={[
                { value: 'draft', label: t('blog.draft') },
                { value: 'published', label: t('blog.published') },
              ]}
            />
          </Form.Item>
          <Form.Item name="content" label={t('blog.field.content')} rules={[{ required: true }]}>
            <Input.TextArea rows={12} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--site-space-3)', marginTop: 'var(--site-space-4)' }}>
            <Button onClick={() => setModalVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
