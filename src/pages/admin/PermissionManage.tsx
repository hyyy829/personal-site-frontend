import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { createPermission, deletePermission, pagePermissions, updatePermission } from '@/api/permission';
import type { MenuType, PermissionManagement, PermissionUpsertRequest } from '@/types/permission';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';

const PAGE_SIZE = 20;

/** 可选文本字段留空时提交空串会被后端存成 ''，这里统一归一为 null */
function normalizeText(value: string | null | undefined): string | null {
  const text = value?.trim();
  return text ? text : null;
}

/** 权限管理：平台级权限码字典的维护 */
export default function PermissionManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.permissionManage');

  const { message } = AntdApp.useApp();
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
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const handleSubmit = async (values: PermissionUpsertRequest) => {
    const payload: PermissionUpsertRequest = {
      ...values,
      menuType: values.menuType ?? 'button',
      parentCode: normalizeText(values.parentCode),
      routePath: normalizeText(values.routePath),
      icon: normalizeText(values.icon),
      nameKey: normalizeText(values.nameKey),
      sortOrder: values.sortOrder ?? 0,
      visible: values.visible ?? true,
    };
    setSaving(true);
    try {
      if (editing) {
        await updatePermission(editing.id, payload);
      } else {
        await createPermission(payload);
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

  const columns: ColumnsType<PermissionManagement> = [
    { title: t('admin.permission.code'), dataIndex: 'code' },
    { title: t('admin.permission.name'), dataIndex: 'name' },
    {
      title: t('admin.permission.menuType'),
      dataIndex: 'menuType',
      width: 110,
      // 旧后端不返回该字段时按 button 展示，避免出现空白列
      render: (value: MenuType | undefined) =>
        (value ?? 'button') === 'menu' ? (
          <Tag color="blue">{t('admin.permission.menuTypeMenu')}</Tag>
        ) : (
          <Tag>{t('admin.permission.menuTypeButton')}</Tag>
        ),
    },
    {
      title: t('admin.permission.routePath'),
      dataIndex: 'routePath',
      render: (value: string | null | undefined) => value || '-',
    },
    { title: t('admin.permission.sortOrder'), dataIndex: 'sortOrder', width: 90 },
    {
      title: t('admin.blog.actions'),
      width: 180,
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
            <Popconfirm
              title={t('admin.permission.deleteConfirm')}
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
        title={t('admin.permission.title')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setFormVisible(true);
              }}
            >
              {t('admin.permission.create')}
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
        title={editing ? t('admin.permission.edit') : t('admin.permission.create')}
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
            code: editing?.code ?? '',
            name: editing?.name ?? '',
            // 新建时普通动作权限更常见，故默认 button
            menuType: editing?.menuType ?? 'button',
            parentCode: editing?.parentCode ?? undefined,
            routePath: editing?.routePath ?? undefined,
            icon: editing?.icon ?? undefined,
            nameKey: editing?.nameKey ?? undefined,
            sortOrder: editing?.sortOrder ?? 0,
            visible: editing?.visible ?? true,
          }}
        >
          <Form.Item name="code" label={t('admin.permission.code')} rules={[{ required: true }]}>
            <Input placeholder={t('admin.permission.codePlaceholder')} />
          </Form.Item>
          <Form.Item name="name" label={t('admin.permission.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="menuType" label={t('admin.permission.menuType')}>
            <Select
              options={[
                { value: 'menu', label: t('admin.permission.menuTypeMenu') },
                { value: 'button', label: t('admin.permission.menuTypeButton') },
              ]}
            />
          </Form.Item>
          <Form.Item name="parentCode" label={t('admin.permission.parentCode')}>
            <Input />
          </Form.Item>
          <Form.Item name="routePath" label={t('admin.permission.routePath')}>
            <Input placeholder="/admin/blog" />
          </Form.Item>
          <Form.Item name="icon" label={t('admin.permission.icon')}>
            <Input placeholder="FileTextOutlined" />
          </Form.Item>
          <Form.Item name="nameKey" label={t('admin.permission.nameKey')}>
            <Input placeholder="menu.blogManage" />
          </Form.Item>
          <Form.Item name="sortOrder" label={t('admin.permission.sortOrder')}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="visible" label={t('admin.permission.visible')} valuePropName="checked">
            <Switch />
          </Form.Item>
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
