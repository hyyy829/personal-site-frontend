import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Popconfirm, Table, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { createPermission, deletePermission, pagePermissions, updatePermission } from '@/api/system';
import type { PermissionManagement } from '@/types/system';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 20;

/** 权限管理：平台级权限码字典的维护 */
export default function PermissionManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.permissionManage');

  const canManage = useAuthStore((state) => state.permissions.includes('system:manage'));

  const [records, setRecords] = useState<PermissionManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<PermissionManagement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pagePermissions({ page: currentPage, pageSize: PAGE_SIZE })
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

  const handleRemove = async (record: PermissionManagement) => {
    await deletePermission(record.id);
    Toast.success(t('common.actions.delete'));
    load(page);
  };

  const handleSubmit = async (values: { code: string; name: string }) => {
    setSaving(true);
    try {
      if (editing) {
        await updatePermission(editing.id, values);
      } else {
        await createPermission(values);
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

  const columns: ColumnProps<PermissionManagement>[] = [
    { title: t('admin.permission.code'), dataIndex: 'code' },
    { title: t('admin.permission.name'), dataIndex: 'name' },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) =>
        canManage && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button
              size="small"
              onClick={() => {
                setEditing(record);
                setFormVisible(true);
              }}
            >
              {t('common.actions.edit')}
            </Button>
            <Popconfirm title={t('admin.permission.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
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
          {t('admin.permission.title')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          >
            {t('admin.permission.create')}
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

      <Modal title={editing ? t('admin.permission.edit') : t('admin.permission.create')} visible={formVisible} onCancel={() => setFormVisible(false)} footer={null}>
        <Form key={editing?.id ?? 'new'} onSubmit={handleSubmit} initValues={{ code: editing?.code ?? '', name: editing?.name ?? '' }}>
          <Form.Input field="code" label={t('admin.permission.code')} placeholder="module:action" rules={[{ required: true }]} />
          <Form.Input field="name" label={t('admin.permission.name')} rules={[{ required: true }]} />
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
