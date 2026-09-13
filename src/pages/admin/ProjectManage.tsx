import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Popconfirm, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { adminGetProject, adminPageProjects, createProject, deleteProject, updateProject } from '@/api/project';
import type { ProjectDetail, ProjectSummary, ProjectUpsertRequest } from '@/types/project';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

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
    Toast.success(t('common.actions.delete'));
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
      Toast.success(t('admin.blog.saved'));
      setModalVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一 Toast
    } finally {
      setSaving(false);
    }
  };

  const columns: ColumnProps<ProjectSummary>[] = [
    { title: t('project.field.name'), dataIndex: 'name', ellipsis: true },
    {
      title: t('project.field.status'),
      dataIndex: 'status',
      width: 110,
      render: (value: ProjectSummary['status']) =>
        value === 'active' ? <Tag color="green">{t('project.active')}</Tag> : <Tag color="grey">{t('project.archived')}</Tag>,
    },
    {
      title: t('project.field.published'),
      dataIndex: 'published',
      width: 100,
      render: (value: boolean) => (value ? <Tag color="blue">{t('blog.published')}</Tag> : <Tag color="grey">{t('project.unpublished')}</Tag>),
    },
    { title: t('project.field.sortOrder'), dataIndex: 'sortOrder', width: 90 },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 180, render: (value: string) => value?.slice(0, 10) ?? '-' },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {canManage && (
            <Button size="small" onClick={() => void openEdit(record)}>
              {t('common.actions.edit')}
            </Button>
          )}
          {permissions.includes('project:delete') && (
            <Popconfirm title={t('admin.project.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
              <Button size="small" type="danger">
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Typography.Title heading={4} style={{ margin: 0 }}>
          {t('admin.project.title')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setModalVisible(true);
            }}
          >
            {t('admin.project.create')}
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

      <Modal
        title={editing ? t('admin.project.edit') : t('admin.project.create')}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={680}
      >
        <Form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          initValues={{
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
          <Form.Input field="name" label={t('project.field.name')} rules={[{ required: true }]} />
          <Form.Input field="summary" label={t('project.field.summary')} />
          <Form.TextArea field="description" label={t('project.field.description')} rows={4} />
          <Form.Input field="repoUrl" label={t('project.field.repoUrl')} />
          <Form.Input field="demoUrl" label={t('project.field.demoUrl')} />
          <Form.Input field="coverUrl" label={t('blog.field.coverUrl')} />
          <Form.Input field="techStack" label={t('project.field.techStack')} placeholder="Java, React" />
          <Form.Select field="status" label={t('project.field.status')} style={{ width: 200 }}>
            <Form.Select.Option value="active">{t('project.active')}</Form.Select.Option>
            <Form.Select.Option value="archived">{t('project.archived')}</Form.Select.Option>
          </Form.Select>
          <Form.InputNumber field="sortOrder" label={t('project.field.sortOrder')} style={{ width: 200 }} min={0} max={9999} />
          <Form.Switch field="published" label={t('project.field.published')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
            <Button onClick={() => setModalVisible(false)}>{t('common.actions.cancel')}</Button>
            <Button htmlType="submit" theme="solid" type="primary" loading={saving}>
              {t('common.actions.confirm')}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
