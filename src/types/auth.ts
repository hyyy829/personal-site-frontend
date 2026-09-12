/** 与后端 auth 模块 VO 对齐 */
export interface UserVO {
  id: number;
  username: string;
  nickname: string | null;
}

export interface TenantVO {
  id: number;
  code: string;
  name: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface CurrentUserResponse {
  user: UserVO;
  roles: string[];
  permissions: string[];
  tenants: TenantVO[];
  currentTenantId: number;
}

export interface LoginResponse extends CurrentUserResponse {
  token: string;
}
