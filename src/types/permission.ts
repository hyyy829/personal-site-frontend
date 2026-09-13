/** 权限记录类型：menu 参与侧边菜单注册表，button 只做动作鉴权 */
export type MenuType = 'menu' | 'button';

/** 与后端 system 模块权限管理接口对齐；菜单字段由「菜单权限可配置」新增，旧后端可能不返回 */
export interface PermissionManagement {
  id: number;
  code: string;
  name: string;
  createdAt: string;
  menuType?: MenuType;
  parentCode?: string | null;
  routePath?: string | null;
  icon?: string | null;
  nameKey?: string | null;
  sortOrder?: number;
  visible?: boolean;
}

export interface PermissionUpsertRequest {
  code: string;
  name: string;
  menuType?: MenuType;
  parentCode?: string | null;
  routePath?: string | null;
  icon?: string | null;
  nameKey?: string | null;
  sortOrder?: number;
  visible?: boolean;
}

/** 列表分页查询参数：system 子模块共用，拆分后随本模块类型保留，避免跨模块类型依赖 */
export interface SystemPageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
