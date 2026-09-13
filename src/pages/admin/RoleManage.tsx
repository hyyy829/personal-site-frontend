import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Popconfirm, Select, Table, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import {
  assignRolePermissions,
  createRole,
  deleteRole,
  getRole,
  pagePermissions,
  pageRoles,
  updateRole,
} from '@/api/system';
import type { PermissionManagement, RoleManagement } from '@/types/system';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

/** 角色管理：列表 + 新建/编辑 + 权限分配 + 删除（当前租户） */
export default function RoleManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.roleManage');

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
    await assignRolePermissions(permissionsTarget.id, selectedPermissionIds);
    Toast.success(t('admin.blog.saved'));
    setPermissionsVisible(false);
  };

  const handleRemove = async (record: RoleManagement) => {
    await deleteRole(record.id);
    Toast.success(t('common.actions.delete'));
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
      Toast.success(t('admin.blog.saved'));
      setFormVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一 Toast
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnProps<RoleManagement>[] = [
    { title: t('admin.role.code'), dataIndex: 'code' },
    { title: t('admin.role.name'), dataIndex: 'name' },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => value?.slice(0, 10) ?? '-' },
    {
      title: t('admin.blog.actions'),
      width: 250,
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
            <Button size="small" onClick={() => void openPermissions(record)}>
              {t('admin.role.permissions')}
            </Button>
            <Popconfirm title={t('admin.role.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
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
          {t('admin.role.title')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          >
            {t('admin.role.create')}
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

      <Modal title={editing ? t('admin.role.edit') : t('admin.role.create')} visible={formVisible} onCancel={() => setFormVisible(false)} footer={null}>
        <Form key={editing?.id ?? 'new'} onSubmit={handleSubmit} initValues={{ code: editing?.code ?? '', name: editing?.name ?? '' }}>
          <Form.Input field="code" label={t('admin.role.code')} rules={[{ required: true }]} />
          <Form.Input field="name" label={t('admin.role.name')} rules={[{ required: true }]} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setFormVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button htmlType="submit" theme="solid" type="primary" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>

      <Modal
        title={`${t('admin.role.permissions')} · ${permissionsTarget?.name ?? ''}`}
        visible={permissionsVisible}
        onCancel={() => setPermissionsVisible(false)}
        onOk={() => void handlePermissionsSubmit()}
      >
        <Typography.Text strong>{t('admin.permission.title')}</Typography.Text>
        <Select
          multiple
          filter
          style={{ width: '100%', marginTop: 8 }}
          value={selectedPermissionIds}
          onChange={(value) => setSelectedPermissionIds(value as number[])}
          optionList={permissionOptions.map((permission) => ({ value: permission.id, label: `${permission.name} (${permission.code})` }))}
        />
      </Modal>
    </div>
  );
}
