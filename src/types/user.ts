/** 与后端 system 模块用户管理接口对齐 */
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

/** 重置他人密码属敏感操作，需携带操作者本人密码做二次校验 */
export interface UserResetPasswordRequest {
  password: string;
  operatorPassword: string;
}

/** 列表分页查询参数：system 子模块共用，拆分后随本模块类型保留，避免跨模块类型依赖 */
export interface SystemPageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
