import request from '@/utils/request';
import type { PageResult } from '@/types/common';
import type {
  UserManagement,
  UserDetail,
  UserCreateRequest,
  UserUpdateRequest,
  UserResetPasswordRequest,
  SystemPageQuery,
} from '@/types/user';

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

export function resetUserPassword(id: number, password: string, operatorPassword: string): Promise<void> {
  const data: UserResetPasswordRequest = { password, operatorPassword };
  return request.put(`/admin/system/users/${id}/password`, data);
}

export function assignUserRoles(id: number, roleIds: number[]): Promise<void> {
  return request.put(`/admin/system/users/${id}/roles`, { roleIds });
}
