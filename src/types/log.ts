/** 与后端 log 模块对齐 */
export interface OperationLogManagement {
  id: number;
  userId: number | null;
  username: string | null;
  module: string;
  action: string;
  method: string;
  path: string;
  ip: string | null;
  status: 'success' | 'failed';
  errorMsg: string | null;
  costMs: number | null;
  createdAt: string;
}

export interface LoginLogManagement {
  id: number;
  username: string;
  userId: number | null;
  ip: string | null;
  status: 'success' | 'failed';
  message: string | null;
  createdAt: string;
}

export interface LogPageQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
}
