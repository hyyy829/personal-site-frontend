import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, Modal, Popconfirm, Table, Tag, Toast, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { adminPageTimeline, createTimeline, deleteTimeline, updateTimeline } from '@/api/content';
import type { TimelineItem, TimelineUpsertRequest } from '@/types/content';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

interface FormValues {
  title: string;
  content?: string;
  eventDate: Date;
  tag?: string;
  published: boolean;
}

/** 时间线管理 */
export default function TimelineManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.timelineManage');

  const canManage = useAuthStore((state) => state.permissions.includes('timeline:add'));
  const canDelete = useAuthStore((state) => state.permissions.includes('timeline:delete'));

  const [records, setRecords] = useState<TimelineItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<TimelineItem | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    adminPageTimeline({ page: currentPage, pageSize: PAGE_SIZE })
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

  const handleSubmit = async (values: FormValues) => {
    const payload: TimelineUpsertRequest = {
      title: values.title,
      content: values.content,
      eventDate: values.eventDate.toISOString().slice(0, 10),
      tag: values.tag,
      published: values.published,
    };
    setSaving(true);
    try {
      if (editing) {
        await updateTimeline(editing.id, payload);
      } else {
        await createTimeline(payload);
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

  const handleRemove = async (record: TimelineItem) => {
    await deleteTimeline(record.id);
    Toast.success(t('common.actions.delete'));
    load(page);
  };

  const columns: ColumnProps<TimelineItem>[] = [
    { title: t('timeline.title'), dataIndex: 'title', ellipsis: true },
    { title: t('timeline.date'), dataIndex: 'eventDate', width: 130 },
    { title: t('timeline.tag'), dataIndex: 'tag', width: 120, render: (value: string | null) => (value ? <Tag>{value}</Tag> : '-') },
    {
      title: t('project.field.published'),
      dataIndex: 'published',
      width: 100,
      render: (value: boolean) => (value ? <Tag color="blue">{t('blog.published')}</Tag> : <Tag color="grey">{t('project.unpublished')}</Tag>),
    },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          {canManage && (
            <Button
              size="small"
              onClick={() => {
                setEditing(record);
                setModalVisible(true);
              }}
            >
              {t('common.actions.edit')}
            </Button>
          )}
          {canDelete && (
            <Popconfirm title={t('timeline.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
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
          {t('menu.timelineManage')}
        </Typography.Title>
        {canManage && (
          <Button
            theme="solid"
            onClick={() => {
              setEditing(null);
              setModalVisible(true);
            }}
          >
            {t('timeline.create')}
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

      <Modal title={editing ? t('timeline.edit') : t('timeline.create')} visible={modalVisible} onCancel={() => setModalVisible(false)} footer={null}>
        <Form
          key={editing?.id ?? 'new'}
          onSubmit={handleSubmit}
          initValues={{
            title: editing?.title ?? '',
            content: editing?.content ?? '',
            tag: editing?.tag ?? '',
            published: editing?.published ?? true,
            eventDate: editing ? new Date(`${editing.eventDate}T00:00:00`) : new Date(),
          }}
        >
          <Form.Input field="title" label={t('timeline.title')} rules={[{ required: true }]} />
          <Form.TextArea field="content" label={t('timeline.content')} rows={3} />
          <Form.DatePicker field="eventDate" label={t('timeline.date')} type="date" style={{ width: 240 }} rules={[{ required: true }]} />
          <Form.Input field="tag" label={t('timeline.tag')} />
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
