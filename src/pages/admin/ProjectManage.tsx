import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import PageHeader from '@/components/common/PageHeader';
import { adminGetProject, adminPageProjects, createProject, deleteProject, updateProject } from '@/api/project';
import type { ProjectDetail, ProjectSummary, ProjectUpsertRequest } from '@/types/project';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/date';

const PAGE_SIZE = 10;

interface FormValues {
  name: string;
  summary?: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  coverUrl?: string;
  techStack?: string;
  status: 'active' | 'archived';
  sortOrder?: number;
  published: boolean;
}

/** 项目管理：分页列表 + 新建/编辑弹窗 + 删除 */
export default function ProjectManage() {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
  useDocumentTitle('menu.projectManage');

  const permissions = useAuthStore((state) => state.permissions);
  const canManage = permissions.includes('system:manage') || permissions.includes('project:add');

  const [records, setRecords] = useState<ProjectSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<ProjectDetail | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    adminPageProjects({ page: currentPage, pageSize: PAGE_SIZE })
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

  const openEdit = async (record: ProjectSummary) => {
    const detail = await adminGetProject(record.id);
    setEditing(detail);
    setModalVisible(true);
  };

  const handleRemove = async (record: ProjectSummary) => {
    await deleteProject(record.id);
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const handleSubmit = async (values: FormValues) => {
    const payload: ProjectUpsertRequest = { ...values };
    setSaving(true);
    try {
      if (editing) {
        await updateProject(editing.id, payload);
      } else {
        await createProject(payload);
      }
      void message.success(t('common.actions.saved'));
      setModalVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnsType<ProjectSummary> = [
    { title: t('project.field.name'), dataIndex: 'name', ellipsis: true },
    {
      title: t('project.field.status'),
      dataIndex: 'status',
      width: 110,
      render: (value: ProjectSummary['status']) =>
        value === 'active' ? <Tag color="green">{t('project.active')}</Tag> : <Tag color="default">{t('project.archived')}</Tag>,
    },
    {
      title: t('project.field.published'),
      dataIndex: 'published',
      width: 100,
      render: (value: boolean) =>
        value ? <Tag color="blue">{t('blog.published')}</Tag> : <Tag color="default">{t('project.unpublished')}</Tag>,
    },
    { title: t('project.field.sortOrder'), dataIndex: 'sortOrder', width: 90 },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 180, render: (value: string) => formatDate(value) },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
          {canManage && (
            <Button size="small" onClick={() => void openEdit(record)}>
              {t('common.actions.edit')}
            </Button>
          )}
          {permissions.includes('project:delete') && (
            <Popconfirm
              title={t('admin.project.deleteConfirm')}
              okText={t('common.actions.confirm')}
              cancelText={t('common.actions.cancel')}
              onConfirm={() => void handleRemove(record)}
            >
              <Button size="small" danger>
                {t('common.actions.delete')}
              </Button>
            </Popconfirm>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="site-admin-page">
      <PageHeader
        title={t('admin.project.title')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setModalVisible(true);
              }}
            >
              {t('admin.project.create')}
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
        title={editing ? t('admin.project.edit') : t('admin.project.create')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={680}
      >
        <Form<FormValues>
          key={editing?.id ?? 'new'}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            name: editing?.name ?? '',
            summary: editing?.summary ?? '',
            description: editing?.description ?? '',
            repoUrl: editing?.repoUrl ?? '',
            demoUrl: editing?.demoUrl ?? '',
            coverUrl: editing?.coverUrl ?? '',
            techStack: editing?.techStack ?? '',
            status: editing?.status ?? 'active',
            sortOrder: editing?.sortOrder ?? 0,
            published: editing?.published ?? false,
          }}
        >
          <Form.Item name="name" label={t('project.field.name')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="summary" label={t('project.field.summary')}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label={t('project.field.description')}>
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="repoUrl" label={t('project.field.repoUrl')}>
            <Input />
          </Form.Item>
          <Form.Item name="demoUrl" label={t('project.field.demoUrl')}>
            <Input />
          </Form.Item>
          <Form.Item name="coverUrl" label={t('blog.field.coverUrl')}>
            <Input />
          </Form.Item>
          <Form.Item name="techStack" label={t('project.field.techStack')}>
            <Input placeholder={t('project.field.techStackPlaceholder')} />
          </Form.Item>
          <Form.Item name="status" label={t('project.field.status')}>
            <Select
              style={{ width: 200 }}
              options={[
                { value: 'active', label: t('project.active') },
                { value: 'archived', label: t('project.archived') },
              ]}
            />
          </Form.Item>
          <Form.Item name="sortOrder" label={t('project.field.sortOrder')}>
            <InputNumber style={{ width: 200 }} min={0} max={9999} />
          </Form.Item>
          <Form.Item name="published" label={t('project.field.published')} valuePropName="checked">
            <Switch />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--site-space-3)', marginTop: 'var(--site-space-4)' }}>
            <Button onClick={() => setModalVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
