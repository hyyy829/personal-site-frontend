/** 与后端 system 模块管理接口对齐 */
export interface UserManagement {
  id: number;
  username: string;
  nickname: string | null;
  email: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserDetail extends UserManagement {
  roleIds: number[];
}

export interface UserCreateRequest {
  username: string;
  password: string;
  nickname?: string;
  email?: string;
}

export interface UserUpdateRequest {
  nickname?: string;
  email?: string;
  status?: number;
}

export interface RoleManagement {
  id: number;
  code: string;
  name: string;
  createdAt: string;
}

export interface RoleDetail extends RoleManagement {
  permissionIds: number[];
}

export interface RoleUpsertRequest {
  code: string;
  name: string;
}

export interface PermissionManagement {
  id: number;
  code: string;
  name: string;
  createdAt: string;
}

export interface PermissionUpsertRequest {
  code: string;
  name: string;
}

export interface TenantManagement {
  id: number;
  code: string;
  name: string;
  status: number;
  createdAt: string;
}

export interface TenantCreateRequest {
  code: string;
  name: string;
}

export interface TenantUpdateRequest {
  name: string;
  status: number;
}

export interface ConfigManagement {
  id: number;
  configKey: string;
  configValue: string | null;
  remark: string | null;
  updatedAt: string;
}

export interface ConfigUpsertRequest {
  configKey: string;
  configValue?: string;
  remark?: string;
}

export interface SystemPageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
