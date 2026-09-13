import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type {
  FileManagement,
  VisitSummary,
  TopPath,
  OperationLogManagement,
  LoginLogManagement,
  LogPageQuery,
} from '@/types/infra';

/* ---------- 文件 ---------- */

export function pageFiles(params: { page?: number; pageSize?: number }): Promise<PageResult<FileManagement>> {
  return request.get('/admin/files', { params });
}

export function uploadFile(form: FormData): Promise<FileManagement> {
  return request.post('/admin/files', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export function deleteFile(id: number): Promise<void> {
  return request.delete(`/admin/files/${id}`);
}

/* ---------- 访问统计 ---------- */

export function reportVisit(path: string): Promise<void> {
  return request.post('/stats/visit', { path });
}

export function getVisitSummary(): Promise<VisitSummary> {
  return request.get('/stats/visits');
}

export function getTopPaths(limit = 10): Promise<TopPath[]> {
  return request.get('/admin/stats/top-paths', { params: { limit } });
}

/* ---------- 日志 ---------- */

export function pageOperationLogs(params: LogPageQuery): Promise<PageResult<OperationLogManagement>> {
  return request.get('/admin/operation-logs', { params });
}

export function pageLoginLogs(params: LogPageQuery): Promise<PageResult<LoginLogManagement>> {
  return request.get('/admin/login-logs', { params });
}
