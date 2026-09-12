export type BlogStatus = 'draft' | 'published';

/** 与后端 blog 模块 DTO/VO 对齐 */
export interface BlogSummary {
  id: number;
  title: string;
  summary: string | null;
  coverUrl: string | null;
  status: BlogStatus;
  publishedAt: string | null;
  viewCount: number;
  createdAt: string;
}

export interface BlogDetail extends BlogSummary {
  content: string;
  updatedAt: string;
}

export interface BlogQueryRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: BlogStatus;
}

export interface BlogUpsertRequest {
  title: string;
  summary?: string;
  content: string;
  coverUrl?: string;
  status?: BlogStatus;
}
