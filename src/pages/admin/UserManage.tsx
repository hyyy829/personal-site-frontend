import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Select, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { createUser, getUser, pageUsers, resetUserPassword, updateUser, assignUserRoles, pageRoles } from '@/api/system';
import type { RoleManagement, UserManagement } from '@/types/system';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

/** 用户管理：列表 + 新建/编辑 + 重置密码 + 分配角色（作用于当前租户） */
export default function UserManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.userManage');

  const canManage = useAuthStore((state) => state.permissions.includes('system:manage'));

  const [records, setRecords] = useState<UserManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<UserManagement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rolesTarget, setRolesTarget] = useState<UserManagement | null>(null);
  const [rolesVisible, setRolesVisible] = useState(false);
  const [roles, setRoles] = useState<RoleManagement[]>([]);
  const [selectedRoleIds, setSelectedRoleIds] = useState<number[]>([]);
  const [passwordTarget, setPasswordTarget] = useState<UserManagement | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageUsers({ page: currentPage, pageSize: PAGE_SIZE })
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

  const openEdit = (record: UserManagement) => {
    setEditing(record);
    setFormVisible(true);
  };

  const openRoles = async (record: UserManagement) => {
    const [detail, rolePage] = await Promise.all([getUser(record.id), pageRoles({ page: 1, pageSize: 200 })]);
    setRoles(rolePage.records);
    setSelectedRoleIds(detail.roleIds);
    setRolesTarget(record);
    setRolesVisible(true);
  };

  const handleRolesSubmit = async () => {
    if (!rolesTarget) {
      return;
    }
    await assignUserRoles(rolesTarget.id, selectedRoleIds);
    Toast.success(t('admin.blog.saved'));
    setRolesVisible(false);
  };

  const handlePasswordSubmit = async (values: { password: string }) => {
    if (!passwordTarget) {
      return;
    }
    await resetUserPassword(passwordTarget.id, values.password);
    Toast.success(t('admin.blog.saved'));
    setPasswordVisible(false);
  };

  const handleSubmit = async (values: { username: string; password?: string; nickname?: string; email?: string; status?: number }) => {
    setSaving(true);
    try {
      if (editing) {
        await updateUser(editing.id, { nickname: values.nickname, email: values.email, status: values.status });
      } else {
        await createUser({
          username: values.username,
          password: values.password ?? '',
          nickname: values.nickname,
          email: values.email,
        });
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

  const columns: ColumnProps<UserManagement>[] = [
    { title: t('admin.user.username'), dataIndex: 'username' },
    { title: t('admin.user.nickname'), dataIndex: 'nickname' },
    { title: t('admin.user.email'), dataIndex: 'email' },
    {
      title: t('admin.user.status'),
      dataIndex: 'status',
      width: 100,
      render: (value: number) => (value === 1 ? <Tag color="green">{t('admin.user.enabled')}</Tag> : <Tag color="red">{t('admin.user.disabled')}</Tag>),
    },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => value?.slice(0, 10) ?? '-' },
    {
      title: t('admin.blog.actions'),
      width: 250,
      render: (_text, record) =>
        canManage && (
          <div style={{ display: 'flex', gap: 8 }}>
            <Button size="small" onClick={() => openEdit(record)}>
              {t('common.actions.edit')}
            </Button>
            <Button size="small" onClick={() => void openRoles(record)}>
              {t('admin.user.roles')}
            </Button>
            <Button
              size="small"
              onClick={() => {
                setPasswordTarget(record);
                setPasswordVisible(true);
              }}
            >
              {t('admin.user.resetPassword')}
            </Button>
          </div>
        ),
    },
  ];

  return (
    <div className="site-admin-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title heading={4} style={{ margin: 0 }}>
          {t('admin.user.title')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          >
            {t('admin.user.create')}
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

      <Modal title={editing ? t('admin.user.edit') : t('admin.user.create')} visible={formVisible} onCancel={() => setFormVisible(false)} footer={null}>
        <Form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          initValues={{
            username: editing?.username ?? '',
            nickname: editing?.nickname ?? '',
            email: editing?.email ?? '',
            status: editing?.status ?? 1,
          }}
        >
          <Form.Input field="username" label={t('admin.user.username')} disabled={Boolean(editing)} rules={[{ required: !editing }]} />
          {!editing && <Form.Input field="password" label={t('auth.password')} mode="password" rules={[{ required: true, min: 6 }]} />}
          <Form.Input field="nickname" label={t('admin.user.nickname')} />
          <Form.Input field="email" label={t('admin.user.email')} />
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

      <Modal title={`${t('admin.user.roles')} · ${rolesTarget?.username ?? ''}`} visible={rolesVisible} onCancel={() => setRolesVisible(false)} onOk={() => void handleRolesSubmit()}>
        <Typography.Text strong>{t('admin.role.title')}</Typography.Text>
        <Select
          multiple
          filter
          style={{ width: '100%', marginTop: 8 }}
          placeholder={t('admin.user.roles')}
          value={selectedRoleIds}
          onChange={(value) => setSelectedRoleIds(value as number[])}
          optionList={roles.map((role) => ({ value: role.id, label: `${role.name} (${role.code})` }))}
        />
      </Modal>

      <Modal title={`${t('admin.user.resetPassword')} · ${passwordTarget?.username ?? ''}`} visible={passwordVisible} onCancel={() => setPasswordVisible(false)} footer={null}>
        <Form onSubmit={handlePasswordSubmit}>
          <Form.Input field="password" label={t('auth.password')} mode="password" rules={[{ required: true, min: 6 }]} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setPasswordVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button htmlType="submit" theme="solid" type="primary">
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
