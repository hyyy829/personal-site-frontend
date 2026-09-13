import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Popconfirm, Table, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { createConfig, deleteConfig, pageConfigs, updateConfig } from '@/api/system';
import type { ConfigManagement } from '@/types/system';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 20;

/** 系统配置：当前租户的键值对配置维护 */
export default function ConfigManage() {
  const { t } = useTranslation();
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
    Toast.success(t('common.actions.delete'));
    load(page);
  };

  const handleSubmit = async (values: { configKey: string; configValue?: string; remark?: string }) => {
    setSaving(true);
    try {
      if (editing) {
        await updateConfig(editing.id, values);
      } else {
        await createConfig(values);
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

  const columns: ColumnProps<ConfigManagement>[] = [
    { title: t('admin.config.key'), dataIndex: 'configKey' },
    { title: t('admin.config.value'), dataIndex: 'configValue', ellipsis: true },
    { title: t('admin.config.remark'), dataIndex: 'remark', ellipsis: true },
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
            <Popconfirm title={t('admin.config.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
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
          {t('admin.config.title')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setFormVisible(true);
            }}
          >
            {t('admin.config.create')}
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

      <Modal title={editing ? t('admin.config.edit') : t('admin.config.create')} visible={formVisible} onCancel={() => setFormVisible(false)} footer={null}>
        <Form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          initValues={{ configKey: editing?.configKey ?? '', configValue: editing?.configValue ?? '', remark: editing?.remark ?? '' }}
        >
          <Form.Input field="configKey" label={t('admin.config.key')} disabled={Boolean(editing)} rules={[{ required: !editing }]} />
          <Form.Input field="configValue" label={t('admin.config.value')} />
          <Form.Input field="remark" label={t('admin.config.remark')} />
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
