/** 与后端 system 模块租户管理接口对齐 */
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

/** 列表分页查询参数：system 子模块共用，拆分后随本模块类型保留，避免跨模块类型依赖 */
export interface SystemPageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
