/** 与后端 stats 模块对齐 */
export interface VisitSummary {
  total: number;
  today: number;
}

export interface TopPath {
  path: string;
  count: number;
}
