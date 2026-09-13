import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { pageOperationLogs } from '@/api/log';
import type { OperationLogManagement } from '@/types/log';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import { formatDateTime } from '@/utils/date';

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

  const columns: ColumnsType<OperationLogManagement> = [
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
    {
      title: t('log.cost'),
      dataIndex: 'costMs',
      width: 100,
      render: (value: number | null) => (value == null ? '-' : `${value}${t('common.unit.millisecond')}`),
    },
    { title: t('log.time'), dataIndex: 'createdAt', width: 160, render: (value: string) => formatDateTime(value) },
  ];

  return (
    <div className="site-admin-page">
      <PageHeader title={t('menu.operationlogManage')} />
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
