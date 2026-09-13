import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, Modal, Popconfirm, Select, Table, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  getRole,
  pageRoles,
  updateRole,
} from '@/api/role';
import { pagePermissions } from '@/api/permission';
import type { PermissionManagement } from '@/types/permission';
import type { RoleManagement } from '@/types/role';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import { formatDate } from '@/utils/date';

const PAGE_SIZE = 10;

/** 角色管理：列表 + 新建/编辑 + 权限分配 + 删除（当前租户） */
export default function RoleManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.roleManage');

  const { message } = AntdApp.useApp();
  const canManage = useAuthStore((state) => state.permissions.includes('system:manage'));

  const [records, setRecords] = useState<RoleManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<RoleManagement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [permissionsTarget, setPermissionsTarget] = useState<RoleManagement | null>(null);
  const [permissionsVisible, setPermissionsVisible] = useState(false);
  const [permissionOptions, setPermissionOptions] = useState<PermissionManagement[]>([]);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);
  const [permissionsSaving, setPermissionsSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageRoles({ page: currentPage, pageSize: PAGE_SIZE })
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

  const openPermissions = async (record: RoleManagement) => {
    const [detail, permissionPage] = await Promise.all([getRole(record.id), pagePermissions({ page: 1, pageSize: 200 })]);
    setPermissionOptions(permissionPage.records);
    setSelectedPermissionIds(detail.permissionIds);
    setPermissionsTarget(record);
    setPermissionsVisible(true);
  };

  const handlePermissionsSubmit = async () => {
    if (!permissionsTarget) {
      return;
    }
    setPermissionsSaving(true);
    try {
      await assignRolePermissions(permissionsTarget.id, selectedPermissionIds);
      void message.success(t('common.actions.saved'));
      setPermissionsVisible(false);
    } finally {
      setPermissionsSaving(false);
    }
  };

  const handleRemove = async (record: RoleManagement) => {
    await deleteRole(record.id);
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const handleSubmit = async (values: { code: string; name: string }) => {
    setSaving(true);
    try {
      if (editing) {
        await updateRole(editing.id, values);
      } else {
        await createRole(values);
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

  const columns: ColumnsType<RoleManagement> = [
    { title: t('admin.role.code'), dataIndex: 'code' },
    { title: t('admin.role.name'), dataIndex: 'name' },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => formatDate(value) },
    {
      title: t('admin.blog.actions'),
      width: 250,
      render: (_text, record) =>
        canManage && (
          <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
            <Button
              size="small"
              onClick={() => {
                setEditing(record);
                setFormVisible(true);
              }}
            >
              {t('common.actions.edit')}
            </Button>
            <Button size="small" onClick={() => void openPermissions(record)}>
              {t('admin.role.permissions')}
            </Button>
            <Popconfirm
              title={t('admin.role.deleteConfirm')}
              onConfirm={() => void handleRemove(record)}
              okText={t('common.actions.confirm')}
              cancelText={t('common.actions.cancel')}
            >
              <Button size="small" danger>
                {t('common.actions.delete')}
              </Button>
            </Popconfirm>
          </div>
        ),
    },
  ];

  return (
    <div className="site-admin-page">
      <PageHeader
        title={t('admin.role.title')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setFormVisible(true);
              }}
            >
              {t('admin.role.create')}
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
        title={editing ? t('admin.role.edit') : t('admin.role.create')}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" key={editing?.id ?? 'new'} onFinish={handleSubmit} initialValues={{ code: editing?.code ?? '', name: editing?.name ?? '' }}>
          <Form.Item name="code" label={t('admin.role.code')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label={t('admin.role.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--site-space-3)', marginTop: 'var(--site-space-4)' }}>
            <Button onClick={() => setFormVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`${t('admin.role.permissions')} · ${permissionsTarget?.name ?? ''}`}
        open={permissionsVisible}
        onCancel={() => setPermissionsVisible(false)}
        onOk={() => void handlePermissionsSubmit()}
        okText={t('common.actions.confirm')}
        cancelText={t('common.actions.cancel')}
        confirmLoading={permissionsSaving}
      >
        <Typography.Text strong>{t('admin.permission.title')}</Typography.Text>
        <Select<number[]>
          mode="multiple"
          showSearch
          optionFilterProp="label"
          style={{ width: '100%', marginTop: 'var(--site-space-2)' }}
          value={selectedPermissionIds}
          onChange={(value) => setSelectedPermissionIds(value)}
          options={permissionOptions.map((permission) => ({ value: permission.id, label: `${permission.name} (${permission.code})` }))}
        />
      </Modal>
    </div>
  );
}
