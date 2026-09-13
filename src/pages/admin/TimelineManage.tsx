import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, DatePicker, Form, Input, Modal, Popconfirm, Switch, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';
import PageHeader from '@/components/common/PageHeader';
import { adminPageTimeline, createTimeline, deleteTimeline, updateTimeline } from '@/api/timeline';
import type { TimelineItem, TimelineUpsertRequest } from '@/types/timeline';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { formatDate } from '@/utils/date';

const PAGE_SIZE = 10;

interface FormValues {
  title: string;
  content?: string;
  eventDate: Dayjs;
  tag?: string;
  published: boolean;
}

/** 时间线管理 */
export default function TimelineManage() {
  const { t } = useTranslation();
  const { message } = AntdApp.useApp();
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
      eventDate: values.eventDate.format('YYYY-MM-DD'),
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
      void message.success(t('common.actions.saved'));
      setModalVisible(false);
      load(page);
    } catch {
      // 错误信息已由请求拦截器统一提示
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (record: TimelineItem) => {
    await deleteTimeline(record.id);
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const columns: ColumnsType<TimelineItem> = [
    { title: t('timeline.title'), dataIndex: 'title', ellipsis: true },
    { title: t('timeline.date'), dataIndex: 'eventDate', width: 130, render: (value: string) => formatDate(value) },
    { title: t('timeline.tag'), dataIndex: 'tag', width: 120, render: (value: string | null) => (value ? <Tag>{value}</Tag> : '-') },
    {
      title: t('project.field.published'),
      dataIndex: 'published',
      width: 100,
      render: (value: boolean) =>
        value ? <Tag color="blue">{t('blog.published')}</Tag> : <Tag color="default">{t('project.unpublished')}</Tag>,
    },
    {
      title: t('admin.blog.actions'),
      width: 160,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
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
            <Popconfirm
              title={t('timeline.deleteConfirm')}
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
        title={t('menu.timelineManage')}
        extra={
          canManage ? (
            <Button
              type="primary"
              onClick={() => {
                setEditing(null);
                setModalVisible(true);
              }}
            >
              {t('timeline.create')}
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
        title={editing ? t('timeline.edit') : t('timeline.create')}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form<FormValues>
          key={editing?.id ?? 'new'}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            title: editing?.title ?? '',
            content: editing?.content ?? '',
            tag: editing?.tag ?? '',
            published: editing?.published ?? true,
            eventDate: editing ? dayjs(editing.eventDate) : dayjs(),
          }}
        >
          <Form.Item name="title" label={t('timeline.title')} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="content" label={t('timeline.content')}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="eventDate" label={t('timeline.date')} rules={[{ required: true }]}>
            <DatePicker style={{ width: 240 }} />
          </Form.Item>
          <Form.Item name="tag" label={t('timeline.tag')}>
            <Input />
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
