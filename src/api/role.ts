import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type { RoleManagement, RoleDetail, RoleUpsertRequest, SystemPageQuery } from '@/types/role';

export function pageRoles(params: SystemPageQuery): Promise<PageResult<RoleManagement>> {
  return request.get('/admin/system/roles', { params });
}

export function getRole(id: number): Promise<RoleDetail> {
  return request.get(`/admin/system/roles/${id}`);
}

export function createRole(data: RoleUpsertRequest): Promise<number> {
  return request.post('/admin/system/roles', data);
}

export function updateRole(id: number, data: RoleUpsertRequest): Promise<void> {
  return request.put(`/admin/system/roles/${id}`, data);
}

export function assignRolePermissions(id: number, permissionIds: number[]): Promise<void> {
  return request.put(`/admin/system/roles/${id}/permissions`, { permissionIds });
}

export function deleteRole(id: number): Promise<void> {
  return request.delete(`/admin/system/roles/${id}`);
}
