import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, InputNumber, Modal, Popconfirm, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { adminPageFriendLinks, createFriendLink, deleteFriendLink, updateFriendLink } from '@/api/friendlink';
import type { FriendLink, FriendLinkUpsertRequest } from '@/types/friendlink';
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
  const { message } = AntdApp.useApp();
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
      void message.success(t('common.actions.saved'));
      setModalVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (record: FriendLink) => {
    await deleteFriendLink(record.id);
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const columns: ColumnsType<FriendLink> = [
    { title: t('friendlink.name'), dataIndex: 'name' },
    { title: t('friendlink.url'), dataIndex: 'url', ellipsis: true },
    { title: t('project.field.sortOrder'), dataIndex: 'sortOrder', width: 90 },
    {
      title: t('project.field.published'),
      dataIndex: 'published',
      width: 100,
      render: (value: boolean) =>
        value ? <Tag color="blue">{t('blog.published')}</Tag> : <Tag color="default">{t('project.unpublished')}</Tag>,
    },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
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
            <Popconfirm
              title={t('friendlink.deleteConfirm')}
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
        title={t('menu.friendlinkManage')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setModalVisible(true);
              }}
            >
              {t('friendlink.create')}
            </Button>
          ) : null
        }
      />

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ current: page, pageSize: PAGE_SIZE, total, onChange: setPage, showSizeChanger: false }}
      />

      <Modal
        title={editing ? t('friendlink.edit') : t('friendlink.create')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form<FormValues>
          key={editing?.id ?? 'new'}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: editing?.name ?? '',
            url: editing?.url ?? '',
            logoUrl: editing?.logoUrl ?? '',
            description: editing?.description ?? '',
            sortOrder: editing?.sortOrder ?? 0,
            published: editing?.published ?? true,
          }}
        >
          <Form.Item name="name" label={t('friendlink.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="url" label={t('friendlink.url')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="logoUrl" label={t('friendlink.logoUrl')}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('friendlink.description')}>
            <Input />
          </Form.Item>
          <Form.Item name="sortOrder" label={t('project.field.sortOrder')}>
            <InputNumber style={{ width: 200 }} min={0} max={9999} />
          </Form.Item>
          <Form.Item name="published" label={t('project.field.published')} valuePropName="checked">
            <Switch />
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
