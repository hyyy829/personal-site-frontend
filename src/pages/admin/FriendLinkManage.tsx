import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Popconfirm, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { adminPageFriendLinks, createFriendLink, deleteFriendLink, updateFriendLink } from '@/api/content';
import type { FriendLink, FriendLinkUpsertRequest } from '@/types/content';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

interface FormValues {
  name: string;
  url: string;
  logoUrl?: string;
  description?: string;
  sortOrder?: number;
  published: boolean;
}

/** 友链管理 */
export default function FriendLinkManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.friendlinkManage');

  const canManage = useAuthStore((state) => state.permissions.includes('friendlink:add'));
  const canDelete = useAuthStore((state) => state.permissions.includes('friendlink:delete'));

  const [records, setRecords] = useState<FriendLink[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<FriendLink | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    adminPageFriendLinks({ page: currentPage, pageSize: PAGE_SIZE })
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

  const handleSubmit = async (values: FormValues) => {
    const payload: FriendLinkUpsertRequest = { ...values };
    setSaving(true);
    try {
      if (editing) {
        await updateFriendLink(editing.id, payload);
      } else {
        await createFriendLink(payload);
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

  const handleRemove = async (record: FriendLink) => {
    await deleteFriendLink(record.id);
    Toast.success(t('common.actions.delete'));
    load(page);
  };

  const columns: ColumnProps<FriendLink>[] = [
    { title: t('friendlink.name'), dataIndex: 'name' },
    { title: t('friendlink.url'), dataIndex: 'url', ellipsis: true },
    { title: t('project.field.sortOrder'), dataIndex: 'sortOrder', width: 90 },
    {
      title: t('project.field.published'),
      dataIndex: 'published',
      width: 100,
      render: (value: boolean) => (value ? <Tag color="blue">{t('blog.published')}</Tag> : <Tag color="grey">{t('project.unpublished')}</Tag>),
    },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {canManage && (
            <Button
              size="small"
              onClick={() => {
                setEditing(record);
                setModalVisible(true);
              }}
            >
              {t('common.actions.edit')}
            </Button>
          )}
          {canDelete && (
            <Popconfirm title={t('friendlink.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title heading={4} style={{ margin: 0 }}>
          {t('menu.friendlinkManage')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setModalVisible(true);
            }}
          >
            {t('friendlink.create')}
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ currentPage: page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />

      <Modal title={editing ? t('friendlink.edit') : t('friendlink.create')} visible={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          initValues={{
            name: editing?.name ?? '',
            url: editing?.url ?? '',
            logoUrl: editing?.logoUrl ?? '',
            description: editing?.description ?? '',
            sortOrder: editing?.sortOrder ?? 0,
            published: editing?.published ?? true,
          }}
        >
          <Form.Input field="name" label={t('friendlink.name')} rules={[{ required: true }]} />
          <Form.Input field="url" label={t('friendlink.url')} rules={[{ required: true }]} />
          <Form.Input field="logoUrl" label={t('friendlink.logoUrl')} />
          <Form.Input field="description" label={t('friendlink.description')} />
          <Form.InputNumber field="sortOrder" label={t('project.field.sortOrder')} style={{ width: 200 }} min={0} max={9999} />
          <Form.Switch field="published" label={t('project.field.published')} />
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
