import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { App as AntdApp, Button, Popconfirm, Table, Tag, Upload } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { UploadOutlined } from '@ant-design/icons';
import { deleteFile, pageFiles, uploadFile } from '@/api/file';
import type { FileManagement } from '@/types/file';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import { formatDateTime } from '@/utils/date';

const PAGE_SIZE = 10;

/** 文件管理：上传（MinIO/OSS）+ 元信息列表 + 删除 */
export default function FileManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.fileManage');

  const { message } = AntdApp.useApp();
  const canUpload = useAuthStore((state) => state.permissions.includes('file:upload'));
  const canDelete = useAuthStore((state) => state.permissions.includes('file:delete'));

  const [records, setRecords] = useState<FileManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const uploadingRef = useRef(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageFiles({ page: currentPage, pageSize: PAGE_SIZE })
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

  const handleRemove = async (record: FileManagement) => {
    await deleteFile(record.id);
    void message.success(t('common.actions.delete'));
    load(page);
  };

  const copyUrl = async (record: FileManagement) => {
    try {
      await navigator.clipboard.writeText(record.fileUrl);
      void message.success(t('file.copied'));
    } catch {
      void message.warning(record.fileUrl);
    }
  };

  const columns: ColumnsType<FileManagement> = [
    { title: t('file.name'), dataIndex: 'fileName', ellipsis: true },
    {
      title: t('file.contentType'),
      dataIndex: 'contentType',
      width: 160,
      render: (value: string) => <Tag>{value}</Tag>,
    },
    {
      title: t('file.size'),
      dataIndex: 'fileSize',
      width: 110,
      render: (value: number) => (value > 1024 * 1024 ? `${(value / 1024 / 1024).toFixed(1)} MB` : `${(value / 1024).toFixed(1)} KB`),
    },
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => formatDateTime(value) },
    {
      title: t('admin.blog.actions'),
      width: 200,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 'var(--site-space-2)' }}>
          <Button size="small" onClick={() => void copyUrl(record)}>
            {t('file.copyUrl')}
          </Button>
          {canDelete && (
            <Popconfirm
              title={t('file.deleteConfirm')}
              onConfirm={() => void handleRemove(record)}
              okText={t('common.actions.confirm')}
              cancelText={t('common.actions.cancel')}
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
        title={t('menu.fileManage')}
        extra={
          canUpload ? (
            <Upload
              accept="image/*,.pdf,.txt,.zip"
              showUploadList={false}
              customRequest={({ file }) => {
                if (uploadingRef.current || !(file instanceof File)) {
                  return;
                }
                uploadingRef.current = true;
                const form = new FormData();
                form.append('file', file);
                uploadFile(form)
                  .then(() => {
                    void message.success(t('common.actions.saved'));
                    load(page);
                  })
                  .catch(() => undefined)
                  .finally(() => {
                    uploadingRef.current = false;
                  });
              }}
            >
              <Button type="primary" icon={<UploadOutlined />}>
                {t('file.upload')}
              </Button>
            </Upload>
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
    </div>
  );
}
