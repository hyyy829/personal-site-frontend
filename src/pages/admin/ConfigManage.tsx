import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, Modal, Popconfirm, Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { createConfig, deleteConfig, pageConfigs, updateConfig } from '@/api/config';
import type { ConfigManagement } from '@/types/config';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 20;

interface FormValues {
  configKey: string;
  configValue?: string;
  remark?: string;
}

/** 系统配置：当前租户的键值对配置维护 */
export default function ConfigManage() {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  useDocumentTitle('menu.systemManage');

  const canManage = useAuthStore((state) => state.permissions.includes('system:manage'));

  const [records, setRecords] = useState<ConfigManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ConfigManagement | null>(null);
  const [formVisible, setFormVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageConfigs({ page: currentPage, pageSize: PAGE_SIZE })
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

  const handleRemove = async (record: ConfigManagement) => {
    await deleteConfig(record.id);
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const handleSubmit = async (values: FormValues) => {
    setSaving(true);
    try {
      if (editing) {
        await updateConfig(editing.id, values);
      } else {
        await createConfig(values);
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

  const columns: ColumnsType<ConfigManagement> = [
    { title: t('admin.config.key'), dataIndex: 'configKey' },
    { title: t('admin.config.value'), dataIndex: 'configValue', ellipsis: true },
    { title: t('admin.config.remark'), dataIndex: 'remark', ellipsis: true },
    {
      title: t('admin.blog.actions'),
      width: 160,
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
              title={t('admin.config.deleteConfirm')}
              okText={t('common.actions.confirm')}
              cancelText={t('common.actions.cancel')}
              onConfirm={() => void handleRemove(record)}
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
        title={t('admin.config.title')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setFormVisible(true);
              }}
            >
              {t('admin.config.create')}
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
        title={editing ? t('admin.config.edit') : t('admin.config.create')}
        open={formVisible}
        onCancel={() => setFormVisible(false)}
        footer={null}
      >
        <Form<FormValues>
          key={editing?.id ?? 'new'}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            configKey: editing?.configKey ?? '',
            configValue: editing?.configValue ?? '',
            remark: editing?.remark ?? '',
          }}
        >
          <Form.Item name="configKey" label={t('admin.config.key')} rules={[{ required: !editing }]}>
            <Input disabled={Boolean(editing)} />
          </Form.Item>
          <Form.Item name="configValue" label={t('admin.config.value')}>
            <Input />
          </Form.Item>
          <Form.Item name="remark" label={t('admin.config.remark')}>
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
    </div>
  );
}
