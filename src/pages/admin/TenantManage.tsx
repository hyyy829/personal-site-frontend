import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { createTenant, pageTenants, updateTenant } from '@/api/system';
import type { TenantManagement } from '@/types/system';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

/** 租户管理：平台级租户的创建与启停 */
export default function TenantManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.tenantManage');

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
      Toast.success(t('admin.blog.saved'));
      setFormVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一 Toast
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnProps<TenantManagement>[] = [
    { title: t('admin.tenantPage.code'), dataIndex: 'code' },
    { title: t('admin.tenantPage.name'), dataIndex: 'name' },
    {
      title: t('admin.user.status'),
      dataIndex: 'status',
      width: 100,
      render: (value: number) => (value === 1 ? <Tag color="green">{t('admin.user.enabled')}</Tag> : <Tag color="red">{t('admin.user.disabled')}</Tag>),
    },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => value?.slice(0, 10) ?? '-' },
    {
      title: t('admin.blog.actions'),
      width: 100,
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title heading={4} style={{ margin: 0 }}>
          {t('admin.tenantPage.title')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          >
            {t('admin.tenantPage.create')}
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

      <Modal title={editing ? t('admin.tenantPage.edit') : t('admin.tenantPage.create')} visible={formVisible} onCancel={() => setFormVisible(false)} footer={null}>
        <Form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          initValues={{ code: editing?.code ?? '', name: editing?.name ?? '', status: editing?.status ?? 1 }}
        >
          <Form.Input field="code" label={t('admin.tenantPage.code')} disabled={Boolean(editing)} rules={[{ required: !editing }]} />
          <Form.Input field="name" label={t('admin.tenantPage.name')} rules={[{ required: true }]} />
          {editing && (
            <Form.Select field="status" label={t('admin.user.status')} style={{ width: 200 }}>
              <Form.Select.Option value={1}>{t('admin.user.enabled')}</Form.Select.Option>
              <Form.Select.Option value={0}>{t('admin.user.disabled')}</Form.Select.Option>
            </Form.Select>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setFormVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button htmlType="submit" theme="solid" type="primary" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
