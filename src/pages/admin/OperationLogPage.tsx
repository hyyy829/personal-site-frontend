import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { pageOperationLogs } from '@/api/infra';
import type { OperationLogManagement } from '@/types/infra';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 20;

/** 操作日志：管理端写操作审计 */
export default function OperationLogPage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.operationlogManage');
  const [records, setRecords] = useState<OperationLogManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    pageOperationLogs({ page, pageSize: PAGE_SIZE })
      .then((data) => {
        setRecords(data.records);
        setTotal(data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [page]);

  const columns: ColumnProps<OperationLogManagement>[] = [
    { title: t('log.module'), dataIndex: 'module', width: 120 },
    { title: t('log.action'), dataIndex: 'action', ellipsis: true },
    { title: t('log.username'), dataIndex: 'username', width: 110 },
    { title: t('log.ip'), dataIndex: 'ip', width: 130 },
    {
      title: t('log.status'),
      dataIndex: 'status',
      width: 100,
      render: (value: OperationLogManagement['status']) =>
        value === 'success' ? <Tag color="green">{t('log.success')}</Tag> : <Tag color="red">{t('log.failed')}</Tag>,
    },
    { title: t('log.cost'), dataIndex: 'costMs', width: 100, render: (value: number | null) => (value == null ? '-' : `${value}ms`) },
    { title: t('log.time'), dataIndex: 'createdAt', width: 160, render: (value: string) => value?.slice(0, 19).replace('T', ' ') ?? '-' },
  ];

  return (
    <div className="site-admin-page">
      <Typography.Title heading={4} style={{ marginBottom: 16 }}>
        {t('menu.operationlogManage')}
      </Typography.Title>
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
