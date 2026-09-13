import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { OperationLogManagement, LoginLogManagement, LogPageQuery } from '@/types/log';

export function pageOperationLogs(params: LogPageQuery): Promise<PageResult<OperationLogManagement>> {
  return request.get('/admin/operation-logs', { params });
}

export function pageLoginLogs(params: LogPageQuery): Promise<PageResult<LoginLogManagement>> {
  return request.get('/admin/login-logs', { params });
}
