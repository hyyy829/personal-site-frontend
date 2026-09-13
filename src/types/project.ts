export type ProjectStatus = 'active' | 'archived';

/** 与后端 project 模块 DTO/VO 对齐 */
export interface ProjectSummary {
  id: number;
  name: string;
  summary: string | null;
  coverUrl: string | null;
  techStack: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  status: ProjectStatus;
  sortOrder: number;
  published: boolean;
  createdAt: string;
}

export interface ProjectDetail extends ProjectSummary {
  description: string | null;
  repoUrl: string | null;
  demoUrl: string | null;
  updatedAt: string;
}

export interface ProjectQueryRequest {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: ProjectStatus;
}

export interface ProjectUpsertRequest {
  name: string;
  summary?: string;
  description?: string;
  repoUrl?: string;
  demoUrl?: string;
  coverUrl?: string;
  techStack?: string;
  status?: ProjectStatus;
  sortOrder?: number;
  published?: boolean;
}
