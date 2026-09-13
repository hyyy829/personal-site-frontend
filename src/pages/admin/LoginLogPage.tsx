import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { pageLoginLogs } from '@/api/log';
import type { LoginLogManagement } from '@/types/log';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import PageHeader from '@/components/common/PageHeader';
import { formatDateTime } from '@/utils/date';

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

  const columns: ColumnsType<LoginLogManagement> = [
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
    { title: t('log.time'), dataIndex: 'createdAt', width: 160, render: (value: string) => formatDateTime(value) },
  ];

  return (
    <div className="site-admin-page">
      <PageHeader title={t('menu.loginlogManage')} />
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
