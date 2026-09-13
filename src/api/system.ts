import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type {
  UserManagement,
  UserDetail,
  UserCreateRequest,
  UserUpdateRequest,
  RoleManagement,
  RoleDetail,
  RoleUpsertRequest,
  PermissionManagement,
  PermissionUpsertRequest,
  TenantManagement,
  TenantCreateRequest,
  TenantUpdateRequest,
  ConfigManagement,
  ConfigUpsertRequest,
  SystemPageQuery,
} from '@/types/system';

/* ---------- 用户 ---------- */

export function pageUsers(params: SystemPageQuery): Promise<PageResult<UserManagement>> {
  return request.get('/admin/system/users', { params });
}

export function getUser(id: number): Promise<UserDetail> {
  return request.get(`/admin/system/users/${id}`);
}

export function createUser(data: UserCreateRequest): Promise<number> {
  return request.post('/admin/system/users', data);
}

export function updateUser(id: number, data: UserUpdateRequest): Promise<void> {
  return request.put(`/admin/system/users/${id}`, data);
}

export function resetUserPassword(id: number, password: string): Promise<void> {
  return request.put(`/admin/system/users/${id}/password`, { password });
}

export function assignUserRoles(id: number, roleIds: number[]): Promise<void> {
  return request.put(`/admin/system/users/${id}/roles`, { roleIds });
}

/* ---------- 角色 ---------- */

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

/* ---------- 权限 ---------- */

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

/* ---------- 租户 ---------- */

export function pageTenants(params: SystemPageQuery): Promise<PageResult<TenantManagement>> {
  return request.get('/admin/system/tenants', { params });
}

export function createTenant(data: TenantCreateRequest): Promise<number> {
  return request.post('/admin/system/tenants', data);
}

export function updateTenant(id: number, data: TenantUpdateRequest): Promise<void> {
  return request.put(`/admin/system/tenants/${id}`, data);
}

/* ---------- 站点配置 ---------- */

export function pageConfigs(params: SystemPageQuery): Promise<PageResult<ConfigManagement>> {
  return request.get('/admin/system/configs', { params });
}

export function createConfig(data: ConfigUpsertRequest): Promise<number> {
  return request.post('/admin/system/configs', data);
}

export function updateConfig(id: number, data: ConfigUpsertRequest): Promise<void> {
  return request.put(`/admin/system/configs/${id}`, data);
}

export function deleteConfig(id: number): Promise<void> {
  return request.delete(`/admin/system/configs/${id}`);
}
