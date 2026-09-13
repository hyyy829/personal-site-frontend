import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag, Typography } from '@douyinfe/semi-ui';
import type { ColumnProps } from '@douyinfe/semi-ui/lib/es/table';
import { pageLoginLogs } from '@/api/infra';
import type { LoginLogManagement } from '@/types/infra';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const PAGE_SIZE = 20;

/** 登录日志 */
export default function LoginLogPage() {
  const { t } = useTranslation();
  useDocumentTitle('menu.loginlogManage');
  const [records, setRecords] = useState<LoginLogManagement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  const load = useCallback((currentPage: number) => {
    setLoading(true);
    pageLoginLogs({ page: currentPage, pageSize: PAGE_SIZE })
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

  const columns: ColumnProps<LoginLogManagement>[] = [
    { title: t('log.username'), dataIndex: 'username', width: 140 },
    { title: t('log.ip'), dataIndex: 'ip', width: 140 },
    {
      title: t('log.status'),
      dataIndex: 'status',
      width: 100,
      render: (value: LoginLogManagement['status']) =>
        value === 'success' ? <Tag color="green">{t('log.success')}</Tag> : <Tag color="red">{t('log.failed')}</Tag>,
    },
    { title: t('log.message'), dataIndex: 'message', ellipsis: true },
    { title: t('log.time'), dataIndex: 'createdAt', width: 160, render: (value: string) => value?.slice(0, 19).replace('T', ' ') ?? '-' },
  ];

  return (
    <div className="site-admin-page">
      <Typography.Title heading={4} style={{ marginBottom: 16 }}>
        {t('menu.loginlogManage')}
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
