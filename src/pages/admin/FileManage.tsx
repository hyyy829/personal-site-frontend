import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Popconfirm, Table, Tag, Toast, Typography, Upload } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { IconUpload } from '@douyinfe/semi-icons';
import { deleteFile, pageFiles, uploadFile } from '@/api/infra';
import type { FileManagement } from '@/types/infra';
import { useAuthStore } from '@/stores/auth';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 10;

/** 文件管理：上传（MinIO/OSS）+ 元信息列表 + 删除 */
export default function FileManage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.fileManage');

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
    Toast.success(t('common.actions.delete'));
    load(page);
  };

  const copyUrl = async (record: FileManagement) => {
    try {
      await navigator.clipboard.writeText(record.fileUrl);
      Toast.success(t('file.copied'));
    } catch {
      Toast.warning(record.fileUrl);
    }
  };

  const columns: ColumnProps<FileManagement>[] = [
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
    { title: t('blog.createdAt'), dataIndex: 'createdAt', width: 150, render: (value: string) => value?.slice(0, 16).replace('T', ' ') ?? '-' },
    {
      title: t('admin.blog.actions'),
      width: 200,
      render: (_text, record) => (
        <div style={{ display: 'flex', gap: 8 }}>
          <Button size="small" onClick={() => void copyUrl(record)}>
            {t('file.copyUrl')}
          </Button>
          {canDelete && (
            <Popconfirm title={t('file.deleteConfirm')} onConfirm={() => void handleRemove(record)}>
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
          {t('menu.fileManage')}
        </Typography.Title>
        {canUpload && (
          <Upload
            action=""
            accept="image/*,.pdf,.txt,.zip"
            showRetry={false}
            customRequest={({ fileInstance }) => {
              if (uploadingRef.current || !(fileInstance instanceof File)) {
                return;
              }
              uploadingRef.current = true;
              const form = new FormData();
              form.append('file', fileInstance);
              uploadFile(form)
                .then(() => {
                  Toast.success(t('admin.blog.saved'));
                  load(page);
                })
                .catch(() => undefined)
                .finally(() => {
                  uploadingRef.current = false;
                });
            }}
          >
            <Button theme="solid" icon={<IconUpload />}>
              {t('file.upload')}
            </Button>
          </Upload>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={records}
        rowKey="id"
        loading={loading}
        pagination={{ currentPage: page, pageSize: PAGE_SIZE, total, onPageChange: setPage }}
      />
    </div>
  );
}
