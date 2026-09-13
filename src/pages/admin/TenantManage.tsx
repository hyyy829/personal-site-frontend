import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, Modal, Select, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { createTenant, pageTenants, updateTenant } from '@/api/tenant';
import type { TenantManagement } from '@/types/tenant';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import { formatDate } from '@/utils/date';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 1, labelKey: 'admin.user.enabled' },
  { value: 0, labelKey: 'admin.user.disabled' },
];

/** 租户管理：平台级租户的创建与启停 */
export default function TenantManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.tenantManage');

  const { message } = AntdApp.useApp();
  const canManage = useAuthStore((state) => state.permissions.includes('tenant:manage'));

  const [records, setRecords] = useState<TenantManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<TenantManagement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageTenants({ page: currentPage, pageSize: PAGE_SIZE })
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

  const handleSubmit = async (values: { code?: string; name: string; status?: number }) => {
    setSaving(true);
    try {
      if (editing) {
        await updateTenant(editing.id, { name: values.name, status: values.status ?? 1 });
      } else {
        await createTenant({ code: values.code ?? '', name: values.name });
      }
      void message.success(t('common.actions.saved'));
      setFormVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<TenantManagement> = [
    { title: t('admin.tenantPage.code'), dataIndex: 'code' },
    { title: t('admin.tenantPage.name'), dataIndex: 'name' },
    {
      title: t('admin.user.status'),
      dataIndex: 'status',
      width: 100,
      render: (value: number) => (value === 1 ? <Tag color="green">{t('admin.user.enabled')}</Tag> : <Tag color="red">{t('admin.user.disabled')}</Tag>),
    },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => formatDate(value) },
    {
      title: t('admin.blog.actions'),
      width: 110,
      render: (_text, record) =>
        canManage && (
          <Button
            size="small"
            onClick={() => {
              setEditing(record);
              setFormVisible(true);
            }}
          >
            {t('common.actions.edit')}
          </Button>
        ),
    },
  ];

  return (
    <div className="site-admin-page">
      <PageHeader
        title={t('admin.tenantPage.title')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setFormVisible(true);
              }}
            >
              {t('admin.tenantPage.create')}
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
        title={editing ? t('admin.tenantPage.edit') : t('admin.tenantPage.create')}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          layout="vertical"
          key={editing?.id ?? 'new'}
          onFinish={handleSubmit}
          initialValues={{ code: editing?.code ?? '', name: editing?.name ?? '', status: editing?.status ?? 1 }}
        >
          <Form.Item name="code" label={t('admin.tenantPage.code')} rules={[{ required: !editing }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="name" label={t('admin.tenantPage.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label={t('admin.user.status')}>
              <Select options={STATUS_OPTIONS.map((option) => ({ value: option.value, label: t(option.labelKey) }))} />
            </Form.Item>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--site-space-3)', marginTop: 'var(--site-space-4)' }}>
            <Button onClick={() => setFormVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
