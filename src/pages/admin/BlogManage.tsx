import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Popconfirm, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { deletePost, adminGetPost, adminPagePosts, createPost, updatePost } from '@/api/blog';
import type { BlogDetail, BlogSummary, BlogUpsertRequest } from '@/types/blog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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
  useDocumentTitle('menu.blogManage');

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
    Toast.success(t('common.actions.delete'));
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
      Toast.success(t('admin.blog.saved'));
      setModalVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一 Toast
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnProps<BlogSummary>[] = [
    { title: t('blog.field.title'), dataIndex: 'title', ellipsis: true },
    {
      title: t('blog.field.status'),
      dataIndex: 'status',
      width: 110,
      render: (value: BlogSummary['status']) =>
        value === 'published' ? (
          <Tag color="green">{t('blog.published')}</Tag>
        ) : (
          <Tag color="grey">{t('blog.draft')}</Tag>
        ),
    },
    { title: t('blog.publishedAtColumn'), dataIndex: 'publishedAt', width: 180, render: (value: string | null) => value?.slice(0, 10) ?? '-' },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 180, render: (value: string) => value?.slice(0, 10) ?? '-' },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" onClick={() => void openEdit(record)}>
            {t('common.actions.edit')}
          </Button>
          <Popconfirm title={t('admin.blog.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
            <Button size="small" type="danger">
              {t('common.actions.delete')}
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="site-admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title heading={4} style={{ margin: 0 }}>
          {t('admin.blog.title')}
        </Typography.Title>
        <Button theme="solid" onClick={openCreate}>
          {t('admin.blog.create')}
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{
          currentPage: page,
          pageSize: PAGE_SIZE,
          total,
          onPageChange: setPage,
        }}
      />

      <Modal
        title={editing ? t('admin.blog.edit') : t('admin.blog.create')}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={720}
      >
        <Form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          initValues={{
            title: editing?.title ?? '',
            summary: editing?.summary ?? '',
            content: editing?.content ?? '',
            coverUrl: editing?.coverUrl ?? '',
            status: editing?.status ?? 'draft',
          }}
        >
          <Form.Input field="title" label={t('blog.field.title')} rules={[{ required: true }]} />
          <Form.Input field="summary" label={t('blog.field.summary')} />
          <Form.Input field="coverUrl" label={t('blog.field.coverUrl')} />
          <Form.Select field="status" label={t('blog.field.status')} style={{ width: 200 }}>
            <Form.Select.Option value="draft">{t('blog.draft')}</Form.Select.Option>
            <Form.Select.Option value="published">{t('blog.published')}</Form.Select.Option>
          </Form.Select>
          <Form.TextArea field="content" label={t('blog.field.content')} rows={12} rules={[{ required: true }]} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setModalVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button htmlType="submit" theme="solid" type="primary" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
