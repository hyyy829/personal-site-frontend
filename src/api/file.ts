import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { FileManagement } from '@/types/file';

export function pageFiles(params: { page?: number; pageSize?: number }): Promise<PageResult<FileManagement>> {
  return request.get('/admin/files', { params });
}

export function uploadFile(form: FormData): Promise<FileManagement> {
  return request.post('/admin/files', form, { headers: { 'Content-Type': 'multipart/form-data' } });
}

export function deleteFile(id: number): Promise<void> {
  return request.delete(`/admin/files/${id}`);
}
