import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, Modal, Select, Table, Tag, Typography } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { createUser, getUser, pageUsers, resetUserPassword, updateUser, assignUserRoles } from '@/api/user';
import { pageRoles } from '@/api/role';
import type { RoleManagement } from '@/types/role';
import type { UserManagement } from '@/types/user';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import { formatDate } from '@/utils/date';

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: 1, labelKey: 'admin.user.enabled' },
  { value: 0, labelKey: 'admin.user.disabled' },
];

/** 用户管理：列表 + 新建/编辑 + 重置密码 + 分配角色（作用于当前租户） */
export default function UserManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.userManage');

  const { message } = AntdApp.useApp();
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
  const [rolesSaving, setRolesSaving] = useState(false);
  const [passwordTarget, setPasswordTarget] = useState<UserManagement | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

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

  const openEdit = async (record: UserManagement) => {
    // 列表接口的邮箱已脱敏，必须取详情再做表单初值，否则会把 a***@example.com 回写进数据库
    const detail = await getUser(record.id);
    setEditing(detail);
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
    setRolesSaving(true);
    try {
      await assignUserRoles(rolesTarget.id, selectedRoleIds);
      void message.success(t('common.actions.saved'));
      setRolesVisible(false);
    } finally {
      setRolesSaving(false);
    }
  };

  const handlePasswordSubmit = async (values: { password: string; operatorPassword: string }) => {
    if (!passwordTarget) {
      return;
    }
    setPasswordSaving(true);
    try {
      await resetUserPassword(passwordTarget.id, values.password, values.operatorPassword);
      void message.success(t('common.actions.saved'));
      setPasswordVisible(false);
    } finally {
      setPasswordSaving(false);
    }
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
      void message.success(t('common.actions.saved'));
      setFormVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<UserManagement> = [
    { title: t('admin.user.username'), dataIndex: 'username' },
    { title: t('admin.user.nickname'), dataIndex: 'nickname' },
    { title: t('admin.user.email'), dataIndex: 'email' },
    {
      title: t('admin.user.status'),
      dataIndex: 'status',
      width: 100,
      render: (value: number) => (value === 1 ? <Tag color="green">{t('admin.user.enabled')}</Tag> : <Tag color="red">{t('admin.user.disabled')}</Tag>),
    },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => formatDate(value) },
    {
      title: t('admin.blog.actions'),
      width: 260,
      render: (_text, record) =>
        canManage && (
          <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
            <Button size="small" onClick={() => void openEdit(record)}>
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
      <PageHeader
        title={t('admin.user.title')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setFormVisible(true);
              }}
            >
              {t('admin.user.create')}
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
        title={editing ? t('admin.user.edit') : t('admin.user.create')}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form
          layout="vertical"
          key={editing?.id ?? 'new'}
          onFinish={handleSubmit}
          initialValues={{
            username: editing?.username ?? '',
            nickname: editing?.nickname ?? '',
            email: editing?.email ?? '',
            status: editing?.status ?? 1,
          }}
        >
          <Form.Item
            name="username"
            label={t('admin.user.username')}
            rules={[{ required: !editing, message: t('auth.usernamePlaceholder') }]}
          >
            <Input disabled={Boolean(editing)} autoComplete="off" />
          </Form.Item>
          {!editing && (
            <Form.Item
              name="password"
              label={t('auth.password')}
              rules={[{ required: true, min: 6, message: t('auth.passwordPlaceholder') }]}
            >
              <Input.Password autoComplete="new-password" />
            </Form.Item>
          )}
          <Form.Item name="nickname" label={t('admin.user.nickname')}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label={t('admin.user.email')}>
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

      <Modal
        title={`${t('admin.user.roles')} · ${rolesTarget?.username ?? ''}`}
        open={rolesVisible}
        onCancel={() => setRolesVisible(false)}
        onOk={() => void handleRolesSubmit()}
        okText={t('common.actions.confirm')}
        cancelText={t('common.actions.cancel')}
        confirmLoading={rolesSaving}
      >
        <Typography.Text strong>{t('admin.role.title')}</Typography.Text>
        <Select<number[]>
          mode="multiple"
          showSearch
          optionFilterProp="label"
          style={{ width: '100%', marginTop: 'var(--site-space-2)' }}
          placeholder={t('admin.user.roles')}
          value={selectedRoleIds}
          onChange={(value) => setSelectedRoleIds(value)}
          options={roles.map((role) => ({ value: role.id, label: `${role.name} (${role.code})` }))}
        />
      </Modal>

      <Modal
        title={`${t('admin.user.resetPassword')} · ${passwordTarget?.username ?? ''}`}
        open={passwordVisible}
        onCancel={() => setPasswordVisible(false)}
        footer={null}
        destroyOnHidden
      >
        <Form layout="vertical" onFinish={handlePasswordSubmit}>
          <Form.Item
            name="password"
            label={t('auth.password')}
            rules={[{ required: true, min: 6, message: t('auth.passwordPlaceholder') }]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <Form.Item
            name="operatorPassword"
            label={t('admin.user.operatorPassword')}
            rules={[{ required: true, message: t('auth.passwordPlaceholder') }]}
            extra={
              <Typography.Text type="secondary" style={{ fontSize: 'var(--site-font-size-sm)' }}>
                {t('admin.user.operatorPasswordHint')}
              </Typography.Text>
            }
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder={t('admin.user.operatorPassword')}
              autoComplete="current-password"
            />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--site-space-3)', marginTop: 'var(--site-space-4)' }}>
            <Button onClick={() => setPasswordVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={passwordSaving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
