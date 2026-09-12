/** 与后端 com.hyyy.site.common.R 对齐的统一响应结构 */
export interface R<T> {
  code: number;
  message: string;
  data: T;
}

/** 与后端 com.hyyy.site.common.PageResult 对齐的统一分页结构 */
export interface PageResult<T> {
  records: T[];
  total: number;
  page: number;
  pageSize: number;
}
