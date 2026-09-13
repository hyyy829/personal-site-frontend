/** 与后端 system 模块站点配置接口对齐 */
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

/** 列表分页查询参数：system 子模块共用，拆分后随本模块类型保留，避免跨模块类型依赖 */
export interface SystemPageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
