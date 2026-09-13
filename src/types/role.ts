/** 与后端 system 模块角色管理接口对齐 */
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

/** 列表分页查询参数：system 子模块共用，拆分后随本模块类型保留，避免跨模块类型依赖 */
export interface SystemPageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
