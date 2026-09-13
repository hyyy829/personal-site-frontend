import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { PermissionManagement, PermissionUpsertRequest, SystemPageQuery } from '@/types/permission';

export function pagePermissions(params: SystemPageQuery): Promise<PageResult<PermissionManagement>> {
  return request.get('/admin/system/permissions', { params });
}

export function createPermission(data: PermissionUpsertRequest): Promise<number> {
  return request.post('/admin/system/permissions', data);
}

export function updatePermission(id: number, data: PermissionUpsertRequest): Promise<void> {
  return request.put(`/admin/system/permissions/${id}`, data);
}

export function deletePermission(id: number): Promise<void> {
  return request.delete(`/admin/system/permissions/${id}`);
}
